package com.hatcast.api.event

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.event.dto.CreateEventRequest
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.event.dto.PagedEventsResponse
import com.hatcast.api.event.dto.UpdateEventRequest
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
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
    private val compositionLifecycleEnrichment: CompositionLifecycleEnrichmentService,
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
    ): PagedEventsResponse {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
        }
        val pr = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startsAt"))
        val p =
            when (scope) {
                EventListScope.ALL ->
                    eventRepository.findBySeason_IdOrderByStartsAtAsc(seasonId, pr)
                EventListScope.UPCOMING -> {
                    val from = startOfTodayInclusive(AGENDA_ZONE)
                    eventRepository.findUpcomingNonArchived(seasonId, from, pr)
                }
            }
        val eventIds = p.content.map { it.id }
        val availabilityByEvent = availabilityService.myStatusByEventIds(eventIds, principal.userId)
        val lifecycleByEvent =
            compositionLifecycleEnrichment.loadViewsByEventIds(p.content, season, principal)
        return PagedEventsResponse(
            content =
                p.content.map { event ->
                    EventResponseDto.from(
                        event,
                        myAvailabilityStatus = availabilityByEvent[event.id],
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
        val now = Instant.now()
        val entity =
            EventEntity(
                season = season,
                title = titleTrim,
                description = body.description?.trim()?.takeIf { it.isNotEmpty() },
                location = body.location?.trim()?.takeIf { it.isNotEmpty() },
                startsAt = body.startsAt,
                archived = false,
                templateType = templateType,
                roleSlots = roleSlots,
                createdAt = now,
                updatedAt = now,
            )
        val saved = eventRepository.save(entity)
        season.eventCount += 1
        season.updatedAt = now
        seasonRepository.save(season)
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
                    "Le type de spectacle ne peut pas être effacé.",
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
        e.updatedAt = Instant.now()
        return EventResponseDto.from(eventRepository.save(e))
    }

    @Transactional(readOnly = true)
    fun getById(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
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
        e.archived = true
        e.updatedAt = Instant.now()
        return EventResponseDto.from(eventRepository.save(e))
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

    private fun startOfTodayInclusive(zone: ZoneId): Instant {
        val z: ZonedDateTime = ZonedDateTime.now(zone)
        return z.toLocalDate().atStartOfDay(zone).toInstant()
    }
}

enum class EventListScope {
    ALL,
    UPCOMING,
}
