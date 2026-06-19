package com.hatcast.api.composition

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

/**
 * Shared MockMvc helpers for role-request integration tests (19.10+).
 * Uses self-service availability HTTP so dispos are stored with member [user_id] identity.
 */
class RoleRequestIntegrationTestSupport(
    private val mockMvc: MockMvc,
    private val googleIdTokenService: GoogleIdTokenService,
    private val membershipRepository: TroupeMembershipRepository,
    private val userRepository: UserRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val compositionRepository: EventCompositionRepository,
) {
    private val mapper = ObjectMapper()
    val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    fun memberCookie(
        googleSub: String,
        admin: Boolean = false,
        displayName: String = "Role request integration test",
    ): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = displayName,
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

    fun adminPrincipal(googleSub: String): SessionUserPrincipal {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user $googleSub")
        return SessionUserPrincipal(
            userId = user.id,
            googleSub = user.googleSub ?: googleSub,
            idpUid = user.idpUid,
            email = user.email,
        )
    }

    fun createSeason(
        cookie: jakarta.servlet.http.Cookie,
        title: String = "Role request season",
    ): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"$title"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    fun createEvent(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        startsAt: Instant,
        title: String = "Show $startsAt",
        roleSlots: Map<String, Int> = mapOf("dj" to 1, "player" to 1),
        category: String? = null,
    ): UUID {
        category?.let { EventTestSupport.ensureGlossaryCategory(mockMvc, adminCookie, seedTroupeId, it) }
        val categoryJson = category?.let { """, "category": "$it"""" } ?: ""
        val roleSlotsJson = mapper.writeValueAsString(roleSlots)
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "$title",
                              "startsAt": "$startsAt",
                              "roleSlots": $roleSlotsJson$categoryJson
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, adminCookie, seasonId, eventId)
        return eventId
    }

    fun setAvailability(
        memberCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        roleKeys: List<String>,
    ) {
        val roleKeysJson = mapper.writeValueAsString(roleKeys)
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":$roleKeysJson}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    fun assignSlot(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
        roleKey: String = "dj",
        slotIndex: Int = 0,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/$roleKey/$slotIndex")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    fun declineSlotParticipation(
        memberCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        roleKey: String = "dj",
        slotIndex: Int = 0,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/slots/$roleKey/$slotIndex/participation")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    fun validateComposition(eventId: UUID) {
        val now = Instant.now()
        val composition = compositionRepository.findById(eventId).orElseThrow()
        composition.validatedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)
    }

    fun participantIdForUser(
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
}
