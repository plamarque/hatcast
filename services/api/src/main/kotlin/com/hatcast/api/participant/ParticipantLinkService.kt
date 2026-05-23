package com.hatcast.api.participant

import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class ParticipantLinkService(
    private val userRepository: UserRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
) {
    fun normalizeEmail(raw: String?): String? {
        val normalized = raw?.trim()?.lowercase()?.takeIf { it.contains("@") }
        return normalized
    }

    fun resolveUserId(normalizedEmail: String?): UUID? {
        if (normalizedEmail.isNullOrBlank()) return null
        return userRepository.findFirstByEmailIgnoreCase(normalizedEmail)?.id
    }

    @Transactional
    fun linkPendingParticipantsOnLogin(user: UserEntity) {
        val email = normalizeEmail(user.email) ?: return
        val now = Instant.now()
        seasonParticipantRepository.linkUnlinkedByEmail(email, user, now)
        eventParticipantRepository.linkUnlinkedByEmail(email, user, now)
    }
}
