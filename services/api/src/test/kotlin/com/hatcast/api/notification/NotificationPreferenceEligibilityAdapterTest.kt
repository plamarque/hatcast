package com.hatcast.api.notification

import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class NotificationPreferenceEligibilityAdapterTest {
    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var subscriptionRepository: UserPushSubscriptionRepository

    @Autowired
    private lateinit var preferenceEligibilityPort: NotificationPreferenceEligibilityPort

    @Autowired
    private lateinit var pushEligibilityPort: PushNotificationEligibilityPort

    @Test
    fun `push requires global opt in active subscription and category opt in`() {
        val user =
            userRepository.save(
                UserEntity(
                    googleSub = "sub-pref-elig-push",
                    email = "pref-elig-push@example.com",
                    displayName = "Pref Elig Push",
                    pushNotificationsEnabled = true,
                ),
            )
        subscriptionRepository.save(
            UserPushSubscriptionEntity(
                user = user,
                endpoint = "https://fcm.googleapis.com/fcm/send/pref-elig-push-${user.id}",
                p256dhKey = "p256dh",
                authKey = "auth",
            ),
        )

        assertTrue(
            preferenceEligibilityPort.isAllowed(
                user.id,
                NotificationCategory.AVAILABILITY_REQUEST,
                NotificationChannel.PUSH,
            ),
        )
        assertTrue(pushEligibilityPort.isPushAllowedForCategory(user.id, NotificationCategory.AVAILABILITY_REQUEST))

        user.notificationPreferences =
            mapOf(NotificationCategory.AVAILABILITY_REQUEST to NotificationPreference(push = false, email = true))
        userRepository.save(user)

        assertFalse(
            preferenceEligibilityPort.isAllowed(
                user.id,
                NotificationCategory.AVAILABILITY_REQUEST,
                NotificationChannel.PUSH,
            ),
        )
        assertFalse(pushEligibilityPort.isPushAllowedForCategory(user.id, NotificationCategory.AVAILABILITY_REQUEST))
        assertTrue(
            preferenceEligibilityPort.isAllowed(
                user.id,
                NotificationCategory.AVAILABILITY_REQUEST,
                NotificationChannel.EMAIL,
            ),
        )
    }

    @Test
    fun `missing preference json defaults to allowed`() {
        val user =
            userRepository.save(
                UserEntity(
                    googleSub = "sub-pref-elig-default",
                    email = "pref-elig-default@example.com",
                    displayName = "Pref Elig Default",
                ),
            )

        assertTrue(
            preferenceEligibilityPort.isAllowed(
                user.id,
                NotificationCategory.REMINDER_7_DAYS,
                NotificationChannel.EMAIL,
            ),
        )
    }

    @Test
    fun `global push off blocks push even when category is enabled`() {
        val user =
            userRepository.save(
                UserEntity(
                    googleSub = "sub-pref-elig-global",
                    email = "pref-elig-global@example.com",
                    displayName = "Pref Elig Global",
                    pushNotificationsEnabled = false,
                ),
            )
        subscriptionRepository.save(
            UserPushSubscriptionEntity(
                user = user,
                endpoint = "https://fcm.googleapis.com/fcm/send/pref-elig-global-${user.id}",
                p256dhKey = "p256dh",
                authKey = "auth",
            ),
        )

        assertFalse(
            preferenceEligibilityPort.isAllowed(
                user.id,
                NotificationCategory.AVAILABILITY_REQUEST,
                NotificationChannel.PUSH,
            ),
        )
        assertFalse(pushEligibilityPort.isPushAllowedForCategory(user.id, NotificationCategory.AVAILABILITY_REQUEST))
    }
}
