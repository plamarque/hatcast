package com.hatcast.api.participant

import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class ParticipantLinkServiceTest {
    private val userRepository = mock<UserRepository>()
    private val seasonParticipantRepository = mock<SeasonParticipantRepository>()
    private val eventParticipantRepository = mock<EventParticipantRepository>()
    private val service =
        ParticipantLinkService(userRepository, seasonParticipantRepository, eventParticipantRepository)

    @Test
    fun `normalizeEmail lowercases and trims`() {
        assertEquals("user@example.com", service.normalizeEmail("  USER@Example.COM "))
    }

    @Test
    fun `normalizeEmail rejects invalid values`() {
        assertNull(service.normalizeEmail("not-an-email"))
        assertNull(service.normalizeEmail(""))
        assertNull(service.normalizeEmail(null))
    }

    @Test
    fun `resolveUserId returns user id when email matches`() {
        val userId = UUID.randomUUID()
        whenever(userRepository.findFirstByEmailIgnoreCase("linked@example.com"))
            .thenReturn(UserEntity(id = userId, email = "linked@example.com"))

        assertEquals(userId, service.resolveUserId("linked@example.com"))
    }

    @Test
    fun `resolveUserId returns null for blank email`() {
        assertNull(service.resolveUserId(null))
        assertNull(service.resolveUserId(""))
    }

    @Test
    fun `linkPendingParticipantsOnLogin updates season and event rows`() {
        val user = UserEntity(id = UUID.randomUUID(), email = "pending@example.com")

        service.linkPendingParticipantsOnLogin(user)

        verify(seasonParticipantRepository).linkUnlinkedByEmail(
            eq("pending@example.com"),
            eq(user),
            org.mockito.kotlin.any(),
        )
        verify(eventParticipantRepository).linkUnlinkedByEmail(
            eq("pending@example.com"),
            eq(user),
            org.mockito.kotlin.any(),
        )
    }
}
