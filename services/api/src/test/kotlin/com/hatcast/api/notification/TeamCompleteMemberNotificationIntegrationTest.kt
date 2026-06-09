package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argThat
import org.mockito.kotlin.never
import org.mockito.kotlin.reset
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TeamCompleteMemberNotificationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var notificationDispatcher: NotificationDispatcher

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

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        reset(notificationDispatcher)
    }

    @Test
    fun `last confirmation on validated composition dispatches TEAM_COMPLETE_MEMBER`() {
        val admin = adminCookie("sub-team-complete-admin")
        val assigneeA = memberCookie("sub-team-complete-a")
        val assigneeB = memberCookie("sub-team-complete-b")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        val a = participantIdForUser(seasonId, "sub-team-complete-a")
        val b = participantIdForUser(seasonId, "sub-team-complete-b")
        seedValidatedSlots(eventId, listOf(a, b))

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(assigneeA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 1))
                    .cookie(assigneeB)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_VALIDATED_FYI },
        )
    }

    @Test
    fun `validate with all assignees already confirmed dispatches TEAM_COMPLETE_MEMBER only`() {
        val admin = adminCookie("sub-team-complete-validate-all-admin")
        memberCookie("sub-team-complete-validate-all-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-team-complete-validate-all-member")
        seedDraftSlots(eventId, listOf(memberId))

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.CONFIRMATION_REQUEST },
        )
        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
    }

    @Test
    fun `event organizer who is not assignee still triggers TEAM_COMPLETE_MEMBER on team complete`() {
        val admin = adminCookie("sub-team-complete-orga-only-admin")
        memberCookie("sub-team-complete-orga-only-orga")
        val assigneeA = memberCookie("sub-team-complete-orga-only-a")
        val assigneeB = memberCookie("sub-team-complete-orga-only-b")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        val a = participantIdForUser(seasonId, "sub-team-complete-orga-only-a")
        val b = participantIdForUser(seasonId, "sub-team-complete-orga-only-b")
        seedValidatedSlots(eventId, listOf(a, b))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"sub-team-complete-orga-only-orga@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(assigneeA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 1))
                    .cookie(assigneeB)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
    }

    @Test
    fun `event organizer who is also assignee triggers single TEAM_COMPLETE_MEMBER dispatch`() {
        val admin = adminCookie("sub-team-complete-dedupe-admin")
        val organizerAssignee = memberCookie("sub-team-complete-dedupe-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-team-complete-dedupe-member")
        seedValidatedOneSlot(eventId, memberId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"sub-team-complete-dedupe-member@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(organizerAssignee)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
    }

    @Test
    fun `waived slot on required position counts toward complete team notification`() {
        val admin = adminCookie("sub-team-complete-waived-admin")
        memberCookie("sub-team-complete-waived-a")
        val assigneeB = memberCookie("sub-team-complete-waived-b")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        val waivedId = participantIdForUser(seasonId, "sub-team-complete-waived-a")
        val pendingId = participantIdForUser(seasonId, "sub-team-complete-waived-b")
        seedValidatedWaivedAndPending(eventId, waivedParticipantId = waivedId, pendingParticipantId = pendingId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 1))
                    .cookie(assigneeB)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
    }

    @Test
    fun `decline after complete does not dispatch TEAM_COMPLETE_MEMBER`() {
        val admin = adminCookie("sub-team-complete-decline-admin")
        val assignee = memberCookie("sub-team-complete-decline-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-team-complete-decline-member")
        seedValidatedOneSlot(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(assignee)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        reset(notificationDispatcher)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(assignee)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
    }

    @Test
    fun `repeat confirm while already complete does not dispatch TEAM_COMPLETE_MEMBER again`() {
        val admin = adminCookie("sub-team-complete-repeat-admin")
        val assignee = memberCookie("sub-team-complete-repeat-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-team-complete-repeat-member")
        seedValidatedOneSlot(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(assignee)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        reset(notificationDispatcher)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId, 0))
                    .cookie(assignee)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_COMPLETE_MEMBER },
        )
    }

    private fun participationPath(seasonId: UUID, eventId: UUID, slotIndex: Int): String =
        "/v1/seasons/$seasonId/events/$eventId/composition/slots/player/$slotIndex/participation"

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie = memberCookie(googleSub)
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = "$googleSub@example.com",
            name = "Team Complete Test",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Team complete notifications"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        playerCount: Int = 1,
    ): UUID {
        val future = Instant.parse("2034-08-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Team complete test",
                              "startsAt": "$future",
                              "roleSlots": { "player": $playerCount }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
        return eventId
    }

    private fun ensureParticipants(seasonId: UUID) {
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())
    }

    private fun participantIdForUser(seasonId: UUID, googleSub: String): UUID {
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(
                seedTroupeId,
                userRepository.findByGoogleSub(googleSub)!!.id,
            )!!
        return seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)!!.id
    }

    private fun seedDraftSlots(eventId: UUID, assigneeIds: List<UUID>) {
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
        assigneeIds.forEachIndexed { index, id ->
            slotRepository.save(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = index,
                    seasonParticipantId = id,
                    participationStatus = SlotParticipationStatus.PENDING,
                ),
            )
        }
    }

    private fun seedValidatedSlots(eventId: UUID, assigneeIds: List<UUID>) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        assigneeIds.forEachIndexed { index, id ->
            slotRepository.save(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = index,
                    seasonParticipantId = id,
                    participationStatus = SlotParticipationStatus.PENDING,
                ),
            )
        }
    }

    private fun seedValidatedOneSlot(eventId: UUID, participantId: UUID) {
        seedValidatedSlots(eventId, listOf(participantId))
    }

    private fun seedValidatedWaivedAndPending(
        eventId: UUID,
        waivedParticipantId: UUID,
        pendingParticipantId: UUID,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = waivedParticipantId,
                participationStatus = SlotParticipationStatus.PENDING,
                waived = true,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 1,
                seasonParticipantId = pendingParticipantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }
}
