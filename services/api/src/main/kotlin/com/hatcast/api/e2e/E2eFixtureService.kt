package com.hatcast.api.e2e

import com.hatcast.api.e2e.dto.Story319FixtureResponse
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.SeasonOrganizerId
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.participant.EventParticipantExclusionId
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantMembershipSync
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

/**
 * Hybrid fixtures (option C) for Story 3.19 E2E :
 * improbots seed (V17/V30) + runtime reset via API before each recette run.
 */
@Service
@Profile("e2e")
class E2eFixtureService(
    private val troupeRepository: TroupeRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val eventRepository: EventRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val seasonOrganizerRepository: SeasonOrganizerRepository,
    private val membershipSync: SeasonParticipantMembershipSync,
) {
    @Transactional
    fun resetStory319(): Story319FixtureResponse {
        val troupe =
            troupeRepository.findById(SEED_TROUPE_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Seed troupe missing")
            }
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
        clearSeasonOrganizer(seasonA.id, TARGET_USER_ID)

        val external = ensureExternalParticipant(seasonA)

        val eventForExclusion = pickEventForExclusion(seasonA.id)
        val historyEvent = loadHistoryEvent(seasonA.id)

        return Story319FixtureResponse(
            troupeSlug = troupe.slug,
            seasonASlug = seasonA.slug,
            seasonBSlug = seasonB.slug,
            seasonAId = seasonA.id,
            targetMemberDisplayName = TARGET_DISPLAY_NAME,
            targetMemberEmail = TARGET_EMAIL,
            targetMemberUserId = TARGET_USER_ID,
            targetSeasonParticipantId = participantA.id,
            externalParticipantName = external.displayName,
            eventSlugForExclusion = eventForExclusion.slug,
            historyEventSlug = historyEvent.slug,
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

    private fun ensureExternalParticipant(season: SeasonEntity): SeasonParticipantEntity {
        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
                season.id,
                ParticipantStatus.REMOVED,
                EXTERNAL_DISPLAY_NAME,
            ).firstOrNull()
            ?.let { removed ->
                reactivate(removed)
                return removed
            }
        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
                season.id,
                ParticipantStatus.ACTIVE,
                EXTERNAL_DISPLAY_NAME,
            ).firstOrNull()
            ?.let { return it }
        val now = Instant.now()
        return seasonParticipantRepository.save(
            SeasonParticipantEntity(
                season = season,
                displayName = EXTERNAL_DISPLAY_NAME,
                normalizedEmail = null,
                user = null,
                status = ParticipantStatus.ACTIVE,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private fun pickEventForExclusion(seasonId: UUID) =
        eventRepository
            .findNonArchivedBySeasonId(seasonId)
            .filter { it.startsAt.isAfter(Instant.now()) }
            .minByOrNull { it.startsAt }
            ?: eventRepository
                .findNonArchivedBySeasonId(seasonId)
                .minByOrNull { it.startsAt }
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No events on season A seed")

    private fun loadHistoryEvent(seasonId: UUID) =
        eventRepository
            .findById(HISTORY_EVENT_ID)
            .filter { it.season.id == seasonId && !it.archived }
            .orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "History event seed missing on season A")
            }

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

    private fun clearSeasonOrganizer(
        seasonId: UUID,
        userId: UUID,
    ) {
        if (seasonOrganizerRepository.existsById(SeasonOrganizerId(seasonId, userId))) {
            seasonOrganizerRepository.deleteById(SeasonOrganizerId(seasonId, userId))
        }
    }

    companion object {
        const val SEASON_A_SLUG = "les-improbots-2026-2027"
        const val SEASON_B_SLUG = "aperock-2026"
        const val TARGET_EMAIL = "max@seed.improbots.test"
        const val TARGET_DISPLAY_NAME = "Max"
        const val EXTERNAL_DISPLAY_NAME = "Invité Recette E2E"
        private val SEED_TROUPE_ID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        private val TARGET_MEMBERSHIP_ID = UUID.fromString("e0000001-0000-4000-8000-000000000018")
        private val TARGET_USER_ID = UUID.fromString("d0000001-0000-4000-8000-000000000018")
        private val HISTORY_EVENT_ID = UUID.fromString("c0000018-0000-4000-8000-000000000018")
    }
}
