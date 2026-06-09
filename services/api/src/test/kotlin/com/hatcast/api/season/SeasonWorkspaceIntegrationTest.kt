package com.hatcast.api.season

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeasonWorkspaceIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val aperockSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000002")

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub)
        promoteSeedMemberToAdmin(googleSub)
        return cookie
    }

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    @Test
    fun `GET workspace view agenda aggregates permissions selectors categories and upcoming events`() {
        val cookie = memberCookie("sub-season-workspace-1")

        mockMvc
            .perform(
                get("/v1/seasons/$aperockSeasonId/workspace")
                    .param("view", "agenda")
                    .param("eventPage", "0")
                    .param("eventSize", "50")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.permissions.isTroupeAdmin").value(true))
            .andExpect(jsonPath("$.participantSelectors").isArray)
            .andExpect(jsonPath("$.categories").isArray)
            .andExpect(jsonPath("$.categories[0].slug").exists())
            .andExpect(jsonPath("$.categories[0].label").exists())
            .andExpect(jsonPath("$.upcomingEvents.content").isArray)
            .andExpect(jsonPath("$.upcomingEvents.page").value(0))
            .andExpect(jsonPath("$.upcomingEvents.size").value(50))
    }

    @Test
    fun `GET workspace rejects unknown view`() {
        val cookie = memberCookie("sub-season-workspace-2")

        mockMvc
            .perform(
                get("/v1/seasons/$aperockSeasonId/workspace")
                    .param("view", "stats")
                    .cookie(cookie),
            ).andExpect(status().isBadRequest)
    }
}
