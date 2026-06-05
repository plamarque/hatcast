package com.hatcast.api.memberglance

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.MembershipParticipantSyncCache
import com.hatcast.api.participant.MembershipSyncScope
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertTrue
import java.time.Instant
import org.junit.jupiter.api.Tag
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
@Tag("FR55")
class MemberSeasonGlanceIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")

    @Test
    fun `GET season-glance returns 404 for unknown slug`() {
        val cookie = signInAndJoin("sub-glance-404", "glance-404@example.com", "Glance 404")

        mockMvc
            .perform(
                get("/v1/members/unknown-slug-xyz/season-glance")
                    .cookie(cookie)
                    .param("seasonId", seedSeasonId.toString()),
            ).andExpect(status().isNotFound)
    }

    @Test
    fun `GET season-glance returns profile for self with slug`() {
        val cookie = signInAndJoin("sub-glance-self", "glance-self@example.com", "Glance Self")
        val user = userRepository.findByGoogleSub("sub-glance-self")!!
        assertTrue(!user.slug.isNullOrBlank())

        mockMvc
            .perform(
                get("/v1/members/${user.slug}/season-glance")
                    .cookie(cookie)
                    .param("seasonId", seedSeasonId.toString()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.userSlug").value(user.slug))
            .andExpect(jsonPath("$.isSelf").value(true))
            .andExpect(jsonPath("$.resolvedSeasonId").value(seedSeasonId.toString()))
            .andExpect(jsonPath("$.filterBarVisible").isBoolean)
            .andExpect(jsonPath("$.gender").value("non_specified"))
    }

    @Test
    fun `GET season-glance omits avatarUrl when avatar bytes missing`() {
        val cookie = signInAndJoin("sub-glance-avatar-guard", "glance-avatar-guard@example.com", "Glance Avatar")
        val user = userRepository.findByGoogleSub("sub-glance-avatar-guard")!!
        user.avatarUpdatedAt = Instant.now()
        userRepository.save(user)

        mockMvc
            .perform(
                get("/v1/members/${user.slug}/season-glance")
                    .cookie(cookie)
                    .param("seasonId", seedSeasonId.toString()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.avatarUrl").isEmpty)
    }

    @Test
    fun `GET season-glance returns 403 for non member viewer`() {
        signInAndJoin("sub-glance-target-403", "glance-target-403@example.com", "Target")
        val target = userRepository.findByGoogleSub("sub-glance-target-403")!!
        val cookie = signIn("sub-glance-forbidden", "glance-forbidden@example.com", "Forbidden")

        mockMvc
            .perform(
                get("/v1/members/${target.slug}/season-glance")
                    .cookie(cookie)
                    .param("seasonId", seedSeasonId.toString()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `GET season-glance allows viewer in same troupe`() {
        val viewerCookie = signInAndJoin("sub-glance-viewer", "glance-viewer@example.com", "Viewer")
        val targetCookie = signInAndJoin("sub-glance-target", "glance-target@example.com", "Target")
        val target = userRepository.findByGoogleSub("sub-glance-target")!!

        mockMvc
            .perform(
                get("/v1/members/${target.slug}/season-glance")
                    .cookie(viewerCookie)
                    .param("seasonId", seedSeasonId.toString()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.isSelf").value(false))
            .andExpect(jsonPath("$.preferredRoleKeys").doesNotExist())

        assertTrue(targetCookie.name.isNotEmpty())
    }

    @Test
    fun `GET season-glance hides filter bar for single troupe and league participation`() {
        val cookie = signInAndJoin("sub-glance-filter-hidden", "glance-filter@example.com", "Filter Hidden")
        val user = userRepository.findByGoogleSub("sub-glance-filter-hidden")!!

        mockMvc
            .perform(
                get("/v1/members/${user.slug}/season-glance")
                    .cookie(cookie)
                    .param("seasonId", seedSeasonId.toString()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.filterBarVisible").value(false))
            .andExpect(jsonPath("$.participationFilters").doesNotExist())
            .andExpect(jsonPath("$.resolvedSeasonId").value(seedSeasonId.toString()))
            .andExpect(jsonPath("$.troupeId").value(seedTroupeId.toString()))
    }

    @Test
    fun `GET season-glance scopes response to requested seasonId`() {
        val cookie = signInAndJoin("sub-glance-league-scope", "glance-league@example.com", "League Scope")
        val user = userRepository.findByGoogleSub("sub-glance-league-scope")!!

        mockMvc
            .perform(
                get("/v1/members/${user.slug}/season-glance")
                    .cookie(cookie)
                    .param("troupeId", seedTroupeId.toString())
                    .param("seasonId", seedSeasonId.toString()),
            )            .andExpect(status().isOk)
            .andExpect(jsonPath("$.resolvedSeasonId").value(seedSeasonId.toString()))
    }

    @Test
    fun `GET season-glance returns empty stats shape when no dispos in scope`() {
        val cookie = signInAndJoin("sub-glance-empty-stats", "glance-empty@example.com", "Empty Stats")
        val user = userRepository.findByGoogleSub("sub-glance-empty-stats")!!
        val emptySeason =
            seasonRepository.save(
                SeasonEntity(
                    troupe = troupeRepository.findById(seedTroupeId).orElseThrow(),
                    slug = "glance-empty-${java.util.UUID.randomUUID()}",
                    title = "Empty glance season",
                ),
            )
        MembershipSyncScope.clear()
        MembershipParticipantSyncCache.invalidate(emptySeason.id)
        mockMvc
            .perform(
                get("/v1/seasons/${emptySeason.id}/participants/selectors")
                    .cookie(cookie),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/members/${user.slug}/season-glance")
                    .cookie(cookie)
                    .param("seasonId", emptySeason.id.toString()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.stats").doesNotExist())
            .andExpect(jsonPath("$.monthlyChart").isArray)
            .andExpect(jsonPath("$.monthlyChart.length()").value(0))
            .andExpect(jsonPath("$.favoriteRoleCounts.length()").value(0))
    }

    private fun signInAndJoin(
        googleSub: String,
        email: String,
        name: String,
    ) = signIn(googleSub, email, name).also { cookie ->
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        syncSeedSeasonParticipation(cookie)
    }

    private fun syncSeedSeasonParticipation(cookie: jakarta.servlet.http.Cookie) {
        MembershipSyncScope.clear()
        MembershipParticipantSyncCache.invalidate(seedSeasonId)
        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/participants/selectors")
                    .cookie(cookie),
            ).andExpect(status().isOk)
    }

    private fun signIn(
        googleSub: String,
        email: String,
        name: String,
    ) = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub, email, name)
}
