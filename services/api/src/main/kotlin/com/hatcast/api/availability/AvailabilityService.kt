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
import com.hatcast.api.organizer.OrganizerAccessService
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
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
    private val organizerAccess: OrganizerAccessService,
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
        return toResponse(findRowForUser(event.id, principal.userId))
    }

    @Transactional
    fun setMyStatus(
        seasonId: UUID,
        eventId: UUID,
        body: SetMyAvailabilityRequest,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireEditableEvent(event)
        val user =
            userRepository.findById(principal.userId).orElseThrow {
                ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu")
            }
        return upsertForLinkedUser(
            event = event,
            user = user,
            body = body,
            recordedByUserId = null,
        )
    }

    @Transactional
    fun setParticipantStatus(
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
        body: SetMyAvailabilityRequest,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireEditableEvent(event)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Droits insuffisants")
        }
        val subject = resolveEligibleSubject(seasonId, event, participantId)
        return when (subject) {
            is AvailabilitySubject.LinkedUser ->
                upsertForLinkedUser(
                    event = event,
                    user = subject.user,
                    body = body,
                    recordedByUserId = principal.userId,
                )
            is AvailabilitySubject.SeasonParticipant ->
                upsertForSeasonParticipant(
                    event = event,
                    participant = subject.participant,
                    body = body,
                    recordedByUserId = principal.userId,
                )
            is AvailabilitySubject.EventParticipant ->
                upsertForEventParticipant(
                    event = event,
                    participant = subject.participant,
                    body = body,
                    recordedByUserId = principal.userId,
                )
        }
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

    /** Status for a season participant on listed events (Historique participant filter — story 3.6b). */
    @Transactional(readOnly = true)
    fun participantStatusByEventIds(
        seasonId: UUID,
        eventIds: Collection<UUID>,
        seasonParticipantId: UUID,
    ): Map<UUID, String> {
        if (eventIds.isEmpty()) {
            return emptyMap()
        }
        val sp =
            seasonParticipantRepository
                .findById(seasonParticipantId)
                .orElseThrow {
                    ResponseStatusException(HttpStatus.BAD_REQUEST, "Participant inconnu")
                }
        if (sp.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Participant inconnu")
        }
        val linkedUserId = sp.user?.id ?: sp.troupeMembership?.user?.id
        val rows =
            if (linkedUserId != null) {
                availabilityRepository.findByEvent_IdInAndUser_Id(eventIds, linkedUserId)
            } else {
                availabilityRepository.findByEvent_IdInAndSeasonParticipant_Id(
                    eventIds,
                    seasonParticipantId,
                )
            }
        val byEvent = rows.associate { it.event.id to AvailabilityStatusMapper.toApi(it.status) }
        return eventIds.associateWith { byEvent[it] ?: AvailabilityStatusMapper.UNKNOWN }
    }

    @Transactional
    fun getSummary(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
        includeChances: Boolean = false,
    ): EventAvailabilitySummaryResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        seasonParticipantService.ensureMembershipParticipants(season)
        val eligible = loadEligibleParticipants(seasonId, event.id)
        val availabilityIndex = buildAvailabilityIndex(event.id)

        val participants =
            eligible.map { row ->
                val availability = availabilityIndex.forParticipant(row.participantId, row.userId)
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

        val requiredRoles = AvailabilityRoleRules.rolesRequiredForEvent(event.roleSlots)
        val historyCounts =
            if (includeChances) {
                selectionHistory.pastSelectionCountByParticipantAndRole(seasonId, event.id)
            } else {
                emptyMap()
            }
        val roles =
            requiredRoles.map { roleKey ->
                val requiredCount = event.roleSlots[roleKey] ?: 0
                val roleCandidates =
                    participants.filter { participant ->
                        AvailabilityRoleRules.isCandidateForRole(
                            participant.status,
                            participant.roleKeys,
                            roleKey,
                        )
                    }
                val chanceByParticipantId =
                    if (includeChances) {
                        val pastByParticipant =
                            selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)
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
                        ).associate { it.participantId to it.chancePercent }
                    } else {
                        emptyMap()
                    }
                val candidates =
                    roleCandidates.map { row ->
                        SummaryRoleCandidateDto(
                            participantId = row.participantId,
                            displayName = row.displayName,
                            avatarUrl = row.avatarUrl,
                            chancePercent = chanceByParticipantId[row.participantId],
                        )
                    }
                SummaryRoleDto(
                    roleKey = roleKey,
                    requiredCount = requiredCount,
                    candidates = candidates,
                )
            }

        return EventAvailabilitySummaryResponse(
            eventId = event.id,
            roleSlots = event.roleSlots,
            participants = participants,
            roles = roles,
        )
    }

    private sealed class AvailabilitySubject {
        data class LinkedUser(val user: UserEntity) : AvailabilitySubject()

        data class SeasonParticipant(val participant: SeasonParticipantEntity) : AvailabilitySubject()

        data class EventParticipant(val participant: EventParticipantEntity) : AvailabilitySubject()
    }

    private data class AvailabilityIndex(
        private val byUserId: Map<UUID, EventAvailabilityEntity>,
        private val bySeasonParticipantId: Map<UUID, EventAvailabilityEntity>,
        private val byEventParticipantId: Map<UUID, EventAvailabilityEntity>,
    ) {
        fun forParticipant(
            participantId: UUID,
            userId: UUID?,
        ): EventAvailabilityEntity? =
            when {
                userId != null -> byUserId[userId]
                else ->
                    bySeasonParticipantId[participantId]
                        ?: byEventParticipantId[participantId]
            }
    }

    private fun buildAvailabilityIndex(eventId: UUID): AvailabilityIndex {
        val rows = availabilityRepository.findByEvent_Id(eventId)
        return AvailabilityIndex(
            byUserId = rows.mapNotNull { row -> row.user?.id?.let { it to row } }.toMap(),
            bySeasonParticipantId =
                rows.mapNotNull { row ->
                    row.seasonParticipant?.id?.let { it to row }
                }.toMap(),
            byEventParticipantId =
                rows.mapNotNull { row ->
                    row.eventParticipant?.id?.let { it to row }
                }.toMap(),
        )
    }

    private fun resolveEligibleSubject(
        seasonId: UUID,
        event: EventEntity,
        participantId: UUID,
    ): AvailabilitySubject {
        val eligible = loadEligibleParticipants(seasonId, event.id)
        val row =
            eligible.find { it.participantId == participantId }
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")

        seasonParticipantRepository.findById(participantId).orElse(null)?.let { sp ->
            if (sp.season.id != seasonId || sp.status != ParticipantStatus.ACTIVE) {
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
            }
            return if (sp.user != null) {
                AvailabilitySubject.LinkedUser(sp.user!!)
            } else {
                AvailabilitySubject.SeasonParticipant(sp)
            }
        }

        eventParticipantRepository.findById(participantId).orElse(null)?.let { ep ->
            if (ep.event.id != event.id || ep.status != ParticipantStatus.ACTIVE) {
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
            }
            return if (ep.user != null) {
                AvailabilitySubject.LinkedUser(ep.user!!)
            } else {
                AvailabilitySubject.EventParticipant(ep)
            }
        }

        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
    }

    private fun upsertForLinkedUser(
        event: EventEntity,
        user: UserEntity,
        body: SetMyAvailabilityRequest,
        recordedByUserId: UUID?,
    ): MyAvailabilityResponse {
        val stored = parseStoredStatus(body)
        val existing = findRowForUser(event.id, user.id)
        if (stored == null) {
            if (existing != null) {
                availabilityRepository.delete(existing)
            }
            return MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN, roleKeys = emptyList())
        }
        val roleKeys = roleKeysForWrite(event, stored, body)
        val now = Instant.now()
        val saved =
            if (existing != null) {
                existing.status = stored
                existing.roleKeys = roleKeys
                existing.updatedAt = now
                if (recordedByUserId != null) {
                    existing.recordedByUserId = recordedByUserId
                }
                availabilityRepository.save(existing)
            } else {
                availabilityRepository.save(
                    EventAvailabilityEntity(
                        event = event,
                        user = user,
                        status = stored,
                        roleKeys = roleKeys,
                        recordedByUserId = recordedByUserId,
                        now = now,
                    ),
                )
            }
        return toResponse(saved)
    }

    private fun upsertForSeasonParticipant(
        event: EventEntity,
        participant: SeasonParticipantEntity,
        body: SetMyAvailabilityRequest,
        recordedByUserId: UUID,
    ): MyAvailabilityResponse = upsertForParticipantScopedRow(
        event = event,
        existing = availabilityRepository.findByEvent_IdAndSeasonParticipant_Id(event.id, participant.id),
        stored = parseStoredStatus(body),
        roleKeys = { stored -> roleKeysForWrite(event, stored, body) },
        create = { stored, roleKeys, now ->
            EventAvailabilityEntity(
                event = event,
                seasonParticipant = participant,
                status = stored,
                roleKeys = roleKeys,
                recordedByUserId = recordedByUserId,
                now = now,
            )
        },
        recordedByUserId = recordedByUserId,
    )

    private fun upsertForEventParticipant(
        event: EventEntity,
        participant: EventParticipantEntity,
        body: SetMyAvailabilityRequest,
        recordedByUserId: UUID,
    ): MyAvailabilityResponse = upsertForParticipantScopedRow(
        event = event,
        existing = availabilityRepository.findByEvent_IdAndEventParticipant_Id(event.id, participant.id),
        stored = parseStoredStatus(body),
        roleKeys = { stored -> roleKeysForWrite(event, stored, body) },
        create = { stored, roleKeys, now ->
            EventAvailabilityEntity(
                event = event,
                eventParticipant = participant,
                status = stored,
                roleKeys = roleKeys,
                recordedByUserId = recordedByUserId,
                now = now,
            )
        },
        recordedByUserId = recordedByUserId,
    )

    private fun upsertForParticipantScopedRow(
        event: EventEntity,
        existing: EventAvailabilityEntity?,
        stored: StoredAvailabilityStatus?,
        roleKeys: (StoredAvailabilityStatus) -> List<String>,
        create: (StoredAvailabilityStatus, List<String>, Instant) -> EventAvailabilityEntity,
        recordedByUserId: UUID,
    ): MyAvailabilityResponse {
        if (stored == null) {
            if (existing != null) {
                availabilityRepository.delete(existing)
            }
            return MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN, roleKeys = emptyList())
        }
        val keys = roleKeys(stored)
        val now = Instant.now()
        val saved =
            if (existing != null) {
                existing.status = stored
                existing.roleKeys = keys
                existing.updatedAt = now
                existing.recordedByUserId = recordedByUserId
                availabilityRepository.save(existing)
            } else {
                availabilityRepository.save(create(stored, keys, now))
            }
        return toResponse(saved)
    }

    private fun parseStoredStatus(body: SetMyAvailabilityRequest): StoredAvailabilityStatus? {
        val apiStatus =
            try {
                AvailabilityStatusMapper.parseApi(body.status)
            } catch (_: IllegalArgumentException) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "status invalide")
            }
        return AvailabilityStatusMapper.toStored(apiStatus)
    }

    private fun roleKeysForWrite(
        event: EventEntity,
        stored: StoredAvailabilityStatus,
        body: SetMyAvailabilityRequest,
    ): List<String> =
        if (stored == StoredAvailabilityStatus.AVAILABLE) {
            AvailabilityRoleRules.normalizeRoleKeys(
                event.roleSlots,
                body.roleKeys,
                applyVolunteerRule = body.applyVolunteerRule ?: true,
            )
        } else {
            emptyList()
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

    private fun requireEditableEvent(event: EventEntity) {
        if (event.archived) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Événement archivé")
        }
    }

    private fun findRowForUser(
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
