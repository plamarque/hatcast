package com.hatcast.api.e2e

import com.hatcast.api.e2e.dto.Story319FixtureResponse
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.EventParticipantExclusionEntity
import com.hatcast.api.participant.EventParticipantExclusionId
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantMembershipSync
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

/**
 * Hybrid fixtures (option C) for Story 3.19 E2E :
 * improbots seed (V17/V30) + runtime reset via API before each smoke run.
 */
@Service
@Profile("e2e")
class E2eFixtureService(
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val eventRepository: EventRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val membershipSync: SeasonParticipantMembershipSync,
) {
    @Transactional
    fun resetStory319(): Story319FixtureResponse {
        val seasonA = loadSeason(SEASON_A_SLUG)
        val seasonB = loadSeason(SEASON_B_SLUG)
        val membership =
            troupeMembershipRepository.findById(TARGET_MEMBERSHIP_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Target membership seed missing")
            }

        membershipSync.ensureForMembership(seasonA, membership)
        membershipSync.ensureForMembership(seasonB, membership)

        val participantA = requireParticipant(seasonA.id, TARGET_MEMBERSHIP_ID)
        val participantB = requireParticipant(seasonB.id, TARGET_MEMBERSHIP_ID)

        reactivate(participantA)
        reactivate(participantB)

        clearEventExclusions(seasonA.id, participantA.id)

        val firstEvent =
            eventRepository
                .findNonArchivedBySeasonId(seasonA.id)
                .minByOrNull { it.startsAt }
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No events on season A seed")

        if (
            !eventParticipantExclusionRepository.existsByIdEventIdAndIdSeasonParticipantId(
                firstEvent.id,
                participantA.id,
            )
        ) {
            eventParticipantExclusionRepository.save(
                EventParticipantExclusionEntity(
                    id = EventParticipantExclusionId(firstEvent.id, participantA.id),
                    event = firstEvent,
                    seasonParticipant = participantA,
                    createdAt = Instant.now(),
                ),
            )
        }

        return Story319FixtureResponse(
            seasonASlug = seasonA.slug,
            seasonBSlug = seasonB.slug,
            targetMemberDisplayName = TARGET_DISPLAY_NAME,
            targetMemberEmail = TARGET_EMAIL,
            eventExclusionSlug = firstEvent.slug,
        )
    }

    private fun loadSeason(slug: String) =
        seasonRepository.findByTroupe_IdAndSlug(SEED_TROUPE_ID, slug)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Season seed missing: $slug")

    private fun requireParticipant(
        seasonId: UUID,
        membershipId: UUID,
    ) =
        seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membershipId)
            ?: throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Target member missing on season $seasonId",
            )

    private fun reactivate(participant: SeasonParticipantEntity) {
        val now = Instant.now()
        participant.status = ParticipantStatus.ACTIVE
        participant.removedAt = null
        participant.removalSource = null
        participant.updatedAt = now
        seasonParticipantRepository.save(participant)
    }

    private fun clearEventExclusions(
        seasonId: UUID,
        seasonParticipantId: UUID,
    ) {
        eventRepository.findNonArchivedBySeasonId(seasonId).forEach { event ->
            eventParticipantExclusionRepository.deleteById(
                EventParticipantExclusionId(event.id, seasonParticipantId),
            )
        }
    }

    companion object {
        const val SEASON_A_SLUG = "les-improbots-2026-2027"
        const val SEASON_B_SLUG = "aperock-2026"
        const val TARGET_EMAIL = "max@seed.improbots.test"
        const val TARGET_DISPLAY_NAME = "Max"
        private val SEED_TROUPE_ID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        private val TARGET_MEMBERSHIP_ID = UUID.fromString("e0000001-0000-4000-8000-000000000018")
    }
}
