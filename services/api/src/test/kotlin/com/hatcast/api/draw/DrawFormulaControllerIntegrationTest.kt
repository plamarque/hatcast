package com.hatcast.api.draw

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
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
class DrawFormulaControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @Autowired
    private lateinit var drawPolicyRepository: DrawPolicyRepository

    @Autowired
    private lateinit var drawFormulaSeedService: DrawFormulaSeedService

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

    private lateinit var troupeId: UUID
    private val mapper = ObjectMapper()

    @BeforeEach
    fun setUp() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Draw Formula API Troupe",
                    slug = "draw-formula-api-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        troupeId = troupe.id
        drawFormulaSeedService.ensureSystemFormula(troupeId)
    }

    @Test
    fun `non-admin receives 403 on all catalogue endpoints`() {
        val cookie = memberCookie("sub-formula-member-403-all")
        val admin = adminCookie("sub-formula-admin-for-403-all")
        val formulaId = createUserFormula(admin, "Formula for 403 test")

        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-formulas").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/troupes/$troupeId/draw-formulas")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Interdit",
                          "status": "DRAFT",
                          "factorConfig": [
                            { "factorId": "equity_tag", "enabled": true },
                            { "factorId": "past_participation", "enabled": true }
                          ]
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/draw-formulas/$formulaId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "name": "Interdit" }""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie).with(csrf()))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `system formula cannot be patched`() {
        val cookie = adminCookie("sub-formula-system-patch")
        val systemId = DrawFormulaIds.systemV1(troupeId)
        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/draw-formulas/$systemId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "name": "Hacked system name" }""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `patch to published with invalid config returns 400 and leaves entity unchanged`() {
        val cookie = adminCookie("sub-formula-patch-publish-invalid")
        val createResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$troupeId/draw-formulas")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "name": "Draft before invalid publish",
                              "status": "DRAFT",
                              "factorConfig": [
                                { "factorId": "equity_tag", "enabled": true },
                                { "factorId": "past_participation", "enabled": true }
                              ]
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isCreated)
                .andReturn()
        val formulaId = UUID.fromString(mapper.readTree(createResult.response.contentAsString).get("id").asText())
        val before = drawFormulaRepository.findById(formulaId).orElseThrow()
        val versionBefore = before.version
        val statusBefore = before.status

        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/draw-formulas/$formulaId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "status": "PUBLISHED",
                          "factorConfig": [
                            { "factorId": "equity_tag", "enabled": true },
                            { "factorId": "gender_parity", "enabled": true }
                          ]
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)

        val after = drawFormulaRepository.findById(formulaId).orElseThrow()
        assertEquals(statusBefore, after.status)
        assertEquals(versionBefore, after.version)
    }

    @Test
    fun `cross-troupe patch and delete return 404`() {
        val cookie = adminCookie("sub-formula-cross-mutate-404")
        val otherTroupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Other troupe mutate",
                    slug = "other-troupe-mutate-${UUID.randomUUID()}",
                    createdAt = Instant.now(),
                ),
            )
        val now = Instant.now()
        val foreignFormula =
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    troupeId = otherTroupe.id,
                    name = "Foreign formula",
                    status = DrawFormulaStatus.DRAFT,
                    factorConfig =
                        listOf(
                            DrawFactorConfigEntry("equity_tag", true),
                            DrawFactorConfigEntry("past_participation", true),
                        ),
                    version = 1,
                    createdAt = now,
                    updatedAt = now,
                ),
            )

        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/draw-formulas/${foreignFormula.id}")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "name": "Cross troupe patch" }""")
                    .with(csrf()),
            ).andExpect(status().isNotFound)

        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/${foreignFormula.id}").cookie(cookie).with(csrf()))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `system formula cannot be deleted`() {
        val cookie = adminCookie("sub-formula-system-del")
        val systemId = DrawFormulaIds.systemV1(troupeId)
        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/$systemId").cookie(cookie).with(csrf()))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `delete returns 409 when formula referenced by policy`() {
        val cookie = adminCookie("sub-formula-policy-409")
        val formulaId = createUserFormula(cookie, "Policy bound formula")
        drawPolicyRepository.save(
            DrawPolicyEntity(
                troupeId = troupeId,
                scope = DrawPolicyScope.TROUPE,
                troupeScopeKey = troupeId,
                defaultRule =
                    DrawDefaultRule(
                        mode = DrawRuleMode.MANDATORY,
                        mandatoryFormulaId = formulaId.toString(),
                    ),
            ),
        )
        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie).with(csrf()))
            .andExpect(status().isConflict)
    }

    @Test
    fun `patch to archived returns 409 when formula referenced by policy`() {
        val cookie = adminCookie("sub-formula-policy-patch-409")
        val formulaId = createUserFormula(cookie, "Policy bound patch formula")
        drawPolicyRepository.save(
            DrawPolicyEntity(
                troupeId = troupeId,
                scope = DrawPolicyScope.TROUPE,
                troupeScopeKey = troupeId,
                defaultRule =
                    DrawDefaultRule(
                        mode = DrawRuleMode.MANDATORY,
                        mandatoryFormulaId = formulaId.toString(),
                    ),
            ),
        )
        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/draw-formulas/$formulaId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "status": "ARCHIVED" }""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `post with archived status returns 400`() {
        val cookie = adminCookie("sub-formula-post-archived-400")
        mockMvc
            .perform(
                post("/v1/troupes/$troupeId/draw-formulas")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "name": "Archived at create",
                          "status": "ARCHIVED",
                          "factorConfig": [
                            { "factorId": "equity_tag", "enabled": true },
                            { "factorId": "past_participation", "enabled": true }
                          ]
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `second delete on archived formula is idempotent`() {
        val cookie = adminCookie("sub-formula-delete-idempotent")
        val formulaId = createUserFormula(cookie, "Idempotent archive")
        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie).with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ARCHIVED"))
            .andExpect(jsonPath("$.version").value(2))

        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie).with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ARCHIVED"))
            .andExpect(jsonPath("$.version").value(2))
    }

    @Test
    fun `get system formula without prior list succeeds`() {
        val freshTroupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Fresh troupe system get",
                    slug = "fresh-troupe-system-get-${UUID.randomUUID()}",
                    createdAt = Instant.now(),
                ),
            )
        val cookie = adminCookieForTroupe("sub-formula-system-get-fresh", freshTroupe.id)
        val systemId = DrawFormulaIds.systemV1(freshTroupe.id)
        mockMvc
            .perform(get("/v1/troupes/${freshTroupe.id}/draw-formulas/$systemId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.isSystem").value(true))
    }

    @Test
    fun `happy path CRUD and soft archive`() {
        val cookie = adminCookie("sub-formula-crud-1")
        val createBody =
            """
            {
              "name": "Ma formule test",
              "status": "DRAFT",
              "factorConfig": [
                { "factorId": "equity_tag", "enabled": true },
                { "factorId": "past_participation", "enabled": true },
                { "factorId": "gender_parity", "enabled": false }
              ]
            }
            """.trimIndent()

        val createResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$troupeId/draw-formulas")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody)
                        .with(csrf()),
                ).andExpect(status().isCreated)
                .andExpect(jsonPath("$.name").value("Ma formule test"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.isSystem").value(false))
                .andReturn()

        val formulaId = UUID.fromString(mapper.readTree(createResult.response.contentAsString).get("id").asText())

        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(formulaId.toString()))

        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-formulas").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.isSystem == true)].name").exists())

        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/draw-formulas/$formulaId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{ "status": "PUBLISHED" }""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("PUBLISHED"))
            .andExpect(jsonPath("$.version").value(2))

        mockMvc
            .perform(delete("/v1/troupes/$troupeId/draw-formulas/$formulaId").cookie(cookie).with(csrf()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ARCHIVED"))
            .andExpect(jsonPath("$.version").value(3))

        val entity = drawFormulaRepository.findById(formulaId).orElseThrow()
        assertEquals(DrawFormulaStatus.ARCHIVED, entity.status)
    }

    @Test
    fun `cross-troupe formula id returns 404`() {
        val cookie = adminCookie("sub-formula-cross-404")
        val otherTroupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Other troupe",
                    slug = "other-troupe-${UUID.randomUUID()}",
                    createdAt = Instant.now(),
                ),
            )
        drawFormulaSeedService.ensureSystemFormula(otherTroupe.id)
        val foreignFormulaId = DrawFormulaIds.systemV1(otherTroupe.id)

        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-formulas/$foreignFormulaId").cookie(cookie))
            .andExpect(status().isNotFound)
    }

    private fun createUserFormula(
        cookie: jakarta.servlet.http.Cookie,
        name: String,
    ): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/troupes/$troupeId/draw-formulas")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "name": "$name",
                              "status": "PUBLISHED",
                              "factorConfig": [
                                { "factorId": "equity_tag", "enabled": true },
                                { "factorId": "past_participation", "enabled": true }
                              ]
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isCreated)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).get("id").asText())
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie = adminCookieForTroupe(googleSub, troupeId)

    private fun adminCookieForTroupe(
        googleSub: String,
        targetTroupeId: UUID,
    ): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Formula Admin",
            )
        val email = "$googleSub@example.com"
        val user =
            userRepository.findByGoogleSub(googleSub)
                ?: userRepository.findFirstByEmailIgnoreCase(email)
                ?: error("Missing test user $googleSub")
        ensureMembership(user.id, TroupeBaselineRole.TROUPE_ADMIN, targetTroupeId)
        return cookie
    }

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Formula Member",
            )
        val email = "$googleSub@example.com"
        val user =
            userRepository.findByGoogleSub(googleSub)
                ?: userRepository.findFirstByEmailIgnoreCase(email)
                ?: error("Missing test user $googleSub")
        ensureMembership(user.id, TroupeBaselineRole.MEMBER, troupeId)
        return cookie
    }

    private fun ensureMembership(
        userId: UUID,
        role: TroupeBaselineRole,
        targetTroupeId: UUID = troupeId,
    ) {
        val existing = membershipRepository.findByTroupe_IdAndUser_Id(targetTroupeId, userId)
        if (existing != null) {
            existing.baselineRole = role
            membershipRepository.save(existing)
        } else {
            val troupe = troupeRepository.findById(targetTroupeId).orElseThrow()
            val user = userRepository.findById(userId).orElseThrow()
            membershipRepository.save(
                com.hatcast.api.troupe.TroupeMembershipEntity(
                    troupe = troupe,
                    user = user,
                    status = TroupeMembershipStatus.ACTIVE,
                    baselineRole = role,
                    displayName = user.displayName ?: "Member",
                ),
            )
        }
    }
}
