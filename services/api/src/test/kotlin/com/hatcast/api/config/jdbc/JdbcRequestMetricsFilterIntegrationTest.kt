package com.hatcast.api.config.jdbc

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Assertions.assertTrue
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
  properties = [
    "hatcast.jdbc.metrics-enabled=true",
    "hatcast.jdbc.query-log-enabled=false",
  ],
)
class JdbcRequestMetricsFilterIntegrationTest {
  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var googleIdTokenService: GoogleIdTokenService

  private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

  @Test
  fun `GET me agenda returns JDBC metric response headers when proxy enabled`() {
    val cookie =
      TestAuthSupport.memberSessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = "jdbc-metrics-test",
        email = "jdbc-metrics@example.com",
        name = "Jdbc Metrics",
        seedTroupeId = seedTroupeId,
      )

    val result =
      mockMvc
        .perform(get("/v1/me/agenda").cookie(cookie))
        .andExpect(status().isOk)
        .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_COUNT))
        .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_SQL_TOTAL_MS))
        .andExpect(header().exists(JdbcRequestMetricsFilter.HEADER_HTTP_TOTAL_MS))
        .andReturn()

    val sqlCount =
      result.response.getHeader(JdbcRequestMetricsFilter.HEADER_SQL_COUNT)?.toIntOrNull() ?: 0
    assertTrue(sqlCount > 0, "Expected at least one JDBC statement on GET /v1/me/agenda, got $sqlCount")
  }
}
