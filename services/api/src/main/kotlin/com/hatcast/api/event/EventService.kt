package com.hatcast.api.event

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.event.dto.CreateEventRequest
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.event.dto.PagedEventsResponse
import com.hatcast.api.event.dto.UpdateEventRequest
import com.hatcast.api.season.SeasonEventCountSync
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.organizer.OrganizerAccessService
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.participant.GuestSeasonWorkspaceMode
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeCategoryService
import com.hatcast.api.notification.EventDetailsChangeSummary
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val seasonRepository: SeasonRepository,
    private val troupeAccess: TroupeAccessService,
    private val availabilityService: AvailabilityService,
    private val participantFocusService: EventParticipantFocusService,
    private val compositionLifecycleEnrichment: CompositionLifecycleEnrichmentService,
    private val troupeCategoryService: TroupeCategoryService,
    private val seasonEventCountSync: SeasonEventCountSync,
    private val auditRecorder: AuditEventRecorder,
    private val draftVisibility: EventDraftVisibility,
    private val organizerAccess: OrganizerAccessService,
    private val eventPublisher: ApplicationEventPublisher,
    private val guestInvitationAccess: GuestInvitationAccessService,
) {
    companion object {
        /** Fuseau pour la borne « début du jour civil » (liste à venir / agenda). */
        val AGENDA_ZONE: ZoneId = ZoneId.of("Europe/Paris")
    }

    @Transactional(readOnly = true)
    fun listForSeason(
        seasonId: UUID,
        page: Int,
        size: Int,
        scope: EventListScope,
        principal: SessionUserPrincipal,
        participantId: UUID? = null,
    ): PagedEventsResponse {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        val workspaceMode = guestInvitationAccess.requireSeasonWorkspaceAccess(seasonId, principal)
        if (workspaceMode == GuestSeasonWorkspaceMode.AGENDA_ONLY && scope == EventListScope.PAST) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour l'historique.")
        }
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
        }
        val pr =
            when (scope) {
                EventListScope.PAST ->
                    PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startsAt"))
                else -> PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startsAt"))
            }
        val applyDraftVisibility = draftVisibility.applyDraftVisibilityFilter(principal)
        val viewerUserId = principal.userId
        val guestFiltered =
            workspaceMode == GuestSeasonWorkspaceMode.AGENDA_ONLY ||
                workspaceMode == GuestSeasonWorkspaceMode.EVENTS_ONLY
        val p =
            when (scope) {
                EventListScope.ALL ->
                    if (guestFiltered) {
                        eventRepository.findBySeason_IdForGuestOrderByStartsAtAsc(
                            seasonId,
                            viewerUserId,
                            viewerUserId,
                            applyDraftVisibility,
                            pr,
                        )
                    } else {
                        eventRepository.findBySeason_IdOrderByStartsAtAsc(
                            seasonId,
                            viewerUserId,
                            applyDraftVisibility,
                            pr,
                        )
                    }
                EventListScope.UPCOMING -> {
                    val from = startOfTodayInclusive(AGENDA_ZONE)
                    if (guestFiltered) {
                        eventRepository.findUpcomingNonArchivedForGuest(
                            seasonId,
                            from,
                            viewerUserId,
                            viewerUserId,
                            applyDraftVisibility,
                            pr,
                        )
                    } else {
                        eventRepository.findUpcomingNonArchived(
                            seasonId,
                            from,
                            viewerUserId,
                            applyDraftVisibility,
                            pr,
                        )
                    }
                }
                EventListScope.PAST -> {
                    val before = startOfTodayInclusive(AGENDA_ZONE)
                    if (guestFiltered) {
                        eventRepository.findPastNonArchivedForGuest(
                            seasonId,
                            before,
                            viewerUserId,
                            viewerUserId,
                            applyDraftVisibility,
                            pr,
                        )
                    } else {
                        eventRepository.findPastNonArchived(
                            seasonId,
                            before,
                            viewerUserId,
                            applyDraftVisibility,
                            pr,
                        )
                    }
                }
            }
        val eventIds = p.content.map { it.id }
        val focusParticipantId =
            participantFocusService.resolveFocusParticipantId(seasonId, participantId, principal)
        val availabilityByEvent =
            if (focusParticipantId != null) {
                availabilityService.participantStatusByEventIds(
                    seasonId = seasonId,
                    eventIds = eventIds,
                    seasonParticipantId = focusParticipantId,
                )
            } else {
                availabilityService.myStatusByEventIds(eventIds, principal.userId)
            }
        val focusByEvent =
            if (focusParticipantId != null) {
                participantFocusService.summariesByEventIds(
                    season = season,
                    eventIds = eventIds,
                    focusParticipantId = focusParticipantId,
                    availabilityByEvent = availabilityByEvent,
                    principal = principal,
                )
            } else {
                emptyMap()
            }
        val lifecycleByEvent =
            compositionLifecycleEnrichment.loadViewsByEventIds(p.content, season, principal)
        return PagedEventsResponse(
            content =
                p.content.map { event ->
                    EventResponseDto.from(
                        event,
                        myAvailabilityStatus = availabilityByEvent[event.id],
                        participantFocus = focusByEvent[event.id],
                        compositionView = lifecycleByEvent[event.id],
                    )
                },
            page = p.number,
            size = p.size,
            totalElements = p.totalElements,
            totalPages = p.totalPages,
        )
    }

    @Transactional
    fun create(
        seasonId: UUID,
        body: CreateEventRequest,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(principal, season.troupe.id)
        val titleTrim = body.title.trim()
        val templateType = body.templateType?.trim()?.takeIf { it.isNotEmpty() } ?: EventTypes.DEFAULT_CREATE
        EventTypes.requireValid(templateType)
        val roleSlots =
            if (body.roleSlots != null) {
                RoleTemplates.normalize(body.roleSlots)
            } else {
                RoleTemplates.slotsFor(templateType)
            }
        val slugBase =
            body.slug?.trim()?.takeIf { it.isNotEmpty() }?.also { EventSlugGenerator.requireValidExplicitSlug(it) }
                ?: EventSlugGenerator.slugify(titleTrim).also { base ->
                    if (base.isEmpty()) {
                        throw ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Le titre ne permet pas de générer un identifiant URL.",
                        )
                    }
                }
        val uniqueSlug =
            EventSlugGenerator.allocateUniqueSlug(seasonId, slugBase, eventRepository, null)
        val now = Instant.now()
        val category = resolveCategoryForCreate(season.troupe.id, body.category)
        val entity =
            EventEntity(
                season = season,
                title = titleTrim,
                slug = uniqueSlug,
                description = body.description?.trim()?.takeIf { it.isNotEmpty() },
                location = body.location?.trim()?.takeIf { it.isNotEmpty() },
                startsAt = body.startsAt,
                archived = false,
                templateType = templateType,
                roleSlots = roleSlots,
                category = category,
                createdAt = now,
                updatedAt = now,
            )
        val saved = eventRepository.save(entity)
        season.eventCount += 1
        season.updatedAt = now
        seasonRepository.save(season)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_CREATED,
                actorUserId = principal.userId,
                troupeId = season.troupe.id,
                seasonId = seasonId,
                eventId = saved.id,
                after = AuditSnapshots.event(saved),
            ),
        )
        eventPublisher.publishEvent(
            EventDraftCreatedEvent(
                eventId = saved.id,
                seasonId = seasonId,
                troupeId = season.troupe.id,
                actorUserId = principal.userId,
            ),
        )
        return EventResponseDto.from(saved)
    }

    @Transactional
    fun update(
        seasonId: UUID,
        eventId: UUID,
        body: UpdateEventRequest,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        troupeAccess.requireCanManageTroupe(principal, e.season.troupe.id)
        val beforeSnapshot = AuditSnapshots.event(e)
        val beforeStartsAt = e.startsAt
        val beforeLocation = e.location
        val beforeTemplateType = e.templateType
        if (body.title.isPresent) {
            val rawTitle = body.title.get()
            if (rawTitle == null) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le titre ne peut pas être effacé.")
            }
            val t = rawTitle.trim()
            if (t.isEmpty()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre vide")
            }
            if (t.length > 255) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "title trop long (max 255).")
            }
            e.title = t
        }
        if (body.startsAt.isPresent) {
            val rawStartsAt = body.startsAt.get()
            if (rawStartsAt == null) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de début ne peut pas être effacée.",
                )
            }
            e.startsAt = rawStartsAt
        }
        if (body.description.isPresent) {
            val raw = body.description.get()
            if (raw == null) {
                e.description = null
            } else {
                if (raw.length > 4000) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "description trop longue (max 4000).")
                }
                e.description = raw.trim().takeIf { it.isNotEmpty() }
            }
        }
        if (body.location.isPresent) {
            val raw = body.location.get()
            if (raw == null) {
                e.location = null
            } else {
                if (raw.length > 512) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "location trop longue (max 512).")
                }
                e.location = raw.trim().takeIf { it.isNotEmpty() }
            }
        }
        if (body.templateType.isPresent) {
            val raw = body.templateType.get()
            if (raw == null) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le format ne peut pas être effacé.",
                )
            }
            val t = raw.trim()
            EventTypes.requireValid(t)
            e.templateType = t
        }
        if (body.roleSlots.isPresent) {
            val raw = body.roleSlots.get()
            if (raw == null) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "roleSlots doit être un objet.",
                )
            }
            e.roleSlots = RoleTemplates.normalize(raw)
        }
        if (body.slug.isPresent) {
            val rawSlug = body.slug.get()
            if (rawSlug == null) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "L’identifiant URL ne peut pas être effacé.",
                )
            }
            EventSlugGenerator.requireValidExplicitSlug(rawSlug)
            e.slug =
                EventSlugGenerator.allocateUniqueSlug(
                    seasonId,
                    rawSlug.trim(),
                    eventRepository,
                    e.id,
                )
        }
        if (body.category.isPresent) {
            val raw = body.category.get()
            e.category =
                if (raw == null) {
                    null
                } else {
                    troupeCategoryService.ensureTag(e.season.troupe.id, raw)
                }
        }
        e.updatedAt = Instant.now()
        val saved = eventRepository.save(e)
        val afterSnapshot = AuditSnapshots.event(saved)
        val (beforeDiff, afterDiff) = AuditSnapshots.mapDiff(beforeSnapshot, afterSnapshot)
        if (beforeDiff != null && afterDiff != null) {
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.EVENT_UPDATED,
                    actorUserId = principal.userId,
                    troupeId = saved.season.troupe.id,
                    seasonId = seasonId,
                    eventId = saved.id,
                    before = beforeDiff,
                    after = afterDiff,
                ),
            )
        }
        maybePublishEventDetailsChanged(
            saved = saved,
            seasonId = seasonId,
            actorUserId = principal.userId,
            beforeStartsAt = beforeStartsAt,
            beforeLocation = beforeLocation,
            beforeTemplateType = beforeTemplateType,
        )
        return EventResponseDto.from(saved)
    }

    private fun maybePublishEventDetailsChanged(
        saved: EventEntity,
        seasonId: UUID,
        actorUserId: UUID,
        beforeStartsAt: Instant,
        beforeLocation: String?,
        beforeTemplateType: String,
    ) {
        if (!saved.isAvailabilityOpen() || saved.archived) {
            return
        }
        val startsAtChange =
            if (saved.startsAt != beforeStartsAt) {
                EventDetailsChangeSummary.StartsAtChange(beforeStartsAt, saved.startsAt)
            } else {
                null
            }
        val locationChange =
            if (saved.location != beforeLocation) {
                EventDetailsChangeSummary.LocationChange(beforeLocation, saved.location)
            } else {
                null
            }
        val templateTypeChange =
            if (saved.templateType != beforeTemplateType) {
                EventDetailsChangeSummary.TemplateTypeChange(beforeTemplateType, saved.templateType)
            } else {
                null
            }
        if (startsAtChange == null && locationChange == null && templateTypeChange == null) {
            return
        }
        eventPublisher.publishEvent(
            EventDetailsChangedEvent(
                eventId = saved.id,
                seasonId = seasonId,
                troupeId = saved.season.troupe.id,
                actorUserId = actorUserId,
                changeSummary =
                    EventDetailsChangeSummary(
                        startsAtChange = startsAtChange,
                        locationChange = locationChange,
                        templateTypeChange = templateTypeChange,
                    ),
            ),
        )
    }

    @Transactional(readOnly = true)
    fun getBySlug(
        seasonId: UUID,
        slug: String,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        val e =
            eventRepository.findBySeason_IdAndSlug(seasonId, slug.trim())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        guestInvitationAccess.requireMemberOrInvitedGuestForEventOrNotFound(seasonId, e.id, principal)
        val availability = availabilityService.myStatusByEventIds(listOf(e.id), principal.userId)
        val lifecycle =
            compositionLifecycleEnrichment
                .loadViewsByEventIds(listOf(e), season, principal)[e.id]
        return EventResponseDto.from(
            e,
            myAvailabilityStatus = availability[e.id],
            compositionView = lifecycle,
        )
    }

    @Transactional(readOnly = true)
    fun getById(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        guestInvitationAccess.requireMemberOrInvitedGuestForEventOrNotFound(seasonId, eventId, principal)
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        val availability = availabilityService.myStatusByEventIds(listOf(eventId), principal.userId)
        val lifecycle =
            compositionLifecycleEnrichment
                .loadViewsByEventIds(listOf(e), season, principal)[eventId]
        return EventResponseDto.from(
            e,
            myAvailabilityStatus = availability[eventId],
            compositionView = lifecycle,
        )
    }

    @Transactional
    fun archive(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        troupeAccess.requireCanManageTroupe(principal, e.season.troupe.id)
        if (!e.archived) {
            val beforeArchived = e.archived
            e.archived = true
            e.updatedAt = Instant.now()
            eventRepository.save(e)
            seasonEventCountSync.recountEvents(seasonId)
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.EVENT_ARCHIVED,
                    actorUserId = principal.userId,
                    troupeId = e.season.troupe.id,
                    seasonId = seasonId,
                    eventId = e.id,
                    before = mapOf("archived" to beforeArchived, "title" to e.title),
                    after = mapOf("archived" to true, "title" to e.title),
                ),
            )
            eventPublisher.publishEvent(
                EventArchivedEvent(
                    eventId = e.id,
                    seasonId = seasonId,
                    troupeId = e.season.troupe.id,
                    actorUserId = principal.userId,
                ),
            )
        }
        return EventResponseDto.from(e)
    }

    @Transactional
    fun unarchive(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        troupeAccess.requireCanManageTroupe(principal, e.season.troupe.id)
        if (e.archived) {
            val beforeArchived = e.archived
            e.archived = false
            e.updatedAt = Instant.now()
            eventRepository.save(e)
            seasonEventCountSync.recountEvents(seasonId)
            auditRecorder.record(
                AuditRecordRequest(
                    actionType = AuditActionType.EVENT_UNARCHIVED,
                    actorUserId = principal.userId,
                    troupeId = e.season.troupe.id,
                    seasonId = seasonId,
                    eventId = e.id,
                    before = mapOf("archived" to beforeArchived, "title" to e.title),
                    after = mapOf("archived" to false, "title" to e.title),
                ),
            )
        }
        return EventResponseDto.from(e)
    }

    @Transactional
    fun openAvailability(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Droits insuffisants")
        }
        if (e.archived) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Événement archivé")
        }
        if (e.availabilityOpenedAt != null) {
            return EventResponseDto.from(e)
        }
        val beforeSnapshot = AuditSnapshots.event(e)
        val now = Instant.now()
        e.availabilityOpenedAt = now
        e.updatedAt = now
        val saved = eventRepository.save(e)
        val afterSnapshot = AuditSnapshots.event(saved)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_AVAILABILITY_OPENED,
                actorUserId = principal.userId,
                troupeId = saved.season.troupe.id,
                seasonId = seasonId,
                eventId = saved.id,
                before = beforeSnapshot,
                after = afterSnapshot,
            ),
        )
        eventPublisher.publishEvent(
            EventAvailabilityOpenedEvent(
                eventId = saved.id,
                seasonId = seasonId,
                troupeId = saved.season.troupe.id,
                actorUserId = principal.userId,
            ),
        )
        val lifecycle =
            compositionLifecycleEnrichment
                .loadViewsByEventIds(listOf(saved), saved.season, principal)[saved.id]
        return EventResponseDto.from(saved, compositionView = lifecycle)
    }

    @Transactional
    fun closeAvailability(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Droits insuffisants")
        }
        if (e.archived) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Événement archivé")
        }
        if (e.availabilityOpenedAt == null) {
            val lifecycle =
                compositionLifecycleEnrichment
                    .loadViewsByEventIds(listOf(e), e.season, principal)[e.id]
            return EventResponseDto.from(e, compositionView = lifecycle)
        }
        val beforeSnapshot = AuditSnapshots.event(e)
        val now = Instant.now()
        e.availabilityOpenedAt = null
        e.updatedAt = now
        val saved = eventRepository.save(e)
        val afterSnapshot = AuditSnapshots.event(saved)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_AVAILABILITY_CLOSED,
                actorUserId = principal.userId,
                troupeId = saved.season.troupe.id,
                seasonId = seasonId,
                eventId = saved.id,
                before = beforeSnapshot,
                after = afterSnapshot,
            ),
        )
        val lifecycle =
            compositionLifecycleEnrichment
                .loadViewsByEventIds(listOf(saved), saved.season, principal)[saved.id]
        return EventResponseDto.from(saved, compositionView = lifecycle)
    }

    private fun loadEventInSeason(
        seasonId: UUID,
        eventId: UUID,
    ): EventEntity {
        val e =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (e.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return e
    }

    private fun resolveCategoryForCreate(
        troupeId: UUID,
        raw: String?,
    ): String? {
        if (raw == null) {
            return null
        }
        return troupeCategoryService.ensureTag(troupeId, raw)
    }

    private fun startOfTodayInclusive(zone: ZoneId): Instant {
        val z: ZonedDateTime = ZonedDateTime.now(zone)
        return z.toLocalDate().atStartOfDay(zone).toInstant()
    }
}

enum class EventListScope {
    ALL,
    UPCOMING,
    PAST,
}
