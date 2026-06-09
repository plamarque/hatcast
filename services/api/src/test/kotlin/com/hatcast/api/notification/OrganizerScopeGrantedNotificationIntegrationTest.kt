package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.organizer.OrganizerScopeGrantedEvent
import com.hatcast.api.organizer.OrganizerScopeKind
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.reset
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/** Story 8.4b CAP-3 — grant API publishes scope-granted notification once. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrganizerScopeGrantedNotificationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var scopeGrantedNotificationService: OrganizerScopeGrantedNotificationService

    @Autowired
    private lateinit var seasonOrganizerRepository: SeasonOrganizerRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        reset(scopeGrantedNotificationService)
    }

    @Test
    fun `grant season organizer invokes scope granted notification once`() {
        val admin = adminCookie("sub-scope-grant-hook-admin")
        memberCookie("sub-scope-grant-hook", "scope-grant-hook@example.com", "Scope Grant Hook")
        val targetUserId = userRepository.findByGoogleSub("sub-scope-grant-hook")!!.id
        val seasonId = createSeason(admin)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"scope-grant-hook@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        assertEquals(1, seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId).size)

        verify(scopeGrantedNotificationService, times(1)).notifyScopeGranted(
            OrganizerScopeGrantedEvent(
                userId = targetUserId,
                scopeKind = OrganizerScopeKind.SEASON,
                scopeId = seasonId,
                scopeName = "Scope grant notifications",
            ),
        )
    }

    @Test
    fun `idempotent season organizer grant does not invoke notification twice`() {
        val admin = adminCookie("sub-scope-grant-idem-admin")
        memberCookie("sub-scope-grant-idem", "scope-grant-idem@example.com", "Scope Grant Idem")
        val seasonId = createSeason(admin)

        val grant =
            post("/v1/seasons/$seasonId/organizers")
                .cookie(admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"scope-grant-idem@example.com"}""")
                .with(csrf())

        mockMvc.perform(grant).andExpect(status().isOk)
        mockMvc.perform(grant).andExpect(status().isOk)

        verify(scopeGrantedNotificationService, times(1)).notifyScopeGranted(any())
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie = memberCookie(googleSub, "$googleSub@example.com", "Scope Grant Admin")
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    private fun memberCookie(
        googleSub: String,
        email: String,
        name: String,
    ): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = email,
            name = name,
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Scope grant notifications"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }
}
