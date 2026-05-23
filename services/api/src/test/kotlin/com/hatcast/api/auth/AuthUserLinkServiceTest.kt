package com.hatcast.api.auth

import com.hatcast.api.user.UserAccountService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

class AuthUserLinkServiceTest {
    private val userRepository = mock<UserRepository>()
    private val userAccountService = mock<UserAccountService>()
    private val service = AuthUserLinkService(userRepository, userAccountService)

    @Test
    fun `google sign in links migration stub by email`() {
        val stub =
            UserEntity(
                id = UUID.randomUUID(),
                email = "migrated@example.com",
                displayName = "Migré",
            )
        whenever(userRepository.findByGoogleSub("google-sub-1")).thenReturn(null)
        whenever(userRepository.findFirstByEmailIgnoreCase("migrated@example.com")).thenReturn(stub)
        whenever(userRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(userAccountService.markActivated(any())).thenAnswer { it.getArgument(0) }

        val linked = service.resolveGoogleSignInUser("google-sub-1", "migrated@example.com", "Google Name")

        assertEquals("google-sub-1", linked.googleSub)
        assertEquals("migrated@example.com", linked.email)
        assertEquals("Google Name", linked.displayName)
        verify(userAccountService).markActivated(any())
    }

    @Test
    fun `idp sign in links migration stub by email`() {
        val stub = UserEntity(id = UUID.randomUUID(), email = "pwd@example.com", displayName = "Pwd User")
        whenever(userRepository.findByIdpUid("idp-uid-1")).thenReturn(null)
        whenever(userRepository.findFirstByEmailIgnoreCase("pwd@example.com")).thenReturn(stub)
        whenever(userRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(userAccountService.markActivated(any())).thenAnswer { it.getArgument(0) }

        val linked = service.resolveIdpSignInUser("idp-uid-1", "pwd@example.com", "IdP Name")

        assertEquals("idp-uid-1", linked.idpUid)
        assertNull(linked.googleSub)
    }

    @Test
    fun `google sign in rejects email already bound to another google sub`() {
        val stub =
            UserEntity(
                id = UUID.randomUUID(),
                email = "taken@example.com",
                googleSub = "other-sub",
            )
        whenever(userRepository.findByGoogleSub("new-sub")).thenReturn(null)
        whenever(userRepository.findFirstByEmailIgnoreCase("taken@example.com")).thenReturn(stub)

        val ex =
            assertThrows<ResponseStatusException> {
                service.resolveGoogleSignInUser("new-sub", "taken@example.com", "X")
            }
        assertEquals(HttpStatus.CONFLICT, ex.statusCode)
    }

    @Test
    fun `google sign in creates user when no stub exists`() {
        whenever(userRepository.findByGoogleSub("google-new")).thenReturn(null)
        whenever(userRepository.findFirstByEmailIgnoreCase("new@example.com")).thenReturn(null)
        whenever(userRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(userAccountService.markActivated(any())).thenAnswer { it.getArgument(0) }

        val created = service.resolveGoogleSignInUser("google-new", "new@example.com", "New")

        assertNotNull(created)
        assertEquals("google-new", created.googleSub)
        verify(userRepository).save(any())
    }
}
