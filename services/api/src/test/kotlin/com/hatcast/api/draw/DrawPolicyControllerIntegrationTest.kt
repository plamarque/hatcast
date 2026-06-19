package com.hatcast.api.draw

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.PolicyAuthTestSupport
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.event.EventRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.18")
class DrawPolicyControllerIntegrationTest {
    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

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
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private lateinit var troupeId: UUID
    private lateinit var publishedFormulaId: UUID
    private val mapper = ObjectMapper()

    @BeforeEach
    fun setUp() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Policy API Troupe",
                    slug = "policy-api-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        troupeId = troupe.id
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        publishedFormulaId =
            drawFormulaRepository
                .save(
                    DrawFormulaEntity(
                        troupeId = troupeId,
                        name = "Published policy formula",
                        status = DrawFormulaStatus.PUBLISHED,
                        factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                        createdAt = now,
                        updatedAt = now,
                    ),
                ).id
    }

    @Test
    fun `non-admin receives 403 on troupe policy endpoints`() {
        val cookie = memberCookie("sub-policy-member-403")
        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-policy").cookie(cookie))
            .andExpect(status().isForbidden)
        mockMvc
            .perform(
                put("/v1/troupes/$troupeId/draw-policy")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validPolicyBody())
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `admin upserts and reads troupe policy`() {
        val cookie = adminCookie("sub-policy-admin-upsert")
        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-policy").cookie(cookie))
            .andExpect(status().isNotFound)

        mockMvc
            .perform(
                put("/v1/troupes/$troupeId/draw-policy")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validPolicyBody())
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.scope").value("TROUPE"))
            .andExpect(jsonPath("$.defaultRule.mode").value("MANDATORY"))

        mockMvc
            .perform(get("/v1/troupes/$troupeId/draw-policy").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.defaultRule.mandatoryFormulaId").value(publishedFormulaId.toString()))
    }

    @Test
    fun `admin upserts and reads season policy`() {
        val now = Instant.now()
        val season =
            seasonRepository.save(
                com.hatcast.api.season.SeasonEntity(
                    id = UUID.randomUUID(),
                    troupe = troupeRepository.findById(troupeId).orElseThrow(),
                    title = "Policy Season",
                    slug = "policy-season-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        val cookie = adminCookie("sub-policy-admin-season")
        mockMvc
            .perform(
                put("/v1/seasons/${season.id}/draw-policy")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validPolicyBody())
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.scope").value("SEASON"))

        mockMvc
            .perform(get("/v1/seasons/${season.id}/draw-policy").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.seasonId").value(season.id.toString()))
    }

    @Test
    fun `season organizer receives 403 on season policy admin endpoints`() {
        val now = Instant.now()
        val season =
            seasonRepository.save(
                com.hatcast.api.season.SeasonEntity(
                    id = UUID.randomUUID(),
                    troupe = troupeRepository.findById(troupeId).orElseThrow(),
                    title = "Organizer Policy Season",
                    slug = "organizer-policy-season-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        val adminCookie = adminCookie("sub-policy-admin-for-organizer")
        val organizerCookie =
            PolicyAuthTestSupport.seasonOrganizerCookie(
                mockMvc,
                googleIdTokenService,
                adminCookie,
                troupeId,
                season.id,
                troupeRepository,
                membershipRepository,
                userRepository,
                googleSub = "sub-policy-season-organizer",
            )
        mockMvc
            .perform(get("/v1/seasons/${season.id}/draw-policy").cookie(organizerCookie))
            .andExpect(status().isForbidden)
        mockMvc
            .perform(
                put("/v1/seasons/${season.id}/draw-policy")
                    .cookie(organizerCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validPolicyBody())
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `organizer reads effective draw policy for event`() {
        val now = Instant.now()
        val troupe = troupeRepository.findById(troupeId).orElseThrow()
        val season =
            seasonRepository.save(
                com.hatcast.api.season.SeasonEntity(
                    id = UUID.randomUUID(),
                    troupe = troupe,
                    title = "Effective Season",
                    slug = "effective-season-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        val event =
            eventRepository.save(
                com.hatcast.api.event.EventEntity(
                    id = UUID.randomUUID(),
                    season = season,
                    title = "Effective Event",
                    slug = "effective-event-${UUID.randomUUID()}",
                    startsAt = now.plusSeconds(7200),
                    roleSlots = mapOf("player" to 1),
                    category = null,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        val cookie = adminCookie("sub-policy-effective-admin")
        mockMvc
            .perform(
                put("/v1/troupes/$troupeId/draw-policy")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(validPolicyBody())
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/${season.id}/events/${event.id}/draw-policy/effective")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.policySource").value("TROUPE"))
            .andExpect(jsonPath("$.effectiveFormulaId").value(publishedFormulaId.toString()))
    }

    @Test
    fun `member without composition rights receives 403 on effective draw policy`() {
        val now = Instant.now()
        val troupe = troupeRepository.findById(troupeId).orElseThrow()
        val season =
            seasonRepository.save(
                com.hatcast.api.season.SeasonEntity(
                    id = UUID.randomUUID(),
                    troupe = troupe,
                    title = "Forbidden Season",
                    slug = "forbidden-season-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        val event =
            eventRepository.save(
                com.hatcast.api.event.EventEntity(
                    id = UUID.randomUUID(),
                    season = season,
                    title = "Forbidden Event",
                    slug = "forbidden-event-${UUID.randomUUID()}",
                    startsAt = now.plusSeconds(7200),
                    roleSlots = mapOf("player" to 1),
                    category = null,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        val cookie = memberCookie("sub-policy-effective-member")
        mockMvc
            .perform(
                get("/v1/seasons/${season.id}/events/${event.id}/draw-policy/effective")
                    .cookie(cookie),
            ).andExpect(status().isForbidden)
    }

    private fun validPolicyBody(): String =
        """
        {
          "defaultRule": {
            "mode": "MANDATORY",
            "mandatoryFormulaId": "$publishedFormulaId"
          },
          "categoryRules": []
        }
        """.trimIndent()

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

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie =
        PolicyAuthTestSupport.memberCookie(
            mockMvc,
            googleIdTokenService,
            troupeId,
            troupeRepository,
            membershipRepository,
            userRepository,
            googleSub,
        )
}
