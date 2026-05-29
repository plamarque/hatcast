package com.hatcast.api.composition

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.eq
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
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.stereotype.Service
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(CompositionPublishNotificationIntegrationTest.RollbackTestConfig::class)
class CompositionPublishNotificationIntegrationTest {
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
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var rollbackProbe: PublishCompositionRollbackProbe

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetNotificationMocks() {
        org.mockito.kotlin.reset(notificationPort)
    }

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Publish Notification Test",
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

    private fun adminPrincipal(googleSub: String): SessionUserPrincipal {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        return SessionUserPrincipal(
            userId = user.id,
            googleSub = googleSub,
            idpUid = user.idpUid,
            email = user.email,
        )
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Publish notification season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
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
                              "title": "Publish notification event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 2 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
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

    private fun seedDraftComposition(eventId: UUID, participantId: UUID) {
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
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    @Test
    fun `first publish invokes publishDraftCompositionShared exactly once after commit`() {
        val googleSub = "sub-publish-notif-admin-1"
        val adminCookie = memberCookie(googleSub, admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createSeasonParticipant(seasonId, "Notify Alice")
        seedDraftComposition(eventId, participantId)
        val actorUserId = adminPrincipal(googleSub).userId

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationPort, times(1)).publishDraftCompositionShared(
            eq(eventId),
            eq(seasonId),
            eq(actorUserId),
        )
    }

    @Test
    fun `idempotent publish does not emit additional notification`() {
        val googleSub = "sub-publish-notif-admin-2"
        val adminCookie = memberCookie(googleSub, admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createSeasonParticipant(seasonId, "Notify Bob")
        seedDraftComposition(eventId, participantId)
        val actorUserId = adminPrincipal(googleSub).userId

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationPort, times(1)).publishDraftCompositionShared(
            eq(eventId),
            eq(seasonId),
            eq(actorUserId),
        )
    }

    @Test
    fun `publish rollback does not invoke publishDraftCompositionShared`() {
        val googleSub = "sub-publish-notif-admin-3"
        val adminCookie = memberCookie(googleSub, admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createSeasonParticipant(seasonId, "Notify Carol")
        seedDraftComposition(eventId, participantId)
        val principal = adminPrincipal(googleSub)

        assertThrows(IllegalStateException::class.java) {
            rollbackProbe.publishThenFail(seasonId, eventId, principal)
        }

        verify(notificationPort, never()).publishDraftCompositionShared(
            eq(eventId),
            eq(seasonId),
            eq(principal.userId),
        )
    }

    @TestConfiguration
    class RollbackTestConfig {
        @Bean
        fun publishCompositionRollbackProbe(compositionService: CompositionService): PublishCompositionRollbackProbe =
            PublishCompositionRollbackProbe(compositionService)
    }
}

@Service
class PublishCompositionRollbackProbe(
    private val compositionService: CompositionService,
) {
    @Transactional
    fun publishThenFail(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        compositionService.publishComposition(seasonId, eventId, principal)
        throw IllegalStateException("forced rollback for test")
    }
}
