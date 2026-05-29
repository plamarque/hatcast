package com.hatcast.api.migration

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.config.MigrationApiKeyService
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = [
        "hatcast.migration.api-enabled=true",
        "hatcast.migration.api-key=test-migration-key-secret",
        "hatcast.migration.operator-email=angie@seed.improbots.test",
    ],
)
class MigrationApiKeyIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Test
    fun `migration key creates troupe without session or csrf`() {
        mockMvc
            .perform(
                post("/v1/troupes")
                    .header(MigrationApiKeyService.HEADER_NAME, "test-migration-key-secret")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Migration CLI Troupe"}"""),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Migration CLI Troupe"))
            .andExpect(jsonPath("$.membership.baselineRole").value("TROUPE_ADMIN"))
    }

    @Test
    fun `invalid migration key returns unauthorized`() {
        mockMvc
            .perform(
                post("/v1/troupes")
                    .header(MigrationApiKeyService.HEADER_NAME, "wrong-key")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Should Fail"}"""),
            ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST troupe without auth returns forbidden when migration key absent`() {
        mockMvc
            .perform(
                post("/v1/troupes")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"No Auth"}"""),
            ).andExpect(status().isForbidden)
    }
}

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = [
        "hatcast.migration.api-enabled=true",
        "hatcast.migration.api-key=test-migration-key-secret",
        "hatcast.migration.operator-email=migration-cli-operator@hatcast.test",
    ],
)
class MigrationApiKeyAutoProvisionIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Test
    fun `migration key provisions operator stub when user missing`() {
        mockMvc
            .perform(
                post("/v1/troupes")
                    .header(MigrationApiKeyService.HEADER_NAME, "test-migration-key-secret")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Empty DB Operator Troupe"}"""),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.name").value("Empty DB Operator Troupe"))
    }
}

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MigrationApiKeyDisabledIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Test
    fun `migration key ignored when feature disabled`() {
        mockMvc
            .perform(
                post("/v1/troupes")
                    .header(MigrationApiKeyService.HEADER_NAME, "test-migration-key-secret")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Disabled Feature"}"""),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `session auth still works when migration disabled`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-migration-disabled",
            )
        mockMvc
            .perform(
                post("/v1/troupes")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Session Auth Troupe"}"""),
            ).andExpect(status().isCreated)
    }
}
