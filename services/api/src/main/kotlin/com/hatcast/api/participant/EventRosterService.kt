package com.hatcast.api.participant

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.audit.AuditSnapshots
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.dto.EventRosterParticipantDto
import com.hatcast.api.participant.dto.EventRosterSource
import com.hatcast.api.text.sortedByFrenchDisplayName
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class EventRosterService(
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val eventRepository: EventRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val participantAccess: ParticipantAccessService,
    private val auditRecorder: AuditEventRecorder,
    private val avatarService: AvatarService,
) {
    @Transactional(readOnly = true)
    fun listRoster(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): List<EventRosterParticipantDto> {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val includeEmail = participantAccess.canViewEventParticipantEmail(eventId, seasonId, principal)
        return buildRoster(seasonId, eventId, includeEmail)
    }

    @Transactional
    fun excludeSeasonParticipant(
        seasonId: UUID,
        eventId: UUID,
        seasonParticipantId: UUID,
        principal: SessionUserPrincipal,
    ) {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        val seasonParticipant =
            seasonParticipantRepository
                .findById(seasonParticipantId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu") }
        if (seasonParticipant.season.id != seasonId || seasonParticipant.status != ParticipantStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        }
        if (eventParticipantExclusionRepository.existsByIdEventIdAndIdSeasonParticipantId(eventId, seasonParticipantId)) {
            return
        }
        eventParticipantExclusionRepository.save(
            EventParticipantExclusionEntity(
                id = EventParticipantExclusionId(eventId, seasonParticipantId),
                event = event,
                seasonParticipant = seasonParticipant,
                createdAt = Instant.now(),
            ),
        )
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_ROSTER_EXCLUDED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = seasonParticipantId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                metadata = AuditSnapshots.participantMetadata(seasonParticipant.displayName),
            ),
        )
    }

    @Transactional
    fun includeSeasonParticipant(
        seasonId: UUID,
        eventId: UUID,
        seasonParticipantId: UUID,
        principal: SessionUserPrincipal,
    ) {
        participantAccess.loadEventInSeason(seasonId, eventId, principal)
        participantAccess.requireCanManageEventParticipants(eventId, seasonId, principal)
        val seasonParticipant =
            seasonParticipantRepository
                .findById(seasonParticipantId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu") }
        if (seasonParticipant.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Participant inconnu")
        }
        val existed =
            eventParticipantExclusionRepository.existsByIdEventIdAndIdSeasonParticipantId(
                eventId,
                seasonParticipantId,
            )
        if (!existed) {
            return
        }
        eventParticipantExclusionRepository.deleteByIdEventIdAndIdSeasonParticipantId(eventId, seasonParticipantId)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.EVENT_ROSTER_INCLUDED,
                actorUserId = principal.userId,
                subjectSeasonParticipantId = seasonParticipantId,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = eventId,
                metadata = AuditSnapshots.participantMetadata(seasonParticipant.displayName),
            ),
        )
    }

    internal fun buildRoster(
        seasonId: UUID,
        eventId: UUID,
        includeEmail: Boolean,
    ): List<EventRosterParticipantDto> {
        seasonParticipantService.ensureMembershipParticipants(
            eventRepository.findById(eventId).orElseThrow().season,
        )
        val excluded =
            eventParticipantExclusionRepository
                .findByIdEventId(eventId)
                .map { it.id.seasonParticipantId }
                .toSet()
        val seasonRows =
            seasonParticipantRepository
                .findActiveForSeasonWithAssociations(seasonId, ParticipantStatus.ACTIVE)
                .filter { row ->
                    row.troupeMembership == null ||
                        row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
                }
                .filter { it.id !in excluded }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val removedSeasonUserIds = seasonParticipantRepository.findRemovedUserIdsForSeason(seasonId).toSet()
        val seenUserIds = mutableSetOf<UUID>()
        val roster = linkedMapOf<String, EventRosterParticipantDto>()

        for (row in seasonRows.sortedByFrenchDisplayName { it.displayName }) {
            val key = "season:${row.id}"
            roster[key] = rosterDtoFromSeason(row, includeEmail)
            row.user?.id?.let { seenUserIds.add(it) }
        }

        val eventRows =
            eventParticipantRepository.findActiveForEventWithAssociations(eventId, ParticipantStatus.ACTIVE)
        for (row in eventRows.sortedByFrenchDisplayName { it.displayName }) {
            val linkedSeasonId = row.seasonParticipant?.id
            if (linkedSeasonId != null && linkedSeasonId in seasonParticipantIds) {
                continue
            }
            if (row.seasonParticipant?.status == ParticipantStatus.REMOVED) {
                continue
            }
            val userId = row.user?.id
            if (userId != null && userId in seenUserIds) {
                continue
            }
            if (userId != null && userId in removedSeasonUserIds) {
                continue
            }
            val key = "event:${row.id}"
            roster[key] = rosterDtoFromEvent(row, includeEmail)
            userId?.let { seenUserIds.add(it) }
        }

        return roster.values.toList()
    }

    private fun rosterDtoFromSeason(
        row: SeasonParticipantEntity,
        includeEmail: Boolean,
    ): EventRosterParticipantDto {
        val user = ParticipantRowPresentation.linkedUser(row)
        return EventRosterParticipantDto.fromSeason(
            row,
            includeEmail,
            ParticipantRowPresentation.avatarUrl(avatarService, user),
        )
    }

    private fun rosterDtoFromEvent(
        row: EventParticipantEntity,
        includeEmail: Boolean,
    ): EventRosterParticipantDto {
        val user = ParticipantRowPresentation.linkedUser(row)
        return EventRosterParticipantDto.fromEvent(
            row,
            includeEmail,
            ParticipantRowPresentation.avatarUrl(avatarService, user),
        )
    }
}
