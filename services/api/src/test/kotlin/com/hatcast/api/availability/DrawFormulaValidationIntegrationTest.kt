package com.hatcast.api.availability

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.draw.DrawFactorConfigEntry
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.MethodSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DrawFormulaValidationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper().registerModule(kotlinModule())

    @ParameterizedTest(name = "POST {0}")
    @MethodSource("fixtures")
    fun formulaValidationPost(fixture: ValidationFixtureLoader.ValidationFixture) {
        val cookie = adminCookie("sub-formula-validation-post-${fixture.id}")
        val body = buildPostBody(fixture)
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/draw-formulas")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(body))
                    .with(csrf()),
            ).andExpect(status().`is`(fixture.expectedHttpStatus))
    }

    @ParameterizedTest(name = "PATCH {0}")
    @MethodSource("fixtures")
    fun formulaValidationPatch(fixture: ValidationFixtureLoader.ValidationFixture) {
        val cookie = adminCookie("sub-formula-validation-patch-${fixture.id}")
        val formulaId = createSeedDraftFormula(cookie, "Seed ${fixture.id}")
        val patchBody = buildPatchBody(fixture)
        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/draw-formulas/$formulaId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(patchBody))
                    .with(csrf()),
            ).andExpect(status().`is`(if (fixture.expectedRejected) fixture.expectedHttpStatus else 200))
    }

    private fun buildPostBody(fixture: ValidationFixtureLoader.ValidationFixture): Map<String, Any?> =
        mapOf(
            "name" to fixtureInputName(fixture),
            "status" to fixtureInputStatus(fixture),
            "factorConfig" to fixtureInputFactorConfig(fixture),
        )

    private fun buildPatchBody(fixture: ValidationFixtureLoader.ValidationFixture): Map<String, Any?> {
        val body = mutableMapOf<String, Any?>()
        val input = fixture.input
        if (input.has("status")) {
            body["status"] = input.path("status").asText()
        } else if (fixture.function == "formulaPublish") {
            body["status"] = "PUBLISHED"
        }
        if (input.has("factorConfig")) {
            body["factorConfig"] = fixtureInputFactorConfig(fixture)
        }
        if (input.has("name")) {
            body["name"] = fixtureInputName(fixture)
        }
        return body
    }

    private fun fixtureInputName(fixture: ValidationFixtureLoader.ValidationFixture): String =
        fixture.input.path("name").asText("Formula ${fixture.id}")

    private fun fixtureInputStatus(fixture: ValidationFixtureLoader.ValidationFixture): String =
        fixture.input.path("status").asText(
            if (fixture.function == "formulaPublish") "PUBLISHED" else "DRAFT",
        )

    private fun fixtureInputFactorConfig(fixture: ValidationFixtureLoader.ValidationFixture): List<DrawFactorConfigEntry> {
        val factorConfigNode = fixture.input.get("factorConfig")
        return if (factorConfigNode == null || factorConfigNode.isNull) {
            emptyList()
        } else {
            mapper.readValue(factorConfigNode.toString())
        }
    }

    private fun createSeedDraftFormula(
        cookie: jakarta.servlet.http.Cookie,
        name: String,
    ): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/draw-formulas")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            mapper.writeValueAsString(
                                mapOf(
                                    "name" to name,
                                    "status" to "DRAFT",
                                    "factorConfig" to
                                        listOf(
                                            mapOf("factorId" to "equity_tag", "enabled" to true),
                                            mapOf("factorId" to "past_participation", "enabled" to true),
                                        ),
                                ),
                            ),
                        ).with(csrf()),
                ).andExpect(status().isCreated)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).get("id").asText())
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Formula Validation Test",
            )
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    companion object {
        @JvmStatic
        fun fixtures(): List<ValidationFixtureLoader.ValidationFixture> =
            ValidationFixtureLoader.formulaFixtures()
    }
}

object ValidationFixtureLoader {
    private val mapper = ObjectMapper().registerModule(kotlinModule())

    data class ValidationFixture(
        val id: String,
        val function: String,
        val input: JsonNode,
        val expectedRejected: Boolean,
        val expectedHttpStatus: Int,
    )

    fun formulaFixtures(): List<ValidationFixture> {
        val stream =
            requireNotNull(
                DrawFormulaValidationIntegrationTest::class.java.classLoader.getResourceAsStream(
                    "draw/golden/policies/validation.json",
                ),
            ) { "Missing validation.json" }
        val nodes: List<JsonNode> = mapper.readValue(stream)
        return nodes
            .filter { node ->
                val fn = node.get("function").asText()
                fn == "formulaSave" || fn == "formulaPublish"
            }.map { node ->
                ValidationFixture(
                    id = node.get("id").asText(),
                    function = node.get("function").asText(),
                    input = node.get("input"),
                    expectedRejected = node.path("expected").path("rejected").asBoolean(false),
                    expectedHttpStatus = node.path("expected").path("httpStatus").asInt(400),
                )
            }
    }
}
