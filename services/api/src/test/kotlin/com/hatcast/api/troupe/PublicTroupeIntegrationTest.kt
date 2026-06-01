package com.hatcast.api.troupe

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
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
class PublicTroupeIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @Test
    fun `GET public troupes is unauthenticated and returns listed non-demo troupes only`() {
        val listedId = UUID.randomUUID()
        val hiddenId = UUID.randomUUID()
        val demoId = UUID.randomUUID()
        troupeRepository.saveAll(
            listOf(
                TroupeEntity(
                    id = listedId,
                    name = "Annuaire Visible",
                    slug = "annuaire-visible-${listedId.toString().take(8)}",
                    listedInDirectory = true,
                    isDemo = false,
                ),
                TroupeEntity(
                    id = hiddenId,
                    name = "Annuaire Masquée",
                    slug = "annuaire-masquee-${hiddenId.toString().take(8)}",
                    listedInDirectory = false,
                    isDemo = false,
                ),
                TroupeEntity(
                    id = demoId,
                    name = "Troupe Démo",
                    slug = "annuaire-demo-${demoId.toString().take(8)}",
                    listedInDirectory = true,
                    isDemo = true,
                ),
            ),
        )

        val body =
            mockMvc
                .perform(get("/v1/public/troupes"))
                .andExpect(status().isOk)
                .andReturn()
                .response
                .contentAsString

        val root = mapper.readTree(body)
        assertTrue(root.isArray)
        val ids = root.map { it.get("id").asText() }.toSet()
        assertTrue(ids.contains(listedId.toString()))
        assertTrue(ids.contains(seedTroupeId.toString()))
        assertFalse(ids.contains(hiddenId.toString()))
        assertFalse(ids.contains(demoId.toString()))

        for (node in root) {
            assertFalse(node.has("membership"))
            assertFalse(node.has("email"))
            assertFalse(node.has("joinPolicy"))
            assertFalse(node.has("isDemo"))
        }

        mockMvc
            .perform(get("/v1/public/troupes"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug=='les-improbots')].name").value("Les Improbots"))
    }

    @Test
    fun `GET public troupes does not require session while GET troupes does`() {
        mockMvc
            .perform(get("/v1/public/troupes"))
            .andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes"))
            .andExpect(status().isUnauthorized)

        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-public-troupes-auth")
        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
    }
}
