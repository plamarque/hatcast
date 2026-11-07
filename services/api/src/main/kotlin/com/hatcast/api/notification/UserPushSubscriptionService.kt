package com.hatcast.api.notification

import com.hatcast.api.notification.dto.MePushStatusResponseDto
import com.hatcast.api.notification.dto.PushSubscriptionSummaryDto
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.ConnectionCallback
import org.springframework.jdbc.core.JdbcTemplate
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
    private val adventDevices: AdventReminderDeviceRepository,
    private val jdbc: JdbcTemplate,
) {
    /** Serialize ownership changes across both tables for the same browser endpoint. */
    internal fun lockEndpoint(endpoint: String) {
        jdbc.execute(ConnectionCallback { connection ->
            if (connection.metaData.databaseProductName == "PostgreSQL") {
                connection.prepareStatement("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))").use { statement ->
                    statement.setString(1, endpoint)
                    statement.execute()
                }
            }
        })
    }

    /** Register an Advent device without changing HatCast's global notification choice. */
    @Transactional
    fun registerAdventDevice(userId: UUID, body: RegisterPushSubscriptionRequest, userAgent: String?) =
        registerAdventDeviceInternal(userId, body, userAgent, false)

    @Transactional
    fun registerTestAdventDevice(userId: UUID, body: RegisterPushSubscriptionRequest, userAgent: String?) =
        registerAdventDeviceInternal(userId, body, userAgent, true)

    private fun registerAdventDeviceInternal(userId: UUID, body: RegisterPushSubscriptionRequest, userAgent: String?, test: Boolean) {
        val endpoint = body.endpoint.trim()
        validateEndpoint(endpoint)
        lockEndpoint(endpoint)
        val user = requireUser(userId)
        val general = subscriptionRepository.findByEndpoint(endpoint)
        val existing = adventDevices.findByEndpoint(endpoint)
        if (test && ((general != null && general.user.id != userId) || (existing != null && existing.user.id != userId)))
            throw ResponseStatusException(HttpStatus.CONFLICT, "Cet appareil est associé à un autre compte.")
        val p256dh = body.keys.p256dh.trim()
        val auth = body.keys.auth.trim()
        if ((general != null && (general.p256dhKey != p256dh || general.authKey != auth)) ||
            (existing != null && existing.user.id != userId && (existing.p256dhKey != p256dh || existing.authKey != auth))) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Cet appareil est associé à un autre compte.")
        }
        val now = Instant.now()
        if (existing == null) {
            adventDevices.saveAndFlush(AdventReminderDeviceEntity(
                user = user, endpoint = endpoint, p256dhKey = body.keys.p256dh.trim(),
                authKey = body.keys.auth.trim(), userAgent = userAgent?.take(512), lastUsedAt = now,
            ))
        } else {
            // Possession of the endpoint and both subscription keys identifies the same browser.
            // Transfer only the Advent registration; the previous user's HatCast choice is untouched.
            existing.user = user
            existing.p256dhKey = body.keys.p256dh.trim()
            existing.authKey = body.keys.auth.trim()
            existing.userAgent = userAgent?.take(512)
            existing.lastUsedAt = now
            adventDevices.saveAndFlush(existing)
        }
    }

    @Transactional(readOnly = true)
    fun ownsTestAdventDevice(userId: UUID, body: RegisterPushSubscriptionRequest): Boolean {
        val device = adventDevices.findByEndpoint(body.endpoint.trim()) ?: return false
        val general = subscriptionRepository.findByEndpoint(body.endpoint.trim())
        return device.user.id == userId && (general == null || general.user.id == userId) &&
            device.p256dhKey == body.keys.p256dh.trim() && device.authKey == body.keys.auth.trim()
    }

    @Transactional(readOnly = true)
    fun ownsSubscription(userId: UUID, endpoint: String): Boolean =
        subscriptionRepository.findByUserIdAndEndpoint(userId, endpoint.trim()) != null

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
        lockEndpoint(endpoint)
        val user = requireUser(userId)
        val now = Instant.now()

        // The normal HatCast account-switch path transfers a browser endpoint.
        // Its old Advent registration must not continue targeting the new account's device.
        adventDevices.findByEndpoint(endpoint)?.let { device ->
            if (device.user.id != userId) adventDevices.delete(device)
        }
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
        if (previousUser != null) {
            // A browser subscription belongs to its new account only after an account switch.
            adventDevices.findByEndpoint(existing.endpoint)?.let { device ->
                if (device.user.id != newUser.id) adventDevices.delete(device)
            }
        }

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
