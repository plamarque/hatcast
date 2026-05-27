package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.availability.AvailabilityRoleRules
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.associateByLinkedUserId
import com.hatcast.api.composition.dto.CompositionDrawResponseDto
import com.hatcast.api.composition.dto.CompositionDrawStepCandidateDto
import com.hatcast.api.composition.dto.CompositionDrawStepDto
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.DrawCompositionRequestDto
import com.hatcast.api.event.EquityCompartment
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID
import kotlin.random.Random

@Service
class CompositionDrawService(
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
    private val selectionHistory: CompositionSelectionHistoryService,
    private val compositionService: CompositionService,
    private val notificationPort: CompositionNotificationPort,
) {
    @Transactional
    fun drawComposition(
        seasonId: UUID,
        eventId: UUID,
        body: DrawCompositionRequestDto?,
        principal: SessionUserPrincipal,
        random: Random = Random.Default,
    ): CompositionDrawResponseDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }

        val mode = parseDrawMode(body?.mode)
        val normalizedSlots = RoleTemplates.normalize(event.roleSlots)
        val requiredRoles = AvailabilityRoleRules.rolesRequiredForEvent(normalizedSlots)

        val composition =
            compositionRepository.findByEventIdForUpdate(eventId).orElse(null)
        val isLocked = composition?.validatedAt != null
        if (isLocked) {
            if (mode != DrawMode.FILL_EMPTY) {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
            }
            val existingSlots = slotRepository.findByEventId(eventId)
            if (!CompositionGapFillRules.hasEmptyRequiredSlot(normalizedSlots, existingSlots)) {
                throw ResponseStatusException(HttpStatus.CONFLICT, "Composition verrouillée")
            }
        }

        val now = Instant.now()
        val compositionRow =
            composition
                ?: compositionRepository.save(
                    EventCompositionEntity(
                        eventId = eventId,
                        validatedAt = null,
                        publishedAt = null,
                        createdAt = now,
                        updatedAt = now,
                    ),
                )

        seasonParticipantService.ensureMembershipParticipants(event.season)
        val eligible =
            CompositionParticipantPool.loadEligibleParticipants(
                seasonId,
                eventId,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )
        val availabilityByUserId =
            availabilityRepository.findByEvent_Id(eventId).associateByLinkedUserId()
        val historyCounts =
            selectionHistory.pastSelectionCountByParticipantAndRole(
                seasonId,
                eventId,
                EquityCompartment.slug(event),
            )

        val allSlots = slotRepository.findByEventId(eventId)
        val slotsByRole =
            allSlots
                .filter { slot ->
                    val count = normalizedSlots[slot.roleKey] ?: 0
                    slot.slotIndex in 0 until count
                }.groupBy { it.roleKey }

        val eligibleById = eligible.associateBy { it.participantId }
        val crossRoleExcluded = mutableSetOf<UUID>()
        val steps = mutableListOf<CompositionDrawStepDto>()
        val newlyAssignedParticipantIds = mutableListOf<UUID>()
        val slotsToPersist = mutableListOf<EventCompositionSlotEntity>()

        for (roleKey in requiredRoles) {
            val requiredCount = normalizedSlots[roleKey] ?: 0
            if (requiredCount <= 0) continue

            val roleSlots = slotsByRole[roleKey].orEmpty().associateBy { it.slotIndex }
            val filledCount = (0 until requiredCount).count { roleSlots[it]?.hasAssignee() == true }
            val isFullRedraw =
                mode == DrawMode.FULL && filledCount >= requiredCount

            if (isFullRedraw) {
                for (index in 0 until requiredCount) {
                    roleSlots[index]?.let { slot ->
                        if (slot.hasAssignee()) {
                            slot.clearAssignee()
                            slot.updatedAt = now
                            slotsToPersist.add(slot)
                        }
                    }
                }
            }

            val withinRoleExcluded = mutableSetOf<UUID>()
            if (!isFullRedraw) {
                for (index in 0 until requiredCount) {
                    roleSlots[index]?.assignedParticipantId()?.let {
                        withinRoleExcluded.add(it)
                        crossRoleExcluded.add(it)
                    }
                }
            }

            val indicesToFill =
                when {
                    mode == DrawMode.FILL_EMPTY ->
                        (0 until requiredCount).filter { roleSlots[it]?.hasAssignee() != true }
                    isFullRedraw -> (0 until requiredCount).toList()
                    else -> (0 until requiredCount).filter { roleSlots[it]?.hasAssignee() != true }
                }

            val pastByParticipant =
                selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)

            for (slotIndex in indicesToFill) {
                val pool =
                    CompositionParticipantPool.buildRolePool(
                        eligible = eligible,
                        availabilityByUserId = availabilityByUserId,
                        roleKey = roleKey,
                        excluded = crossRoleExcluded + withinRoleExcluded,
                    )
                val weighted =
                    AvailabilityChanceCalculator.toWeightedCandidates(
                        pool.map {
                            AvailabilityChanceCalculator.Candidate(
                                participantId = it.participantId,
                                displayName = it.displayName,
                                avatarUrl = null,
                            )
                        },
                        requiredCount,
                        pastByParticipant,
                    )
                val scored =
                    AvailabilityChanceCalculator.scoreCandidates(
                        pool.map {
                            AvailabilityChanceCalculator.Candidate(
                                it.participantId,
                                it.displayName,
                                null,
                            )
                        },
                        requiredCount,
                        pastByParticipant,
                    )
                val drawResult = AvailabilityChanceCalculator.performWeightedDraw(weighted, random)

                if (drawResult == null) {
                    steps.add(
                        CompositionDrawStepDto(
                            roleKey = roleKey,
                            slotIndex = slotIndex,
                            candidates =
                                scored.map {
                                    CompositionDrawStepCandidateDto(
                                        participantId = it.participantId,
                                        displayName = it.displayName,
                                        chancePercent = it.chancePercent,
                                        weight = it.weight,
                                    )
                                },
                            selectedParticipantId = null,
                            randomValue = null,
                            totalWeight = weighted.sumOf { it.weight },
                        ),
                    )
                    continue
                }

                val selectedId = drawResult.selected.participantId
                val selectedParticipant =
                    eligibleById[selectedId]
                        ?: throw ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Participant non éligible pour ce rôle",
                        )
                val slotEntity =
                    roleSlots[slotIndex]
                        ?: EventCompositionSlotEntity(
                            eventId = eventId,
                            roleKey = roleKey,
                            slotIndex = slotIndex,
                        )
                slotEntity.setAssignee(selectedParticipant)
                slotEntity.participationStatus = SlotParticipationStatus.PENDING
                slotEntity.updatedAt = now
                slotsToPersist.add(slotEntity)

                withinRoleExcluded.add(selectedId)
                crossRoleExcluded.add(selectedId)
                newlyAssignedParticipantIds.add(selectedId)

                steps.add(
                    CompositionDrawStepDto(
                        roleKey = roleKey,
                        slotIndex = slotIndex,
                        candidates =
                            scored.map {
                                CompositionDrawStepCandidateDto(
                                    participantId = it.participantId,
                                    displayName = it.displayName,
                                    chancePercent = it.chancePercent,
                                    weight = it.weight,
                                )
                            },
                        selectedParticipantId = selectedId,
                        randomValue = drawResult.randomValue,
                        totalWeight = drawResult.totalWeight,
                    ),
                )
            }
        }

        if (slotsToPersist.isNotEmpty()) {
            slotRepository.saveAll(slotsToPersist.distinctBy { it.id })
        }

        compositionRow.updatedAt = now
        compositionRepository.save(compositionRow)

        if (newlyAssignedParticipantIds.isNotEmpty()) {
            notificationPort.requestConfirmationForAssignees(
                eventId = eventId,
                seasonId = seasonId,
                assigneeParticipantIds = newlyAssignedParticipantIds.distinct(),
                actorUserId = principal.userId,
            )
        }

        val compositionResponse =
            compositionService.getCompositionStateAfterMutation(seasonId, eventId, principal)
        return CompositionDrawResponseDto(composition = compositionResponse, steps = steps)
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

    private enum class DrawMode {
        FULL,
        FILL_EMPTY,
    }

    private fun parseDrawMode(raw: String?): DrawMode =
        when (raw?.trim()?.lowercase()) {
            null, "", "full" -> DrawMode.FULL
            "fillempty", "fill_empty", "fill-empty" -> DrawMode.FILL_EMPTY
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "mode de tirage invalide")
        }
}
