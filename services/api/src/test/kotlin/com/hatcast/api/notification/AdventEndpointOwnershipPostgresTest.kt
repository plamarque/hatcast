package com.hatcast.api.notification

import com.hatcast.api.notification.dto.PushSubscriptionKeysDto
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.mockito.Mockito
import org.mockito.kotlin.whenever
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

/** Exercises real Spring/JPA service transactions against a disposable local PostgreSQL. */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = ["hatcast.web-push.vapid-public-key=test", "hatcast.web-push.vapid-private-key=test"])
@EnabledIfEnvironmentVariable(named = "ADVENT_TEST_POSTGRES_URL", matches = ".+")
class AdventEndpointOwnershipPostgresTest {
    @Autowired private lateinit var users: UserRepository
    @Autowired private lateinit var generic: UserPushSubscriptionRepository
    @Autowired private lateinit var advent: AdventReminderDeviceRepository
    @Autowired private lateinit var service: UserPushSubscriptionService
    @Autowired private lateinit var tx: TransactionTemplate
    @Autowired private lateinit var sender: WebPushNotificationSender

    companion object {
        @JvmStatic @DynamicPropertySource
        fun postgres(registry: DynamicPropertyRegistry) {
            val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
            require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
            registry.add("spring.datasource.url") { url }
            registry.add("spring.datasource.username") { System.getenv("ADVENT_TEST_POSTGRES_USER") }
            registry.add("spring.datasource.password") { System.getenv("ADVENT_TEST_POSTGRES_PASSWORD") ?: "" }
            registry.add("spring.datasource.driver-class-name") { "org.postgresql.Driver" }
            registry.add("spring.jpa.properties.hibernate.dialect") { "org.hibernate.dialect.PostgreSQLDialect" }
            registry.add("spring.flyway.locations") { "classpath:db/migration,classpath:db/migration-postgresql" }
            registry.add("spring.flyway.placeholders.drop_event_availability_pk") { "DROP CONSTRAINT event_availability_pkey" }
            registry.add("spring.flyway.placeholders.notification_preferences_json_type") { "JSONB" }
            registry.add("spring.flyway.placeholders.notification_preferences_json_default") { "'{}'::jsonb" }
            registry.add("spring.flyway.placeholders.draw_factor_config_json_type") { "JSONB" }
            registry.add("spring.flyway.placeholders.draw_policy_rule_json_type") { "JSONB" }
            registry.add("spring.flyway.placeholders.draw_policy_rules_json_type") { "JSONB" }
            registry.add("spring.flyway.placeholders.draw_policy_rules_json_default") { "'[]'::jsonb" }
            registry.add("spring.flyway.placeholders.draw_policies_season_idx_sql") { "CREATE INDEX IF NOT EXISTS draw_policies_season_idx ON draw_policies (season_id) WHERE season_id IS NOT NULL" }
        }
    }

    @Test fun `concurrent actual registrations preserve HatCast ownership in both orders`() {
        val a = users.saveAndFlush(UserEntity(displayName = "Test Avent A"))
        val b = users.saveAndFlush(UserEntity(displayName = "Test HatCast B"))
        val pool = Executors.newFixedThreadPool(2)
        try {
            for (adventFirst in listOf(true, false)) {
                val endpoint = "https://push.example.test/" + UUID.randomUUID()
                val request = RegisterPushSubscriptionRequest(endpoint, PushSubscriptionKeysDto("key", "auth"))
                val holding = CountDownLatch(1); val release = CountDownLatch(1)
                val first = pool.submit {
                    tx.executeWithoutResult {
                        if (adventFirst) service.registerAdventDevice(a.id, request, null)
                        else service.registerSubscription(b.id, request, null)
                        holding.countDown()
                        check(release.await(10, TimeUnit.SECONDS))
                    }
                }
                try {
                    assertTrue(holding.await(10, TimeUnit.SECONDS))
                    val secondStarted = CountDownLatch(1)
                    val second = pool.submit {
                        secondStarted.countDown()
                        if (adventFirst) service.registerSubscription(b.id, request, null)
                        else service.registerAdventDevice(a.id, request, null)
                    }
                    assertTrue(secondStarted.await(10, TimeUnit.SECONDS))
                    assertThrows(TimeoutException::class.java) { second.get(150, TimeUnit.MILLISECONDS) }
                    release.countDown()
                    first.get(10, TimeUnit.SECONDS)
                    second.get(10, TimeUnit.SECONDS)
                    assertEquals(b.id, generic.findByEndpoint(endpoint)?.user?.id)
                    if (adventFirst) assertNull(advent.findByEndpoint(endpoint))
                    else {
                        assertEquals(a.id, advent.findByEndpoint(endpoint)?.user?.id)
                        service.registerAdventDevice(b.id, request, null)
                        assertEquals(b.id, advent.findByEndpoint(endpoint)?.user?.id)
                        assertEquals(b.id, generic.findByEndpoint(endpoint)?.user?.id)
                        val wrongKeys = request.copy(keys = PushSubscriptionKeysDto("different", "auth"))
                        assertThrows(ResponseStatusException::class.java) { service.registerAdventDevice(a.id, wrongKeys, null) }
                        assertEquals(b.id, advent.findByEndpoint(endpoint)?.user?.id)
                        assertEquals(b.id, generic.findByEndpoint(endpoint)?.user?.id)
                    }
                } finally { release.countDown() }
            }
        } finally { pool.shutdownNow() }
    }
    @Test fun `test delivery holds ownership stable until provider returns`() {
        val a = users.saveAndFlush(UserEntity(displayName = "Test push owner"))
        val b = users.saveAndFlush(UserEntity(displayName = "Test account switch"))
        val request = RegisterPushSubscriptionRequest("https://push.example.test/" + UUID.randomUUID(), PushSubscriptionKeysDto("key", "auth"))
        service.registerTestAdventDevice(a.id, request, null)
        val pool = Executors.newSingleThreadExecutor()
        try {
            val response: org.apache.http.HttpResponse = mock()
            val status: org.apache.http.StatusLine = mock()
            whenever(response.statusLine).thenReturn(status)
            whenever(status.statusCode).thenReturn(201)
            var transfer: java.util.concurrent.Future<*>? = null
            Mockito.mockConstruction(nl.martijndwars.webpush.Notification::class.java).use {
                Mockito.mockConstruction(nl.martijndwars.webpush.PushService::class.java) { push, _ ->
                    whenever(push.send(any<nl.martijndwars.webpush.Notification>())).thenAnswer {
                        val started = CountDownLatch(1)
                        transfer = pool.submit { started.countDown(); service.registerSubscription(b.id, request, null) }
                        assertTrue(started.await(10, TimeUnit.SECONDS))
                        assertThrows(TimeoutException::class.java) { transfer!!.get(200, TimeUnit.MILLISECONDS) }
                        assertEquals(a.id, advent.findByEndpoint(request.endpoint)?.user?.id)
                        response
                    }
                }.use {
                    assertEquals(NotificationDeliveryStatus.SENT, sender.sendTestAdventPush(a.id, request, adventReminderPayload(5, true)).status)
                }
            }
            transfer!!.get(10, TimeUnit.SECONDS)
            assertEquals(b.id, generic.findByEndpoint(request.endpoint)?.user?.id)
            assertNull(advent.findByEndpoint(request.endpoint))
        } finally { pool.shutdownNow() }
    }

}
