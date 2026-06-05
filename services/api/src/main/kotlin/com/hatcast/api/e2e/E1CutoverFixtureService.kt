package com.hatcast.api.e2e

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditEventRepository
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.e2e.dto.E1CutoverFixtureResponse
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantMembershipSync
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
@Profile("e2e")
class E1CutoverFixtureService(
    private val troupeRepository: TroupeRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val compositionSlotRepository: EventCompositionSlotRepository,
    private val auditEventRepository: AuditEventRepository,
    private val auditRecorder: AuditEventRecorder,
    private val membershipSync: SeasonParticipantMembershipSync,
) {
    @Transactional
    fun resetE1Cutover(): E1CutoverFixtureResponse {
        val troupe =
            troupeRepository.findById(SEED_TROUPE_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Seed troupe missing")
            }
        val season =
            seasonRepository.findByTroupe_IdAndSlug(SEED_TROUPE_ID, SEASON_SLUG)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Seed season missing: $SEASON_SLUG")
        val membership =
            troupeMembershipRepository.findById(MEMBER_MEMBERSHIP_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Member membership seed missing")
            }

        membershipSync.ensureForMembership(season, membership)
        val participant = requireParticipant(season.id, MEMBER_MEMBERSHIP_ID)
        reactivate(participant)

        val drawEvent = loadEvent(EVENT_DRAW_ID, season.id)
        val activiteEvent = loadEvent(EVENT_ACTIVITE_ID, season.id)
        val pendingEvent = loadEvent(EVENT_PENDING_ID, season.id)

        clearComposition(drawEvent.id)
        ensureActiviteAudit(season.id, activiteEvent.id, MEMBER_USER_ID, participant.id)

        return E1CutoverFixtureResponse(
            troupeSlug = troupe.slug,
            seasonSlug = season.slug,
            seasonId = season.id,
            memberDisplayName = MEMBER_DISPLAY_NAME,
            memberEmail = MEMBER_EMAIL,
            memberUserSlug = MEMBER_USER_SLUG,
            memberUserId = MEMBER_USER_ID,
            memberSeasonParticipantId = participant.id,
            eventDrawSlug = drawEvent.slug,
            eventDrawTitle = drawEvent.title,
            eventActiviteSlug = activiteEvent.slug,
            eventActiviteTitle = activiteEvent.title,
            eventPendingSlug = pendingEvent.slug,
            eventPendingTitle = pendingEvent.title,
        )
    }

    private fun loadEvent(
        eventId: UUID,
        seasonId: UUID,
    ) =
        eventRepository
            .findById(eventId)
            .filter { it.season.id == seasonId && !it.archived }
            .orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "E1 event seed missing: $eventId")
            }

    private fun requireParticipant(
        seasonId: UUID,
        membershipId: UUID,
    ) =
        seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membershipId)
            ?: throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "E1 member missing on season $seasonId",
            )

    private fun reactivate(participant: com.hatcast.api.participant.SeasonParticipantEntity) {
        val now = java.time.Instant.now()
        participant.status = ParticipantStatus.ACTIVE
        participant.removedAt = null
        participant.removalSource = null
        participant.updatedAt = now
        seasonParticipantRepository.save(participant)
    }

    private fun clearComposition(eventId: UUID) {
        compositionSlotRepository.findByEventId(eventId).forEach {
            compositionSlotRepository.delete(it)
        }
        compositionRepository.findById(eventId).ifPresent {
            compositionRepository.delete(it)
        }
    }

    private fun ensureActiviteAudit(
        seasonId: UUID,
        eventId: UUID,
        actorUserId: UUID,
        seasonParticipantId: UUID,
    ) {
        if (auditEventRepository.existsByEventIdAndActionType(eventId, AuditActionType.AVAILABILITY_UPDATED) ||
            auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId).isNotEmpty()
        ) {
            return
        }
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.AVAILABILITY_UPDATED,
                actorUserId = actorUserId,
                subjectUserId = actorUserId,
                subjectSeasonParticipantId = seasonParticipantId,
                troupeId = SEED_TROUPE_ID,
                seasonId = seasonId,
                eventId = eventId,
                metadata = mapOf("e2e" to "e1-cutover-fixture"),
            ),
        )
    }

    companion object {
        const val SEASON_SLUG = "les-improbots-2026-2027"
        const val MEMBER_EMAIL = "angie@seed.improbots.test"
        const val MEMBER_DISPLAY_NAME = "Angie"
        const val MEMBER_USER_SLUG = "angie"

        private val SEED_TROUPE_ID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        private val MEMBER_MEMBERSHIP_ID = UUID.fromString("e0000001-0000-4000-8000-000000000001")
        private val MEMBER_USER_ID = UUID.fromString("d0000001-0000-4000-8000-000000000001")
        private val EVENT_DRAW_ID = UUID.fromString("c0000014-0000-4000-8000-000000000014")
        private val EVENT_ACTIVITE_ID = UUID.fromString("c0000010-0000-4000-8000-000000000010")
        private val EVENT_PENDING_ID = UUID.fromString("c0000012-0000-4000-8000-000000000012")
    }
}
