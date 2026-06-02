package com.hatcast.api.notification

import com.hatcast.api.notification.dto.NotificationPreferenceCategoryDto
import com.hatcast.api.notification.dto.NotificationPreferencesResponseDto
import com.hatcast.api.notification.dto.PatchNotificationPreferenceDto
import com.hatcast.api.notification.dto.PatchNotificationPreferencesRequest
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class UserNotificationPreferencesService(
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getPreferences(userId: UUID): NotificationPreferencesResponseDto =
        toResponse(requireUser(userId))

    @Transactional
    fun patchPreferences(
        userId: UUID,
        body: PatchNotificationPreferencesRequest,
    ): NotificationPreferencesResponseDto {
        if (body.preferences.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune préférence à mettre à jour.")
        }

        val user = requireUser(userId)
        val next = user.notificationPreferences.toMutableMap()
        body.preferences.forEach { (rawKey, patch) ->
            val category = parseCategory(rawKey)
            val current = next[category] ?: NotificationPreference()
            next[category] =
                NotificationPreference(
                    push = patch.push ?: current.push,
                    email = patch.email ?: current.email,
                )
        }

        user.notificationPreferences = next
        user.updatedAt = Instant.now()
        userRepository.save(user)
        return toResponse(user)
    }

    @Transactional(readOnly = true)
    fun isChannelAllowed(
        userId: UUID,
        category: NotificationCategory,
        channel: NotificationChannel,
    ): Boolean {
        val user = userRepository.findById(userId).orElse(null) ?: return false
        val preference = user.notificationPreferences[category] ?: NotificationPreference()
        return when (channel) {
            NotificationChannel.PUSH -> preference.push
            NotificationChannel.EMAIL -> preference.email
        }
    }

    private fun requireUser(userId: UUID): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable.")
        }

    private fun parseCategory(rawKey: String): NotificationCategory =
        try {
            NotificationCategory.valueOf(rawKey)
        } catch (_: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Catégorie de notification inconnue.")
        }

    private fun toResponse(user: UserEntity): NotificationPreferencesResponseDto =
        NotificationPreferencesResponseDto(
            categories =
                NotificationCategory.entries.map { category ->
                    val preference = user.notificationPreferences[category] ?: NotificationPreference()
                    NotificationPreferenceCategoryDto(
                        key = category.name,
                        label = category.label,
                        group = category.group.name,
                        pushEnabled = preference.push,
                        emailEnabled = preference.email,
                    )
                },
        )
}

@Component
class NotificationPreferenceEligibilityAdapter(
    private val preferencesService: UserNotificationPreferencesService,
    private val pushEligibilityPort: PushNotificationEligibilityPort,
) : NotificationPreferenceEligibilityPort {
    override fun isAllowed(
        userId: UUID,
        category: NotificationCategory,
        channel: NotificationChannel,
    ): Boolean =
        when (channel) {
            NotificationChannel.PUSH ->
                pushEligibilityPort.isPushEnabled(userId) &&
                    preferencesService.isChannelAllowed(userId, category, NotificationChannel.PUSH)
            NotificationChannel.EMAIL ->
                preferencesService.isChannelAllowed(userId, category, NotificationChannel.EMAIL)
        }
}
