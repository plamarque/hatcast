package com.hatcast.api.agenda

import com.hatcast.api.config.jdbc.JdbcRequestMetricsFilter
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.auth.GoogleIdTokenService
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * PERF-16 / NFR-P2 gate against Neon (manual CI).
 * Run only when Neon-backed API credentials are available:
 *   HATCAST_NEON_PERF_TEST=true ./gradlew test --tests NeonAgendaPerformanceIntegrationTest
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Tag("neon-perf")
@EnabledIfEnvironmentVariable(named = "HATCAST_NEON_PERF_TEST", matches = "true")
class NeonAgendaPerformanceIntegrationTest {
  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var googleIdTokenService: GoogleIdTokenService

  private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

  @Test
  fun `GET me agenda exposes JDBC metrics headers on hot path`() {
    val cookie =
      TestAuthSupport.memberSessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = "neon-perf-agenda",
        email = "neon-perf@seed.improbots.test",
        name = "Neon Perf",
        seedTroupeId = seedTroupeId,
      )

    mockMvc
      .perform(get("/v1/me/agenda").cookie(cookie))
      .andExpect(status().isOk)
      .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_COUNT))
      .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS))
      .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_HTTP_TOTAL_MS))
  }

  @Test
  fun `GET me agenda p95 is at most 500ms over 10 sequential requests`() {
    val cookie =
      TestAuthSupport.memberSessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = "neon-perf-agenda-p95",
        email = "neon-perf-p95@seed.improbots.test",
        name = "Neon Perf P95",
        seedTroupeId = seedTroupeId,
      )

    mockMvc.perform(get("/v1/me/agenda").cookie(cookie)).andExpect(status().isOk)

    val durationsMs =
      (1..10).map {
        val startedAt = System.nanoTime()
        mockMvc
          .perform(get("/v1/me/agenda").cookie(cookie))
          .andExpect(status().isOk)
        (System.nanoTime() - startedAt) / 1_000_000
      }

    val sorted = durationsMs.sorted()
    val index = kotlin.math.ceil(sorted.size * 0.95).toInt() - 1
    val p95Ms = sorted[index.coerceIn(0, sorted.lastIndex)]
    assertTrue(
      p95Ms <= 500,
      "Expected agenda p95 ≤ 500 ms on Neon-like profile, got p95=$p95Ms ms (samples=$durationsMs)",
    )
  }
}
