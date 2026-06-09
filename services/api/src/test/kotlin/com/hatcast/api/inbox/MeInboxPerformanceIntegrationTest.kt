package com.hatcast.api.inbox

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
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
 * NFR-P2 / PERF-06: inbox p95 ≤ 300 ms on minimal dev-like fixture (H2 + seed troupe).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("perf")
class MeInboxPerformanceIntegrationTest {
  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var googleIdTokenService: GoogleIdTokenService

  private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

  @Test
  fun `GET me inbox p95 is at most 300ms over 10 sequential requests with minimal data`() {
    val cookie =
      TestAuthSupport.memberSessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = "inbox-perf-minimal",
        email = "inbox-perf-minimal@example.com",
        name = "Inbox Perf",
        seedTroupeId = seedTroupeId,
      )

    mockMvc
      .perform(get("/v1/me/inbox").cookie(cookie))
      .andExpect(status().isOk)

    val durationsMs =
      (1..10).map {
        val startedAt = System.nanoTime()
        mockMvc
          .perform(get("/v1/me/inbox").cookie(cookie))
          .andExpect(status().isOk)
        (System.nanoTime() - startedAt) / 1_000_000
      }

    val p95Ms = percentile95(durationsMs)
    assertTrue(
      p95Ms <= 300,
      "Expected inbox p95 ≤ 300 ms, got p95=$p95Ms ms (samples=$durationsMs)",
    )
  }

  private fun percentile95(samplesMs: List<Long>): Long {
    val sorted = samplesMs.sorted()
    val index = ceil(sorted.size * 0.95).toInt() - 1
    return sorted[index.coerceIn(0, sorted.lastIndex)]
  }
}
