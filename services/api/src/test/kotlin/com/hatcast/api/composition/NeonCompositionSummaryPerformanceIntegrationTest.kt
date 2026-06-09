package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.config.jdbc.JdbcRequestMetricsFilter
import com.hatcast.api.support.TestAuthSupport
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
import kotlin.math.ceil

/**
 * PERF-15 / PERF-16 gate against Neon dev (manual CI).
 * Run: HATCAST_NEON_PERF_TEST=true ./gradlew test --tests NeonCompositionSummaryPerformanceIntegrationTest
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Tag("neon-perf")
@EnabledIfEnvironmentVariable(named = "HATCAST_NEON_PERF_TEST", matches = "true")
class NeonCompositionSummaryPerformanceIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val matchEventId: UUID = UUID.fromString("c0000002-0000-4000-8000-000000000002")
    private val publishedCompositionEventId: UUID = UUID.fromString("c0000005-0000-4000-8000-000000000005")

    @Test
    fun `GET availability summary JDBC metrics within hot path budget on Neon`() {
        val cookie = improbotsCookie()
        val result =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_COUNT))
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS))
                .andReturn()

        val sqlCount =
            result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_COUNT)?.toIntOrNull() ?: 0
        val sqlTotalMs =
            result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS)?.toLongOrNull() ?: 0L
        assertTrue(sqlCount <= 10, "Expected summary Sql-Count ≤ 10 on Neon, got $sqlCount")
        assertTrue(sqlTotalMs <= 500, "Expected summary Sql-Total-Ms ≤ 500 on Neon, got $sqlTotalMs")
    }

    @Test
    fun `GET composition JDBC metrics within hot path budget on Neon`() {
        val cookie = improbotsCookie()
        val result =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/events/$publishedCompositionEventId/composition")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_COUNT))
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS))
                .andReturn()

        val sqlCount =
            result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_COUNT)?.toIntOrNull() ?: 0
        val sqlTotalMs =
            result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS)?.toLongOrNull() ?: 0L
        assertTrue(sqlCount <= 10, "Expected composition Sql-Count ≤ 10 on Neon, got $sqlCount")
        assertTrue(sqlTotalMs <= 500, "Expected composition Sql-Total-Ms ≤ 500 on Neon, got $sqlTotalMs")
    }

    @Test
    fun `GET availability summary and composition p95 at most 500ms over 10 requests on Neon`() {
        val cookie = improbotsCookie()
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary")
                    .cookie(cookie),
            ).andExpect(status().isOk)
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$publishedCompositionEventId/composition")
                    .cookie(cookie),
            ).andExpect(status().isOk)

        val summaryP95 =
            percentile95(
                (1..10).map {
                    val startedAt = System.nanoTime()
                    mockMvc
                        .perform(
                            get("/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary")
                                .cookie(cookie),
                        ).andExpect(status().isOk)
                    (System.nanoTime() - startedAt) / 1_000_000
                },
            )
        val compositionP95 =
            percentile95(
                (1..10).map {
                    val startedAt = System.nanoTime()
                    mockMvc
                        .perform(
                            get("/v1/seasons/$seedSeasonId/events/$publishedCompositionEventId/composition")
                                .cookie(cookie),
                        ).andExpect(status().isOk)
                    (System.nanoTime() - startedAt) / 1_000_000
                },
            )

        assertTrue(summaryP95 <= 500, "Expected summary p95 ≤ 500 ms on Neon, got $summaryP95 ms")
        assertTrue(compositionP95 <= 500, "Expected composition p95 ≤ 500 ms on Neon, got $compositionP95 ms")
    }

    private fun improbotsCookie() =
        TestAuthSupport.sessionCookieFromGoogleSignIn(
            mockMvc = mockMvc,
            googleIdTokenService = googleIdTokenService,
            googleSub = "seed-improbots-01",
            email = "angie@seed.improbots.test",
            name = "Angie",
        )

    private fun percentile95(samplesMs: List<Long>): Long {
        val sorted = samplesMs.sorted()
        val index = ceil(sorted.size * 0.95).toInt() - 1
        return sorted[index.coerceIn(0, sorted.lastIndex)]
    }
}
