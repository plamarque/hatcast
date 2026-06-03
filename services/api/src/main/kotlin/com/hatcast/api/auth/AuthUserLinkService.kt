package com.hatcast.api.auth

import com.hatcast.api.participant.ParticipantLinkService
import com.hatcast.api.user.UserAccountService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import com.hatcast.api.user.UserSlugService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

/**
 * Resolves or links application users on sign-in (supports V1 migration stubs pre-filled by email).
 */
@Service
class AuthUserLinkService(
    private val userRepository: UserRepository,
    private val userAccountService: UserAccountService,
    private val participantLinkService: ParticipantLinkService,
    private val userSlugService: UserSlugService,
) {
    fun resolveGoogleSignInUser(
        googleSub: String,
        email: String?,
        displayName: String?,
    ): UserEntity {
        userRepository.findByGoogleSub(googleSub)?.let { existing ->
            rejectIfDeleted(existing)
            val user = userAccountService.markActivated(updateProfile(existing, email, displayName))
            participantLinkService.linkPendingParticipantsOnLogin(user)
            return user
        }

        val normalizedEmail = email?.trim()?.lowercase()?.takeIf { it.contains("@") }
        if (normalizedEmail != null) {
            userRepository.findFirstByEmailIgnoreCase(normalizedEmail)?.let { byEmail ->
                rejectIfDeleted(byEmail)
                if (byEmail.googleSub != null && byEmail.googleSub != googleSub) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cet email est déjà associé à un autre compte Google.",
                    )
                }
                byEmail.googleSub = googleSub
                val user = userAccountService.markActivated(updateProfile(byEmail, normalizedEmail, displayName))
                participantLinkService.linkPendingParticipantsOnLogin(user)
                return user
            }
        }

        val now = Instant.now()
        val draft =
            UserEntity(
                googleSub = googleSub,
                idpUid = null,
                email = normalizedEmail ?: email,
                displayName = displayName,
                activatedAt = now,
                createdAt = now,
                updatedAt = now,
            )
        draft.slug = userSlugService.allocateUniqueSlug(draft)
        val created = userRepository.save(draft)
        participantLinkService.linkPendingParticipantsOnLogin(created)
        return created
    }

    fun resolveIdpSignInUser(
        idpUid: String,
        email: String?,
        displayName: String?,
    ): UserEntity {
        userRepository.findByIdpUid(idpUid)?.let { existing ->
            rejectIfDeleted(existing)
            val user = userAccountService.markActivated(updateProfile(existing, email, displayName))
            participantLinkService.linkPendingParticipantsOnLogin(user)
            return user
        }

        val normalizedEmail = email?.trim()?.lowercase()?.takeIf { it.contains("@") }
        if (normalizedEmail != null) {
            userRepository.findFirstByEmailIgnoreCase(normalizedEmail)?.let { byEmail ->
                rejectIfDeleted(byEmail)
                if (byEmail.idpUid != null && byEmail.idpUid != idpUid) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cet email est déjà associé à un autre compte.",
                    )
                }
                byEmail.idpUid = idpUid
                val user = userAccountService.markActivated(updateProfile(byEmail, normalizedEmail, displayName))
                participantLinkService.linkPendingParticipantsOnLogin(user)
                return user
            }
        }

        val now = Instant.now()
        val draft =
            UserEntity(
                googleSub = null,
                idpUid = idpUid,
                email = normalizedEmail ?: email,
                displayName = displayName,
                activatedAt = now,
                createdAt = now,
                updatedAt = now,
            )
        draft.slug = userSlugService.allocateUniqueSlug(draft)
        val created = userRepository.save(draft)
        participantLinkService.linkPendingParticipantsOnLogin(created)
        return created
    }

    private fun updateProfile(
        user: UserEntity,
        email: String?,
        displayName: String?,
    ): UserEntity {
        if (!email.isNullOrBlank()) {
            user.email = email.trim().lowercase()
        }
        if (!displayName.isNullOrBlank()) {
            user.displayName = displayName
        }
        user.updatedAt = Instant.now()
        return userSlugService.ensureSlug(userRepository.save(user))
    }

    private fun rejectIfDeleted(user: UserEntity) {
        if (user.deletedAt != null) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Ce compte a été supprimé.",
            )
        }
    }
}
