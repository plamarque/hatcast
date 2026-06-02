package com.hatcast.api.audit

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID
import jakarta.servlet.http.Cookie

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuditEventIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var auditEventRepository: AuditEventRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()
    private var currentGoogleSub: String = ""

    @BeforeEach
    fun cleanAudit() {
        auditEventRepository.deleteAll()
    }

    private fun adminCookie(googleSub: String): Cookie {
        currentGoogleSub = googleSub
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Audit Admin",
            )
        promoteToAdmin(googleSub)
        return cookie
    }

    private fun promoteToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun createSeason(cookie: Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Audit season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: Cookie,
        seasonId: UUID,
        title: String,
    ): UUID {
        val future = Instant.parse("2032-06-01T19:00:00Z")
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
                              "roleSlots": { "player": 2 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    @Test
    fun `availability self and proxy write audit entries`() {
        val cookie = adminCookie("audit-self-${UUID.randomUUID()}")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Audit dispo event")

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val afterSelfCreateCount = auditEventRepository.count()
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        assertEquals(afterSelfCreateCount, auditEventRepository.count())

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable","comment":"empêchement"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unknown"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val participantId = createNameOnlyParticipant(seasonId, "Proxy Target")
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/participants/$participantId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/participants/$participantId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"],"comment":"ok"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/participants/$participantId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unknown"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val events = auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId)
        assertTrue(
            events.any {
                it.actionType == AuditActionType.AVAILABILITY_CREATED &&
                    it.subjectUserId != null &&
                    it.afterJson?.get("status") == "available"
            },
        )
        assertTrue(
            events.any {
                it.actionType == AuditActionType.AVAILABILITY_UPDATED &&
                    it.subjectUserId != null &&
                    it.beforeJson?.get("status") == "available" &&
                    it.afterJson?.get("status") == "unavailable"
            },
        )
        assertTrue(
            events.any {
                it.actionType == AuditActionType.AVAILABILITY_DELETED &&
                    it.subjectUserId != null &&
                    it.beforeJson?.get("status") == "unavailable" &&
                    it.afterJson == null
            },
        )
        assertTrue(
            events.any {
                it.actionType == AuditActionType.AVAILABILITY_CREATED &&
                    it.subjectSeasonParticipantId == participantId &&
                    it.afterJson?.get("status") == "unavailable"
            },
        )
        assertTrue(
            events.any {
                it.actionType == AuditActionType.AVAILABILITY_UPDATED &&
                    it.subjectSeasonParticipantId == participantId &&
                    it.beforeJson?.get("status") == "unavailable" &&
                    it.afterJson?.get("status") == "available"
            },
        )
        assertTrue(
            events.any {
                it.actionType == AuditActionType.AVAILABILITY_DELETED &&
                    it.subjectSeasonParticipantId == participantId &&
                    it.beforeJson?.get("status") == "available" &&
                    it.afterJson == null
            },
        )
    }

    @Test
    fun `event create update archive write audit entries`() {
        val cookie = adminCookie("audit-event-${UUID.randomUUID()}")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Audit lifecycle")

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"title":"Audit lifecycle renamed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        val types = auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId).map { it.actionType }.toSet()
        assertTrue(AuditActionType.EVENT_CREATED in types)
        assertTrue(AuditActionType.EVENT_UPDATED in types)
        assertTrue(AuditActionType.EVENT_ARCHIVED in types)
    }

    @Test
    fun `season participant remove writes audit entry`() {
        val cookie = adminCookie("audit-roster-${UUID.randomUUID()}")
        val seasonId = createSeason(cookie)
        val participantId = createNameOnlyParticipant(seasonId, "To Remove")

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        val entries = auditEventRepository.findBySeasonIdOrderByOccurredAtDesc(seasonId)
        assertTrue(entries.any { it.actionType == AuditActionType.SEASON_PARTICIPANT_REMOVED })
    }

    @Test
    fun `organizer grant and revoke write audit entries`() {
        val admin = adminCookie("audit-orga-admin-${UUID.randomUUID()}")
        val seasonId = createSeason(admin)
        val targetSub = "audit-orga-target-${UUID.randomUUID()}"
        adminCookie(targetSub) // ensure user exists in DB with membership

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$targetSub@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val userId = userRepository.findByGoogleSub(targetSub)!!.id

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/organizers/$userId")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        val types = auditEventRepository.findBySeasonIdOrderByOccurredAtDesc(seasonId).map { it.actionType }
        assertTrue(AuditActionType.SEASON_ORGANIZER_GRANTED in types)
        assertTrue(AuditActionType.SEASON_ORGANIZER_REVOKED in types)
    }

    @Test
    fun `validate composition and confirm decline write audit entries`() {
        val cookie = adminCookie("audit-comp-${UUID.randomUUID()}")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Audit composition")
        setMyAvailability(cookie, seasonId, eventId)
        val participantId = participantIdForCookie(seasonId)

        assignSlot(cookie, seasonId, eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0/participation")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0/participation")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val types = auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId).map { it.actionType }.toSet()
        assertTrue(AuditActionType.COMPOSITION_VALIDATED in types)
        assertTrue(AuditActionType.PARTICIPATION_CONFIRMED in types)
        assertTrue(AuditActionType.PARTICIPATION_DECLINED in types)
    }

    @Test
    fun `correlated timeline shares event_id across action types`() {
        val cookie = adminCookie("audit-corr-${UUID.randomUUID()}")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Correlated event")

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val types = auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId).map { it.actionType }.toSet()
        assertTrue(types.size >= 2)
        assertTrue(AuditActionType.EVENT_CREATED in types)
        assertTrue(
            AuditActionType.AVAILABILITY_CREATED in types ||
                AuditActionType.AVAILABILITY_UPDATED in types,
        )
        auditEventRepository.findByEventIdOrderByOccurredAtDesc(eventId).forEach {
            assertEquals(eventId, it.eventId)
        }
    }

    @Test
    fun `failed mutation does not persist audit entry`() {
        val cookie = adminCookie("audit-rollback-${UUID.randomUUID()}")
        val seasonId = createSeason(cookie)
        val beforeCount = auditEventRepository.count()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/${UUID.randomUUID()}")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"title":"Should fail"}""")
                    .with(csrf()),
            ).andExpect(status().isNotFound)

        assertEquals(beforeCount, auditEventRepository.count())
    }

    private fun createNameOnlyParticipant(
        seasonId: UUID,
        label: String,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                    status = ParticipantStatus.ACTIVE,
                ),
            ).id
    }

    private fun setMyAvailability(
        cookie: Cookie,
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

    private fun participantIdForCookie(
        seasonId: UUID,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val user = userRepository.findByGoogleSub(currentGoogleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        return seasonParticipantRepository
            .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
            ?.id
            ?: error("Missing season participant")
    }

    private fun assignSlot(
        cookie: Cookie,
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
}
