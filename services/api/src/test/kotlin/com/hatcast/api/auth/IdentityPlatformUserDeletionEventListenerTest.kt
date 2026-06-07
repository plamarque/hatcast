package com.hatcast.api.auth

import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension::class)
class IdentityPlatformUserDeletionEventListenerTest {
    private val deletionSupport: IdentityPlatformUserDeletionSupport = mock()
    private val userRepository: UserRepository = mock()

    private val listener =
        IdentityPlatformUserDeletionEventListener(
            deletionSupport = deletionSupport,
            userRepository = userRepository,
        )

    @Test
    fun `onDeletionRequested no-ops when idpUid is blank`() {
        listener.onDeletionRequested(
            IdentityPlatformUserDeletionRequestedEvent(
                userId = UUID.randomUUID(),
                idpUid = "   ",
            ),
        )

        verify(deletionSupport, never()).deleteUserIfAvailable(org.mockito.kotlin.any())
        verify(userRepository, never()).findById(org.mockito.kotlin.any())
    }

    @Test
    fun `onDeletionRequested skips idp_uid clear when Firebase is unavailable`() {
        val idpUid = "firebase-uid-unavailable"
        whenever(deletionSupport.deleteUserIfAvailable(idpUid)).thenReturn(false)

        listener.onDeletionRequested(
            IdentityPlatformUserDeletionRequestedEvent(
                userId = UUID.randomUUID(),
                idpUid = idpUid,
            ),
        )

        verify(userRepository, never()).findById(org.mockito.kotlin.any())
    }

    @Test
    fun `onDeletionRequested clears idp_uid after successful delete attempt`() {
        val idpUid = "firebase-uid-success"
        val user = UserEntity(idpUid = idpUid)
        whenever(deletionSupport.deleteUserIfAvailable(idpUid)).thenReturn(true)
        whenever(userRepository.findById(user.id)).thenReturn(Optional.of(user))

        listener.onDeletionRequested(
            IdentityPlatformUserDeletionRequestedEvent(
                userId = user.id,
                idpUid = idpUid,
            ),
        )

        assertNull(user.idpUid)
        verify(userRepository).save(user)
    }

    @Test
    fun `onDeletionRequested clears idp_uid when delete attempt fails`() {
        val idpUid = "firebase-uid-failure"
        val user = UserEntity(idpUid = idpUid)
        whenever(deletionSupport.deleteUserIfAvailable(idpUid)).thenReturn(true)
        whenever(userRepository.findById(user.id)).thenReturn(Optional.of(user))

        listener.onDeletionRequested(
            IdentityPlatformUserDeletionRequestedEvent(
                userId = user.id,
                idpUid = idpUid,
            ),
        )

        assertNull(user.idpUid)
        verify(userRepository).save(user)
    }
}
