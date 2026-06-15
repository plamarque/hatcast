package com.hatcast.api.troupe

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.draw.DrawFormulaIds
import com.hatcast.api.draw.DrawFormulaRepository
import com.hatcast.api.draw.DrawFormulaSeedConstants
import com.hatcast.api.draw.DrawFormulaStatus
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Assertions.assertEquals
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeCreationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @Test
    fun `POST creates troupe with admin membership lists and allows admin export`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-create-troupe-1",
            )

        val createBody =
            mockMvc
                .perform(
                    post("/v1/troupes")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"name":"  Ma Nouvelle Troupe  "}"""),
                ).andExpect(status().isCreated)
                .andExpect(jsonPath("$.name").value("Ma Nouvelle Troupe"))
                .andExpect(jsonPath("$.slug").value("ma-nouvelle-troupe"))
                .andExpect(jsonPath("$.joinPolicy").value("OPEN"))
                .andExpect(jsonPath("$.isDemo").value(false))
                .andExpect(jsonPath("$.membership.status").value("ACTIVE"))
                .andExpect(jsonPath("$.membership.baselineRole").value("TROUPE_ADMIN"))
                .andExpect(jsonPath("$.activeMemberCount").value(1))
                .andExpect(jsonPath("$.upcomingEventCount").value(0))
                .andReturn()
                .response
                .contentAsString

        val troupeId = UUID.fromString(mapper.readTree(createBody).get("id").asText())

        val persisted = troupeRepository.findById(troupeId).orElseThrow()
        assertEquals(TroupeJoinPolicy.OPEN, persisted.joinPolicy)
        assertEquals(false, persisted.isDemo)

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$.[0].slug").value("ma-nouvelle-troupe"))
            .andExpect(jsonPath("$.[0].joinPolicy").value("OPEN"))
            .andExpect(jsonPath("$.[0].isDemo").value(false))

        mockMvc
            .perform(get("/v1/troupes/$troupeId/members/export").cookie(cookie))
            .andExpect(status().isOk)
    }

    @Test
    fun `POST creates troupe with system V1 draw formula seeded`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-create-troupe-draw-seed",
            )

        val createBody =
            mockMvc
                .perform(
                    post("/v1/troupes")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"name":"Troupe Draw Seed"}"""),
                ).andExpect(status().isCreated)
                .andReturn()
                .response
                .contentAsString

        val troupeId = UUID.fromString(mapper.readTree(createBody).get("id").asText())
        val systemFormula =
            drawFormulaRepository
                .findById(DrawFormulaIds.systemV1(troupeId))
                .orElseThrow()

        assertEquals(DrawFormulaIds.systemV1(troupeId), systemFormula.id)
        assertEquals(troupeId, systemFormula.troupeId)
        assertTrue(systemFormula.isSystem)
        assertEquals(DrawFormulaStatus.PUBLISHED, systemFormula.status)
        assertEquals(DrawFormulaSeedConstants.SYSTEM_V1_NAME, systemFormula.name)
        assertEquals(DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG, systemFormula.factorConfig)
    }

    @Test
    fun `seed troupe has join policy OPEN and isDemo false after migration`() {
        val seed = troupeRepository.findById(seedTroupeId).orElseThrow()
        assertEquals(TroupeJoinPolicy.OPEN, seed.joinPolicy)
        assertEquals(false, seed.isDemo)
    }

    @Test
    fun `POST allocates slug suffix when seed slug collides`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-create-troupe-2",
            )
        val seedSlug = troupeRepository.findById(seedTroupeId).orElseThrow().slug
        assertEquals("les-improbots", seedSlug)

        mockMvc
            .perform(
                post("/v1/troupes")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Les Improbots"}"""),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.slug").value("les-improbots-2"))
    }

    @Test
    fun `POST rejects blank name`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-create-troupe-3",
            )

        mockMvc
            .perform(
                post("/v1/troupes")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"   "}"""),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `POST without session returns unauthorized`() {
        mockMvc
            .perform(
                post("/v1/troupes")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Sans session"}"""),
            ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `POST requires csrf`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-create-troupe-csrf",
            )

        mockMvc
            .perform(
                post("/v1/troupes")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Sans CSRF"}"""),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `POST rejects name that does not slugify`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-create-troupe-4",
            )

        mockMvc
            .perform(
                post("/v1/troupes")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"!!!"}"""),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }
}
