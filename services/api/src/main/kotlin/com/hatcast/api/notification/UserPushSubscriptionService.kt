package com.hatcast.api.notification

import com.hatcast.api.notification.dto.MePushStatusResponseDto
import com.hatcast.api.notification.dto.PushSubscriptionSummaryDto
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.net.URI
import java.time.Instant
import java.util.UUID

@Service
class UserPushSubscriptionService(
    private val userRepository: UserRepository,
    private val subscriptionRepository: UserPushSubscriptionRepository,
) {
    @Transactional(readOnly = true)
    fun getStatus(
        userId: UUID,
        browserPermission: String? = null,
        includeSubscriptions: Boolean = false,
    ): MePushStatusResponseDto {
        val user = requireUser(userId)
        val subscriptions = subscriptionRepository.findByUserId(userId)
        return MePushStatusResponseDto(
            enabled = user.pushNotificationsEnabled && subscriptions.isNotEmpty(),
            browserPermission = browserPermission,
            subscriptionCount = subscriptions.size,
            subscriptions = if (includeSubscriptions) subscriptions.map { toSummary(it) } else null,
        )
    }

    @Transactional
    fun registerSubscription(
        userId: UUID,
        body: RegisterPushSubscriptionRequest,
        userAgent: String?,
    ): MePushStatusResponseDto {
        val endpoint = body.endpoint.trim()
        validateEndpoint(endpoint)
        val user = requireUser(userId)
        val now = Instant.now()

        try {
            upsertByEndpoint(user, endpoint, body, userAgent, now)
        } catch (exception: DataIntegrityViolationException) {
            // A concurrent tab may have inserted the same endpoint after our first lookup.
            val existing = subscriptionRepository.findByEndpoint(endpoint) ?: throw exception
            updateExistingSubscription(existing, user, body, userAgent, now)
        }

        user.pushNotificationsEnabled = true
        user.updatedAt = now
        userRepository.save(user)

        return getStatus(userId)
    }

    private fun upsertByEndpoint(
        user: UserEntity,
        endpoint: String,
        body: RegisterPushSubscriptionRequest,
        userAgent: String?,
        now: Instant,
    ) {
        val existing = subscriptionRepository.findByEndpoint(endpoint)
        if (existing != null) {
            updateExistingSubscription(existing, user, body, userAgent, now)
        } else {
            subscriptionRepository.saveAndFlush(
                UserPushSubscriptionEntity(
                    user = user,
                    endpoint = endpoint,
                    p256dhKey = body.keys.p256dh.trim(),
                    authKey = body.keys.auth.trim(),
                    userAgent = userAgent?.take(512),
                    lastUsedAt = now,
                ),
            )
        }
    }

    private fun updateExistingSubscription(
        existing: UserPushSubscriptionEntity,
        newUser: UserEntity,
        body: RegisterPushSubscriptionRequest,
        userAgent: String?,
        now: Instant,
    ) {
        val previousUser = existing.user.takeIf { it.id != newUser.id }

        existing.user = newUser
        existing.p256dhKey = body.keys.p256dh.trim()
        existing.authKey = body.keys.auth.trim()
        existing.userAgent = userAgent?.take(512)
        existing.lastUsedAt = now
        subscriptionRepository.saveAndFlush(existing)

        if (previousUser != null && subscriptionRepository.countByUserId(previousUser.id) == 0L) {
            previousUser.pushNotificationsEnabled = false
            previousUser.updatedAt = now
            userRepository.save(previousUser)
        }
    }

    @Transactional
    fun deleteSubscription(
        userId: UUID,
        endpoint: String?,
    ): MePushStatusResponseDto {
        val user = requireUser(userId)
        val now = Instant.now()

        if (endpoint.isNullOrBlank()) {
            subscriptionRepository.deleteAllByUserId(userId)
        } else {
            subscriptionRepository.deleteByUserIdAndEndpoint(userId, endpoint.trim())
        }

        val remaining = subscriptionRepository.countByUserId(userId)
        if (remaining == 0L) {
            user.pushNotificationsEnabled = false
            user.updatedAt = now
            userRepository.save(user)
        }

        return getStatus(userId)
    }

    @Transactional
    fun setGlobalEnabled(
        userId: UUID,
        enabled: Boolean,
    ): MePushStatusResponseDto {
        val user = requireUser(userId)
        val now = Instant.now()

        if (!enabled) {
            subscriptionRepository.deleteAllByUserId(userId)
            user.pushNotificationsEnabled = false
        } else {
            user.pushNotificationsEnabled = true
        }

        user.updatedAt = now
        userRepository.save(user)

        return getStatus(userId)
    }

    private fun requireUser(userId: UUID) =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable.")
        }

    private fun validateEndpoint(endpoint: String) {
        val trimmed = endpoint.trim()
        if (trimmed.length > 2048) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Endpoint push invalide.")
        }
        val uri =
            try {
                URI(trimmed)
            } catch (_: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Endpoint push invalide.")
            }
        if (uri.scheme != "https") {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Endpoint push invalide.")
        }
    }

    private fun toSummary(entity: UserPushSubscriptionEntity): PushSubscriptionSummaryDto {
        val endpoint = entity.endpoint
        val preview =
            if (endpoint.length <= 48) {
                endpoint
            } else {
                "${endpoint.take(24)}…${endpoint.takeLast(12)}"
            }
        return PushSubscriptionSummaryDto(
            id = entity.id.toString(),
            endpointPreview = preview,
            createdAt = entity.createdAt.toString(),
        )
    }
}
