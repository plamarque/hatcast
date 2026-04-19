package com.hatcast.api.auth

import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.BadJwtException
import org.springframework.test.context.ActiveProfiles
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Test
    fun `POST google returns user and sets session cookie`() {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", "google-sub-test-1")
                .claim("email", "user@example.com")
                .claim("name", "Test User")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)

        val result =
            mockMvc
                .perform(
                    post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake-jwt"}"""),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.user.email").value("user@example.com"))
                .andReturn()

        val cookie = result.response.getCookie("HATCAST_SESSION")
        requireNotNull(cookie) { "session cookie expected" }

        mockMvc
            .perform(
                get("/v1/auth/me").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.email").value("user@example.com"))
    }

    @Test
    fun `POST google returns 401 when token invalid`() {
        whenever(googleIdTokenService.validateAndParse(any())).thenThrow(
            BadJwtException("invalid"),
        )

        mockMvc
            .perform(
                post("/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"bad"}"""),
            ).andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.code").value("AUTH_INVALID_ID_TOKEN"))
    }

    @Test
    fun `GET me without session returns 401`() {
        mockMvc.perform(get("/v1/auth/me")).andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST idp returns user and sets session cookie`() {
        whenever(idpIdTokenVerifier.verify(any())).thenReturn(
            IdpTokenPayload(
                uid = "firebase-uid-test-1",
                email = "idp@example.com",
                displayName = "Idp User",
            ),
        )

        val result =
            mockMvc
                .perform(
                    post("/v1/auth/idp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake-idp-token"}"""),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.user.email").value("idp@example.com"))
                .andReturn()

        val cookie = result.response.getCookie("HATCAST_SESSION")
        requireNotNull(cookie) { "session cookie expected" }

        mockMvc
            .perform(
                get("/v1/auth/me").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.email").value("idp@example.com"))
    }

    @Test
    fun `POST idp returns 401 when token invalid`() {
        whenever(idpIdTokenVerifier.verify(any())).thenThrow(
            RuntimeException("invalid token"),
        )

        mockMvc
            .perform(
                post("/v1/auth/idp")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"bad"}"""),
            ).andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.code").value("AUTH_INVALID_ID_TOKEN"))
    }
}
