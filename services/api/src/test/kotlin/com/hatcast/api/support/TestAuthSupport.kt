package com.hatcast.api.support

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.SessionUserPrincipal
import jakarta.servlet.http.Cookie
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

object TestAuthSupport {
    fun testPrincipal(userId: UUID = UUID.randomUUID()): SessionUserPrincipal =
        SessionUserPrincipal(
            userId = userId,
            googleSub = "google-sub-${userId.toString().take(8)}",
            idpUid = null,
            email = "user-${userId.toString().take(8)}@example.com",
        )

    fun sessionCookieFromGoogleSignIn(
        mockMvc: MockMvc,
        googleIdTokenService: GoogleIdTokenService,
        googleSub: String,
        email: String = "$googleSub@example.com",
        name: String = "Season Test",
    ): Cookie {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", googleSub)
                .claim("email", email)
                .claim("name", name)
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
                        .content("""{"idToken":"fake","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()
        return result.response.getCookie("HATCAST_SESSION")!!
    }

    fun joinSeedTroupe(
        mockMvc: MockMvc,
        cookie: Cookie,
        seedTroupeId: UUID,
    ) {
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    fun memberSessionCookieFromGoogleSignIn(
        mockMvc: MockMvc,
        googleIdTokenService: GoogleIdTokenService,
        googleSub: String,
        email: String = "$googleSub@example.com",
        name: String = "Season Test",
        seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001"),
    ): Cookie {
        val cookie = sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub, email, name)
        joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        return cookie
    }
}
