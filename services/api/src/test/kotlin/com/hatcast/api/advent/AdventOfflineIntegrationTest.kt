package com.hatcast.api.advent

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.zaxxer.hikari.HikariDataSource
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.not
import org.junit.jupiter.api.TestInstance
import org.mockito.kotlin.whenever
import org.mockito.kotlin.doReturn
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.boot.test.mock.mockito.SpyBean
import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.MapPropertySource
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.nio.file.Files
import java.time.Instant
import java.util.Comparator
import java.util.UUID
import javax.sql.DataSource

@SpringBootTest(properties = ["hatcast.advent.troupe-id=a0000001-0000-4000-8000-000000000001", "hatcast.advent-test.enabled=true"])
@AutoConfigureMockMvc
@ActiveProfiles("offline")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AdventOfflineIntegrationTest {
    companion object {
        private val testRoot = Files.createTempDirectory("hatcast-advent-test-")
        @JvmStatic @DynamicPropertySource fun isolatedProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { "jdbc:h2:file:${testRoot}/.local/hatcast-offline/hatcast;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE" }
        }
    }
    @Autowired private lateinit var dataSource: DataSource
    @Autowired private lateinit var mvc: MockMvc
    @Autowired private lateinit var jdbc: JdbcTemplate
    @Autowired private lateinit var environment: ConfigurableEnvironment
    @MockBean private lateinit var google: GoogleIdTokenService
    @MockBean private lateinit var idp: IdpIdTokenVerifier
    @SpyBean private lateinit var clock: AdventMemberClock
    @MockBean private lateinit var offlineRoot: AdventOfflineRoot

    @BeforeEach fun prepare() {
        seedAdventQuizzes(jdbc)
        whenever(offlineRoot.worktreeRoot()).thenReturn(testRoot)
        doReturn(Instant.parse("2026-12-01T12:00:00Z")).whenever(clock).instant()
    }

    @AfterAll fun removeTemporaryDatabase() {
        dataSource.unwrap(HikariDataSource::class.java).close()
        Files.walk(testRoot).use { paths -> paths.sorted(Comparator.reverseOrder()).forEach(Files::delete) }
    }

    @Test fun `unverified operator cannot use test controls even with eligible identity`() {
        val unverified = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "unverified-operator", email = "unverified-operator@example.com", emailVerified = false)
        val verified = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "verified-operator", email = "verified-operator@example.com", emailVerified = true)
        val first = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "unverified-operator")!!
        val second = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "verified-operator")!!
        environment.propertySources.addFirst(MapPropertySource("offline-test-operators", mapOf(
            "hatcast.advent.excluded-user-ids" to "$first,$second",
            "hatcast.advent-test.allowed-emails" to "unverified-operator@example.com,verified-operator@example.com",
        )))
        try {
            mvc.perform(get("/v1/advent/session").cookie(verified)).andExpect(status().isOk)
                .andExpect(jsonPath("$.testControls").value(true)).andExpect(header().string("Cache-Control", "private, no-store"))
            val session = mvc.perform(get("/v1/advent/session").cookie(unverified)).andExpect(status().isOk)
                .andExpect(jsonPath("$.testControls").value(false)).andExpect(header().string("Cache-Control", "private, no-store"))
                .andReturn().response.contentAsString
            val token = com.jayway.jsonpath.JsonPath.read<String>(session, "$.sessionId")
            mvc.perform(post("/v1/advent/session/reset").cookie(verified).header("X-Advent-Test-Session", token))
                .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get("/v1/advent/clock").cookie(unverified).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02"))
                .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            for (path in listOf("/v1/advent/session/reset", "/v1/advent/doors/1/answer/replay")) {
                mvc.perform(post(path).cookie(unverified).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"${UUID.randomUUID()}"}"""))
                    .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            }
            mvc.perform(get("/v1/advent-test/session").cookie(verified))
                .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        } finally {
            environment.propertySources.remove("offline-test-operators")
        }
    }

    @Test fun `active membership protects each fictional door`() {
        jdbc.update("UPDATE advent_quizzes SET story_0 = ?, story_1 = NULL, story_2 = ? WHERE quiz_day = 1", "Premier\n\nÉté", "Dernier")
        val active = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "offline-active", emailVerified = true)
        val inactive = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "offline-inactive", emailVerified = true)
        val external = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "offline-external", emailVerified = true)
        val externalId = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "offline-external")!!
        jdbc.update("UPDATE troupe_memberships SET baseline_role = 'EXTERNE' WHERE user_id = ?", externalId)
        val outsider = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "offline-outsider", emailVerified = true)
        val inactiveId = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "offline-inactive")!!
        jdbc.update("UPDATE troupe_memberships SET status = 'INACTIVE' WHERE user_id = ? AND troupe_id = ?", inactiveId, UUID.fromString("a0000001-0000-4000-8000-000000000001"))
        val session = mvc.perform(get("/v1/advent/session").cookie(active)).andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "private, no-store")).andReturn().response.contentAsString
        val token = com.jayway.jsonpath.JsonPath.read<String>(session, "$.sessionId")
        for (path in listOf("/v1/advent/doors/1", "/v1/advent/doors/1/answer", "/v1/advent/doors/1/result", "/v1/advent/calendar", "/v1/advent/doors/1/history")) {
            mvc.perform(get(path).header("X-Advent-Test-Session", token))
                .andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(content().string(not(containsString("Premier"))))
            for (cookie in listOf(inactive, external, outsider)) {
                mvc.perform(get(path).cookie(cookie).header("X-Advent-Test-Session", token))
                    .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(content().string(not(containsString("Premier"))))
            }
        }
        for (cookie in listOf(inactive, external, outsider)) {
            val id = UUID.randomUUID()
            for ((path, body) in listOf(
                "/v1/advent/doors/1/answer/reconcile" to "{}",
                "/v1/advent/doors/1/answer/reserve" to """{"attemptId":"$id","generation":"$id"}""",
                "/v1/advent/doors/1/answer" to """{"attemptId":"$id","choice":0}""",
                "/v1/advent/doors/1/result/acknowledge" to """{"answerId":"$id"}""",
            )) {
                mvc.perform(post(path).cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
            }
        }
        mvc.perform(get("/v1/advent/doors/1").cookie(active).header("X-Advent-Test-Session", token))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.statements.length()").value(3)).andExpect(jsonPath("$.stories[0]").value("Premier\n\nÉté"))
            .andExpect(jsonPath("$.stories[1]").isEmpty).andExpect(jsonPath("$.stories[2]").value("Dernier"))
            .andExpect(jsonPath("$.falseChoice").doesNotExist())
            .andExpect(jsonPath("$.explanation").doesNotExist()).andExpect(jsonPath("$.answer").doesNotExist())
        mvc.perform(get("/v1/advent-test/session").cookie(active))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
    }
}
