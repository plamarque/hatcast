package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.availability.draw.ImmediateReplayMode
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.9")
class ImmediateReplayDrawIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @TestConfiguration
    class ImmediateReplayExcludePipelineConfig {
        @Bean
        @Primary
        fun drawWeightPipeline(): DrawWeightPipeline =
            DrawWeightPipelines.withImmediateReplay(ImmediateReplayMode.EXCLUDE)
    }

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Immediate Replay Draw Test",
            )
        if (admin) {
            val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
            val membership =
                membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                    ?: error("Missing membership")
            membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
            membershipRepository.save(membership)
        }
        return cookie
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Immediate replay draw season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        title: String,
        startsAt: Instant,
    ): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "$title",
                              "startsAt": "$startsAt",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun assignSlot(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun validateComposition(eventId: UUID) {
        val now = Instant.now()
        val composition = compositionRepository.findById(eventId).orElseThrow()
        composition.validatedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)
    }

    private fun participantIdForUser(
        seasonId: UUID,
        googleSub: String,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        return seasonParticipantRepository
            .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
            ?.id
            ?: error("Missing season participant")
    }

    @Test
    @Tag("FR19")
    fun `EXCLUDE pipeline never selects veteran who replayed same role on predecessor`() {
        val adminCookie = memberCookie("sub-ir-draw-admin", admin = true)
        val veteran = memberCookie("sub-ir-draw-veteran")
        val rookie = memberCookie("sub-ir-draw-rookie")
        val seasonId = createSeason(adminCookie)
        val veteranId = participantIdForUser(seasonId, "sub-ir-draw-veteran")
        val rookieId = participantIdForUser(seasonId, "sub-ir-draw-rookie")

        val predecessorId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Premier spectacle",
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val currentId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Deuxième spectacle",
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(veteran, seasonId, predecessorId)
        setAvailability(veteran, seasonId, currentId)
        setAvailability(rookie, seasonId, currentId)

        assignSlot(adminCookie, seasonId, predecessorId, veteranId)
        validateComposition(predecessorId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$currentId/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.composition.slots[0].participantId").value(rookieId.toString()))
    }
}
