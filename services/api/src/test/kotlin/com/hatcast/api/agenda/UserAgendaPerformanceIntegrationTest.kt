package com.hatcast.api.agenda

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import kotlin.math.ceil

/**
 * NFR-P2 / PERF-11: GET /me/agenda p95 ≤ 500 ms on Improbots-like seed (H2 + seed troupe).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("perf")
class UserAgendaPerformanceIntegrationTest {
  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var googleIdTokenService: GoogleIdTokenService

  @Autowired
  private lateinit var seasonRepository: SeasonRepository

  @Autowired
  private lateinit var seasonParticipantRepository: SeasonParticipantRepository

  @Autowired
  private lateinit var userRepository: UserRepository

  private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
  private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
  private val mapper = ObjectMapper()

  @Test
  fun `GET me agenda p95 is at most 500ms over 10 sequential requests on seed troupe`() {
    val email = "agenda-perf-improbots@example.com"
    val cookie =
      TestAuthSupport.memberSessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = "agenda-perf-improbots",
        email = email,
        name = "Agenda Perf",
        seedTroupeId = seedTroupeId,
      )
    linkSeedSeasonParticipant(email)

    val warmupBody =
      mockMvc
        .perform(get("/v1/me/agenda").cookie(cookie))
        .andExpect(status().isOk)
        .andReturn()
        .response
        .contentAsString
    val eventCount = mapper.readTree(warmupBody).path("content").size()
    assertTrue(
      eventCount >= 20,
      "Expected Improbots-like seed agenda (≥20 upcoming events), got content.length=$eventCount",
    )

    val durationsMs =
      (1..10).map {
        val startedAt = System.nanoTime()
        mockMvc
          .perform(get("/v1/me/agenda").cookie(cookie))
          .andExpect(status().isOk)
        (System.nanoTime() - startedAt) / 1_000_000
      }

    val p95Ms = percentile95(durationsMs)
    assertTrue(
      p95Ms <= 500,
      "Expected agenda p95 ≤ 500 ms, got p95=$p95Ms ms (samples=$durationsMs)",
    )
  }

  private fun linkSeedSeasonParticipant(email: String) {
    val user =
      userRepository.findFirstByEmailIgnoreCase(email)
        ?: error("Missing perf test user for $email")
    val season =
      seasonRepository.findById(seedSeasonId).orElse(null)
        ?: error("Missing seed season $seedSeasonId")
    seasonParticipantRepository.save(
      SeasonParticipantEntity(
        season = season,
        displayName = user.displayName ?: "Agenda Perf",
        normalizedEmail = email.lowercase(),
        user = user,
        status = ParticipantStatus.ACTIVE,
      ),
    )
  }

  private fun percentile95(samplesMs: List<Long>): Long {
    val sorted = samplesMs.sorted()
    val index = ceil(sorted.size * 0.95).toInt() - 1
    return sorted[index.coerceIn(0, sorted.lastIndex)]
  }
}
