package com.hatcast.api.advent

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Test
import com.fasterxml.jackson.databind.ObjectMapper
import org.mockito.Mockito.`when`
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.MapPropertySource
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import java.time.Instant
import java.util.UUID
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest(properties = ["hatcast.advent.troupe-id=a0000001-0000-4000-8000-000000000001"])
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdventMemberSecurityTest {
    @Autowired lateinit var mvc: MockMvc
    @MockBean lateinit var google: GoogleIdTokenService
    @MockBean lateinit var idp: IdpIdTokenVerifier
    @MockBean lateinit var clock: AdventMemberClock
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var json: ObjectMapper
    @Autowired lateinit var environment: ConfigurableEnvironment
    @Test fun `anonymous and unrelated user cannot access member data and errors are not cached`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "outsider-advent-member")
        for (path in listOf("/v1/advent/clock", "/v1/advent/doors/1", "/v1/advent/doors/1/answer", "/v1/advent/doors/1/result", "/v1/advent/results/latest-unseen", "/v1/advent/ranking")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get(path).cookie(cookie)).andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        }
    }
    @Test fun `ordinary members cannot invoke controls or the old test API`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Troupe fictive', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-ordinary-controls")
        val user = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "advent-ordinary-controls")!!
        jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, user)
        val session = mvc.perform(get("/v1/advent/session").cookie(cookie)).andExpect(status().isOk).andExpect(jsonPath("$.testControls").value(false)).andExpect(header().string("Cache-Control", "private, no-store")).andReturn()
        val token = json.readTree(session.response.contentAsString).get("sessionId").asText()
        mvc.perform(get("/v1/advent/clock").cookie(cookie).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02"))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent/doors/1/answer/reconcile").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02"))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
        for (path in listOf("/v1/advent/clock/next-day", "/v1/advent/clock/previous-day", "/v1/advent/session/reset", "/v1/advent/doors/1/answer/replay"))
            mvc.perform(post(path).cookie(cookie).with(csrf()).header("X-Advent-Test-Session", UUID.randomUUID().toString()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(get("/v1/advent-test/session").cookie(cookie)).andExpect(status().isForbidden)
    }
    @Test fun `two verified operators and ordinary member share game and protected controls`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Troupe fictive', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val first = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "shared-op-one", "op-one@example.com", emailVerified = true)
        val second = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "shared-op-two", "op-two@example.com", emailVerified = true)
        val member = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "shared-member")
        val ids = listOf("shared-op-one", "shared-op-two", "shared-member").map { sub ->
            val id = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, sub)!!
            jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, id, "Fictif $sub")
            id
        }
        environment.propertySources.addFirst(MapPropertySource("advent-shared-test", mapOf("hatcast.advent.excluded-user-ids" to "${ids[0]},${ids[1]}", "hatcast.advent-test.allowed-emails" to "op-one@example.com,op-two@example.com")))
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        `when`(clock.instant()).thenReturn(Instant.parse("2026-12-01T12:00:00Z"))
        jdbc.update("UPDATE advent_member_lock SET test_offset_seconds = 456 WHERE id = 1")
        try {
            val a = mvc.perform(get("/v1/advent/session").cookie(first)).andExpect(status().isOk).andExpect(jsonPath("$.testControls").value(true)).andReturn()
            val b = mvc.perform(get("/v1/advent/session").cookie(second)).andExpect(status().isOk).andExpect(jsonPath("$.testControls").value(true)).andReturn()
            val token = json.readTree(a.response.contentAsString).get("sessionId").asText()
            assert(token == json.readTree(b.response.contentAsString).get("sessionId").asText())
            val memberSession = mvc.perform(get("/v1/advent/session").cookie(member)).andExpect(jsonPath("$.testControls").value(false)).andReturn()
            assert(token == json.readTree(memberSession.response.contentAsString).get("sessionId").asText())
            jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 1")
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (1, 'Fictif', 'A', 'B', 'C', 0)")
            val reconciliation = mvc.perform(post("/v1/advent/doors/1/answer/reconcile").cookie(member).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andReturn()
            val generation = json.readTree(reconciliation.response.contentAsString).get("generation").asText()
            val attempt = UUID.randomUUID()
            mvc.perform(post("/v1/advent/doors/1/answer/reserve").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","generation":"$generation"}""")).andExpect(status().isOk)
            mvc.perform(post("/v1/advent/doors/1/answer").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","choice":0}""")).andExpect(status().isOk)
            val memberBoard = mvc.perform(get("/v1/advent/ranking").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.ranking.score").value(0)).andReturn()
            val operatorBoard = mvc.perform(get("/v1/advent/ranking").cookie(first).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andReturn()
            val memberJson = json.readTree(memberBoard.response.contentAsString)
            val operatorJson = json.readTree(operatorBoard.response.contentAsString)
            assert(memberJson["ranking"]["entries"].first { it["mine"].asBoolean() }["score"].asInt() == 0)
            assert(operatorJson["ranking"]["entries"].first { it["name"].asText() == "Fictif shared-member" }["score"].asInt() == 11)
            assert(!memberBoard.response.contentAsString.contains("correct"))
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 2, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 2)")
            mvc.perform(post("/v1/advent/doors/2/answer/reconcile").cookie(first).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            val simulated = "2026-12-02"
            val simulatedReconcile = mvc.perform(post("/v1/advent/doors/2/answer/reconcile").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", simulated)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available")).andReturn()
            val simulatedGeneration = json.readTree(simulatedReconcile.response.contentAsString).get("generation").asText()
            val simulatedAttempt = UUID.randomUUID()
            mvc.perform(post("/v1/advent/doors/2/answer/reserve").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", simulated).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$simulatedAttempt","generation":"$simulatedGeneration"}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            mvc.perform(post("/v1/advent/doors/2/answer").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", simulated).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$simulatedAttempt","choice":0}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
            mvc.perform(get("/v1/advent/doors/2/answer").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get("/v1/advent/ranking").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.ranking.score").value(0))
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02")).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-02"))
            mvc.perform(get("/v1/advent/clock").cookie(second).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-01"))
            mvc.perform(get("/v1/advent/clock").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-01"))
            mvc.perform(get("/v1/advent/clock").cookie(second).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-03")).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-03"))
            mvc.perform(get("/v1/advent/clock").cookie(member).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2027-01-16")).andExpect(status().isBadRequest)
            mvc.perform(post("/v1/advent/clock/next-day").cookie(first).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            `when`(clock.isolatedControlsAllowed()).thenReturn(false)
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02"))
                .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            `when`(clock.isolatedControlsAllowed()).thenReturn(true)
            assert(jdbc.queryForObject("SELECT test_offset_seconds FROM advent_member_lock WHERE id = 1", Long::class.java) == 456L)
            mvc.perform(post("/v1/advent/session/reset").cookie(second).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isOk)
            assert(jdbc.queryForObject("SELECT test_offset_seconds FROM advent_member_lock WHERE id = 1", Long::class.java) == 456L)
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token)).andExpect(status().isConflict)
            mvc.perform(get("/v1/advent/clock").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isConflict)
            mvc.perform(post("/v1/advent/doors/1/answer/reconcile").cookie(member).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isConflict)
            val fresh = mvc.perform(get("/v1/advent/session").cookie(member)).andExpect(status().isOk).andReturn()
            val freshToken = json.readTree(fresh.response.contentAsString).get("sessionId").asText()
            assert(freshToken != token)
            mvc.perform(post("/v1/advent/doors/1/answer/reconcile").cookie(member).with(csrf()).header("X-Advent-Test-Session", freshToken)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
        } finally {
            environment.propertySources.remove("advent-shared-test")
            jdbc.update("UPDATE advent_member_lock SET test_offset_seconds = 0 WHERE id = 1")
        }
    }
    @Test fun `post commands enforce membership and isolate answers and acknowledgements`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Troupe fictive', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val alice = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-security-alice")
        val bob = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-security-bob")
        val outsider = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-security-outsider")
        for (sub in listOf("advent-security-alice", "advent-security-bob")) {
            val id = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, sub)!!
            jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, id)
        }
        val token = json.readTree(mvc.perform(get("/v1/advent/session").cookie(alice)).andExpect(status().isOk).andReturn().response.contentAsString).get("sessionId").asText()
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 1, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 1)")
        `when`(clock.instant()).thenReturn(Instant.parse("2026-12-01T12:00:00Z"))
        val attempt = UUID.randomUUID()
        val paths = listOf(
            "/v1/advent/doors/1/answer/reconcile" to "{}",
            "/v1/advent/doors/1/answer/reserve" to """{"attemptId":"$attempt","generation":"${UUID.randomUUID()}"}""",
            "/v1/advent/doors/1/answer" to """{"choice":0,"attemptId":"$attempt"}""",
            "/v1/advent/doors/1/result/acknowledge" to """{"answerId":"${UUID.randomUUID()}"}""",
        )
        for ((path, body) in paths) {
            mvc.perform(post(path).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(post(path).cookie(outsider).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        }
        val reconciliation = mvc.perform(post(paths[0].first).cookie(alice).header("X-Advent-Test-Session", token).with(csrf()))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.status").value("available")).andReturn()
        val generation = json.readTree(reconciliation.response.contentAsString).get("generation").asText()
        val reservation = """{"attemptId":"$attempt","generation":"$generation"}"""
        mvc.perform(post(paths[1].first).cookie(alice).header("X-Advent-Test-Session", token).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(reservation))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.status").value("available"))
        mvc.perform(post(paths[2].first).cookie(bob).header("X-Advent-Test-Session", token).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(paths[2].second))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.status").value("stale"))
        mvc.perform(post(paths[2].first).cookie(alice).header("X-Advent-Test-Session", token).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(paths[2].second))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.status").value("recorded"))
        mvc.perform(get("/v1/advent/doors/1/result").cookie(alice).header("X-Advent-Test-Session", token))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
        `when`(clock.instant()).thenReturn(Instant.parse("2026-12-01T23:00:00Z"))
        val result = mvc.perform(get("/v1/advent/doors/1/result").cookie(alice).header("X-Advent-Test-Session", token))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andReturn()
        val answerId = json.readTree(result.response.contentAsString).get("answerId").asText()
        val acknowledgement = """{"answerId":"$answerId"}"""
        mvc.perform(post(paths[3].first).cookie(bob).header("X-Advent-Test-Session", token).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(acknowledgement))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post(paths[3].first).cookie(alice).header("X-Advent-Test-Session", token).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(acknowledgement))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
    }

}
