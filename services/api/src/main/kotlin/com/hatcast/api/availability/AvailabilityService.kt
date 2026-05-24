package com.hatcast.api.availability

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.dto.EventAvailabilitySummaryResponse
import com.hatcast.api.availability.dto.MyAvailabilityResponse
import com.hatcast.api.availability.dto.SetMyAvailabilityRequest
import com.hatcast.api.availability.dto.SummaryParticipantDto
import com.hatcast.api.availability.dto.SummaryRoleCandidateDto
import com.hatcast.api.availability.dto.SummaryRoleDto
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.composition.CompositionSelectionHistoryService
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class AvailabilityService(
    private val availabilityRepository: EventAvailabilityRepository,
    private val eventRepository: EventRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantRepository: EventParticipantRepository,
    private val troupeAccess: TroupeAccessService,
    private val userRepository: UserRepository,
    private val selectionHistory: CompositionSelectionHistoryService,
) {
    @Transactional(readOnly = true)
    fun getMyStatus(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return toResponse(findRow(event.id, principal.userId))
    }

    @Transactional
    fun setMyStatus(
        seasonId: UUID,
        eventId: UUID,
        body: SetMyAvailabilityRequest,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val apiStatus =
            try {
                AvailabilityStatusMapper.parseApi(body.status)
            } catch (_: IllegalArgumentException) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "status invalide")
            }
        val stored = AvailabilityStatusMapper.toStored(apiStatus)
        val existing = findRow(event.id, principal.userId)
        if (stored == null) {
            if (existing != null) {
                availabilityRepository.delete(existing)
            }
            return MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN, roleKeys = emptyList())
        }
        val roleKeys =
            if (stored == StoredAvailabilityStatus.AVAILABLE) {
                AvailabilityRoleRules.normalizeRoleKeys(
                    event.roleSlots,
                    body.roleKeys,
                    applyVolunteerRule = body.applyVolunteerRule ?: true,
                )
            } else {
                emptyList()
            }
        val now = Instant.now()
        val saved =
            if (existing != null) {
                existing.status = stored
                existing.roleKeys = roleKeys
                existing.updatedAt = now
                availabilityRepository.save(existing)
            } else {
                val user =
                    userRepository.findById(principal.userId).orElseThrow {
                        ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu")
                    }
                availabilityRepository.save(
                    EventAvailabilityEntity(
                        event = event,
                        user = user,
                        status = stored,
                        roleKeys = roleKeys,
                        now = now,
                    ),
                )
            }
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun myStatusByEventIds(
        eventIds: Collection<UUID>,
        userId: UUID,
    ): Map<UUID, String> {
        if (eventIds.isEmpty()) {
            return emptyMap()
        }
        val rows = availabilityRepository.findByEvent_IdInAndUser_Id(eventIds, userId)
        val byEvent = rows.associate { it.event.id to AvailabilityStatusMapper.toApi(it.status) }
        return eventIds.associateWith { byEvent[it] ?: AvailabilityStatusMapper.UNKNOWN }
    }

    @Transactional
    fun getSummary(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventAvailabilitySummaryResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        seasonParticipantService.ensureMembershipParticipants(season)
        val eligible = loadEligibleParticipants(seasonId, event.id)
        val availabilityByUserId =
            availabilityRepository
                .findByEvent_Id(event.id)
                .associateBy { it.user.id }

        val participants =
            eligible.map { row ->
                val availability = row.userId?.let { availabilityByUserId[it] }
                val apiStatus =
                    availability?.let { AvailabilityStatusMapper.toApi(it.status) }
                        ?: AvailabilityStatusMapper.UNKNOWN
                val roleKeys =
                    if (availability?.status == StoredAvailabilityStatus.AVAILABLE) {
                        availability.roleKeys
                    } else {
                        emptyList()
                    }
                SummaryParticipantDto(
                    participantId = row.participantId,
                    userId = row.userId,
                    displayName = row.displayName,
                    avatarUrl = row.avatarUrl,
                    status = apiStatus,
                    roleKeys = roleKeys,
                )
            }

        val historyCounts =
            selectionHistory.pastSelectionCountByParticipantAndRole(seasonId, event.id)
        val requiredRoles = AvailabilityRoleRules.rolesRequiredForEvent(event.roleSlots)
        val roles =
            requiredRoles.map { roleKey ->
                val requiredCount = event.roleSlots[roleKey] ?: 0
                val pastByParticipant =
                    selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)
                val roleCandidates =
                    participants.filter { participant ->
                        AvailabilityRoleRules.isCandidateForRole(
                            participant.status,
                            participant.roleKeys,
                            roleKey,
                        )
                    }
                val scored =
                    AvailabilityChanceCalculator.scoreCandidates(
                        roleCandidates.map {
                            AvailabilityChanceCalculator.Candidate(
                                participantId = it.participantId,
                                displayName = it.displayName,
                                avatarUrl = it.avatarUrl,
                            )
                        },
                        requiredCount,
                        pastByParticipant,
                    )
                SummaryRoleDto(
                    roleKey = roleKey,
                    requiredCount = requiredCount,
                    candidates =
                        scored.map {
                            SummaryRoleCandidateDto(
                                participantId = it.participantId,
                                displayName = it.displayName,
                                avatarUrl = it.avatarUrl,
                                chancePercent = it.chancePercent,
                            )
                        },
                )
            }

        return EventAvailabilitySummaryResponse(
            eventId = event.id,
            roleSlots = event.roleSlots,
            participants = participants,
            roles = roles,
        )
    }

    private data class EligibleParticipantRow(
        val participantId: UUID,
        val userId: UUID?,
        val displayName: String,
        val avatarUrl: String?,
    )

    private fun loadEligibleParticipants(
        seasonId: UUID,
        eventId: UUID,
    ): List<EligibleParticipantRow> {
        val seasonRows =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
                .filter { row ->
                    row.troupeMembership == null ||
                        row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
                }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val byId = linkedMapOf<UUID, EligibleParticipantRow>()
        val seenUserIds = mutableSetOf<UUID>()

        for (row in seasonRows) {
            byId[row.id] = toEligibleRow(row.id, row.user, row.displayName)
            row.user?.id?.let { seenUserIds.add(it) }
        }

        val eventRows =
            eventParticipantRepository.findByEvent_IdAndStatusOrderByDisplayNameAsc(
                eventId,
                ParticipantStatus.ACTIVE,
            )
        for (row in eventRows) {
            val linkedSeasonId = row.seasonParticipant?.id
            if (linkedSeasonId != null && linkedSeasonId in seasonParticipantIds) {
                continue
            }
            // Deduplicate by userId: skip if a season participant already covers this user.
            val userId = row.user?.id
            if (userId != null && userId in seenUserIds) {
                continue
            }
            byId[row.id] = toEligibleRow(row.id, row.user, row.displayName)
            userId?.let { seenUserIds.add(it) }
        }

        return byId.values.sortedBy { it.displayName.lowercase() }
    }

    private fun toEligibleRow(
        participantId: UUID,
        user: UserEntity?,
        displayName: String,
    ): EligibleParticipantRow {
        val avatarUrl =
            user?.let { AvatarService.publicAvatarUrl(it.id, it.avatarUpdatedAt) }
        return EligibleParticipantRow(
            participantId = participantId,
            userId = user?.id,
            displayName = displayName,
            avatarUrl = avatarUrl,
        )
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

    private fun findRow(
        eventId: UUID,
        userId: UUID,
    ): EventAvailabilityEntity? = availabilityRepository.findByEvent_IdAndUser_Id(eventId, userId)

    private fun toResponse(row: EventAvailabilityEntity?): MyAvailabilityResponse =
        if (row == null) {
            MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN)
        } else {
            MyAvailabilityResponse(
                status = AvailabilityStatusMapper.toApi(row.status),
                updatedAt = row.updatedAt,
                roleKeys = if (row.status == StoredAvailabilityStatus.AVAILABLE) row.roleKeys else emptyList(),
            )
        }
}
