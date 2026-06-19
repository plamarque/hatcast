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
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
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
class CompositionGapFillIntegrationTest {
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
                name = "Gap Fill Test",
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
                        .content("""{"title":"Gap fill season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        playerCount: Int = 2,
    ): UUID {
        val future = Instant.parse("2031-05-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Gap fill event",
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

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        status: String,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"$status","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
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

    private fun seedValidatedWithOneFilledSlot(
        eventId: UUID,
        filledParticipantId: UUID,
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
                seasonParticipantId = filledParticipantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    @Test
    @Tag("FR27")
    fun `validated fillEmpty draw fills only empty slots and notifies new assignees`() {
        val adminCookie = memberCookie("sub-gap-admin-draw", admin = true)
        val member1 = memberCookie("sub-gap-member-1")
        val member2 = memberCookie("sub-gap-member-2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, playerCount = 2)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")
        val p1 = participantIdForUser(seasonId, "sub-gap-member-1")
        val p2 = participantIdForUser(seasonId, "sub-gap-member-2")
        seedValidatedWithOneFilledSlot(eventId, p1)

        whenever(
            notificationPort.requestConfirmationForAssignees(
                any(),
                any(),
                any(),
                any(),
            ),
        ).then { }

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"fillEmpty"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.composition.slots[?(@.slotIndex == 1)].participantId").exists())

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)

        verify(notificationPort).requestConfirmationForAssignees(
            eq(eventId),
            eq(seasonId),
            eq(listOf(p2)),
            any(),
        )
    }

    @Test
    @Tag("FR27")
    fun `validated candidates for occupied slot index returns 409 when role has other empty slot`() {
        val adminCookie = memberCookie("sub-gap-admin-candidates", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, playerCount = 2)
        val occupantId = createSeasonParticipant(seasonId, "Occupant")
        seedValidatedWithOneFilledSlot(eventId, occupantId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                    .param("roleKey", "player")
                    .param("slotIndex", "0")
                    .cookie(adminCookie),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                    .param("roleKey", "player")
                    .param("slotIndex", "1")
                    .cookie(adminCookie),
            ).andExpect(status().isOk)
    }

    @Test
    @Tag("FR27")
    fun `validated assign to empty slot succeeds occupied slot returns 409 and clear succeeds`() {
        val adminCookie = memberCookie("sub-gap-admin-assign", admin = true)
        val member = memberCookie("sub-gap-member-assign")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, playerCount = 2)
        setAvailability(member, seasonId, eventId, "available")
        val fillerId = participantIdForUser(seasonId, "sub-gap-member-assign")
        val occupantId = createSeasonParticipant(seasonId, "Occupant")
        seedValidatedWithOneFilledSlot(eventId, occupantId)

        whenever(
            notificationPort.requestConfirmationForAssignees(any(), any(), any(), any()),
        ).then { }

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/composition/candidates")
                    .param("roleKey", "player")
                    .cookie(adminCookie),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/1")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$fillerId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[?(@.slotIndex == 1)].participantId").value(fillerId.toString()))

        verify(notificationPort).requestConfirmationForAssignees(
            eq(eventId),
            eq(seasonId),
            eq(listOf(fillerId)),
            any(),
        )

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$fillerId"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/1")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    @Test
    @Tag("FR27")
    fun `restore decline assigns empty slot and removes decline row`() {
        val adminCookie = memberCookie("sub-gap-admin-restore", admin = true)
        val member = memberCookie("sub-gap-member-restore")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, playerCount = 1)
        setAvailability(member, seasonId, eventId, "available")
        val declinedId = participantIdForUser(seasonId, "sub-gap-member-restore")
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
        val decline =
            declineRepository.save(
                EventCompositionDeclineEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = declinedId,
                    eventParticipantId = null,
                    declinedByUserId = userRepository.findByGoogleSub("sub-gap-member-restore")!!.id,
                    declinedAt = now,
                    note = null,
                ),
            )

        whenever(
            notificationPort.requestConfirmationForAssignees(any(), any(), any(), any()),
        ).then { }

        mockMvc
            .perform(
                post(
                    "/v1/seasons/$seasonId/events/$eventId/composition/declines/${decline.id}/restore",
                )
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(declinedId.toString()))
            .andExpect(jsonPath("$.declines").isEmpty)

        assertTrue(declineRepository.findById(decline.id).isEmpty)

        verify(notificationPort).requestConfirmationForAssignees(
            eq(eventId),
            eq(seasonId),
            eq(listOf(declinedId)),
            any(),
        )
    }

    @Test
    @Tag("FR27")
    fun `restore decline returns 409 when no empty slot for role`() {
        val adminCookie = memberCookie("sub-gap-admin-restore-409", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, playerCount = 1)
        val occupantId = createSeasonParticipant(seasonId, "Still there")
        val declinedId = createSeasonParticipant(seasonId, "Declined")
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
                seasonParticipantId = occupantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
        val decline =
            declineRepository.save(
                EventCompositionDeclineEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = declinedId,
                    eventParticipantId = null,
                    declinedByUserId = userRepository.findByGoogleSub("sub-gap-admin-restore-409")!!.id,
                    declinedAt = now,
                    note = null,
                ),
            )

        mockMvc
            .perform(
                post(
                    "/v1/seasons/$seasonId/events/$eventId/composition/declines/${decline.id}/restore",
                )
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR27")
    fun `lifecycle moves toward awaiting confirmations after gap fill`() {
        val adminCookie = memberCookie("sub-gap-admin-lifecycle", admin = true)
        val member = memberCookie("sub-gap-member-lifecycle")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, playerCount = 1)
        setAvailability(member, seasonId, eventId, "available")
        val fillerId = participantIdForUser(seasonId, "sub-gap-member-lifecycle")
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

        whenever(
            notificationPort.requestConfirmationForAssignees(any(), any(), any(), any()),
        ).then { }

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$fillerId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots.length()").value(1))
            .andExpect(jsonPath("$.slots[0].participantId").value(fillerId.toString()))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("awaitingConfirmations"))
    }
}
