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
    @Test fun `preview capability requires both verified identity and active membership`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Fictif', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val first = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "preview-capability-one", "patrice.lamarque@gmail.com", emailVerified = true)
        val second = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "preview-capability-two", "brousseau.ant@gmail.com", emailVerified = true)
        val third = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "preview-capability-third", "third@example.com", emailVerified = true)
        val ids = listOf("preview-capability-one", "preview-capability-two", "preview-capability-third").map { sub ->
            val id = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, sub)!!
            jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, id)
            id
        }
        environment.propertySources.addFirst(MapPropertySource("advent-preview-test", mapOf("hatcast.advent.excluded-user-ids" to "${ids[0]},${ids[1]}", "hatcast.advent-test.allowed-emails" to "patrice.lamarque@gmail.com,brousseau.ant@gmail.com", "hatcast.advent.preview-allowed-emails" to "patrice.lamarque@gmail.com,brousseau.ant@gmail.com")))
        try {
            for (invalid in listOf("", "one@example.test", "same@example.test,SAME@example.test")) {
                environment.propertySources.addFirst(MapPropertySource("invalid-preview-emails", mapOf("hatcast.advent.preview-allowed-emails" to invalid)))
                mvc.perform(get("/v1/advent/preview-capability").cookie(first)).andExpect(status().isOk).andExpect(jsonPath("$.productionPreview").value(false))
                environment.propertySources.remove("invalid-preview-emails")
            }
            `when`(clock.instant()).thenReturn(Instant.parse("2026-11-30T22:59:59Z"))
            for (day in listOf(7, 23)) {
                jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = ?", day)
                jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice, explanation) VALUES (?, 'Fictif', 'A', 'B', 'C', 1, 'Explication fictive')", day)
            }
            for (cookie in listOf(first, second)) mvc.perform(get("/v1/advent/session").cookie(cookie))
                .andExpect(status().isOk).andExpect(jsonPath("$.productionPreview").value(true))
                .andExpect(jsonPath("$.testControls").value(false))
            mvc.perform(get("/v1/advent/session").cookie(third)).andExpect(jsonPath("$.productionPreview").value(false))
            for (cookie in listOf(first, second)) mvc.perform(get("/v1/advent/preview-capability").cookie(cookie))
                .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
                .andExpect(jsonPath("$.productionPreview").value(true)).andExpect(jsonPath("$.sessionId").doesNotExist())
            mvc.perform(get("/v1/advent/preview-capability").cookie(third)).andExpect(status().isOk).andExpect(jsonPath("$.productionPreview").value(false))
            val token = json.readTree(mvc.perform(get("/v1/advent/session").cookie(first)).andReturn().response.contentAsString)["sessionId"].asText()
            mvc.perform(get("/v1/advent/entry").cookie(third)).andExpect(status().isNotFound)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-11-30T23:00:00Z"))
            mvc.perform(get("/v1/advent/entry").cookie(third)).andExpect(status().isOk)
            val rankingBefore = json.readTree(mvc.perform(get("/v1/advent/ranking").cookie(third).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andReturn().response.contentAsString)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-11-30T22:59:59Z"))
            for ((cookie, day) in listOf(first to 23, first to 7, second to 7)) {
                val prefix = "/v1/advent/doors/$day"
                mvc.perform(get(prefix).cookie(cookie).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
                mvc.perform(get(prefix).cookie(cookie).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                    .andExpect(status().isOk).andExpect(jsonPath("$.statements[0]").value("A"))
                val reconciliation = mvc.perform(post("$prefix/answer/reconcile").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                    .andExpect(status().isOk).andExpect(jsonPath("$.status").value("available")).andReturn()
                val generation = json.readTree(reconciliation.response.contentAsString)["generation"].asText()
                val attempt = UUID.randomUUID()
                mvc.perform(post("$prefix/answer/reserve").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true").contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","generation":"$generation"}"""))
                    .andExpect(status().isOk)
                mvc.perform(post("$prefix/answer").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true").contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","choice":1}"""))
                    .andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
                mvc.perform(post("$prefix/answer").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true").contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","choice":0}"""))
                    .andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
                mvc.perform(get("$prefix/result").cookie(cookie).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                    .andExpect(status().isOk).andExpect(jsonPath("$.correct").value(true)).andExpect(jsonPath("$.explanation").value("Explication fictive"))
            }
            mvc.perform(get("/v1/advent/doors/23/result").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                .andExpect(status().isOk).andExpect(jsonPath("$.selectedChoice").value(1))
            mvc.perform(get("/v1/advent/doors/23/history").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                .andExpect(status().isOk).andExpect(jsonPath("$.priorityResult.selectedChoice").value(1))
            mvc.perform(get("/v1/advent/doors/23/history").cookie(third).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                .andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/23/history").cookie(second).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true"))
                .andExpect(status().isOk).andExpect(jsonPath("$.priorityResult.day").value(7))
            // Preview identities cannot use the isolated opening-replay operation.
            mvc.perform(get("/v1/advent/entry/replay").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-User", ids[0].toString())).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/entry/replay").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-User", ids[0].toString()).contentType(MediaType.APPLICATION_JSON).content("""{"date":"2026-12-01"}""")).andExpect(status().isNotFound)
            // The operator prepares the ordinary day even when the tab simulates another day.
            `when`(clock.isolatedControlsAllowed()).thenReturn(true)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-12-01T12:00:00Z"))
            jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 1")
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (1, 'Fictif', 'A', 'B', 'C', 0)")
            jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at) VALUES (?, 1, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", ids[0], UUID.randomUUID())
            jdbc.update("INSERT INTO advent_member_dismissals (user_id, dismissed_on) VALUES (?, ?)", ids[0], java.time.LocalDate.of(2026, 12, 1))
            val replayHeaders = mapOf("X-Advent-Test-Session" to token, "X-Advent-Test-Mode" to "true", "X-Advent-User" to ids[0].toString(), "X-Advent-Simulated-Date" to "2026-12-07")
            fun replayGet() = get("/v1/advent/entry/replay").cookie(first).also { request -> replayHeaders.forEach { (key, value) -> request.header(key, value) } }
            fun replayPost(date: String, user: String = ids[0].toString(), session: String = token) = post("/v1/advent/entry/replay").cookie(first).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"date":"$date"}""").also { request -> (replayHeaders + mapOf("X-Advent-User" to user, "X-Advent-Test-Session" to session)).forEach { (key, value) -> request.header(key, value) } }
            mvc.perform(replayGet()).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-01")).andExpect(jsonPath("$.eligible").value(true))
            mvc.perform(replayPost("2026-12-07")).andExpect(status().isConflict)
            mvc.perform(replayPost("2026-12-01", user = ids[1].toString())).andExpect(status().isConflict)
            mvc.perform(replayPost("2026-12-01", session = UUID.randomUUID().toString())).andExpect(status().isConflict)
            mvc.perform(replayPost("2026-12-01")).andExpect(status().isOk)
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 1", Int::class.java, ids[0]) == 0)
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 7", Int::class.java, ids[0]) == 1)
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 7", Int::class.java, ids[1]) == 1)
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_dismissals WHERE user_id = ? AND dismissed_on = ?", Int::class.java, ids[0], java.time.LocalDate.of(2026, 12, 1)) == 0)
            mvc.perform(get("/v1/advent/entry").cookie(first)).andExpect(status().isOk).andExpect(jsonPath("$.autoOpen").value(true))
            `when`(clock.isolatedControlsAllowed()).thenReturn(false)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-11-30T22:59:59Z"))
            mvc.perform(post("/v1/advent/session/reset").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true")).andExpect(status().isNotFound)
            val firstAnswer = json.readTree(mvc.perform(get("/v1/advent/doors/23/answer").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true")).andExpect(status().isOk).andReturn().response.contentAsString)["replayToken"].asText()
            fun previewReplay(cookie: jakarta.servlet.http.Cookie, day: Int, answer: String, close: Boolean = false) = post("/v1/advent/doors/$day/answer/replay").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true").contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"$answer","close":$close}""")
            mvc.perform(previewReplay(first, 23, firstAnswer, true)).andExpect(status().isNotFound)
            mvc.perform(previewReplay(third, 23, firstAnswer)).andExpect(status().isNotFound)
            mvc.perform(previewReplay(second, 23, firstAnswer)).andExpect(status().isOk)
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 23", Int::class.java, ids[0]) == 1)
            mvc.perform(previewReplay(first, 23, firstAnswer)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 7", Int::class.java, ids[0]) == 1)
            assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 7", Int::class.java, ids[1]) == 1)
            mvc.perform(get("/v1/advent/doors/23/result").cookie(second).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/23").cookie(third).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/23").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true").header("X-Advent-Simulated-Date", "2026-12-23")).andExpect(status().isNotFound)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-11-30T23:00:00Z"))
            val rankingAfter = json.readTree(mvc.perform(get("/v1/advent/ranking").cookie(third).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andReturn().response.contentAsString)
            assert(rankingBefore == rankingAfter)
            mvc.perform(get("/v1/advent/doors/23/result").cookie(third).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            val unverified = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "preview-capability-one", "patrice.lamarque@gmail.com", emailVerified = false)
            mvc.perform(get("/v1/advent/session").cookie(unverified)).andExpect(status().isOk).andExpect(jsonPath("$.productionPreview").value(false))
            mvc.perform(get("/v1/advent/preview-capability").cookie(unverified)).andExpect(jsonPath("$.productionPreview").value(false))
            mvc.perform(get("/v1/advent/doors/23").cookie(unverified).header("X-Advent-Test-Session", token).header("X-Advent-Preview", "true")).andExpect(status().isNotFound)
            mvc.perform(previewReplay(unverified, 23, firstAnswer)).andExpect(status().isNotFound)
            jdbc.update("UPDATE troupe_memberships SET status = 'INACTIVE' WHERE troupe_id = ? AND user_id = ?", troupe, ids[0])
            mvc.perform(get("/v1/advent/session").cookie(first)).andExpect(status().isForbidden)
            mvc.perform(get("/v1/advent/preview-capability").cookie(first)).andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        } finally {
            environment.propertySources.remove("advent-preview-test")
        }
    }
    @Test fun `anonymous and unrelated user cannot access member data and errors are not cached`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "outsider-advent-member")
        for (path in listOf("/v1/advent/preview-capability", "/v1/advent/discovery", "/v1/advent/entry", "/v1/advent/clock", "/v1/advent/doors/1", "/v1/advent/doors/1/answer", "/v1/advent/doors/1/result", "/v1/advent/results/latest-unseen", "/v1/advent/ranking", "/v1/advent/calendar", "/v1/advent/doors/1/history")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get(path).cookie(cookie)).andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
        }
        mvc.perform(post("/v1/advent/discovery").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"${UUID.randomUUID()}"}""")).andExpect(status().isUnauthorized).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent/discovery").cookie(cookie).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"${UUID.randomUUID()}"}""")).andExpect(status().isForbidden).andExpect(header().string("Cache-Control", "private, no-store"))
    }
    @Test fun `authorized clock serializes coherent projection without caching`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Fictif', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "clock-projection-http-member")
        val user = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "clock-projection-http-member")!!
        jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, user)
        `when`(clock.instant()).thenReturn(Instant.parse("2026-12-24T22:59:59Z"))
        val session = json.readTree(mvc.perform(get("/v1/advent/session").cookie(cookie)).andExpect(status().isOk).andReturn().response.contentAsString)["sessionId"].asText()
        mvc.perform(get("/v1/advent/clock").cookie(cookie).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.date").value("2026-12-24"))
            .andExpect(jsonPath("$.effectiveInstant").value("2026-12-24T22:59:59Z"))
            .andExpect(jsonPath("$.nextMidnight").value("2026-12-24T23:00:00Z"))
            .andExpect(jsonPath("$.simulated").value(false))
    }
    @Test fun `discovery requires current authorized session and enforces mode`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Fictif', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "discovery-http-member")
        val user = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "discovery-http-member")!!
        jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, user)
        `when`(clock.instant()).thenReturn(Instant.parse("2026-12-01T12:00:00Z"))
        val session = json.readTree(mvc.perform(get("/v1/advent/session").cookie(cookie)).andExpect(status().isOk).andReturn().response.contentAsString)["sessionId"].asText()
        val issued = mvc.perform(get("/v1/advent/discovery").cookie(cookie).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.discovered").value(false)).andReturn()
        val attempt = json.readTree(issued.response.contentAsString)["attemptId"].asText()
        val body = """{"attemptId":"$attempt"}"""
        mvc.perform(post("/v1/advent/discovery").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", UUID.randomUUID().toString()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isConflict).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent/discovery").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", session).header("X-Advent-Simulated-Date", "2026-12-02").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
        mvc.perform(post("/v1/advent/discovery").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", session).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isNotFound)
        jdbc.update("UPDATE advent_member_discovery_attempts SET expires_at = ? WHERE attempt_id = ?", java.sql.Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), UUID.fromString(attempt))
        mvc.perform(post("/v1/advent/discovery").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", session).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isConflict)
        assert(jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_discovery_attempts WHERE attempt_id = ?", Int::class.java, UUID.fromString(attempt)) == 0)
        val renewed = mvc.perform(get("/v1/advent/discovery").cookie(cookie).header("X-Advent-Test-Session", session)).andExpect(status().isOk).andReturn()
        val renewedAttempt = json.readTree(renewed.response.contentAsString)["attemptId"].asText()
        val renewedBody = """{"attemptId":"$renewedAttempt"}"""
        mvc.perform(post("/v1/advent/discovery").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", session).contentType(MediaType.APPLICATION_JSON).content(renewedBody))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.days[0].day").value(1))
        mvc.perform(get("/v1/advent/discovery").cookie(cookie).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(jsonPath("$.discovered").value(true))
    }
    @Test fun `late mode and history projection remain private across authenticated members`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Troupe fictive', 'advent-security', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val alice = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "late-http-alice")
        val bob = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "late-http-bob")
        for (sub in listOf("late-http-alice", "late-http-bob")) {
            val user = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, sub)!!
            jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, user)
        }
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 12")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (12, 'Fictif', 'A', 'B', 'C', 1)")
        `when`(clock.instant()).thenReturn(Instant.parse("2026-12-13T12:00:00Z"))
        val token = json.readTree(mvc.perform(get("/v1/advent/session").cookie(alice)).andExpect(status().isOk).andReturn().response.contentAsString)["sessionId"].asText()
        val history = "/v1/advent/doors/12/history"
        val prefix = "/v1/advent/doors/12/answer"
        mvc.perform(get(history).cookie(alice).header("X-Advent-Test-Session", token))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.falseChoice").doesNotExist()).andExpect(jsonPath("$.result").doesNotExist())
        mvc.perform(post("$prefix/reconcile").cookie(alice).with(csrf()).header("X-Advent-Test-Session", token))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("closed"))
        val late = mvc.perform(post("$prefix/reconcile").cookie(alice).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"late":true}"""))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.status").value("available")).andReturn()
        val generation = json.readTree(late.response.contentAsString)["generation"].asText()
        val attempt = UUID.randomUUID()
        mvc.perform(post("$prefix/reserve").cookie(alice).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","generation":"$generation"}"""))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
        mvc.perform(post(prefix).cookie(bob).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","choice":1}"""))
            .andExpect(status().isOk).andExpect(jsonPath("$.status").value("stale"))
        mvc.perform(post(prefix).cookie(alice).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","choice":1}"""))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.late").value(true))
        mvc.perform(get("/v1/advent/doors/12/result").cookie(alice).header("X-Advent-Test-Session", token))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.late").value(true)).andExpect(jsonPath("$.responsePoints").value(0)).andExpect(jsonPath("$.participationPoints").value(0)).andExpect(jsonPath("$.bonusPoints").value(0))
        mvc.perform(get(history).cookie(bob).header("X-Advent-Test-Session", token))
            .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            .andExpect(jsonPath("$.falseChoice").doesNotExist()).andExpect(jsonPath("$.result").doesNotExist())
        mvc.perform(get("/v1/advent/doors/12/result").cookie(bob).header("X-Advent-Test-Session", token))
            .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
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
        mvc.perform(post("/v1/advent/doors/1/answer/replay").cookie(cookie).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"replayToken":"${UUID.randomUUID()}","close":true}"""))
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
            mvc.perform(get("/v1/advent/entry").cookie(member)).andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store")).andExpect(jsonPath("$.autoOpen").value(true)).andExpect(jsonPath("$.answer").doesNotExist()).andExpect(jsonPath("$.score").doesNotExist())
            mvc.perform(post("/v1/advent/entry/dismiss").cookie(member).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get("/v1/advent/entry").cookie(member)).andExpect(jsonPath("$.autoOpen").value(false))
            mvc.perform(get("/v1/advent/entry").cookie(first)).andExpect(jsonPath("$.autoOpen").value(true))
            val reconciliation = mvc.perform(post("/v1/advent/doors/1/answer/reconcile").cookie(member).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andReturn()
            val generation = json.readTree(reconciliation.response.contentAsString).get("generation").asText()
            val attempt = UUID.randomUUID()
            mvc.perform(post("/v1/advent/doors/1/answer/reserve").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","generation":"$generation"}""")).andExpect(status().isOk)
            mvc.perform(post("/v1/advent/doors/1/answer").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$attempt","choice":0}""")).andExpect(status().isOk)
            mvc.perform(get("/v1/advent/calendar").cookie(member).header("X-Advent-Test-Session", token))
                .andExpect(status().isOk).andExpect(header().string("Cache-Control", "private, no-store"))
                .andExpect(jsonPath("$.days[0].state").value("played")).andExpect(jsonPath("$.days[1].state").value("locked"))
            mvc.perform(get("/v1/advent/doors/2/history").cookie(member).header("X-Advent-Test-Session", token))
                .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            val memberBoard = mvc.perform(get("/v1/advent/ranking").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.ranking.score").value(0)).andReturn()
            val defaultBoard = mvc.perform(get("/v1/advent/ranking").cookie(first).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andReturn()
            assert(json.readTree(defaultBoard.response.contentAsString)["ranking"]["entries"].first { it["name"].asText() == "Fictif shared-member" }["score"].asInt() == 0)
            mvc.perform(get("/v1/advent/ranking").cookie(member).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/session/reset").cookie(second).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            val operatorBoard = mvc.perform(get("/v1/advent/ranking").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andReturn()
            val memberJson = json.readTree(memberBoard.response.contentAsString)
            val operatorJson = json.readTree(operatorBoard.response.contentAsString)
            assert(memberJson["ranking"]["entries"].first { it["mine"].asBoolean() }["score"].asInt() == 0)
            assert(operatorJson["ranking"]["entries"].first { it["name"].asText() == "Fictif shared-member" }["score"].asInt() == 11)
            assert(!memberBoard.response.contentAsString.contains("correct"))
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 2, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 2)")
            mvc.perform(post("/v1/advent/doors/2/answer/reconcile").cookie(first).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/2").cookie(first).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/2").cookie(member).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/2").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk)
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 3, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 3)")
            mvc.perform(get("/v1/advent/doors/3").cookie(first).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/3").cookie(member).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            val future = mvc.perform(post("/v1/advent/doors/3/answer/reconcile").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available")).andReturn()
            val futureGeneration = json.readTree(future.response.contentAsString)["generation"].asText()
            val futureAttempt = UUID.randomUUID()
            val futureBody = """{"attemptId":"$futureAttempt","generation":"$futureGeneration"}"""
            mvc.perform(post("/v1/advent/doors/3/answer/reserve").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(futureBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/answer/reserve").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(futureBody)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            val confirmBody = """{"attemptId":"$futureAttempt","choice":0}"""
            mvc.perform(post("/v1/advent/doors/3/answer").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content(confirmBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/answer").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(confirmBody)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
            mvc.perform(get("/v1/advent/doors/3/result").cookie(first).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/3/result").cookie(member).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/3/result").cookie(second).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            val futureResult = mvc.perform(get("/v1/advent/doors/3/result").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andExpect(jsonPath("$.correct").value(true)).andReturn()
            val answerId = json.readTree(futureResult.response.contentAsString)["answerId"].asText()
            val acknowledgeBody = """{"answerId":"$answerId"}"""
            val replayBody = """{"replayToken":"$answerId"}"""
            mvc.perform(post("/v1/advent/doors/3/result/acknowledge").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content(acknowledgeBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/result/acknowledge").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(acknowledgeBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/result/acknowledge").cookie(second).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(acknowledgeBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/result/acknowledge").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(acknowledgeBody)).andExpect(status().isOk)
            mvc.perform(get("/v1/advent/doors/3/result").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andExpect(jsonPath("$.seen").value(true))
            mvc.perform(post("/v1/advent/doors/3/answer/replay").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).contentType(MediaType.APPLICATION_JSON).content(replayBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/answer/replay").cookie(member).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(replayBody)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/doors/3/answer/replay").cookie(second).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(replayBody)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            mvc.perform(get("/v1/advent/doors/3/result").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andExpect(jsonPath("$.seen").value(true))
            mvc.perform(post("/v1/advent/doors/3/answer/replay").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content(replayBody)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            val replayGeneration = mvc.perform(post("/v1/advent/doors/3/answer/reconcile").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available")).andReturn()
            val nextGeneration = json.readTree(replayGeneration.response.contentAsString)["generation"].asText()
            val nextAttempt = UUID.randomUUID()
            mvc.perform(post("/v1/advent/doors/3/answer/reserve").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$nextAttempt","generation":"$nextGeneration"}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            mvc.perform(post("/v1/advent/doors/3/answer").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$nextAttempt","choice":1}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
            mvc.perform(get("/v1/advent/doors/3/result").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk).andExpect(jsonPath("$.correct").value(false)).andExpect(jsonPath("$.seen").value(false))
            val simulated = "2026-12-02"
            val simulatedReconcile = mvc.perform(post("/v1/advent/doors/2/answer/reconcile").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", simulated)).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available")).andReturn()
            val simulatedGeneration = json.readTree(simulatedReconcile.response.contentAsString).get("generation").asText()
            val simulatedAttempt = UUID.randomUUID()
            mvc.perform(post("/v1/advent/doors/2/answer/reserve").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", simulated).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$simulatedAttempt","generation":"$simulatedGeneration"}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("available"))
            mvc.perform(post("/v1/advent/doors/2/answer").cookie(first).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", simulated).contentType(MediaType.APPLICATION_JSON).content("""{"attemptId":"$simulatedAttempt","choice":0}""")).andExpect(status().isOk).andExpect(jsonPath("$.status").value("recorded"))
            mvc.perform(get("/v1/advent/doors/2/answer").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            mvc.perform(get("/v1/advent/ranking").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.ranking.score").value(0))
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", "2026-12-02")).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-02"))
            mvc.perform(get("/v1/advent/clock").cookie(second).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-01"))
            mvc.perform(get("/v1/advent/clock").cookie(member).header("X-Advent-Test-Session", token)).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-01"))
            mvc.perform(get("/v1/advent/clock").cookie(second).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", "2026-12-03")).andExpect(status().isOk).andExpect(jsonPath("$.date").value("2026-12-03"))
            mvc.perform(get("/v1/advent/clock").cookie(member).header("X-Advent-Test-Session", token).header("X-Advent-Simulated-Date", "2026-12-02")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", "2027-01-16")).andExpect(status().isBadRequest)
            mvc.perform(post("/v1/advent/clock/next-day").cookie(first).with(csrf()).header("X-Advent-Test-Session", token)).andExpect(status().isNotFound)
            `when`(clock.isolatedControlsAllowed()).thenReturn(false)
            mvc.perform(get("/v1/advent/ranking").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/doors/2").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isNotFound)
            mvc.perform(get("/v1/advent/clock").cookie(first).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true").header("X-Advent-Simulated-Date", "2026-12-02"))
                .andExpect(status().isNotFound).andExpect(header().string("Cache-Control", "private, no-store"))
            `when`(clock.isolatedControlsAllowed()).thenReturn(true)
            assert(jdbc.queryForObject("SELECT test_offset_seconds FROM advent_member_lock WHERE id = 1", Long::class.java) == 456L)
            mvc.perform(post("/v1/advent/session/reset").cookie(second).with(csrf()).header("X-Advent-Test-Session", token).header("X-Advent-Test-Mode", "true")).andExpect(status().isOk)
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
