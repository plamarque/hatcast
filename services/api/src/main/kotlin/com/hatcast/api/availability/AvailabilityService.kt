package com.hatcast.api.availability

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.dto.EventAvailabilitySummaryResponse
import com.hatcast.api.availability.dto.MyAvailabilityResponse
import com.hatcast.api.availability.dto.SetMyAvailabilityRequest
import com.hatcast.api.availability.dto.SummaryParticipantDto
import com.hatcast.api.availability.dto.SummaryRoleCandidateDto
import com.hatcast.api.availability.dto.SummaryRoleDto
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.participant.ParticipantRowPresentation
import com.hatcast.api.composition.CompositionDrawChanceSnapshotService
import com.hatcast.api.composition.CompositionSelectionHistoryService
import com.hatcast.api.composition.SelectionHistoryMode
import com.hatcast.api.composition.SelectionHistoryModeResolver
import com.hatcast.api.event.EventDraftVisibility
import com.hatcast.api.event.EventDraftVisibility.Companion.DRAFT_AVAILABILITY_CLOSED_MESSAGE
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.isAvailabilityOpen
import com.hatcast.api.organizer.OrganizerAccessService
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.notification.ProxyAvailabilityRecordedEvent
import com.hatcast.api.notification.ProxyNotificationLabels
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.context.ApplicationEventPublisher
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
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val troupeAccess: TroupeAccessService,
    private val organizerAccess: OrganizerAccessService,
    private val userRepository: UserRepository,
    private val selectionHistory: CompositionSelectionHistoryService,
    private val drawChanceSnapshots: CompositionDrawChanceSnapshotService,
    private val auditRecorder: AuditEventRecorder,
    private val draftVisibility: EventDraftVisibility,
    private val eventPublisher: ApplicationEventPublisher,
    private val avatarService: AvatarService,
) {
    @Transactional(readOnly = true)
    fun getMyStatus(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireEditableEvent(event)
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
        requireAvailabilityOpenForWrite(event, seasonId, principal)
        val user =
            userRepository.findById(principal.userId).orElseThrow {
                ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu")
            }
        return upsertForLinkedUser(
            event = event,
            user = user,
            body = body,
            actorUserId = principal.userId,
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
        requireAvailabilityOpenForWrite(event, seasonId, principal)
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
                    actorUserId = principal.userId,
                    recordedByUserId = principal.userId,
                )
            is AvailabilitySubject.SeasonParticipant ->
                upsertForSeasonParticipant(
                    event = event,
                    participant = subject.participant,
                    body = body,
                    actorUserId = principal.userId,
                    recordedByUserId = principal.userId,
                )
            is AvailabilitySubject.EventParticipant ->
                upsertForEventParticipant(
                    event = event,
                    participant = subject.participant,
                    body = body,
                    actorUserId = principal.userId,
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

    @Transactional(readOnly = true)
    fun getSummary(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
        includeChances: Boolean = false,
    ): EventAvailabilitySummaryResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        requireAvailabilitySummaryReadable(event, seasonId, principal)
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
                    gender = row.gender,
                    status = apiStatus,
                    roleKeys = roleKeys,
                    comment = availability?.comment?.takeIf { it.isNotBlank() },
                )
            }

        val requiredRoles = AvailabilityRoleRules.rolesRequiredForEvent(event.roleSlots)
        val historyMode = SelectionHistoryModeResolver.forEvent(event)
        val snapshotByRoleAndParticipant =
            if (includeChances && historyMode == SelectionHistoryMode.RETROSPECTIVE) {
                drawChanceSnapshots
                    .findByEventId(event.id)
                    .associateBy { it.id.roleKey to it.id.participantId }
            } else {
                emptyMap()
            }
        val hasSnapshots = snapshotByRoleAndParticipant.isNotEmpty()
        // Retrospective fallback: candidates without a snapshot row are recalculated live.
        val historyCounts =
            if (includeChances) {
                selectionHistory.pastSelectionCountByParticipantAndRole(event, historyMode)
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
                var roleUsedEstimatedFallback = false
                val candidates =
                    if (includeChances) {
                        // Per (roleKey, participant): prefer the draw snapshot, fall back to a
                        // retrospective recalc for candidates that have no snapshot row.
                        val roleHasMissingSnapshot =
                            historyMode == SelectionHistoryMode.RETROSPECTIVE &&
                                hasSnapshots &&
                                roleCandidates.any {
                                    snapshotByRoleAndParticipant[roleKey to it.participantId] == null
                                }
                        val needsScoring =
                            historyMode == SelectionHistoryMode.OPERATIONAL ||
                                !hasSnapshots ||
                                roleHasMissingSnapshot
                        val scoredByParticipant =
                            if (needsScoring) {
                                val pastByParticipant =
                                    selectionHistory.pastSelectionCountByParticipant(historyCounts, roleKey)
                                AvailabilityChanceCalculator
                                    .scoreCandidates(
                                        roleCandidates.map {
                                            AvailabilityChanceCalculator.Candidate(
                                                participantId = it.participantId,
                                                displayName = it.displayName,
                                                avatarUrl = it.avatarUrl,
                                            )
                                        },
                                        requiredCount,
                                        pastByParticipant,
                                    ).associateBy { it.participantId }
                            } else {
                                emptyMap()
                            }
                        roleCandidates.map { row ->
                            val snapshot = snapshotByRoleAndParticipant[roleKey to row.participantId]
                            val chancePercent =
                                if (snapshot != null) {
                                    snapshot.chancePercent
                                } else {
                                    if (historyMode == SelectionHistoryMode.RETROSPECTIVE && hasSnapshots) {
                                        roleUsedEstimatedFallback = true
                                    }
                                    scoredByParticipant[row.participantId]?.chancePercent
                                }
                            SummaryRoleCandidateDto(
                                participantId = row.participantId,
                                displayName = row.displayName,
                                avatarUrl = row.avatarUrl,
                                chancePercent = chancePercent,
                            )
                        }
                    } else {
                        roleCandidates.map { row ->
                            SummaryRoleCandidateDto(
                                participantId = row.participantId,
                                displayName = row.displayName,
                                avatarUrl = row.avatarUrl,
                                chancePercent = null,
                            )
                        }
                    }
                SummaryRoleDto(
                    roleKey = roleKey,
                    requiredCount = requiredCount,
                    candidates = candidates,
                    hasPartialEstimatedChances = roleUsedEstimatedFallback,
                )
            }
        val chanceSource =
            if (!includeChances) {
                null
            } else if (historyMode == SelectionHistoryMode.OPERATIONAL) {
                "live"
            } else if (hasSnapshots) {
                "snapshot"
            } else {
                "estimated"
            }

        return EventAvailabilitySummaryResponse(
            eventId = event.id,
            roleSlots = event.roleSlots,
            participants = participants,
            roles = roles,
            chanceSource = chanceSource,
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
            sp.user?.let { return AvailabilitySubject.LinkedUser(it) }
            sp.troupeMembership?.user?.let { return AvailabilitySubject.LinkedUser(it) }
            return AvailabilitySubject.SeasonParticipant(sp)
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
        actorUserId: UUID,
        recordedByUserId: UUID?,
    ): MyAvailabilityResponse {
        val stored = parseStoredStatus(body)
        validateComment(body.comment)
        val normalizedComment = normalizeComment(body.comment)
        val existing = findRowForUser(event.id, user.id)
        if (stored == null) {
            if (existing != null) {
                val beforeSnapshot = AuditSnapshots.availability(existing)
                recordAvailabilityAudit(
                    event = event,
                    actorUserId = actorUserId,
                    subjectUserId = user.id,
                    before = beforeSnapshot,
                    after = null,
                    actionType = AuditActionType.AVAILABILITY_DELETED,
                )
                availabilityRepository.delete(existing)
                publishProxyAvailabilityIfEligible(
                    event = event,
                    user = user,
                    actorUserId = actorUserId,
                    recordedByUserId = recordedByUserId,
                    beforeSnapshot = beforeSnapshot,
                    afterSnapshot = null,
                )
            }
            return MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN, roleKeys = emptyList())
        }
        val roleKeys = roleKeysForWrite(event, stored, body)
        val now = Instant.now()
        val beforeSnapshot = AuditSnapshots.availability(existing)
        val saved =
            if (existing != null) {
                existing.status = stored
                existing.roleKeys = roleKeys
                existing.comment = normalizedComment
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
                    ).also { it.comment = normalizedComment },
                )
            }
        val afterSnapshot = AuditSnapshots.availability(saved)
        if (existing == null || beforeSnapshot != afterSnapshot) {
            recordAvailabilityAudit(
                event = event,
                actorUserId = actorUserId,
                subjectUserId = user.id,
                before = beforeSnapshot,
                after = afterSnapshot,
                actionType =
                    if (existing == null) {
                        AuditActionType.AVAILABILITY_CREATED
                    } else {
                        AuditActionType.AVAILABILITY_UPDATED
                    },
            )
            publishProxyAvailabilityIfEligible(
                event = event,
                user = user,
                actorUserId = actorUserId,
                recordedByUserId = recordedByUserId,
                beforeSnapshot = beforeSnapshot,
                afterSnapshot = afterSnapshot,
            )
        }
        return toResponse(saved)
    }

    private fun publishProxyAvailabilityIfEligible(
        event: EventEntity,
        user: UserEntity,
        actorUserId: UUID,
        recordedByUserId: UUID?,
        beforeSnapshot: Map<String, Any?>?,
        afterSnapshot: Map<String, Any?>?,
    ) {
        if (recordedByUserId == null || actorUserId == user.id) {
            return
        }
        eventPublisher.publishEvent(
            ProxyAvailabilityRecordedEvent(
                eventId = event.id,
                seasonId = event.season.id,
                troupeId = event.season.troupe.id,
                actorUserId = actorUserId,
                subjectUserId = user.id,
                change = ProxyNotificationLabels.buildAvailabilityChangeFromAudit(beforeSnapshot, afterSnapshot),
            ),
        )
    }

    private fun upsertForSeasonParticipant(
        event: EventEntity,
        participant: SeasonParticipantEntity,
        body: SetMyAvailabilityRequest,
        actorUserId: UUID,
        recordedByUserId: UUID,
    ): MyAvailabilityResponse = upsertForParticipantScopedRow(
        event = event,
        existing = availabilityRepository.findByEvent_IdAndSeasonParticipant_Id(event.id, participant.id),
        body = body,
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
        actorUserId = actorUserId,
        subjectSeasonParticipantId = participant.id,
        displayName = participant.displayName,
        recordedByUserId = recordedByUserId,
    )

    private fun upsertForEventParticipant(
        event: EventEntity,
        participant: EventParticipantEntity,
        body: SetMyAvailabilityRequest,
        actorUserId: UUID,
        recordedByUserId: UUID,
    ): MyAvailabilityResponse = upsertForParticipantScopedRow(
        event = event,
        existing = availabilityRepository.findByEvent_IdAndEventParticipant_Id(event.id, participant.id),
        body = body,
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
        actorUserId = actorUserId,
        subjectEventParticipantId = participant.id,
        displayName = participant.displayName,
        recordedByUserId = recordedByUserId,
    )

    private fun upsertForParticipantScopedRow(
        event: EventEntity,
        existing: EventAvailabilityEntity?,
        body: SetMyAvailabilityRequest,
        stored: StoredAvailabilityStatus?,
        roleKeys: (StoredAvailabilityStatus) -> List<String>,
        create: (StoredAvailabilityStatus, List<String>, Instant) -> EventAvailabilityEntity,
        actorUserId: UUID,
        subjectSeasonParticipantId: UUID? = null,
        subjectEventParticipantId: UUID? = null,
        displayName: String? = null,
        recordedByUserId: UUID,
    ): MyAvailabilityResponse {
        validateComment(body.comment)
        val normalizedComment = normalizeComment(body.comment)
        if (stored == null) {
            if (existing != null) {
                recordAvailabilityAudit(
                    event = event,
                    actorUserId = actorUserId,
                    subjectSeasonParticipantId = subjectSeasonParticipantId,
                    subjectEventParticipantId = subjectEventParticipantId,
                    displayName = displayName,
                    before = AuditSnapshots.availability(existing),
                    after = null,
                    actionType = AuditActionType.AVAILABILITY_DELETED,
                )
                availabilityRepository.delete(existing)
            }
            return MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN, roleKeys = emptyList())
        }
        val keys = roleKeys(stored)
        val now = Instant.now()
        val beforeSnapshot = AuditSnapshots.availability(existing)
        val saved =
            if (existing != null) {
                existing.status = stored
                existing.roleKeys = keys
                existing.comment = normalizedComment
                existing.updatedAt = now
                existing.recordedByUserId = recordedByUserId
                availabilityRepository.save(existing)
            } else {
                availabilityRepository.save(create(stored, keys, now).also { it.comment = normalizedComment })
            }
        val afterSnapshot = AuditSnapshots.availability(saved)
        if (existing == null || beforeSnapshot != afterSnapshot) {
            recordAvailabilityAudit(
                event = event,
                actorUserId = actorUserId,
                subjectSeasonParticipantId = subjectSeasonParticipantId,
                subjectEventParticipantId = subjectEventParticipantId,
                displayName = displayName,
                before = beforeSnapshot,
                after = afterSnapshot,
                actionType =
                    if (existing == null) {
                        AuditActionType.AVAILABILITY_CREATED
                    } else {
                        AuditActionType.AVAILABILITY_UPDATED
                    },
            )
        }
        return toResponse(saved)
    }

    private fun recordAvailabilityAudit(
        event: EventEntity,
        actorUserId: UUID,
        subjectUserId: UUID? = null,
        subjectSeasonParticipantId: UUID? = null,
        subjectEventParticipantId: UUID? = null,
        displayName: String? = null,
        before: Map<String, Any?>?,
        after: Map<String, Any?>?,
        actionType: AuditActionType,
    ) {
        auditRecorder.record(
            AuditRecordRequest(
                actionType = actionType,
                actorUserId = actorUserId,
                subjectUserId = subjectUserId,
                subjectSeasonParticipantId = subjectSeasonParticipantId,
                subjectEventParticipantId = subjectEventParticipantId,
                troupeId = event.season.troupe.id,
                seasonId = event.season.id,
                eventId = event.id,
                before = before,
                after = after,
                metadata = displayName?.let { AuditSnapshots.participantMetadata(it) },
            ),
        )
    }

    private fun validateComment(comment: String?) {
        if (comment != null && comment.length > MAX_AVAILABILITY_COMMENT_LENGTH) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le commentaire ne peut pas dépasser $MAX_AVAILABILITY_COMMENT_LENGTH caractères",
            )
        }
    }

    private fun normalizeComment(comment: String?): String? = comment?.trim()?.takeIf { it.isNotEmpty() }

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
        val gender: String,
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
        val excluded =
            eventParticipantExclusionRepository
                .findByIdEventId(eventId)
                .map { it.id.seasonParticipantId }
                .toSet()
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val byId = linkedMapOf<UUID, EligibleParticipantRow>()
        val seenUserIds = mutableSetOf<UUID>()

        for (row in seasonRows) {
            if (row.id in excluded) {
                continue
            }
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

        return byId.values.sortedByFrenchDisplayName { it.displayName }
    }

    private fun toEligibleRow(
        participantId: UUID,
        user: UserEntity?,
        displayName: String,
    ): EligibleParticipantRow {
        val avatarUrl = ParticipantRowPresentation.avatarUrl(avatarService, user)
        return EligibleParticipantRow(
            participantId = participantId,
            userId = user?.id,
            displayName = displayName,
            avatarUrl = avatarUrl,
            gender = com.hatcast.api.user.MemberGender.effective(user?.gender).wireValue,
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

    private fun requireAvailabilityOpenForWrite(
        event: EventEntity,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        requireEditableEvent(event)
        if (!event.isAvailabilityOpen()) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                draftAvailabilityClosedMessage(event, seasonId, principal),
            )
        }
    }

    private fun requireAvailabilitySummaryReadable(
        event: EventEntity,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ) {
        if (draftVisibility.isDraft(event) &&
            !draftVisibility.canViewDraftEvent(event.id, seasonId, principal)
        ) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                DRAFT_AVAILABILITY_CLOSED_MESSAGE,
            )
        }
    }

    private fun draftAvailabilityClosedMessage(
        event: EventEntity,
        seasonId: UUID,
        principal: SessionUserPrincipal,
    ): String =
        if (draftVisibility.canViewDraftEvent(event.id, seasonId, principal)) {
            "Les disponibilités ne sont pas encore ouvertes pour ce spectacle."
        } else {
            DRAFT_AVAILABILITY_CLOSED_MESSAGE
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
                comment = row.comment?.takeIf { it.isNotBlank() },
            )
        }

    companion object {
        private const val MAX_AVAILABILITY_COMMENT_LENGTH = 500
    }
}
