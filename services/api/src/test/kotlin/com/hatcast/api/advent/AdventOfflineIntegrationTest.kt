package com.hatcast.api.advent

import com.zaxxer.hikari.HikariDataSource
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.TestInstance
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.nio.file.Files
import java.util.Comparator
import java.util.UUID
import javax.sql.DataSource

@SpringBootTest(properties = ["hatcast.advent-test.enabled=true", "hatcast.advent-test.operator-email=advent-member@example.com", "hatcast.advent-test.troupe-id=a0000001-0000-4000-8000-000000000001", "hatcast.auth.super-admin-emails=advent-admin@example.com", "hatcast.advent-test.allowed-emails=advent-member@example.com,advent-admin@example.com,advent-unverified@example.com,advent-other@example.com"])
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
    @MockBean private lateinit var offlineRoot: AdventOfflineRoot
    @AfterAll fun removeTemporaryDatabase() {
        dataSource.unwrap(HikariDataSource::class.java).close()
        Files.walk(testRoot).use { paths -> paths.sorted(Comparator.reverseOrder()).forEach(Files::delete) }
    }
    @Autowired private lateinit var mvc: MockMvc
    @Autowired private lateinit var jdbc: org.springframework.jdbc.core.JdbcTemplate
    @Autowired private lateinit var users: UserRepository
    @Autowired private lateinit var memberships: TroupeMembershipRepository
    @MockBean private lateinit var google: GoogleIdTokenService
    @MockBean private lateinit var idp: IdpIdTokenVerifier
    private val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    @BeforeEach fun seedQuizContent() { seedAdventQuizzes(jdbc) }

    @Test fun `unverified allowlisted member cannot access any test route`() {
        whenever(offlineRoot.worktreeRoot()).thenReturn(testRoot)
        val cookie = TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mvc, google, "advent-unverified", email = "advent-unverified@example.com", emailVerified = false,
        )
        mvc.perform(post("/v1/advent-test/session/reset").cookie(cookie).header("X-Advent-Test-Session", UUID.randomUUID().toString()).with(csrf()))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/reserve").cookie(cookie).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/reconcile").cookie(cookie).with(csrf()))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(get("/v1/advent-test/doors/1/answer").cookie(cookie))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"choice":0}"""))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
    }

    @Test fun `real membership protects each fictional door`() {
        whenever(offlineRoot.worktreeRoot()).thenReturn(testRoot)
        val cookie = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "advent-member", emailVerified = true)
        val legacyUser = users.findByGoogleSub("advent-member")!!.id
        jdbc.update("DELETE FROM advent_test_answers WHERE user_id = ? AND quiz_day = 1", legacyUser)
        jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at, answer_id) VALUES (?, 1, 0, 0, 10, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)", legacyUser, UUID.randomUUID())
        jdbc.update("UPDATE advent_quizzes SET statement_0 = 'Contenu fictif préparé' WHERE quiz_day = 1")
        jdbc.update("UPDATE advent_content_transition SET reset_required = TRUE WHERE id = 1")
        val legacySession = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(get("/v1/advent-test/session").cookie(cookie)).andExpect(jsonPath("$.transitionRequired").value(true)).andReturn().response.contentAsString, "$.sessionId")
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie)).andExpect(status().isLocked).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(get("/v1/advent-test/results/latest-unseen").cookie(cookie).header("X-Advent-Test-Session", legacySession)).andExpect(status().isLocked)
        mvc.perform(get("/v1/advent-test/doors/1/result").cookie(cookie).header("X-Advent-Test-Session", legacySession)).andExpect(status().isLocked).andExpect(header().string("Cache-Control", "private, no-store"))
        val existingAttempt = UUID.randomUUID()
        jdbc.update("INSERT INTO advent_test_attempts (id, user_id, quiz_day, cancelled) VALUES (?, ?, 1, FALSE)", existingAttempt, legacyUser)
        jdbc.update("INSERT INTO advent_test_generations (user_id, quiz_day, generation) VALUES (?, 1, ?)", legacyUser, UUID.randomUUID())
        val attemptsBefore = jdbc.queryForList("SELECT * FROM advent_test_attempts")
        val answersBefore = jdbc.queryForList("SELECT * FROM advent_test_answers")
        val generationsBefore = jdbc.queryForList("SELECT * FROM advent_test_generations")
        val pending = UUID.randomUUID()
        mvc.perform(post("/v1/advent-test/doors/1/answer/reserve").cookie(cookie).header("X-Advent-Test-Session", legacySession).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$pending","generation":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isLocked).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", legacySession).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"choice":2,"attemptId":"$pending"}"""))
            .andExpect(status().isLocked).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/reconcile").cookie(cookie).header("X-Advent-Test-Session", legacySession).with(csrf()))
            .andExpect(status().isLocked).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie).header("X-Advent-Test-Session", legacySession).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isLocked).andExpect(header().string("Cache-Control", "private, no-store"))
        assertEquals(generationsBefore, jdbc.queryForList("SELECT * FROM advent_test_generations"))
        assertEquals(attemptsBefore, jdbc.queryForList("SELECT * FROM advent_test_attempts"))
        assertEquals(answersBefore, jdbc.queryForList("SELECT * FROM advent_test_answers"))
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ? AND quiz_day = 1", Int::class.java, legacyUser))
        mvc.perform(post("/v1/advent-test/session/reset").cookie(cookie).header("X-Advent-Test-Session", legacySession).with(csrf())).andExpect(status().isOk)
        mvc.perform(get("/v1/advent-test/session").cookie(cookie)).andExpect(jsonPath("$.transitionRequired").value(false))
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 5")
        mvc.perform(get("/v1/advent-test/doors/5").cookie(cookie)).andExpect(status().isNotFound)
            .andExpect(header().string("Cache-Control", "private, no-store"))
        val readySession = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(get("/v1/advent-test/session").cookie(cookie)).andReturn().response.contentAsString, "$.sessionId")
        mvc.perform(post("/v1/advent-test/doors/5/answer/reconcile").cookie(cookie).header("X-Advent-Test-Session", readySession).with(csrf()))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("unavailable"))
        jdbc.update("UPDATE advent_quizzes SET display_name = ?, statement_0 = ?, statement_1 = ?, statement_2 = ?, false_choice = ?, explanation = ? WHERE quiz_day = 1", "Personnage fictif", "Ordre A", "Ordre B", "Ordre C", 2, "Complément fictif")
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.name").value("Personnage fictif"))
            .andExpect(jsonPath("$.statements[0]").value("Ordre A"))
            .andExpect(jsonPath("$.statements[1]").value("Ordre B"))
            .andExpect(jsonPath("$.statements[2]").value("Ordre C"))
            .andExpect(jsonPath("$.falseChoice").doesNotExist()).andExpect(jsonPath("$.explanation").doesNotExist())
        val fixtures = Files.createDirectories(testRoot.resolve(".local/hatcast-avent-test"))
        val camille = fixtures.resolve("camille-net.png")
        Files.write(camille, byteArrayOf(1, 2, 3))
        mvc.perform(get("/v1/advent-test/doors/4").cookie(cookie)).andExpect(status().isOk)
            .andExpect(jsonPath("$.portrait").value("data:image/png;base64,AQID"))
            .andExpect(jsonPath("$.genericElf").value(false))
        Files.delete(camille)
        mvc.perform(get("/v1/advent-test/doors/4").cookie(cookie)).andExpect(status().isOk)
            .andExpect(jsonPath("$.genericElf").value(true))
        mvc.perform(get("/v1/advent-test/doors/4").cookie(cookie)).andExpect(status().isOk)
            .andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.name").value("Camille"))
            .andExpect(jsonPath("$.statements.length()").value(3))
            .andExpect(jsonPath("$.answer").doesNotExist())
        mvc.perform(get("/v1/advent-test/doors/25").cookie(cookie)).andExpect(status().isNotFound)
            .andExpect(header().string("Cache-Control", "private, no-store"))
        val session = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(get("/v1/advent-test/session").cookie(cookie)).andExpect(status().isOk).andReturn().response.contentAsString, "$.sessionId")
        val attempt = UUID.randomUUID()
        val generation = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(post("/v1/advent-test/doors/1/answer/reconcile").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf())).andExpect(status().isOk).andReturn().response.contentAsString, "$.generation")
        mvc.perform(post("/v1/advent-test/doors/1/answer/reserve").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","generation":"$generation"}"""))
            .andExpect(status().isOk)
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"choice":2,"attemptId":"$attempt"}"""))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.status").value("recorded"))
            .andExpect(jsonPath("$.correct").doesNotExist()).andExpect(jsonPath("$.points").doesNotExist())
            .andExpect(jsonPath("$.falseChoice").doesNotExist()).andExpect(jsonPath("$.explanation").doesNotExist())
        mvc.perform(get("/v1/advent-test/doors/1/result").cookie(cookie).header("X-Advent-Test-Session", session))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Complément fictif"))))
        mvc.perform(post("/v1/advent-test/clock/next-day").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf())).andExpect(status().isOk)
        mvc.perform(get("/v1/advent-test/doors/1/result").cookie(cookie).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.falseChoice").value(2)).andExpect(jsonPath("$.selectedChoice").value(2))
            .andExpect(jsonPath("$.responsePoints").value(10)).andExpect(jsonPath("$.participationPoints").value(1))
            .andExpect(jsonPath("$.explanation").value("Complément fictif"))
        mvc.perform(get("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"choice":2,"attemptId":"$attempt"}"""))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie))
            .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        val replayToken = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(get("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", session)).andReturn().response.contentAsString, "$.replayToken")
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"$replayToken"}"""))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.choice").doesNotExist()).andExpect(jsonPath("$.points").doesNotExist())
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"choice":0,"attemptId":"$attempt"}"""))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
        val other = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mvc, google, "advent-other", email = "advent-other@example.com", emailVerified = true)
        val beforeReset = jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1")
        val answerCount = jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers", Int::class.java)
        mvc.perform(post("/v1/advent-test/session/reset").cookie(other).header("X-Advent-Test-Session", session).with(csrf())).andExpect(status().isForbidden)
        assertEquals(beforeReset, jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1"))
        assertEquals(answerCount, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers", Int::class.java))
        mvc.perform(post("/v1/advent-test/session/reset").cookie(cookie).header("X-Advent-Test-Session", session)).andExpect(status().isForbidden)
        mvc.perform(post("/v1/advent-test/session/reset").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent-test/doors/1/answer/reconcile").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()))
            .andExpect(status().isConflict)
        mvc.perform(post("/v1/advent-test/doors/1/answer/reserve").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"${UUID.randomUUID()}","generation":"${UUID.randomUUID()}"}"""))
            .andExpect(status().isConflict)
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"choice":0,"attemptId":"$attempt"}"""))
            .andExpect(status().isConflict)
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"$replayToken"}"""))
            .andExpect(status().isConflict)
        mvc.perform(post("/v1/advent-test/session/reset").cookie(cookie).header("X-Advent-Test-Session", session).with(csrf()))
            .andExpect(status().isConflict)
        mvc.perform(get("/v1/advent-test/doors/4").cookie(cookie)).andExpect(status().isOk).andExpect(jsonPath("$.name").value("Camille"))
        val fresh = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(get("/v1/advent-test/session").cookie(cookie)).andExpect(status().isOk).andReturn().response.contentAsString, "$.sessionId")
        val freshGeneration = com.jayway.jsonpath.JsonPath.read<String>(mvc.perform(post("/v1/advent-test/doors/1/answer/reconcile").cookie(cookie).header("X-Advent-Test-Session", fresh).with(csrf())).andExpect(status().isOk).andReturn().response.contentAsString, "$.generation")
        val freshAttempt = UUID.randomUUID()
        mvc.perform(post("/v1/advent-test/doors/1/answer/reserve").cookie(cookie).header("X-Advent-Test-Session", fresh).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$freshAttempt","generation":"$freshGeneration"}""")).andExpect(status().isOk)
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).header("X-Advent-Test-Session", fresh).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"choice":0,"attemptId":"$freshAttempt"}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))

        val user = users.findByGoogleSub("advent-member")!!
        val member = memberships.findByTroupe_IdAndUser_Id(troupe, user.id)!!
        member.status = TroupeMembershipStatus.INACTIVE
        memberships.saveAndFlush(member)
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie)).andExpect(status().isForbidden)
            .andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(get("/v1/advent-test/doors/1/answer").cookie(cookie)).andExpect(status().isForbidden)
        mvc.perform(post("/v1/advent-test/doors/1/answer/replay").cookie(cookie).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"$replayToken"}""")).andExpect(status().isForbidden)
        mvc.perform(post("/v1/advent-test/doors/1/answer").cookie(cookie).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("""{"choice":0}"""))
            .andExpect(status().isForbidden)
        member.status = TroupeMembershipStatus.ACTIVE
        member.baselineRole = TroupeBaselineRole.EXTERNE
        memberships.saveAndFlush(member)
        mvc.perform(get("/v1/advent-test/doors/1").cookie(cookie)).andExpect(status().isForbidden)
            .andExpect(header().string("Cache-Control", "private, no-store"))
        val admin = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-admin", "advent-admin@example.com", emailVerified = true)
        mvc.perform(get("/v1/advent-test/doors/1").cookie(admin)).andExpect(status().isForbidden)
        mvc.perform(get("/v1/advent-test/doors/25").cookie(admin)).andExpect(status().isForbidden)
    }
}
