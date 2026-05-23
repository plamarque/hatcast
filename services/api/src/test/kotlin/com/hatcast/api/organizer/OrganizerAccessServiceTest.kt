package com.hatcast.api.organizer

import com.hatcast.api.auth.SessionUserPrincipal
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class OrganizerAccessServiceTest {
    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val eventId: UUID = UUID.fromString("c0000001-0000-4000-8000-000000000001")
    private val otherEventId: UUID = UUID.fromString("c0000002-0000-4000-8000-000000000002")
    private val seasonOrganizerId: UUID = UUID.fromString("d0000001-0000-4000-8000-000000000001")
    private val eventOrganizerId: UUID = UUID.fromString("d0000002-0000-4000-8000-000000000002")
    private val memberId: UUID = UUID.fromString("d0000003-0000-4000-8000-000000000003")

    @Test
    fun `season organizer can manage composition but not edit events or organizer lists`() {
        val service =
            OrganizerAccessService.forTests(
                seedTroupeId = seedTroupeId,
                seasonOrganizers = mapOf(seasonId to setOf(seasonOrganizerId)),
                eventOrganizers = emptyMap(),
            )
        val user = principal(seasonOrganizerId)

        assertTrue(service.isSeasonOrganizer(seasonId, user))
        assertTrue(service.canManageComposition(eventId, seasonId, user))
        assertFalse(service.canEditEvent(eventId, seasonId, user))
        assertFalse(service.canEditEvents(seasonId, user))
        assertFalse(service.canCasterEditManually(eventId, seasonId, user))
        assertFalse(service.canManageSeasonOrganizers(seasonId, user))
        assertFalse(service.canManageEventOrganizers(eventId, seasonId, user))
    }

    @Test
    fun `event organizer permissions are scoped to one event and allow manual slot fill`() {
        val service =
            OrganizerAccessService.forTests(
                seedTroupeId = seedTroupeId,
                seasonOrganizers = emptyMap(),
                eventOrganizers = mapOf(eventId to setOf(eventOrganizerId)),
            )
        val user = principal(eventOrganizerId)

        assertTrue(service.isEventOrganizer(eventId, user))
        assertTrue(service.canManageComposition(eventId, seasonId, user))
        assertTrue(service.canEditEvent(eventId, seasonId, user))
        assertTrue(service.canCasterEditManually(eventId, seasonId, user))
        assertFalse(service.canManageComposition(otherEventId, seasonId, user))
        assertFalse(service.canEditEvent(otherEventId, seasonId, user))
        assertFalse(service.canManageEventOrganizers(eventId, seasonId, user))
    }

    @Test
    fun `ordinary member has no organizer powers`() {
        val service =
            OrganizerAccessService.forTests(
                seedTroupeId = seedTroupeId,
                seasonOrganizers = emptyMap(),
                eventOrganizers = emptyMap(),
            )
        val user = principal(memberId)

        assertFalse(service.canManageComposition(eventId, seasonId, user))
        assertFalse(service.canEditEvent(eventId, seasonId, user))
        assertFalse(service.canCasterEditManually(eventId, seasonId, user))
    }

    private fun principal(userId: UUID) =
        SessionUserPrincipal(
            userId = userId,
            googleSub = null,
            idpUid = "idp-$userId",
            email = "$userId@example.com",
        )
}
