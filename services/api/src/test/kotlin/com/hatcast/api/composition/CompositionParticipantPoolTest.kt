package com.hatcast.api.composition

import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityIndex
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRemovalSource
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.UserEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class CompositionParticipantPoolTest {
    private val seasonParticipantRepository = mock<SeasonParticipantRepository>()
    private val eventParticipantRepository = mock<EventParticipantRepository>()
    private val eventParticipantExclusionRepository = mock<EventParticipantExclusionRepository>()

    private val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
    private val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
    private val event =
        EventEntity(
            id = UUID.randomUUID(),
            season = season,
            title = "Spectacle",
            slug = "spectacle",
            startsAt = Instant.parse("2030-06-15T18:00:00Z"),
        )

    private fun user(name: String) = UserEntity(id = UUID.randomUUID(), email = "$name@example.com", displayName = name)

    private fun seasonRow(
        displayName: String,
        user: UserEntity?,
        status: ParticipantStatus = ParticipantStatus.ACTIVE,
        removalSource: SeasonParticipantRemovalSource? = null,
    ) = SeasonParticipantEntity(
        season = season,
        displayName = displayName,
        normalizedEmail = user?.email,
        user = user,
        status = status,
        removalSource = removalSource,
    )

    private fun eventRow(
        displayName: String,
        user: UserEntity? = null,
        seasonParticipant: SeasonParticipantEntity? = null,
    ) = EventParticipantEntity(
        event = event,
        displayName = displayName,
        normalizedEmail = user?.email,
        user = user,
        seasonParticipant = seasonParticipant,
        status = ParticipantStatus.ACTIVE,
    )

    @Test
    fun `excludes event row whose user was removed at season scope`() {
        val activeUser = user("Active Member")
        val removedUser = user("Ghost")
        val guestUser = user("Real Guest")

        whenever(
            seasonParticipantRepository.findActiveForSeasonWithAssociations(season.id, ParticipantStatus.ACTIVE),
        ).thenReturn(listOf(seasonRow("Active Member", activeUser)))
        whenever(eventParticipantExclusionRepository.findByIdEventId(event.id)).thenReturn(emptyList())
        whenever(seasonParticipantRepository.findRemovedUserIdsForSeason(season.id))
            .thenReturn(listOf(removedUser.id))
        whenever(
            eventParticipantRepository.findActiveForEventWithAssociations(event.id, ParticipantStatus.ACTIVE),
        ).thenReturn(
            listOf(
                eventRow("Ghost Event Row", user = removedUser),
                eventRow("Real Guest", user = guestUser),
            ),
        )

        val pool =
            CompositionParticipantPool.loadEligibleParticipants(
                season.id,
                event.id,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )

        val names = pool.map { it.displayName }
        assertTrue(names.contains("Active Member"))
        assertTrue(names.contains("Real Guest"))
        assertFalse(names.contains("Ghost Event Row"))
        assertEquals(2, pool.size)
    }

    @Test
    fun `excludes event row linked to a removed season participant`() {
        val removedSeasonRow =
            seasonRow(
                "Removed Season Row",
                user = null,
                status = ParticipantStatus.REMOVED,
                removalSource = SeasonParticipantRemovalSource.SEASON_ADMIN,
            )

        whenever(
            seasonParticipantRepository.findActiveForSeasonWithAssociations(season.id, ParticipantStatus.ACTIVE),
        ).thenReturn(emptyList())
        whenever(eventParticipantExclusionRepository.findByIdEventId(event.id)).thenReturn(emptyList())
        whenever(seasonParticipantRepository.findRemovedUserIdsForSeason(season.id)).thenReturn(emptyList())
        whenever(
            eventParticipantRepository.findActiveForEventWithAssociations(event.id, ParticipantStatus.ACTIVE),
        ).thenReturn(
            listOf(
                eventRow("Linked To Removed", seasonParticipant = removedSeasonRow),
                eventRow("Standalone Guest", user = user("Standalone")),
            ),
        )

        val pool =
            CompositionParticipantPool.loadEligibleParticipants(
                season.id,
                event.id,
                seasonParticipantRepository,
                eventParticipantRepository,
                eventParticipantExclusionRepository,
            )

        val names = pool.map { it.displayName }
        assertTrue(names.contains("Standalone Guest"))
        assertFalse(names.contains("Linked To Removed"))
        assertEquals(1, pool.size)
    }

    @Test
    fun `buildRolePool includes name-only season participant with participant-scoped availability`() {
        val marie = seasonRow("Marie", user = null)
        val eligible =
            listOf(
                CompositionEligibleParticipant(
                    participantId = marie.id,
                    userId = null,
                    displayName = marie.displayName,
                    source = CompositionParticipantSource.SEASON,
                ),
            )
        val availability =
            EventAvailabilityEntity(
                event = event,
                seasonParticipant = marie,
                status = StoredAvailabilityStatus.AVAILABLE,
                roleKeys = listOf("player"),
                recordedByUserId = UUID.randomUUID(),
            )
        val index = EventAvailabilityIndex.fromRows(listOf(availability))

        val pool =
            CompositionParticipantPool.buildRolePool(
                eligible = eligible,
                availabilityIndex = index,
                roleKey = "player",
                excluded = emptySet(),
            )

        assertEquals(listOf("Marie"), pool.map { it.displayName })
    }
}
