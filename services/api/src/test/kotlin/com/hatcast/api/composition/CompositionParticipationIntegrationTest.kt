package com.hatcast.api.composition

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompositionParticipationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var notificationPort: CompositionNotificationPort

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

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var declineRepository: EventCompositionDeclineRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Participation Test",
            )
        if (admin) {
            promoteToAdmin(googleSub)
        }
        return cookie
    }

    private fun promoteToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Participation season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        title: String,
        playerCount: Int = 1,
    ): UUID {
        val future = Instant.parse("2031-04-01T19:00:00Z")
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
                              "startsAt": "$future",
                              "roleSlots": { "player": $playerCount }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun createSeasonParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            ).id
    }

    private fun participantIdForUser(seasonId: UUID, googleSub: String): UUID {
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

    private fun seedValidatedComposition(
        eventId: UUID,
        participantId: UUID,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    private fun participationPath(seasonId: UUID, eventId: UUID): String =
        "/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0/participation"

    @Test
    @Tag("FR25")
    fun `confirm and pending keep assignee`() {
        val adminCookie = memberCookie("sub-part-confirm-admin", admin = true)
        val memberCookie = memberCookie("sub-part-confirm-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Confirm pending")
        val linkedId = participantIdForUser(seasonId, "sub-part-confirm-member")
        seedValidatedComposition(eventId, linkedId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(linkedId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("confirmed"))

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"pending"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(linkedId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))
    }

    @Test
    @Tag("FR25")
    fun `decline frees slot and records decline row`() {
        val adminCookie = memberCookie("sub-part-decline-admin", admin = true)
        val memberCookie = memberCookie("sub-part-decline-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Decline flow", playerCount = 2)
        val linkedId = participantIdForUser(seasonId, "sub-part-decline-member")
        seedValidatedComposition(eventId, linkedId)
        val user = userRepository.findByGoogleSub("sub-part-decline-member")!!
        user.gender = MemberGender.FEMALE
        userRepository.save(user)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined","note":"Indispo"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").doesNotExist())
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))
            .andExpect(jsonPath("$.declines.length()").value(1))
            .andExpect(jsonPath("$.declines[0].participantId").value(linkedId.toString()))
            .andExpect(jsonPath("$.declines[0].participantGender").value("female"))
            .andExpect(jsonPath("$.declines[0].note").value("Indispo"))

        val declines = declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId)
        assert(declines.size == 1)
        assert(declines[0].seasonParticipantId == linkedId)
    }

    @Test
    @Tag("FR28")
    fun `decline on partially filled composition yields gapsToFill`() {
        val adminCookie = memberCookie("sub-part-gaps-admin", admin = true)
        val memberCookie = memberCookie("sub-part-gaps-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Decline gaps", playerCount = 2)
        val linkedId = participantIdForUser(seasonId, "sub-part-gaps-member")
        seedValidatedComposition(eventId, linkedId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("gapsToFill"))
    }

    @Test
    @Tag("FR26")
    fun `organizer confirms foreign slot via proxy`() {
        val adminCookie = memberCookie("sub-part-proxy-confirm-admin", admin = true)
        memberCookie("sub-part-proxy-confirm-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Proxy confirm")
        val memberId = participantIdForUser(seasonId, "sub-part-proxy-confirm-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(memberId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("confirmed"))
    }

    @Test
    @Tag("FR26")
    fun `organizer proxy decline frees slot and records actor and subject`() {
        val adminCookie = memberCookie("sub-part-proxy-decline-admin", admin = true)
        memberCookie("sub-part-proxy-decline-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Proxy decline")
        val memberId = participantIdForUser(seasonId, "sub-part-proxy-decline-member")
        val adminUser = userRepository.findByGoogleSub("sub-part-proxy-decline-admin") ?: error("Missing admin")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined","note":"Proxy decline"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").doesNotExist())
            .andExpect(jsonPath("$.declines.length()").value(1))

        val declines = declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId)
        assert(declines.size == 1)
        assert(declines[0].seasonParticipantId == memberId)
        assert(declines[0].declinedByUserId == adminUser.id)
        assert(declines[0].declinedByUserId != userRepository.findByGoogleSub("sub-part-proxy-decline-member")?.id)
    }

    @Test
    @Tag("FR26")
    fun `organizer proxy decline on name-only assignee succeeds`() {
        val adminCookie = memberCookie("sub-part-proxy-nameonly-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Proxy name-only")
        val nameOnlyId = createSeasonParticipant(seasonId, "Name Only Player")
        seedValidatedComposition(eventId, nameOnlyId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").doesNotExist())

        val declines = declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId)
        assert(declines.size == 1)
        assert(declines[0].seasonParticipantId == nameOnlyId)
    }

    @Test
    @Tag("FR26")
    fun `organizer proxy on own linked slot still succeeds`() {
        val adminCookie = memberCookie("sub-part-proxy-own-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Proxy own slot")
        val adminParticipantId = participantIdForUser(seasonId, "sub-part-proxy-own-admin")
        seedValidatedComposition(eventId, adminParticipantId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(adminParticipantId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("confirmed"))
    }

    @Test
    @Tag("FR26")
    fun `season organizer can proxy confirm on foreign slot`() {
        val adminCookie = memberCookie("sub-part-proxy-season-org-admin", admin = true)
        val seasonOrganizerCookie = memberCookie("sub-part-proxy-season-org-user")
        val memberCookie = memberCookie("sub-part-proxy-season-org-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Season org proxy")
        val memberId = participantIdForUser(seasonId, "sub-part-proxy-season-org-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"sub-part-proxy-season-org-user@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(seasonOrganizerCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"pending"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(memberId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))
    }

    @Test
    @Tag("FR26")
    fun `event organizer can proxy confirm on foreign slot`() {
        val adminCookie = memberCookie("sub-part-proxy-event-org-admin", admin = true)
        val eventOrganizerCookie = memberCookie("sub-part-proxy-event-org-user")
        memberCookie("sub-part-proxy-event-org-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Event org proxy")
        val memberId = participantIdForUser(seasonId, "sub-part-proxy-event-org-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"sub-part-proxy-event-org-user@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(eventOrganizerCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(memberId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("confirmed"))
    }

    @Test
    fun `other member cannot update participation on foreign slot`() {
        val adminCookie = memberCookie("sub-part-forbidden-admin", admin = true)
        val ownerCookie = memberCookie("sub-part-forbidden-owner")
        val otherCookie = memberCookie("sub-part-forbidden-other")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Forbidden participation")
        val ownerId = participantIdForUser(seasonId, "sub-part-forbidden-owner")
        seedValidatedComposition(eventId, ownerId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(otherCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `participation before validate returns 409`() {
        val adminCookie = memberCookie("sub-part-unvalidated-admin", admin = true)
        val memberCookie = memberCookie("sub-part-unvalidated-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Unvalidated participation")
        val linkedId = participantIdForUser(seasonId, "sub-part-unvalidated-member")
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = null,
                publishedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = linkedId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `note longer than 500 returns 400`() {
        val adminCookie = memberCookie("sub-part-note-admin", admin = true)
        val memberCookie = memberCookie("sub-part-note-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Note length")
        val linkedId = participantIdForUser(seasonId, "sub-part-note-member")
        seedValidatedComposition(eventId, linkedId)
        val longNote = "x".repeat(501)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined","note":"$longNote"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `assign when locked still returns 409`() {
        val adminCookie = memberCookie("sub-part-assign-locked-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Assign locked")
        val p1 = createSeasonParticipant(seasonId, "Locked Alice")
        val p2 = createSeasonParticipant(seasonId, "Locked Bob")
        seedValidatedComposition(eventId, p1)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$p2"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `participation on freed slot after decline returns 409`() {
        val adminCookie = memberCookie("sub-part-empty-slot-admin", admin = true)
        val memberCookie = memberCookie("sub-part-empty-slot-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Empty slot participation")
        val linkedId = participantIdForUser(seasonId, "sub-part-empty-slot-member")
        seedValidatedComposition(eventId, linkedId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `composition GET includes viewerParticipantIds for linked member`() {
        val adminCookie = memberCookie("sub-part-viewer-admin", admin = true)
        val memberCookie = memberCookie("sub-part-viewer-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Viewer ids")
        val linkedId = participantIdForUser(seasonId, "sub-part-viewer-member")
        seedValidatedComposition(eventId, linkedId)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.viewerParticipantIds[0]").value(linkedId.toString()))
    }
}
