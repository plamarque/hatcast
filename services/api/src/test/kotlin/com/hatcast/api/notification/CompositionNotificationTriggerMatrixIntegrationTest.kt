package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.CompositionService
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

/**
 * Canonical dispatch-intent matrix for composition + proxy notification triggers.
 * Design: _bmad-output/implementation-artifacts/investigations/composition-notification-trigger-test-design.md
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("notification-trigger-matrix")
@Import(CompositionNotificationTriggerMatrixIntegrationTest.RollbackTestConfig::class)
class CompositionNotificationTriggerMatrixIntegrationTest {
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
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var seasonParticipantRepository: com.hatcast.api.participant.SeasonParticipantRepository

    @Autowired
    private lateinit var rollbackProbe: ValidateCompositionRollbackProbe

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        org.mockito.kotlin.reset(notificationDispatcher)
    }

    // --- M-D1 draft manual assign ---

    @Test
    fun `M-D1 draft manual assign does not dispatch composition intents`() {
        val admin = adminCookie("sub-matrix-draft-assign-admin")
        val member = memberCookie("sub-matrix-draft-assign-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        setAvailability(member, seasonId, eventId, "available")
        val assigneeId = participantIdForUser(seasonId, "sub-matrix-draft-assign-member")

        mockMvc
            .perform(
                put(slotPath(seasonId, eventId, 0))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$assigneeId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verifyNoCompositionNotificationIntents()
    }

    // --- M-D2 draft full draw ---

    @Test
    fun `M-D2 draft full draw does not dispatch confirmation`() {
        val admin = adminCookie("sub-matrix-draft-draw-admin")
        val m1 = memberCookie("sub-matrix-draft-draw-m1")
        val m2 = memberCookie("sub-matrix-draft-draw-m2")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        setAvailability(m1, seasonId, eventId, "available")
        setAvailability(m2, seasonId, eventId, "available")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.CONFIRMATION_REQUEST },
        )
    }

    // --- M-V1 first validate ---

    @Test
    fun `M-V1 first validate dispatches confirmation only not team FYI`() {
        val admin = adminCookie("sub-matrix-validate-admin")
        memberCookie("sub-matrix-validate-a")
        memberCookie("sub-matrix-validate-b")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val a = participantIdForUser(seasonId, "sub-matrix-validate-a")
        val b = participantIdForUser(seasonId, "sub-matrix-validate-b")
        seedDraftSlots(eventId, listOf(a, b))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST &&
                    assigneeParticipantIds.toSet() == setOf(a, b)
            },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_VALIDATED_FYI },
        )
    }

    // --- M-RB validate rollback ---

    @Test
    fun `M-RB validate rollback does not dispatch any intent`() {
        val googleSub = "sub-matrix-rollback-admin"
        val admin = adminCookie(googleSub)
        memberCookie("sub-matrix-rollback-assignee")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val assigneeId = participantIdForUser(seasonId, "sub-matrix-rollback-assignee")
        seedDraftSlots(eventId, listOf(assigneeId))
        org.mockito.kotlin.reset(notificationDispatcher)
        val principal = adminPrincipal(googleSub)

        assertThrows(IllegalStateException::class.java) {
            rollbackProbe.validateThenFail(seasonId, eventId, principal)
        }

        verify(notificationDispatcher, never()).dispatch(any())
    }

    // --- M-PUB publish draft ---

    @Test
    fun `M-PUB publish draft composition does not dispatch member notifications`() {
        val admin = adminCookie("sub-matrix-publish-admin")
        memberCookie("sub-matrix-publish-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, openAvailability = false)
        val participantId = participantIdForUser(seasonId, "sub-matrix-publish-member")
        seedDraftSlots(eventId, listOf(participantId))
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST ||
                    intent == NotificationIntent.AVAILABILITY_OPENED
            },
        )
    }

    // --- M-G1 gap-fill assign ---

    @Test
    fun `M-G1 validated gap assign dispatches confirmation to new assignee`() {
        val admin = adminCookie("sub-matrix-gap-admin")
        val filler = memberCookie("sub-matrix-gap-filler")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        setAvailability(filler, seasonId, eventId, "available")
        val occupantId = createSeasonParticipant(seasonId, "Occupant")
        val fillerId = participantIdForUser(seasonId, "sub-matrix-gap-filler")
        seedValidatedOneFilledSlot(eventId, occupantId)

        mockMvc
            .perform(
                put(slotPath(seasonId, eventId, 1))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$fillerId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST &&
                    assigneeParticipantIds == listOf(fillerId)
            },
        )
    }

    // --- M-U1 unlock ---

    @Test
    fun `M-U1 unlock does not dispatch reconfirmation or FYI`() {
        val admin = adminCookie("sub-matrix-unlock-admin")
        memberCookie("sub-matrix-unlock-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val assigneeId = participantIdForUser(seasonId, "sub-matrix-unlock-member")
        seedDraftSlots(eventId, listOf(assigneeId))
        validate(admin, seasonId, eventId)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.RECONFIRMATION_REQUEST ||
                    intent == NotificationIntent.TEAM_VALIDATED_FYI
            },
        )
    }

    // --- M-E1 replace slot post-unlock ---

    @Test
    fun `M-E1 draft replace after unlock does not dispatch removal or reconfirmation`() {
        val admin = adminCookie("sub-matrix-replace-admin")
        memberCookie("sub-matrix-replace-former")
        val newcomer = memberCookie("sub-matrix-replace-new")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val formerId = participantIdForUser(seasonId, "sub-matrix-replace-former")
        val newId = participantIdForUser(seasonId, "sub-matrix-replace-new")
        seedDraftSlots(eventId, listOf(formerId))
        validate(admin, seasonId, eventId)
        unlock(admin, seasonId, eventId)
        setAvailability(newcomer, seasonId, eventId, "available")
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                put(slotPath(seasonId, eventId, 0))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$newId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.REMOVED_FROM_COMPOSITION ||
                    intent == NotificationIntent.RECONFIRMATION_REQUEST
            },
        )
    }

    // --- M-E2 clear slot post-unlock ---

    @Test
    fun `M-G2 validated fillEmpty draw dispatches confirmation to new assignee`() {
        val admin = adminCookie("sub-matrix-gap-draw-admin")
        val filler = memberCookie("sub-matrix-gap-draw-filler")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        setAvailability(filler, seasonId, eventId, "available")
        val fillerId = participantIdForUser(seasonId, "sub-matrix-gap-draw-filler")
        val occupantId = createSeasonParticipant(seasonId, "Gap Draw Occupant")
        seedValidatedOneFilledSlot(eventId, occupantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/draw")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"fillEmpty"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST &&
                    assigneeParticipantIds == listOf(fillerId)
            },
        )
    }

    @Test
    fun `M-E2 draft clear after unlock does not dispatch removal`() {
        val admin = adminCookie("sub-matrix-clear-admin")
        memberCookie("sub-matrix-clear-former")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        val formerId = participantIdForUser(seasonId, "sub-matrix-clear-former")
        val keptId = createSeasonParticipant(seasonId, "Clear Kept")
        seedDraftSlots(eventId, listOf(formerId, keptId))
        validate(admin, seasonId, eventId)
        unlock(admin, seasonId, eventId)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                put(slotPath(seasonId, eventId, 0))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.REMOVED_FROM_COMPOSITION },
        )
    }

    // --- M-R1 revalidate ---

    @Test
    fun `M-R1 revalidate dispatches reconfirmation to pending assignees not FYI`() {
        val admin = adminCookie("sub-matrix-reval-admin")
        memberCookie("sub-matrix-reval-assignee")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val assigneeId = participantIdForUser(seasonId, "sub-matrix-reval-assignee")
        seedDraftSlots(eventId, listOf(assigneeId))
        validate(admin, seasonId, eventId)
        unlock(admin, seasonId, eventId)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.RECONFIRMATION_REQUEST &&
                    assigneeParticipantIds == listOf(assigneeId)
            },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST ||
                    intent == NotificationIntent.TEAM_VALIDATED_FYI
            },
        )
    }

    // --- M-P1 / M-P2 proxy availability ---

    @Test
    fun `M-P1 proxy availability defers dispatch until roles recorded`() {
        val admin = adminCookie("sub-matrix-proxy-avail-admin")
        memberCookie("sub-matrix-proxy-avail-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val participantId = participantIdForUser(seasonId, "sub-matrix-proxy-avail-member")
        val memberUserId = subjectUserId("sub-matrix-proxy-avail-member")
        val path = proxyAvailabilityPath(seasonId, eventId, participantId)

        mockMvc
            .perform(
                put(path)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":[]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED },
        )

        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                put(path)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED &&
                    subjectUserId == memberUserId
            },
        )
    }

    // --- M-P5 draft proxy participation (silent) ---

    @Test
    fun `M-P5 draft proxy confirm and decline do not dispatch composition intents`() {
        val admin = adminCookie("sub-matrix-draft-proxy-admin")
        memberCookie("sub-matrix-draft-proxy-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-matrix-draft-proxy-member")
        seedDraftSlots(eventId, listOf(memberId))
        validate(admin, seasonId, eventId)
        unlock(admin, seasonId, eventId)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verifyNoCompositionNotificationIntents()
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED },
        )

        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verifyNoCompositionNotificationIntents()
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED },
        )
    }

    // --- M-R2 revalidate selective after unlock ---

    @Test
    fun `M-R2 revalidate after unlock notifies only non-confirmed assignees`() {
        val admin = adminCookie("sub-matrix-r2-admin")
        memberCookie("sub-matrix-r2-alice")
        memberCookie("sub-matrix-r2-bob")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId, playerCount = 2)
        val aliceId = participantIdForUser(seasonId, "sub-matrix-r2-alice")
        val bobId = participantIdForUser(seasonId, "sub-matrix-r2-bob")
        seedDraftSlots(eventId, listOf(aliceId, bobId))
        validate(admin, seasonId, eventId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        unlock(admin, seasonId, eventId)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.RECONFIRMATION_REQUEST &&
                    assigneeParticipantIds == listOf(bobId)
            },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST ||
                    intent == NotificationIntent.TEAM_VALIDATED_FYI
            },
        )
    }

    // --- M-P3 / M-P4 proxy participation ---

    @Test
    fun `M-P3 proxy confirm on validated slot dispatches proxy confirmation recorded`() {
        val admin = adminCookie("sub-matrix-proxy-conf-admin")
        memberCookie("sub-matrix-proxy-conf-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-matrix-proxy-conf-member")
        val memberUserId = subjectUserId("sub-matrix-proxy-conf-member")
        seedValidatedOneFilledSlot(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED &&
                    subjectUserId == memberUserId &&
                    roleKey == "player" &&
                    proxyChangeSummary is ProxyChangeSummary.Participation &&
                    (proxyChangeSummary as ProxyChangeSummary.Participation).decisionLabel == "Confirmé"
            },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.CONFIRMATION_REQUEST },
        )
    }

    @Test
    fun `M-P4 proxy decline on validated slot dispatches proxy confirmation recorded`() {
        val admin = adminCookie("sub-matrix-proxy-decline-admin")
        memberCookie("sub-matrix-proxy-decline-member")
        val seasonId = createSeason(admin)
        ensureParticipants(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-matrix-proxy-decline-member")
        val memberUserId = subjectUserId("sub-matrix-proxy-decline-member")
        seedValidatedOneFilledSlot(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED &&
                    subjectUserId == memberUserId &&
                    proxyChangeSummary is ProxyChangeSummary.Participation &&
                    (proxyChangeSummary as ProxyChangeSummary.Participation).decisionLabel == "Décliné"
            },
        )
    }

    private fun verifyNoCompositionNotificationIntents() {
        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST ||
                    intent == NotificationIntent.RECONFIRMATION_REQUEST ||
                    intent == NotificationIntent.REMOVED_FROM_COMPOSITION ||
                    intent == NotificationIntent.TEAM_VALIDATED_FYI
            },
        )
    }

    private fun slotPath(seasonId: UUID, eventId: UUID, slotIndex: Int): String =
        "/v1/seasons/$seasonId/events/$eventId/composition/slots/player/$slotIndex"

    private fun participationPath(seasonId: UUID, eventId: UUID): String =
        "/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0/participation"

    private fun proxyAvailabilityPath(seasonId: UUID, eventId: UUID, participantId: UUID): String =
        "/v1/seasons/$seasonId/events/$eventId/availability/participants/$participantId"

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
            name = "Matrix Test",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Matrix notification season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        playerCount: Int = 1,
        openAvailability: Boolean = true,
    ): UUID {
        val future = Instant.parse("2032-08-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Matrix notification event",
                              "startsAt": "$future",
                              "roleSlots": { "player": $playerCount }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        if (openAvailability) {
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                        .cookie(cookie)
                        .with(csrf()),
                ).andExpect(status().isOk)
        }
        return eventId
    }

    private fun adminPrincipal(googleSub: String): SessionUserPrincipal {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        return SessionUserPrincipal(
            userId = user.id,
            googleSub = googleSub,
            idpUid = user.idpUid,
            email = user.email,
        )
    }

    private fun subjectUserId(googleSub: String): UUID =
        userRepository.findByGoogleSub(googleSub)?.id ?: error("Missing user")

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

    private fun createSeasonParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val row =
            com.hatcast.api.participant.SeasonParticipantEntity(
                season = season,
                displayName = label,
            )
        return seasonParticipantRepository.save(row).id
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

    private fun seedValidatedOneFilledSlot(eventId: UUID, participantId: UUID) {
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
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    private fun validate(admin: jakarta.servlet.http.Cookie, seasonId: UUID, eventId: UUID) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun unlock(admin: jakarta.servlet.http.Cookie, seasonId: UUID, eventId: UUID) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    @TestConfiguration
    class RollbackTestConfig {
        @Bean
        fun validateCompositionRollbackProbe(compositionService: CompositionService): ValidateCompositionRollbackProbe =
            ValidateCompositionRollbackProbe(compositionService)
    }
}

@Service
class ValidateCompositionRollbackProbe(
    private val compositionService: CompositionService,
) {
    @Transactional
    fun validateThenFail(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        compositionService.validateComposition(seasonId, eventId, principal)
        throw IllegalStateException("forced rollback for test")
    }
}
