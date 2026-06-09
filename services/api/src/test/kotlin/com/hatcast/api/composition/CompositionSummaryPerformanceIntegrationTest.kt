package com.hatcast.api.composition

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.config.jdbc.JdbcRequestMetricsFilter
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import kotlin.math.ceil

/**
 * NFR-P2 / PERF-15: composition + availability summary hot paths on Improbots seed (H2).
 * Gate: X-Hatcast-Sql-Count ≤ 10, X-Hatcast-Sql-Total-Ms ≤ 500, p95 wall ≤ 500 ms.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("perf")
@TestPropertySource(
    properties = [
        "hatcast.jdbc.metrics-enabled=true",
        "hatcast.jdbc.query-log-enabled=false",
    ],
)
class CompositionSummaryPerformanceIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val matchEventId: UUID = UUID.fromString("c0000002-0000-4000-8000-000000000002")
    private val publishedCompositionEventId: UUID = UUID.fromString("c0000005-0000-4000-8000-000000000005")
    private val mapper = ObjectMapper()

    @Test
    fun `GET availability summary p95 is at most 500ms over 10 sequential requests on seed match event`() {
        val cookie = improbotsCookie()
        warmupSummary(cookie)

        val durationsMs =
            (1..10).map {
                val startedAt = System.nanoTime()
                mockMvc
                    .perform(
                        get(
                            "/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary",
                        ).cookie(cookie),
                    ).andExpect(status().isOk)
                (System.nanoTime() - startedAt) / 1_000_000
            }

        val p95Ms = percentile95(durationsMs)
        assertTrue(
            p95Ms <= 500,
            "Expected summary p95 ≤ 500 ms, got p95=$p95Ms ms (samples=$durationsMs)",
        )
    }

    @Test
    fun `GET composition p95 is at most 500ms over 10 sequential requests on seed cabaret event`() {
        val cookie = improbotsCookie()
        warmupComposition(cookie)

        val durationsMs =
            (1..10).map {
                val startedAt = System.nanoTime()
                mockMvc
                    .perform(
                        get("/v1/seasons/$seedSeasonId/events/$publishedCompositionEventId/composition")
                            .cookie(cookie),
                    ).andExpect(status().isOk)
                (System.nanoTime() - startedAt) / 1_000_000
            }

        val p95Ms = percentile95(durationsMs)
        assertTrue(
            p95Ms <= 500,
            "Expected composition p95 ≤ 500 ms, got p95=$p95Ms ms (samples=$durationsMs)",
        )
    }

    @Test
    fun `GET availability summary JDBC metrics within hot path budget on seed match event`() {
        val cookie = improbotsCookie()
        val metrics = jdbcMetricsForSummary(cookie)
        assertTrue(
            metrics.sqlCount in 1..10,
            "Expected summary Sql-Count ≤ 10, got ${metrics.sqlCount}",
        )
        assertTrue(
            metrics.sqlTotalMs <= 500,
            "Expected summary Sql-Total-Ms ≤ 500, got ${metrics.sqlTotalMs}",
        )
    }

    @Test
    fun `GET composition JDBC metrics within hot path budget on seed cabaret event`() {
        val cookie = improbotsCookie()
        val metrics = jdbcMetricsForComposition(cookie)
        assertTrue(
            metrics.sqlCount in 1..10,
            "Expected composition Sql-Count ≤ 10, got ${metrics.sqlCount}",
        )
        assertTrue(
            metrics.sqlTotalMs <= 500,
            "Expected composition Sql-Total-Ms ≤ 500, got ${metrics.sqlTotalMs}",
        )
    }

    private data class JdbcMetrics(
        val sqlCount: Int,
        val sqlTotalMs: Long,
    )

    private fun jdbcMetricsForSummary(cookie: jakarta.servlet.http.Cookie): JdbcMetrics {
        val result =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_COUNT))
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS))
                .andReturn()
        return readJdbcMetrics(result)
    }

    private fun jdbcMetricsForComposition(cookie: jakarta.servlet.http.Cookie): JdbcMetrics {
        val result =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/events/$publishedCompositionEventId/composition")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_COUNT))
                .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS))
                .andReturn()
        return readJdbcMetrics(result)
    }

    private fun readJdbcMetrics(result: org.springframework.test.web.servlet.MvcResult): JdbcMetrics {
        val sqlCount =
            result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_COUNT)?.toIntOrNull() ?: 0
        val sqlTotalMs =
            result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS)?.toLongOrNull() ?: 0L
        return JdbcMetrics(sqlCount, sqlTotalMs)
    }

    private fun improbotsCookie() =
        TestAuthSupport.sessionCookieFromGoogleSignIn(
            mockMvc = mockMvc,
            googleIdTokenService = googleIdTokenService,
            googleSub = "seed-improbots-01",
            email = "angie@seed.improbots.test",
            name = "Angie",
        )

    private fun warmupSummary(cookie: jakarta.servlet.http.Cookie) {
        val body =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andReturn()
                .response
                .contentAsString
        val participantCount = mapper.readTree(body).path("participants").size()
        assertTrue(
            participantCount >= 10,
            "Expected Improbots-like summary pool (≥10 participants), got $participantCount",
        )
    }

    private fun warmupComposition(cookie: jakarta.servlet.http.Cookie) {
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$publishedCompositionEventId/composition")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect { result ->
                assertTrue(result.response.status == 200, "Expected composition 200, got ${result.response.status}")
            }
    }

    private fun percentile95(samplesMs: List<Long>): Long {
        val sorted = samplesMs.sorted()
        val index = ceil(sorted.size * 0.95).toInt() - 1
        return sorted[index.coerceIn(0, sorted.lastIndex)]
    }
}
