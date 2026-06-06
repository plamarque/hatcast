package com.hatcast.api.participant

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.dto.EventParticipantAdminDto
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.participant.dto.ParticipantCreateRequest
import com.hatcast.api.participant.dto.ParticipantUpdateRequest
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeExterneCarnetService
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
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
class EventParticipantService(
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventRepository: EventRepository,
    private val userRepository: UserRepository,
    private val participantAccess: ParticipantAccessService,
    private val participantLink: ParticipantLinkService,
    private val auditRecorder: AuditEventRecorder,
    private val troupeExterneCarnetService: TroupeExterneCarnetService,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val seasonParticipantService: SeasonParticipantService,
) {
    @Transactional(readOnly = true)
    fun listAdmin(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): List<EventParticipantAdminDto> {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val includeEmail = participantAccess.canViewEventParticipantEmail(eventId, seasonId, principal)
        return eventParticipantRepository
            .findByEvent_IdAndStatusOrderByDisplayNameAsc(eventId, ParticipantStatus.ACTIVE)
            .sortedByFrenchDisplayName { it.displayName }
            .map { EventParticipantAdminDto.from(it, includeEmail) }
    }

    @Transactional
    fun create(
        seasonId: UUID,
        eventId: UUID,
        body: ParticipantCreateRequest,
        principal: SessionUserPrincipal,
    ): EventParticipantAdminDto {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        val displayName = body.displayName.trim()
        if (displayName.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'affichage requis.")
        }
        val normalizedEmail = participantLink.normalizeEmail(body.email)
        val linkedUser = participantLink.resolveUserId(normalizedEmail)?.let { userRepository.findById(it).orElse(null) }
        val memberMembership = resolveActiveMemberMembership(event.season, body, linkedUser)

        if (memberMembership != null) {
            return createMemberEventParticipant(
                event = event,
                seasonId = seasonId,
                displayName = displayName,
                normalizedEmail = normalizedEmail,
                linkedUser = linkedUser,
                principal = principal,
                genderRaw = body.gender,
            )
        }

        val carnet =
            troupeExterneCarnetService.upsertActiveExterne(
                troupeId = event.season.troupe.id,
                displayName = displayName,
                email = body.email,
                actorUserId = principal.userId,
            )
        val carnetEmail =
            carnet.user?.email?.let { participantLink.normalizeEmail(it) } ?: carnet.normalizedEmail

        val seasonRow =
            if (body.addToSeasonRoster) {
                seasonParticipantService.upsertEventScopedSeasonRow(
                    season = event.season,
                    carnet = carnet,
                    actorUserId = principal.userId,
                )
            } else {
                null
            }

        val reactivatable =
            findReactivatableRemovedEventParticipant(
                eventId = eventId,
                linkedUser = carnet.user ?: linkedUser,
                normalizedEmail = carnetEmail,
                displayName = carnet.displayName,
                troupeMembershipId = carnet.id,
            )
        if (reactivatable != null) {
            return reactivateRemovedEventParticipant(
                event = event,
                seasonId = seasonId,
                existing = reactivatable,
                carnet = carnet,
                seasonRow = seasonRow,
                principal = principal,
                genderRaw = body.gender,
            )
        }

        findActiveEventParticipant(
            eventId = eventId,
            linkedUser = carnet.user ?: linkedUser,
            normalizedEmail = carnetEmail,
            displayName = carnet.displayName,
            troupeMembershipId = carnet.id,
        )?.let {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Un participant avec ce nom existe déjà pour ce spectacle.",
            )
        }

        val now = Instant.now()
        val saved =
            eventParticipantRepository.save(
                EventParticipantEntity(
                    event = event,
                    displayName = carnet.displayName,
                    normalizedEmail = carnetEmail,
                    user = carnet.user,
                    seasonParticipant = seasonRow,
                    status = ParticipantStatus.ACTIVE,
                    createdAt = now,
                    updatedAt = now,
                ).also {
                    ParticipantGenderWriteSupport.applyGenderFromRequest(it, carnet.user, body.gender)
                },
            )
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_PARTICIPANT_ADDED,
                actorUserId = principal.userId,
                subjectEventParticipantId = saved.id,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                after = AuditSnapshots.eventParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return EventParticipantAdminDto.from(saved, includeEmail = true)
    }

    private fun resolveActiveMemberMembership(
        season: com.hatcast.api.season.SeasonEntity,
        body: ParticipantCreateRequest,
        linkedUser: UserEntity?,
    ): TroupeMembershipEntity? {
        body.troupeMembershipId?.let { membershipId ->
            val membership =
                troupeMembershipRepository.findByIdAndTroupe_Id(membershipId, season.troupe.id)
                    ?: return@let null
            if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
                return@let null
            }
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
            return membership
        }
        if (linkedUser != null) {
            val membership =
                troupeMembershipRepository.findByTroupe_IdAndUser_Id(season.troupe.id, linkedUser.id)
                    ?: return null
            if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
                return null
            }
            if (membership.status != TroupeMembershipStatus.ACTIVE) {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Réactivez d'abord l'adhésion à la troupe.",
                )
            }
            return membership
        }
        return null
    }

    private fun createMemberEventParticipant(
        event: com.hatcast.api.event.EventEntity,
        seasonId: UUID,
        displayName: String,
        normalizedEmail: String?,
        linkedUser: UserEntity?,
        principal: SessionUserPrincipal,
        genderRaw: String?,
    ): EventParticipantAdminDto {
        val now = Instant.now()
        val saved =
            eventParticipantRepository.save(
                EventParticipantEntity(
                    event = event,
                    displayName = displayName,
                    normalizedEmail = normalizedEmail,
                    user = linkedUser,
                    status = ParticipantStatus.ACTIVE,
                    createdAt = now,
                    updatedAt = now,
                ).also {
                    ParticipantGenderWriteSupport.applyGenderFromRequest(it, linkedUser, genderRaw)
                },
            )
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_PARTICIPANT_ADDED,
                actorUserId = principal.userId,
                subjectEventParticipantId = saved.id,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = event.id,
                after = AuditSnapshots.eventParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return EventParticipantAdminDto.from(saved, includeEmail = true)
    }

    private fun findActiveEventParticipant(
        eventId: UUID,
        linkedUser: UserEntity?,
        normalizedEmail: String?,
        displayName: String,
        troupeMembershipId: UUID?,
    ): EventParticipantEntity? {
        if (troupeMembershipId != null) {
            eventParticipantRepository
                .findByEvent_IdAndStatusAndSeasonParticipant_TroupeMembership_Id(
                    eventId,
                    ParticipantStatus.ACTIVE,
                    troupeMembershipId,
                ).firstOrNull()
                ?.let { return it }
        }
        if (linkedUser != null) {
            eventParticipantRepository
                .findByEvent_IdAndStatusAndUser_Id(eventId, ParticipantStatus.ACTIVE, linkedUser.id)
                .firstOrNull()
                ?.let { return it }
        }
        if (normalizedEmail != null) {
            eventParticipantRepository
                .findByEvent_IdAndStatusAndSeasonParticipantIsNullAndNormalizedEmailIgnoreCase(
                    eventId,
                    ParticipantStatus.ACTIVE,
                    normalizedEmail,
                ).firstOrNull()
                ?.let { return it }
        }
        return eventParticipantRepository
            .findByEvent_IdAndStatusAndSeasonParticipantIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
                eventId,
                ParticipantStatus.ACTIVE,
                displayName,
            ).firstOrNull()
    }

    private fun findReactivatableRemovedEventParticipant(
        eventId: UUID,
        linkedUser: UserEntity?,
        normalizedEmail: String?,
        displayName: String,
        troupeMembershipId: UUID?,
    ): EventParticipantEntity? {
        if (troupeMembershipId != null) {
            eventParticipantRepository
                .findByEvent_IdAndStatusAndSeasonParticipant_TroupeMembership_Id(
                    eventId,
                    ParticipantStatus.REMOVED,
                    troupeMembershipId,
                ).firstOrNull()
                ?.let { return it }
        }
        if (linkedUser != null) {
            eventParticipantRepository
                .findByEvent_IdAndStatusAndUser_Id(eventId, ParticipantStatus.REMOVED, linkedUser.id)
                .firstOrNull()
                ?.let { return it }
        }
        if (normalizedEmail != null) {
            return eventParticipantRepository
                .findByEvent_IdAndStatusAndSeasonParticipantIsNullAndNormalizedEmailIgnoreCase(
                    eventId,
                    ParticipantStatus.REMOVED,
                    normalizedEmail,
                ).firstOrNull()
        }
        return eventParticipantRepository
            .findByEvent_IdAndStatusAndSeasonParticipantIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
                eventId,
                ParticipantStatus.REMOVED,
                displayName,
            ).firstOrNull()
    }

    private fun reactivateRemovedEventParticipant(
        event: com.hatcast.api.event.EventEntity,
        seasonId: UUID,
        existing: EventParticipantEntity,
        carnet: TroupeMembershipEntity,
        seasonRow: SeasonParticipantEntity?,
        principal: SessionUserPrincipal,
        genderRaw: String?,
    ): EventParticipantAdminDto {
        val beforeSnapshot = AuditSnapshots.eventParticipant(existing)
        val carnetEmail =
            carnet.user?.email?.let { participantLink.normalizeEmail(it) } ?: carnet.normalizedEmail
        existing.displayName = carnet.displayName
        existing.normalizedEmail = carnetEmail
        existing.user = carnet.user
        if (seasonRow != null) {
            existing.seasonParticipant = seasonRow
        }
        ParticipantGenderWriteSupport.applyGenderFromRequest(existing, carnet.user, genderRaw)
        val now = Instant.now()
        existing.status = ParticipantStatus.ACTIVE
        existing.removedAt = null
        existing.updatedAt = now
        val saved = eventParticipantRepository.save(existing)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_PARTICIPANT_ADDED,
                actorUserId = principal.userId,
                subjectEventParticipantId = saved.id,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = event.id,
                before = beforeSnapshot,
                after = AuditSnapshots.eventParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return EventParticipantAdminDto.from(saved, includeEmail = true)
    }

    @Transactional
    fun update(
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
        body: ParticipantUpdateRequest,
        principal: SessionUserPrincipal,
    ): EventParticipantAdminDto {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val existing =
            eventParticipantRepository.findByIdAndEvent_Id(participantId, eventId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        if (existing.status != ParticipantStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        }
        val beforeSnapshot = AuditSnapshots.eventParticipant(existing)
        val displayName = body.displayName.trim()
        if (displayName.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'affichage requis.")
        }
        val normalizedEmail = participantLink.normalizeEmail(body.email)
        existing.displayName = displayName
        existing.normalizedEmail = normalizedEmail
        existing.user =
            participantLink.resolveUserId(normalizedEmail)?.let { userRepository.findById(it).orElse(null) }
        ParticipantGenderWriteSupport.applyGenderFromRequest(existing, existing.user, body.gender)
        existing.updatedAt = Instant.now()
        val saved = eventParticipantRepository.save(existing)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_PARTICIPANT_UPDATED,
                actorUserId = principal.userId,
                subjectEventParticipantId = saved.id,
                troupeId = existing.event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = beforeSnapshot,
                after = AuditSnapshots.eventParticipant(saved),
                metadata = AuditSnapshots.participantMetadata(saved.displayName),
            ),
        )
        return EventParticipantAdminDto.from(saved, includeEmail = true)
    }

    @Transactional
    fun remove(
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
        principal: SessionUserPrincipal,
    ) {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val existing =
            eventParticipantRepository.findByIdAndEvent_Id(participantId, eventId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        if (existing.status != ParticipantStatus.ACTIVE) {
            return
        }
        val beforeSnapshot = AuditSnapshots.eventParticipant(existing)
        val now = Instant.now()
        existing.status = ParticipantStatus.REMOVED
        existing.removedAt = now
        existing.updatedAt = now
        eventParticipantRepository.save(existing)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_PARTICIPANT_REMOVED,
                actorUserId = principal.userId,
                subjectEventParticipantId = existing.id,
                troupeId = existing.event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                before = beforeSnapshot,
                after = AuditSnapshots.eventParticipant(existing),
                metadata = AuditSnapshots.participantMetadata(existing.displayName),
            ),
        )
    }
}
