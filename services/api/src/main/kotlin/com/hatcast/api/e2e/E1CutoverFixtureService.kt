package com.hatcast.api.e2e

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditEventRepository
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.notification.NotificationDeliveryLogRepository
import com.hatcast.api.e2e.dto.E1CutoverFixtureResponse
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.SeasonOrganizerEntity
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantMembershipSync
import com.hatcast.api.participant.SeasonParticipantRemovalSource
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.share.EventManualShareNotifyId
import com.hatcast.api.share.EventManualShareNotifyRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.temporal.ChronoUnit
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
    private val seasonOrganizerRepository: SeasonOrganizerRepository,
    private val eventAvailabilityRepository: EventAvailabilityRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val eventManualShareNotifyRepository: EventManualShareNotifyRepository,
    private val notificationDeliveryLogRepository: NotificationDeliveryLogRepository,
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
        ensureReminderOrganizer(season)

        val drawEvent = loadEvent(EVENT_DRAW_ID, season.id)
        val activiteEvent = loadEvent(EVENT_ACTIVITE_ID, season.id)
        val pendingEvent = loadEvent(EVENT_PENDING_ID, season.id)
        rollPilotEventsToUpcoming(drawEvent, activiteEvent, pendingEvent)
        val reminderEvent = ensureReminderFixture(season, participant.id)

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
            eventReminderSlug = reminderEvent.slug,
            eventReminderTitle = reminderEvent.title,
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

    /** Keep MVP pilot events on the member agenda (`scope=upcoming`) regardless of seed calendar dates. */
    private fun rollPilotEventsToUpcoming(
        drawEvent: EventEntity,
        activiteEvent: EventEntity,
        pendingEvent: EventEntity,
    ) {
        val now = Instant.now()
        if (drawEvent.startsAt.isAfter(now)) {
            return
        }
        val anchor = now.plus(1, ChronoUnit.DAYS)
        val updatedAt = now
        drawEvent.startsAt = anchor
        activiteEvent.startsAt = anchor.plus(2, ChronoUnit.DAYS)
        pendingEvent.startsAt = anchor.plus(4, ChronoUnit.DAYS)
        listOf(drawEvent, activiteEvent, pendingEvent).forEach { event ->
            event.updatedAt = updatedAt
            eventRepository.save(event)
        }
    }

    private fun clearComposition(eventId: UUID) {
        compositionSlotRepository.findByEventId(eventId).forEach {
            compositionSlotRepository.delete(it)
        }
        compositionRepository.findById(eventId).ifPresent {
            compositionRepository.delete(it)
        }
    }

    private fun ensureReminderOrganizer(season: com.hatcast.api.season.SeasonEntity) {
        val membership =
            troupeMembershipRepository.findById(REMINDER_ORGANIZER_MEMBERSHIP_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder organizer membership seed missing")
            }
        val user = membership.user ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder organizer user seed missing")
        if (membership.status != com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE ||
            membership.baselineRole != com.hatcast.api.troupe.TroupeBaselineRole.MEMBER
        ) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Reminder organizer must be an active non-admin troupe member")
        }
        seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(season.id, membership.id)?.let { participant ->
            participant.status = ParticipantStatus.REMOVED
            participant.removedAt = Instant.now()
            participant.removalSource = SeasonParticipantRemovalSource.SEASON_ADMIN
            participant.updatedAt = Instant.now()
            seasonParticipantRepository.save(participant)
        }
        if (seasonOrganizerRepository.findBySeason_IdAndUser_Id(season.id, user.id) == null) {
            seasonOrganizerRepository.save(
                SeasonOrganizerEntity(
                    season = season,
                    user = user,
                    grantedAt = Instant.now(),
                    grantedBy = null,
                ),
            )
        }
    }

    /**
     * The reminder fixture never shares an event with journeys that mutate
     * availability or composition. Resetting it removes every answer so the
     * known E2E member recipient remains unknown and can be notified.
     */
    private fun ensureReminderFixture(
        season: com.hatcast.api.season.SeasonEntity,
        recipientParticipantId: UUID,
    ): EventEntity {
        val now = Instant.now()
        val event =
            eventRepository.findById(REMINDER_EVENT_ID).orElseGet {
                EventEntity(
                    id = REMINDER_EVENT_ID,
                    season = season,
                    slug = REMINDER_EVENT_SLUG,
                    title = REMINDER_EVENT_TITLE,
                    description = "Fixture E2E isolée pour la prévisualisation de rappel de disponibilité.",
                    location = "Fixture E2E",
                    startsAt = now.plus(7, ChronoUnit.DAYS),
                    roleSlots = RoleTemplates.emptySlots().toMutableMap().apply { put("player", 1) },
                    availabilityOpenedAt = now,
                )
            }
        if (event.season.id != season.id) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Reminder fixture belongs to another season")
        }
        if (eventRepository.existsBySeason_IdAndSlugAndIdNot(season.id, REMINDER_EVENT_SLUG, REMINDER_EVENT_ID)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Reminder fixture slug belongs to another event")
        }
        event.slug = REMINDER_EVENT_SLUG
        event.title = REMINDER_EVENT_TITLE
        event.description = "Fixture E2E isolée pour la prévisualisation de rappel de disponibilité."
        event.location = "Fixture E2E"
        event.archived = false
        event.startsAt = now.plus(7, ChronoUnit.DAYS)
        event.templateType = "custom"
        event.roleSlots = RoleTemplates.emptySlots().toMutableMap().apply { put("player", 1) }
        event.category = null
        event.availabilityOpenedAt = now
        event.updatedAt = now
        eventRepository.save(event)
        eventAvailabilityRepository.findByEvent_Id(event.id).forEach(eventAvailabilityRepository::delete)
        eventParticipantExclusionRepository.deleteByIdEventIdAndIdSeasonParticipantId(event.id, recipientParticipantId)
        eventManualShareNotifyRepository.deleteById(EventManualShareNotifyId(event.id, "availability_nudge"))
        notificationDeliveryLogRepository.deleteByEventId(event.id)

        season.participantCount = seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE).toInt()
        season.updatedAt = now
        seasonRepository.save(season)
        return event
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
        private val REMINDER_ORGANIZER_MEMBERSHIP_ID = UUID.fromString("e0000001-0000-4000-8000-000000000002")
        private val EVENT_DRAW_ID = UUID.fromString("c0000014-0000-4000-8000-000000000014")
        private val EVENT_ACTIVITE_ID = UUID.fromString("c0000010-0000-4000-8000-000000000010")
        private val EVENT_PENDING_ID = UUID.fromString("c0000012-0000-4000-8000-000000000012")
        private val REMINDER_EVENT_ID = UUID.fromString("c00000e1-0000-4000-8000-000000000001")
        private const val REMINDER_EVENT_SLUG = "e1-reminder-fixture"
        private const val REMINDER_EVENT_TITLE = "[E2E] Rappel disponibilités isolé"
    }
}
