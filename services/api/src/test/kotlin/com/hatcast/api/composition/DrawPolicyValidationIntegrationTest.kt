package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.draw.DrawFormulaEntity
import com.hatcast.api.draw.DrawFormulaRepository
import com.hatcast.api.draw.DrawFormulaSeedConstants
import com.hatcast.api.draw.DrawFormulaSeedService
import com.hatcast.api.draw.DrawFormulaStatus
import com.hatcast.api.troupe.TroupeCategoryRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.18")
@Tag("REF-V")
class DrawPolicyValidationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @Autowired
    private lateinit var drawFormulaSeedService: DrawFormulaSeedService

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var troupeCategoryRepository: TroupeCategoryRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private lateinit var troupeId: UUID
    private lateinit var otherTroupeId: UUID
    private val formulaIds = mutableMapOf<String, UUID>()
    private val mapper = ObjectMapper().registerModule(kotlinModule())

    @BeforeEach
    fun setUp() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Policy Validation Troupe",
                    slug = "policy-validation-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        troupeId = troupe.id
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        formulaIds["f1"] = createFormula(troupeId, "Formula 1", DrawFormulaStatus.PUBLISHED)
        formulaIds["f2"] = createFormula(troupeId, "Formula 2", DrawFormulaStatus.PUBLISHED)

        val otherTroupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Other Troupe",
                    slug = "other-policy-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        otherTroupeId = otherTroupe.id
        formulaIds["foreign-troupe-formula-id"] =
            createFormula(otherTroupeId, "Foreign", DrawFormulaStatus.PUBLISHED)
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("fixtures")
    fun policyValidation(fixtureId: String) {
        val fixture =
            PolicyGoldenTestSupport.loadPolicyValidationFixtures().first { it.path("id").asText() == fixtureId }
        prepareFixtureFormulas(fixture.path("input"))
        prepareCategories(fixture.path("input"))
        val body = buildPolicyBody(fixture.path("input"))
        val expectedStatus = fixture.path("expected").path("httpStatus").asInt(400)
        mockMvc
            .perform(
                put("/v1/troupes/$troupeId/draw-policy")
                    .cookie(adminCookie("sub-policy-$fixtureId"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(body))
                    .with(csrf()),
            ).andExpect(status().`is`(expectedStatus))
    }

    private fun prepareFixtureFormulas(input: JsonNode) {
        val now = Instant.now()
        input.path("formulaStatuses").fields().forEach { (ref, statusNode) ->
            formulaIds[ref] =
                drawFormulaRepository
                    .save(
                        DrawFormulaEntity(
                            troupeId = troupeId,
                            name = ref,
                            status = DrawFormulaStatus.valueOf(statusNode.asText()),
                            factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                            createdAt = now,
                            updatedAt = now,
                        ),
                    ).id
        }
    }

    private fun prepareCategories(input: JsonNode) {
        val now = Instant.now()
        val troupe = troupeRepository.findById(troupeId).orElseThrow()
        input.path("glossaryCategories").forEach { slugNode ->
            val slug = slugNode.asText()
            if (!troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, slug)) {
                troupeCategoryRepository.save(
                    com.hatcast.api.troupe.TroupeCategoryEntity(
                        troupe = troupe,
                        slug = slug,
                        label = slug,
                        createdAt = now,
                    ),
                )
            }
        }
    }

    private fun buildPolicyBody(input: JsonNode): Map<String, Any?> {
        val defaultRule = input.path("defaultRule")
        val categoryRules = input.path("categoryRules")
        return mapOf(
            "defaultRule" to rewriteRule(defaultRule),
            "categoryRules" to categoryRules.map { rewriteCategoryRule(it) },
        )
    }

    private fun rewriteRule(node: JsonNode): Map<String, Any?> {
        val mode = node.path("mode").asText()
        val body = mutableMapOf<String, Any?>("mode" to mode)
        if (node.has("allowedFormulaIds")) {
            body["allowedFormulaIds"] =
                node.path("allowedFormulaIds").map { resolveFormulaRef(it.asText()) }
        }
        if (node.has("mandatoryFormulaId")) {
            body["mandatoryFormulaId"] = resolveFormulaRef(node.path("mandatoryFormulaId").asText())
        }
        return body
    }

    private fun rewriteCategoryRule(node: JsonNode): Map<String, Any?> {
        val body = rewriteRule(node).toMutableMap()
        if (node.has("category") && !node.path("category").isNull) {
            body["category"] = node.path("category").asText()
        } else {
            body["category"] = null
        }
        return body
    }

    private fun resolveFormulaRef(ref: String): String =
        when (ref) {
            "foreign-troupe-formula-id" -> formulaIds[ref]!!.toString()
            else -> formulaIds[ref]?.toString() ?: ref
        }

    private fun createFormula(
        targetTroupeId: UUID,
        name: String,
        status: DrawFormulaStatus,
    ): UUID {
        val now = Instant.now()
        return drawFormulaRepository
            .save(
                DrawFormulaEntity(
                    troupeId = targetTroupeId,
                    name = name,
                    status = status,
                    factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                    createdAt = now,
                    updatedAt = now,
                ),
            ).id
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie =
        PolicyAuthTestSupport.adminCookie(
            mockMvc,
            googleIdTokenService,
            troupeId,
            troupeRepository,
            membershipRepository,
            userRepository,
            googleSub,
        )

    companion object {
        @JvmStatic
        fun fixtures(): List<String> =
            PolicyGoldenTestSupport.loadPolicyValidationFixtures()
                .filter { it.path("function").asText() == "policySave" }
                .map { it.path("id").asText() }
    }
}
