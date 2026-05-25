package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.availability.AvailabilityRoleRules
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.associateByLinkedUserId
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.dto.CompositionDeclineDto
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.CompositionSlotDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class CompositionService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val selectionHistory: CompositionSelectionHistoryService,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val notificationPort: CompositionNotificationPort,
    private val declineRepository: EventCompositionDeclineRepository,
) {
    @Transactional(readOnly = true)
    fun getComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return buildResponse(event, principal, includeSlotExplainability = false)
    }

    /**
     * Composition state after a mutation (assign, validate, draw, etc.).
     * Same lightweight response as GET (odds shown only in candidates picker, not on the grid).
     */
    fun getCompositionStateAfterMutation(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return buildResponse(event, principal, includeSlotExplainability = false)
    }

    @Transactional
    fun publishComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (!canManage) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à publier")
            }
        if (composition.validatedAt != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Composition déjà validée")
        }

        val alreadyPublished = composition.publishedAt != null
        if (!alreadyPublished) {
            val slots = slotRepository.findByEventId(eventId)
            val assignedCount = slots.count { it.hasAssignee() }
            if (assignedCount == 0) {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Aucun rôle assigné à publier")
            }
            val now = Instant.now()
            composition.publishedAt = now
            composition.updatedAt = now
            compositionRepository.save(composition)
            notificationPort.publishDraftCompositionShared(eventId, seasonId, principal.userId)
        }

        return buildResponse(event, principal, canManage = true, includeSlotExplainability = false)
    }

    @Transactional
    fun validateComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (!canManage) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à valider")
            }
        val slots = slotRepository.findByEventId(eventId)
        val assignedCount = slots.count { it.hasAssignee() }
        if (assignedCount == 0) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Aucun rôle assigné à valider")
        }

        val alreadyValidated = composition.validatedAt != null
        if (!alreadyValidated) {
            val now = Instant.now()
            composition.validatedAt = now
            composition.updatedAt = now
            compositionRepository.save(composition)
            val slotsToPending =
                slots.filter { it.hasAssignee() }.onEach {
                    it.participationStatus = SlotParticipationStatus.PENDING
                    it.updatedAt = Instant.now()
                }
            if (slotsToPending.isNotEmpty()) {
                slotRepository.saveAll(slotsToPending)
            }
            notificationPort.requestCompositionConfirmation(eventId, seasonId, principal.userId)
        }

        return buildResponse(event, principal, canManage = true, includeSlotExplainability = false)
    }

    @Transactional
    fun unlockComposition(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): CompositionResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val canManage = organizerAccess.canManageComposition(eventId, seasonId, principal)
        if (!canManage) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElseThrow {
                ResponseStatusException(HttpStatus.CONFLICT, "Aucune composition à déverrouiller")
            }
        if (composition.validatedAt == null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "La composition n'est pas validée")
        }

        val now = Instant.now()
        composition.validatedAt = null
        composition.updatedAt = now
        compositionRepository.save(composition)

        val slots = slotRepository.findByEventId(eventId)
        val slotsToUpdate =
            slots.filter { slot ->
                slot.hasAssignee() && slot.participationStatus != SlotParticipationStatus.PENDING
            }
        if (slotsToUpdate.isNotEmpty()) {
            val now = Instant.now()
            for (slot in slotsToUpdate) {
                slot.participationStatus = SlotParticipationStatus.PENDING
                slot.updatedAt = now
            }
            slotRepository.saveAll(slotsToUpdate)
        }

        return buildResponse(event, principal, canManage = true, includeSlotExplainability = false)
    }

    private fun buildResponse(
        event: EventEntity,
        principal: SessionUserPrincipal,
        canManage: Boolean? = null,
        includeSlotExplainability: Boolean = true,
    ): CompositionResponseDto {
        if (includeSlotExplainability) {
            seasonParticipantService.ensureMembershipParticipants(event.season)
        }
        val seasonId = event.season.id
        val eventId = event.id
        val resolvedCanManage = canManage ?: organizerAccess.canManageComposition(eventId, seasonId, principal)
        val composition = compositionRepository.findById(eventId).orElse(null)
        val normalizedRoleSlots = RoleTemplates.normalize(event.roleSlots)
        val slots =
            slotRepository.findByEventId(eventId).filter { slot ->
                val count = normalizedRoleSlots[slot.roleKey] ?: 0
                slot.slotIndex in 0 until count
            }
        val hasAssignedSlots = slots.any { it.hasAssignee() }
        val compositionValidated = composition?.validatedAt != null
        val visibilityContent = hasAssignedSlots || compositionValidated
        val visibility =
            CompositionVisibilityRules.resolveVisibility(composition, resolvedCanManage, visibilityContent)
        val canViewSlots =
            CompositionVisibilityRules.canViewSlotAssignments(composition, resolvedCanManage) &&
                visibilityContent

        val showExplainability =
            canViewSlots &&
                (
                    composition?.publishedAt != null ||
                        composition?.validatedAt != null ||
                        resolvedCanManage
                )
        val explainabilityByRoleAndParticipant =
            if (showExplainability && includeSlotExplainability) {
                buildExplainabilityLookup(event, seasonId, eventId, slots)
            } else {
                emptyMap()
            }

        val slotDtos =
            if (canViewSlots) {
                val participantIds = slots.mapNotNull { it.assignedParticipantId() }.toSet()
                val displayNames = resolveDisplayNames(eventId, participantIds)
                slots.map { slot ->
                    val assignedId = slot.assignedParticipantId()
                    val odds =
                        assignedId?.let { pid ->
                            explainabilityByRoleAndParticipant[pid to slot.roleKey]
                        }
                    CompositionSlotDto(
                        roleKey = slot.roleKey,
                        slotIndex = slot.slotIndex,
                        participantId = assignedId,
                        participantDisplayName =
                            assignedId?.let { displayNames[it] },
                        participationStatus = slot.participationStatus.name.lowercase(),
                        chancePercent = odds?.first,
                        pastSelectionCount = odds?.second,
                    )
                }
            } else {
                emptyList()
            }

        val viewerParticipantIds =
            CompositionLinkedParticipantResolver.resolveViewerParticipantIds(
                season = event.season,
                eventId = eventId,
                userId = principal.userId,
                seasonParticipantRepository = seasonParticipantRepository,
                eventParticipantRepository = eventParticipantRepository,
            )
        val declineDtos =
            if (canViewSlots) {
                mapDeclines(eventId, declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId))
            } else {
                emptyList()
            }

        return CompositionResponseDto(
            publishedAt = composition?.publishedAt,
            validatedAt = composition?.validatedAt,
            visibility = visibility.toApiValue(),
            slots = slotDtos,
            declines = declineDtos,
            viewerParticipantIds = viewerParticipantIds.toList(),
        )
    }

    private fun mapDeclines(
        eventId: UUID,
        rows: List<EventCompositionDeclineEntity>,
    ): List<CompositionDeclineDto> {
        if (rows.isEmpty()) {
            return emptyList()
        }
        val participantIds =
            rows.mapNotNull { row ->
                row.seasonParticipantId ?: row.eventParticipantId
            }.toSet()
        val displayNames = resolveDisplayNames(eventId, participantIds)
        return rows.map { row ->
            val participantId =
                row.seasonParticipantId ?: row.eventParticipantId
                    ?: throw IllegalStateException("Decline row missing participant reference")
            CompositionDeclineDto(
                id = row.id,
                participantId = participantId,
                participantDisplayName = displayNames[participantId] ?: "Participant",
                roleKey = row.roleKey,
                slotIndex = row.slotIndex,
                declinedAt = row.declinedAt,
                note = row.note,
            )
        }
    }

    private fun buildExplainabilityLookup(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        assignedSlots: List<EventCompositionSlotEntity>,
    ): Map<Pair<UUID, String>, Pair<Int, Int>> {
        return buildExplainabilityLookupInner(event, seasonId, eventId, assignedSlots)
    }

    private fun buildExplainabilityLookupInner(
        event: EventEntity,
        seasonId: UUID,
        eventId: UUID,
        assignedSlots: List<EventCompositionSlotEntity>,
    ): Map<Pair<UUID, String>, Pair<Int, Int>> {
        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val roleKeysForOdds =
            assignedSlots
                .filter { it.hasAssignee() }
                .map { it.roleKey }
                .toSet()
        if (roleKeysForOdds.isEmpty()) {
            return emptyMap()
        }
        val historyCounts =
            selectionHistory.pastSelectionCountByParticipantAndRole(seasonId, eventId)
        val eligible = loadEligibleForExplainability(seasonId, eventId)
        val availabilityByUserId =
            availabilityRepository.findByEvent_Id(eventId).associateByLinkedUserId()

        val result = mutableMapOf<Pair<UUID, String>, Pair<Int, Int>>()
        for (roleKey in roleKeysForOdds) {
            val requiredCount = normalizedSlots[roleKey] ?: 0
            val pastByParticipant =
                selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)
            val pool =
                eligible.filter { row ->
                    val availability = row.userId?.let { availabilityByUserId[it] } ?: return@filter false
                    if (availability.status != StoredAvailabilityStatus.AVAILABLE) {
                        return@filter false
                    }
                    AvailabilityRoleRules.isCandidateForRole(
                        AvailabilityStatusMapper.toApi(availability.status),
                        availability.roleKeys,
                        roleKey,
                    )
                }
            val scored =
                AvailabilityChanceCalculator.scoreCandidates(
                    pool.map {
                        AvailabilityChanceCalculator.Candidate(it.participantId, it.displayName, null)
                    },
                    requiredCount,
                    pastByParticipant,
                )
            for (candidate in scored) {
                result[candidate.participantId to roleKey] =
                    candidate.chancePercent to candidate.pastSelectionCount
            }
        }
        return result
    }

    private data class ExplainabilityParticipantRow(
        val participantId: UUID,
        val userId: UUID?,
        val displayName: String,
    )

    private fun loadEligibleForExplainability(
        seasonId: UUID,
        eventId: UUID,
    ): List<ExplainabilityParticipantRow> {
        val seasonRows =
            seasonParticipantRepository
                .findActiveForSeasonWithAssociations(seasonId, ParticipantStatus.ACTIVE)
                .filter { row ->
                    row.troupeMembership == null ||
                        row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
                }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val byId = linkedMapOf<UUID, ExplainabilityParticipantRow>()
        val seenUserIds = mutableSetOf<UUID>()
        for (row in seasonRows) {
            byId[row.id] = ExplainabilityParticipantRow(row.id, row.user?.id, row.displayName)
            row.user?.id?.let { seenUserIds.add(it) }
        }
        val eventRows =
            eventParticipantRepository.findActiveForEventWithAssociations(
                eventId,
                ParticipantStatus.ACTIVE,
            )
        for (row in eventRows) {
            val linkedSeasonId = row.seasonParticipant?.id
            if (linkedSeasonId != null && linkedSeasonId in seasonParticipantIds) {
                continue
            }
            val userId = row.user?.id
            if (userId != null && userId in seenUserIds) {
                continue
            }
            byId[row.id] = ExplainabilityParticipantRow(row.id, userId, row.displayName)
            userId?.let { seenUserIds.add(it) }
        }
        return byId.values.toList()
    }

    private fun resolveDisplayNames(
        eventId: UUID,
        participantIds: Set<UUID>,
    ): Map<UUID, String> {
        if (participantIds.isEmpty()) {
            return emptyMap()
        }
        val names =
            seasonParticipantRepository
                .findAllById(participantIds)
                .associate { it.id to it.displayName }
                .toMutableMap()
        val unresolved = participantIds - names.keys
        if (unresolved.isNotEmpty()) {
            eventParticipantRepository
                .findAllById(unresolved)
                .filter { it.event.id == eventId }
                .forEach { row -> names[row.id] = row.displayName }
        }
        return names
    }

    private fun loadAuthorizedEvent(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventEntity {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return event
    }
}
