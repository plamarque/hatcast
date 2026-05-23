package com.hatcast.api.season

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.junit.jupiter.api.Assertions.assertTrue
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import java.time.Instant
import java.util.UUID

/**
 * CSRF requis sur mutations ; session obtenue comme [com.hatcast.api.auth.AuthControllerIntegrationTest].
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeasonControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub)

    @Test
    fun ` seasons flow list create activate archive pagination`() {
        val cookie = memberCookie("sub-season-1")
        // GET /v1/troupes — uniquement les troupes où l'utilisateur est membre actif
        mockMvc
            .perform(
                get("/v1/troupes").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.[0].id").value(seedTroupeId.toString()))
            .andExpect(jsonPath("$.[0].slug").value("la-malice"))
            .andExpect(jsonPath("$.[0].membership.status").value("ACTIVE"))

        // list initiale : au moins la saison seed, éventuellement d'autres seeds/fixtures.
        val initialListRes =
            mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/seasons?page=0&size=10")
                    .cookie(cookie),
            ).andExpect(status().isOk)
                .andReturn()
        val initialTotal =
            com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(initialListRes.response.contentAsString)
                .get("totalElements")
                .asInt()

        // create
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Malice 2026-2027",
                              "description": "Saison test"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.slug").value("malice-2026-2027"))
                .andExpect(jsonPath("$.active").value(false))
                .andReturn()
        // extract id
        val body = createRes.response.contentAsString
        val id1 =
            com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(body)
                .get("id")
                .asText()
        val s1 = UUID.fromString(id1)

        // create second
        val id2Res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            { "title": "Malice 2025-2026" }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.slug").value("malice-2025-2026"))
                .andReturn()
        val id2Text =
            com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(id2Res.response.contentAsString)
                .get("id")
                .asText()
        val s2 = UUID.fromString(id2Text)

        // activate s2
        mockMvc
            .perform(
                post("/v1/seasons/$s2/actions/activate")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.active").value(true))

        // s1 not active
        mockMvc
            .perform(
                get("/v1/seasons/$s1")
                    .cookie(cookie),
            ).andExpect(jsonPath("$.active").value(false))

        // activate s1; s2 deactivates
        mockMvc
            .perform(
                post("/v1/seasons/$s1/actions/activate")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(jsonPath("$.active").value(true))
        mockMvc
            .perform(
                get("/v1/seasons/$s2")
                    .cookie(cookie),
            ).andExpect(jsonPath("$.active").value(false))

        // pagination: size 1 page 0 => one result
        mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/seasons?page=0&size=1")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.totalElements").value(initialTotal + 2))

        // archive s1
        mockMvc
            .perform(
                post("/v1/seasons/$s1/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(jsonPath("$.archived").value(true))
            .andExpect(jsonPath("$.active").value(false))
    }

    @Test
    fun `forbidden for non-seed troupe`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-season-2")
        val other = "00000000-0000-0000-0000-00000000feed"
        mockMvc
            .perform(
                get("/v1/troupes/$other/seasons")
                    .cookie(cookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `same title twice yields unique slugs a and a-2`() {
        val cookie = memberCookie("sub-season-3")
        val json =
            """
            { "title": "Saison jumelle" }
            """.trimIndent()
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/seasons")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("saison-jumelle"))
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/seasons")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("saison-jumelle-2"))
    }

    @Test
    fun `cannot activate archived season`() {
        val cookie = memberCookie("sub-season-4")
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Saison archivee"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(createRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/actions/activate")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `patch explicit null clears optional description and dates`() {
        val cookie = memberCookie("sub-season-patch-null")
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Patch nullables",
                              "description": "À effacer",
                              "startDate": "2026-09-01",
                              "endDate": "2027-06-30"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.description").value("À effacer"))
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(createRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        val patchBody =
            mockMvc
                .perform(
                    patch("/v1/seasons/$seasonId")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            { "description": null, "startDate": null }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.endDate").value("2027-06-30"))
                .andReturn()
                .response
                .contentAsString
        val root = com.fasterxml.jackson.databind.ObjectMapper().readTree(patchBody)
        assertTrue(root.path("description").isNull)
        assertTrue(root.path("startDate").isNull)
    }

    @Test
    fun `patch title null is bad request`() {
        val cookie = memberCookie("sub-season-patch-title-null")
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Titre obligatoire reste"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(createRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"title":null}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `patch empty body is no op`() {
        val cookie = memberCookie("sub-season-patch-empty")
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Corps vide patch",
                              "description": "inchangé",
                              "startDate": "2026-04-01",
                              "endDate": "2027-03-31"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(createRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value("Corps vide patch"))
            .andExpect(jsonPath("$.description").value("inchangé"))
            .andExpect(jsonPath("$.startDate").value("2026-04-01"))
            .andExpect(jsonPath("$.endDate").value("2027-03-31"))
    }

    @Test
    fun `patch endDate null only clears end date`() {
        val cookie = memberCookie("sub-season-patch-end-null")
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Fin seulement",
                              "startDate": "2026-01-10",
                              "endDate": "2027-01-10"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(createRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        val patchJson =
            mockMvc
                .perform(
                    patch("/v1/seasons/$seasonId")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"endDate":null}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.startDate").value("2026-01-10"))
                .andReturn()
                .response
                .contentAsString
        val root = com.fasterxml.jackson.databind.ObjectMapper().readTree(patchJson)
        assertTrue(root.path("endDate").isNull)
    }

    @Test
    fun `patch wrong json type for description is bad request`() {
        val cookie = memberCookie("sub-season-patch-type")
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Type JSON"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId =
            UUID.fromString(
                com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(createRes.response.contentAsString)
                    .get("id")
                    .asText(),
            )

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"description":1}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }
}
