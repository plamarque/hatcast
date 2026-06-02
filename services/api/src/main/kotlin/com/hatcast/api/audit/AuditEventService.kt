package com.hatcast.api.audit

import com.hatcast.api.audit.dto.AuditEventRowDto
import com.hatcast.api.audit.dto.AuditScopeDto
import com.hatcast.api.audit.dto.PagedAuditEventsResponse
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.domain.Specification
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class AuditEventService(
    private val auditEventRepository: AuditEventRepository,
    private val auditEventAccess: AuditEventAccessService,
    private val identityResolver: AuditIdentityResolver,
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
) {
    @Transactional(readOnly = true)
    fun listEvents(
        principal: SessionUserPrincipal,
        troupeId: UUID?,
        seasonId: UUID?,
        eventId: UUID?,
        actionType: AuditActionType?,
        from: Instant?,
        to: Instant?,
        participantSeasonParticipantId: UUID?,
        participantEventParticipantId: UUID?,
        page: Int,
        size: Int,
    ): PagedAuditEventsResponse {
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Page invalide")
        }
        if (size !in 1..100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Taille de page invalide")
        }
        if (from != null && to != null && from.isAfter(to)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Plage de dates invalide")
        }

        val auth =
            auditEventAccess.authorizeRead(
                principal = principal,
                troupeId = troupeId,
                seasonId = seasonId,
                eventId = eventId,
            )

        if (auth.role == AuditReadRole.PARTICIPANT_ONLY) {
            validateParticipantAccess(
                principal = principal,
                seasonId = auth.seasonId ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Saison requise"),
                eventId = auth.allowedEventIds?.singleOrNull()
                    ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Spectacle requis"),
                participantSeasonParticipantId = participantSeasonParticipantId,
                participantEventParticipantId = participantEventParticipantId,
            )
        } else if (auth.role == AuditReadRole.EVENT_ORGANIZER && eventId == null) {
            val organizedIds = auditEventAccess.eventOrganizerEventIds(auth.seasonId!!, principal)
            if (organizedIds.isEmpty()) {
                return emptyPage(page, size)
            }
        }

        val eventOrganizerIds =
            if (auth.role == AuditReadRole.EVENT_ORGANIZER && eventId == null && auth.seasonId != null) {
                auditEventAccess.eventOrganizerEventIds(auth.seasonId, principal)
            } else {
                auth.allowedEventIds
            }

        val participantActorUserId =
            participantSeasonParticipantId?.let { id ->
                seasonParticipantRepository.findById(id).orElse(null)?.user?.id
            }
        val participantEventActorUserId =
            participantEventParticipantId?.let { id ->
                eventParticipantRepository.findById(id).orElse(null)?.user?.id
            }

        val spec =
            buildSpecification(
                auth = auth,
                actionType = actionType,
                from = from,
                to = to,
                eventOrganizerIds = eventOrganizerIds,
                participantSeasonParticipantId = participantSeasonParticipantId,
                participantEventParticipantId = participantEventParticipantId,
                participantActorUserId = participantActorUserId,
                participantEventActorUserId = participantEventActorUserId,
                actorUserId = principal.userId,
            )

        val pageable =
            PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "occurredAt").and(Sort.by(Sort.Direction.DESC, "id")),
            )
        val result = auditEventRepository.findAll(spec, pageable)
        val identityContext = identityResolver.resolveIdentities(result.content)

        val seasonTitles =
            result.content.mapNotNull { it.seasonId }.distinct().associateWith { id ->
                seasonRepository.findById(id).map { it.title }.orElse(null)
            }
        val eventTitles =
            result.content.mapNotNull { it.eventId }.distinct().associateWith { id ->
                eventRepository.findById(id).map { it.title }.orElse(null)
            }

        return PagedAuditEventsResponse(
            content =
                result.content.map { entity ->
                    toRowDto(entity, identityContext, seasonTitles, eventTitles)
                },
            page = result.number,
            size = result.size,
            totalElements = result.totalElements,
            totalPages = result.totalPages,
        )
    }

    private fun validateParticipantAccess(
        principal: SessionUserPrincipal,
        seasonId: UUID,
        eventId: UUID,
        participantSeasonParticipantId: UUID?,
        participantEventParticipantId: UUID?,
    ) {
        if (participantSeasonParticipantId == null && participantEventParticipantId == null) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
        participantSeasonParticipantId?.let { id ->
            val participant =
                seasonParticipantRepository.findById(id).orElseThrow {
                    ResponseStatusException(HttpStatus.BAD_REQUEST, "Participant inconnu")
                }
            if (participant.season.id != seasonId || participant.user?.id != principal.userId) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
            }
        }
        participantEventParticipantId?.let { id ->
            val participant =
                eventParticipantRepository.findById(id).orElseThrow {
                    ResponseStatusException(HttpStatus.BAD_REQUEST, "Participant inconnu")
                }
            if (participant.event.id != eventId || participant.user?.id != principal.userId) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
            }
        }
    }

    private fun buildSpecification(
        auth: AuditReadAuthorization,
        actionType: AuditActionType?,
        from: Instant?,
        to: Instant?,
        eventOrganizerIds: Set<UUID>?,
        participantSeasonParticipantId: UUID?,
        participantEventParticipantId: UUID?,
        participantActorUserId: UUID?,
        participantEventActorUserId: UUID?,
        actorUserId: UUID?,
    ): Specification<AuditEventEntity> =
        Specification { root, _, cb ->
            val predicates = mutableListOf<Predicate>()
            predicates += cb.equal(root.get<UUID>("troupeId"), auth.troupeId)

            when (auth.role) {
                AuditReadRole.PLATFORM_OR_TROUPE_ADMIN -> {
                    auth.seasonId?.let { predicates += cb.equal(root.get<UUID>("seasonId"), it) }
                    auth.allowedEventIds?.singleOrNull()?.let {
                        predicates += cb.equal(root.get<UUID>("eventId"), it)
                    }
                }
                AuditReadRole.SEASON_ORGANIZER -> {
                    val seasonId = auth.seasonId!!
                    predicates += cb.equal(root.get<UUID>("seasonId"), seasonId)
                    auth.allowedEventIds?.singleOrNull()?.let {
                        predicates += cb.equal(root.get<UUID>("eventId"), it)
                    }
                }
                AuditReadRole.EVENT_ORGANIZER -> {
                    val allowed = eventOrganizerIds ?: auth.allowedEventIds ?: emptySet()
                    if (allowed.isEmpty()) {
                        predicates += cb.disjunction()
                    } else {
                        predicates += root.get<UUID>("eventId").`in`(allowed)
                    }
                }
                AuditReadRole.PARTICIPANT_ONLY -> {
                    val event = auth.allowedEventIds?.singleOrNull()!!
                    predicates += cb.equal(root.get<UUID>("eventId"), event)
                    val participantFilters = mutableListOf<Predicate>()
                    participantSeasonParticipantId?.let {
                        participantFilters += cb.equal(root.get<UUID>("subjectSeasonParticipantId"), it)
                    }
                    participantEventParticipantId?.let {
                        participantFilters += cb.equal(root.get<UUID>("subjectEventParticipantId"), it)
                    }
                    participantFilters += cb.equal(root.get<UUID>("actorUserId"), actorUserId)
                    participantFilters +=
                        cb.and(
                            cb.isNull(root.get<UUID>("actorUserId")),
                            cb.equal(
                                root.get<AuditActionType>("actionType"),
                                AuditActionType.COMPOSITION_LIFECYCLE_CHANGED,
                            ),
                        )
                    predicates += cb.or(*participantFilters.toTypedArray())
                }
                AuditReadRole.NONE -> predicates += cb.disjunction()
            }

            actionType?.let { predicates += cb.equal(root.get<AuditActionType>("actionType"), it) }
            from?.let { predicates += cb.greaterThanOrEqualTo(root.get("occurredAt"), it) }
            to?.let { predicates += cb.lessThanOrEqualTo(root.get("occurredAt"), it) }

            if (auth.role != AuditReadRole.PARTICIPANT_ONLY) {
                applyParticipantFilter(
                    cb = cb,
                    root = root,
                    participantSeasonParticipantId = participantSeasonParticipantId,
                    participantEventParticipantId = participantEventParticipantId,
                    participantActorUserId = participantActorUserId,
                    participantEventActorUserId = participantEventActorUserId,
                    predicates = predicates,
                )
            }

            cb.and(*predicates.toTypedArray())
        }

    private fun applyParticipantFilter(
        cb: jakarta.persistence.criteria.CriteriaBuilder,
        root: jakarta.persistence.criteria.Root<AuditEventEntity>,
        participantSeasonParticipantId: UUID?,
        participantEventParticipantId: UUID?,
        participantActorUserId: UUID?,
        participantEventActorUserId: UUID?,
        predicates: MutableList<Predicate>,
    ) {
        if (participantSeasonParticipantId == null && participantEventParticipantId == null) {
            return
        }
        val filters = mutableListOf<Predicate>()
        participantSeasonParticipantId?.let {
            filters += cb.equal(root.get<UUID>("subjectSeasonParticipantId"), it)
        }
        participantActorUserId?.let { userId ->
            filters += cb.equal(root.get<UUID>("actorUserId"), userId)
            filters += cb.equal(root.get<UUID>("subjectUserId"), userId)
        }
        participantEventParticipantId?.let {
            filters += cb.equal(root.get<UUID>("subjectEventParticipantId"), it)
        }
        participantEventActorUserId?.let { userId ->
            filters += cb.equal(root.get<UUID>("actorUserId"), userId)
            filters += cb.equal(root.get<UUID>("subjectUserId"), userId)
        }
        if (filters.isNotEmpty()) {
            predicates += cb.or(*filters.toTypedArray())
        }
    }

    private fun toRowDto(
        entity: AuditEventEntity,
        context: AuditIdentityContext,
        seasonTitles: Map<UUID, String?>,
        eventTitles: Map<UUID, String?>,
    ): AuditEventRowDto =
        AuditEventRowDto(
            id = entity.id,
            occurredAt = entity.occurredAt,
            actionType = entity.actionType,
            actionLabel = AuditActionLabels.labelFor(entity.actionType),
            actor = identityResolver.actorDto(entity, context),
            subject = identityResolver.subjectDto(entity, context),
            scope =
                AuditScopeDto(
                    troupeId = entity.troupeId,
                    seasonId = entity.seasonId,
                    eventId = entity.eventId,
                    seasonTitle = entity.seasonId?.let { seasonTitles[it] },
                    eventTitle = entity.eventId?.let { eventTitles[it] },
                ),
            before = entity.beforeJson,
            after = entity.afterJson,
            metadata = entity.metadataJson,
            relatedParticipantLabels = identityResolver.drawParticipantLabels(entity, context),
        )

    private fun emptyPage(
        page: Int,
        size: Int,
    ): PagedAuditEventsResponse =
        PagedAuditEventsResponse(
            content = emptyList(),
            page = page,
            size = size,
            totalElements = 0,
            totalPages = 0,
        )
}
