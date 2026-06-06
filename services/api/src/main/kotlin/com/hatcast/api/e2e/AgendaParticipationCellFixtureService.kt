package com.hatcast.api.e2e

import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.e2e.dto.AgendaParticipationCellFixtureResponse
import com.hatcast.api.event.EventEntity
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
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Profile("e2e")
class AgendaParticipationCellFixtureService(
    private val troupeRepository: TroupeRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val eventRepository: EventRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val compositionRepository: EventCompositionRepository,
    private val compositionSlotRepository: EventCompositionSlotRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val membershipSync: SeasonParticipantMembershipSync,
) {
    @Transactional
    fun resetAgendaParticipationCell(): AgendaParticipationCellFixtureResponse {
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

        val unknownDispoEvent = loadEvent(EVENT_UNKNOWN_DISPO_ID, season.id)
        val pendingEvent = loadEvent(EVENT_PENDING_ID, season.id)
        val historyEvent = loadEvent(EVENT_HISTORY_ID, season.id)

        rollEventDates(unknownDispoEvent, pendingEvent, historyEvent)
        prepareUnknownDispoEvent(unknownDispoEvent, participant.id)
        resetPendingParticipation(pendingEvent, participant.id)

        return AgendaParticipationCellFixtureResponse(
            troupeSlug = troupe.slug,
            seasonSlug = season.slug,
            seasonId = season.id,
            memberSeasonParticipantId = participant.id,
            eventUnknownDispoSlug = unknownDispoEvent.slug,
            eventUnknownDispoTitle = unknownDispoEvent.title,
            eventPendingSlug = pendingEvent.slug,
            eventPendingTitle = pendingEvent.title,
            eventHistorySlug = historyEvent.slug,
            eventHistoryTitle = historyEvent.title,
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
                ResponseStatusException(HttpStatus.NOT_FOUND, "APC event seed missing: $eventId")
            }

    private fun requireParticipant(
        seasonId: UUID,
        membershipId: UUID,
    ) =
        seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membershipId)
            ?: throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "APC member missing on season $seasonId",
            )

    private fun reactivate(participant: com.hatcast.api.participant.SeasonParticipantEntity) {
        val now = Instant.now()
        participant.status = ParticipantStatus.ACTIVE
        participant.removedAt = null
        participant.removalSource = null
        participant.updatedAt = now
        seasonParticipantRepository.save(participant)
    }

    private fun rollEventDates(
        unknownDispoEvent: EventEntity,
        pendingEvent: EventEntity,
        historyEvent: EventEntity,
    ) {
        val now = Instant.now()
        val updatedAt = now
        unknownDispoEvent.startsAt = now.plus(2, ChronoUnit.DAYS)
        pendingEvent.startsAt = now.plus(5, ChronoUnit.DAYS)
        historyEvent.startsAt = now.minus(45, ChronoUnit.DAYS)
        listOf(unknownDispoEvent, pendingEvent, historyEvent).forEach { event ->
            event.updatedAt = updatedAt
            eventRepository.save(event)
        }
    }

    private fun prepareUnknownDispoEvent(
        event: EventEntity,
        participantId: UUID,
    ) {
        availabilityRepository.findByEvent_IdAndUser_Id(event.id, MEMBER_USER_ID)?.let {
            availabilityRepository.delete(it)
        }
        availabilityRepository.findByEvent_IdAndSeasonParticipant_Id(event.id, participantId)?.let {
            availabilityRepository.delete(it)
        }
        val now = Instant.now()
        if (event.availabilityOpenedAt == null) {
            event.availabilityOpenedAt = now
            event.updatedAt = now
            eventRepository.save(event)
        }
        clearComposition(event.id)
    }

    private fun resetPendingParticipation(
        event: EventEntity,
        participantId: UUID,
    ) {
        val now = Instant.now()
        declineRepository
            .findByEventIdOrderByDeclinedAtDesc(event.id)
            .filter { it.seasonParticipantId == participantId }
            .forEach { declineRepository.delete(it) }

        val composition =
            compositionRepository.findById(event.id).orElseGet {
                compositionRepository.save(
                    EventCompositionEntity(
                        eventId = event.id,
                        validatedAt = now,
                        publishedAt = now,
                        createdAt = now,
                        updatedAt = now,
                    ),
                )
            }
        composition.validatedAt = now
        composition.publishedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)

        val slot =
            compositionSlotRepository.findById(MEMBER_PENDING_SLOT_ID).orElseGet {
                compositionSlotRepository.save(
                    EventCompositionSlotEntity(
                        id = MEMBER_PENDING_SLOT_ID,
                        eventId = event.id,
                        roleKey = "player",
                        slotIndex = 0,
                        seasonParticipantId = participantId,
                        participationStatus = SlotParticipationStatus.PENDING,
                        createdAt = now,
                        updatedAt = now,
                    ),
                )
            }
        slot.seasonParticipantId = participantId
        slot.eventParticipantId = null
        slot.participationStatus = SlotParticipationStatus.PENDING
        slot.updatedAt = now
        compositionSlotRepository.save(slot)
    }

    private fun clearComposition(eventId: UUID) {
        compositionSlotRepository.findByEventId(eventId).forEach {
            compositionSlotRepository.delete(it)
        }
        compositionRepository.findById(eventId).ifPresent {
            compositionRepository.delete(it)
        }
    }

    companion object {
        const val SEASON_SLUG = E1CutoverFixtureService.SEASON_SLUG

        private val SEED_TROUPE_ID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        private val MEMBER_MEMBERSHIP_ID = UUID.fromString("e0000001-0000-4000-8000-000000000001")
        private val MEMBER_USER_ID = UUID.fromString("d0000001-0000-4000-8000-000000000001")
        private val EVENT_UNKNOWN_DISPO_ID = UUID.fromString("c0000014-0000-4000-8000-000000000014")
        private val EVENT_PENDING_ID = UUID.fromString("c0000012-0000-4000-8000-000000000012")
        private val EVENT_HISTORY_ID = UUID.fromString("c0000018-0000-4000-8000-000000000018")
        private val MEMBER_PENDING_SLOT_ID = UUID.fromString("90000002-0000-4000-8000-000000000001")
    }
}
