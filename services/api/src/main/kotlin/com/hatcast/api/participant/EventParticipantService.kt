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
                    ParticipantGenderWriteSupport.applyGenderFromRequest(it, linkedUser, body.gender)
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
