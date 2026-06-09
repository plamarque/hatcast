package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeCategoryIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var troupeCategoryRepository: TroupeCategoryRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Category Test",
            )
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Category Member",
            )
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.MEMBER
        membershipRepository.save(membership)
        return cookie
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{ "title": "Saison categories" }""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    @Test
    fun `list includes default principal category first`() {
        val cookie = adminCookie("sub-category-principal-1")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].slug").value("principal"))
            .andExpect(jsonPath("$[0].label").value("Spectacles ordinaires"))

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/categories/principal")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Spectacles classiques" }""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("principal"))
            .andExpect(jsonPath("$.label").value("Spectacles classiques"))

        val troupe = troupeRepository.findById(seedTroupeId).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals("Spectacles classiques", troupe.defaultCategoryLabel)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories/principal/delete-preview").cookie(cookie))
            .andExpect(status().isBadRequest)

        mockMvc
            .perform(delete("/v1/troupes/$seedTroupeId/categories/principal").cookie(cookie).with(csrf()))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `list lazily seeds deplacements and sorts by label`() {
        val cookie = adminCookie("sub-category-list-1")
        troupeCategoryRepository
            .findByTroupe_IdAndSlug(seedTroupeId, TroupeCategoryService.DEPLACEMENTS_SLUG)
            ?.let { troupeCategoryRepository.delete(it) }

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug == 'deplacements')].label").value("Déplacements"))

        assertTrue(
            troupeCategoryRepository.existsByTroupe_IdAndSlug(
                seedTroupeId,
                TroupeCategoryService.DEPLACEMENTS_SLUG,
            ),
        )

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug == 'deplacements')].label").value("Déplacements"))
    }

    @Test
    fun `admin crud duplicate reserved and permissions`() {
        val admin = adminCookie("sub-category-crud-1")
        val member = memberCookie("sub-category-crud-member")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/categories")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Apérock", "slug": "aperock-crud-it" }""")
                    .with(csrf()),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.slug").value("aperock-crud-it"))
            .andExpect(jsonPath("$.label").value("Apérock"))

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/categories")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Autre", "slug": "aperock-crud-it" }""")
                    .with(csrf()),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/categories")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Principal" }""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/categories/aperock-crud-it")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "${"x".repeat(129)}" }""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/categories/aperock-crud-it")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Apérock !" }""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("aperock-crud-it"))
            .andExpect(jsonPath("$.label").value("Apérock !"))

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/categories")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Interdit" }""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories/aperock-crud-it/delete-preview").cookie(member))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/categories/aperock-crud-it")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Interdit" }""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(delete("/v1/troupes/$seedTroupeId/categories/aperock-crud-it").cookie(member).with(csrf()))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `delete preview and cascade clears event category`() {
        val admin = adminCookie("sub-category-delete-1")
        val seasonId = createSeason(admin)
        val startsAt = Instant.parse("2031-06-01T20:00:00Z")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/categories")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Gala test", "slug": "gala-test" }""")
                    .with(csrf()),
            ).andExpect(status().isCreated)

        val createRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Spectacle gala",
                              "startsAt": "$startsAt",
                              "category": "gala-test"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.category").value("gala-test"))
                .andReturn()
        val eventId = mapper.readTree(createRes.response.contentAsString).get("id").asText()

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories/gala-test/delete-preview").cookie(admin))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eventCount").value(1))

        mockMvc
            .perform(delete("/v1/troupes/$seedTroupeId/categories/gala-test").cookie(admin).with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.affectedEventCount").value(1))

        assertFalse(troupeCategoryRepository.existsByTroupe_IdAndSlug(seedTroupeId, "gala-test"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(admin))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.category").value(org.hamcrest.Matchers.nullValue()))
    }

    @Test
    fun `event rejects unknown category without auto-create`() {
        val admin = adminCookie("sub-category-reject-1")
        val seasonId = createSeason(admin)
        val startsAt = Instant.parse("2031-07-01T20:00:00Z")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Catégorie fantôme",
                          "startsAt": "$startsAt",
                          "category": "Fantôme"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)

        val tags = troupeCategoryRepository.findByTroupe_IdOrderByLabelAsc(seedTroupeId)
        assertNull(tags.singleOrNull { it.slug == "fantome" })
        assertTrue(tags.zipWithNext().all { (a, b) -> a.label <= b.label })
    }

    @Test
    fun `non member forbidden on all category endpoints`() {
        val outsider =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-category-outsider",
            )

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories").cookie(outsider))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/categories")
                    .cookie(outsider)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Interdit" }""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/categories/any-slug")
                    .cookie(outsider)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Interdit" }""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/categories/any-slug/delete-preview").cookie(outsider))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(delete("/v1/troupes/$seedTroupeId/categories/any-slug").cookie(outsider).with(csrf()))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `patch and delete return 404 for unknown slug`() {
        val admin = adminCookie("sub-category-404-1")

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/categories/unknown-slug-404")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "label": "Nope" }""")
                    .with(csrf()),
            ).andExpect(status().isNotFound)

        mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/categories/unknown-slug-404/delete-preview")
                    .cookie(admin),
            ).andExpect(status().isNotFound)

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/categories/unknown-slug-404")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isNotFound)
    }

    @Test
    fun `event create with deplacements seeds without prior category list`() {
        val admin = adminCookie("sub-category-depl-seed-1")
        troupeCategoryRepository
            .findByTroupe_IdAndSlug(seedTroupeId, TroupeCategoryService.DEPLACEMENTS_SLUG)
            ?.let { troupeCategoryRepository.delete(it) }
        val seasonId = createSeason(admin)
        val startsAt = Instant.parse("2031-08-01T20:00:00Z")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Déplacement direct",
                          "startsAt": "$startsAt",
                          "category": "deplacements"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.category").value("deplacements"))

        assertTrue(
            troupeCategoryRepository.existsByTroupe_IdAndSlug(
                seedTroupeId,
                TroupeCategoryService.DEPLACEMENTS_SLUG,
            ),
        )
    }
}
