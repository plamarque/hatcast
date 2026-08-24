package com.hatcast.api.auth

import org.junit.jupiter.api.Order
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.session.jdbc.JdbcIndexedSessionRepository
import org.springframework.session.SessionRepository
import org.springframework.session.Session
import java.time.Instant
import java.util.Base64
import org.junit.jupiter.api.Assertions.assertEquals

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Order(1)
class AuthControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var sessionRepository: JdbcIndexedSessionRepository

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
        assertEquals(2592000, cookie.maxAge)
        assertEquals(2592000, serverIntervalSeconds(cookie))
        org.junit.jupiter.api.Assertions.assertTrue(cookie.isHttpOnly)
        org.junit.jupiter.api.Assertions.assertTrue(
            result.response.getHeaders("Set-Cookie").any {
                it.contains("HATCAST_SESSION=") && it.contains("SameSite=lax", ignoreCase = true)
            },
        )
        mockMvc
            .perform(get("/v1/auth/me").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.user.email").value("user@example.com"))
            .andExpect(cookie().exists("XSRF-TOKEN"))
            .andExpect(cookie().httpOnly("XSRF-TOKEN", false))
    }

    @Test
    fun `POST google with rememberMe false returns 200`() {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", "google-sub-test-remember-false")
                .claim("email", "short@example.com")
                .claim("name", "Short Session")
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
                    .content("""{"idToken":"fake-jwt","rememberMe":false}"""),
            ).andExpect(status().isOk)
                .andReturn()

        val cookie = result.response.getCookie("HATCAST_SESSION")
        requireNotNull(cookie) { "session cookie expected" }
        assertEquals(-1, cookie.maxAge)
        assertEquals(1800, serverIntervalSeconds(cookie))
    }

    @Test
    fun `POST google rotates an existing session and reissues a remembered cookie`() {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", "google-sub-test-session-rotation")
                .claim("email", "rotation@example.com")
                .claim("name", "Session Rotation")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)

        val existingCookie =
            mockMvc
                .perform(
                    post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake-jwt","rememberMe":false}"""),
                ).andExpect(status().isOk)
                .andReturn()
                .response
                .getCookie("HATCAST_SESSION")
        requireNotNull(existingCookie) { "initial session cookie expected" }

        val result =
            mockMvc
                .perform(
                    post("/v1/auth/google")
                        .cookie(existingCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake-jwt","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()

        val rememberedCookie = result.response.getCookie("HATCAST_SESSION")
        requireNotNull(rememberedCookie) { "rotated session cookie expected" }
        assertEquals(2592000, rememberedCookie.maxAge)
        org.junit.jupiter.api.Assertions.assertNotEquals(existingCookie.value, rememberedCookie.value)
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
    fun `POST logout invalidates session so GET me returns 401`() {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", "google-sub-test-logout")
                .claim("email", "logout@example.com")
                .claim("name", "Logout User")
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
                .andReturn()

        val cookie = result.response.getCookie("HATCAST_SESSION")
        requireNotNull(cookie) { "session cookie expected" }
        assertEquals(2592000, cookie.maxAge)
        org.junit.jupiter.api.Assertions.assertTrue(cookie.isHttpOnly)
        org.junit.jupiter.api.Assertions.assertTrue(
            result.response.getHeaders("Set-Cookie").any {
                it.contains("HATCAST_SESSION=") && it.contains("SameSite=lax", ignoreCase = true)
            },
        )

        val logoutResult =
            mockMvc
            .perform(
                post("/v1/auth/logout").cookie(cookie),
            ).andExpect(status().isNoContent)
                .andReturn()
        assertEquals(0, logoutResult.response.getCookie("HATCAST_SESSION")?.maxAge)

        mockMvc
            .perform(
                get("/v1/auth/me").cookie(cookie),
            ).andExpect(status().isUnauthorized)
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
        assertEquals(2592000, cookie.maxAge)
        assertEquals(2592000, serverIntervalSeconds(cookie))

        mockMvc
            .perform(
                get("/v1/auth/me").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.email").value("idp@example.com"))
    }

    @Test
    fun `POST idp with rememberMe false returns 200`() {
        whenever(idpIdTokenVerifier.verify(any())).thenReturn(
            IdpTokenPayload(
                uid = "firebase-uid-test-short",
                email = "short-idp@example.com",
                displayName = "Short",
            ),
        )

        val result =
            mockMvc
                .perform(
                post("/v1/auth/idp")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"fake-idp-token","rememberMe":false}"""),
                ).andExpect(status().isOk)
                .andReturn()

        val cookie = result.response.getCookie("HATCAST_SESSION")
        requireNotNull(cookie) { "session cookie expected" }
        assertEquals(-1, cookie.maxAge)
        assertEquals(1800, serverIntervalSeconds(cookie))
    }

    @Test
    fun `POST google links pre-provisioned migration user by email`() {
        userRepository.save(
            UserEntity(
                email = "migrated@example.com",
                displayName = "Stub User",
                slug = "stub-user",
            ),
        )

        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", "google-sub-migrated-1")
                .claim("email", "migrated@example.com")
                .claim("name", "Google Display")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)

        mockMvc
            .perform(
                post("/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"fake-jwt"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.email").value("migrated@example.com"))

        val linked = userRepository.findByGoogleSub("google-sub-migrated-1")
        requireNotNull(linked)
        org.junit.jupiter.api.Assertions.assertEquals("migrated@example.com", linked.email)
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

    @Test
    fun `POST idp twice with same uid is idempotent`() {
        val uid = "firebase-uid-idempotent-test"
        whenever(idpIdTokenVerifier.verify(any())).thenReturn(
            IdpTokenPayload(
                uid = uid,
                email = "idempotent@example.com",
                displayName = "Idempotent User",
            ),
        )

        val first =
            mockMvc
                .perform(
                    post("/v1/auth/idp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake-idp-token"}"""),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.user.email").value("idempotent@example.com"))
                .andReturn()

        val firstUserId =
            com.jayway.jsonpath.JsonPath.read<String>(
                first.response.contentAsString,
                "$.user.id",
            )

        mockMvc
            .perform(
                post("/v1/auth/idp")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"fake-idp-token"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.user.id").value(firstUserId))
            .andExpect(jsonPath("$.user.email").value("idempotent@example.com"))

        val linked = userRepository.findByIdpUid(uid)
        requireNotNull(linked) { "user row expected for idp_uid" }
        org.junit.jupiter.api.Assertions.assertEquals(firstUserId, linked.id.toString())
    }

    private fun serverIntervalSeconds(cookie: jakarta.servlet.http.Cookie): Long {
        val sessionId = String(Base64.getDecoder().decode(cookie.value))
        @Suppress("UNCHECKED_CAST")
        val repository = sessionRepository as SessionRepository<Session>
        return repository.findById(sessionId)!!.maxInactiveInterval.seconds
    }
}
