package com.hatcast.api.audit

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID
import jakarta.servlet.http.Cookie

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuditEventReadIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var auditEventRepository: AuditEventRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun cleanAudit() {
        auditEventRepository.deleteAll()
    }

    private fun sessionCookie(googleSub: String): Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Audit Reader",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
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

    private fun createSeason(cookie: Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Audit read season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun seedSeasonRow(
        seasonId: UUID,
        actionType: AuditActionType,
        actorUserId: UUID? = null,
    ) {
        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T12:00:00Z"),
                actorUserId = actorUserId,
                actionType = actionType,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = null,
                beforeJson = mapOf("displayName" to "A"),
                afterJson = mapOf("displayName" to "B"),
            ),
        )
    }

    @Test
    fun `troupe admin can list troupe audit with pagination`() {
        val adminSub = "audit-read-admin-${UUID.randomUUID()}"
        val cookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(cookie)
        seedSeasonRow(seasonId, AuditActionType.SEASON_PARTICIPANT_ADDED)

        val res =
            mockMvc
                .perform(
                    get("/v1/audit/events")
                        .param("troupeId", seedTroupeId.toString())
                        .param("page", "0")
                        .param("size", "10")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andReturn()

        val json = mapper.readTree(res.response.contentAsString)
        assertTrue(json.get("content").size() >= 1)
        assertEquals(0, json.get("page").asInt())
    }

    @Test
    fun `regular member cannot read troupe audit`() {
        val adminSub = "audit-read-admin-${UUID.randomUUID()}"
        val adminCookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(adminCookie)
        seedSeasonRow(seasonId, AuditActionType.SEASON_PARTICIPANT_ADDED)

        val memberSub = "audit-read-member-${UUID.randomUUID()}"
        val memberCookie = sessionCookie(memberSub)

        mockMvc
            .perform(
                get("/v1/audit/events")
                    .param("troupeId", seedTroupeId.toString())
                    .cookie(memberCookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `season organizer can query season audit scope`() {
        val adminSub = "audit-read-admin-${UUID.randomUUID()}"
        val adminCookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(adminCookie)

        val organizerSub = "audit-read-orga-${UUID.randomUUID()}"
        val organizerEmail = "$organizerSub@example.com"
        sessionCookie(organizerSub)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$organizerEmail"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val organizerCookie = sessionCookie(organizerSub)
        seedSeasonRow(seasonId, AuditActionType.SEASON_PARTICIPANT_ADDED)

        mockMvc
            .perform(
                get("/v1/audit/events")
                    .param("troupeId", seedTroupeId.toString())
                    .param("seasonId", seasonId.toString())
                    .cookie(organizerCookie),
            ).andExpect(status().isOk)

        val perms =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/permissions/me")
                        .cookie(organizerCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val permsJson = mapper.readTree(perms.response.contentAsString)
        assertTrue(permsJson.get("isSeasonOrganizer").asBoolean())
        assertTrue(permsJson.get("canViewAuditSeason").asBoolean())
    }

    @Test
    fun `permissions include canViewAudit flags`() {
        val adminSub = "audit-read-perms-${UUID.randomUUID()}"
        val cookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(cookie)

        val res =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/permissions/me")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andReturn()

        val json = mapper.readTree(res.response.contentAsString)
        assertTrue(json.get("canViewAuditTroupe").asBoolean())
        assertTrue(json.get("canViewAuditSeason").asBoolean())
        assertTrue(json.get("canViewAuditEvent").asBoolean())
    }

    @Test
    fun `event audit can filter rows by participant subject or actor`() {
        val adminSub = "audit-read-filter-${UUID.randomUUID()}"
        val cookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(cookie)

        val eventRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Audit filter event","templateType":"cabaret","startsAt":"2032-06-01T19:00:00Z"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(eventRes.response.contentAsString).get("id").asText())

        val participantA = UUID.randomUUID()
        val participantB = UUID.randomUUID()
        val userA = userRepository.findByGoogleSub(adminSub)!!.id

        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T10:00:00Z"),
                actorUserId = userA,
                subjectSeasonParticipantId = participantA,
                actionType = AuditActionType.AVAILABILITY_UPDATED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = eventId,
            ),
        )
        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T11:00:00Z"),
                actorUserId = userA,
                subjectSeasonParticipantId = participantB,
                actionType = AuditActionType.AVAILABILITY_UPDATED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = eventId,
            ),
        )

        val filtered =
            mockMvc
                .perform(
                    get("/v1/audit/events")
                        .param("troupeId", seedTroupeId.toString())
                        .param("seasonId", seasonId.toString())
                        .param("eventId", eventId.toString())
                        .param("participantSeasonParticipantId", participantA.toString())
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andReturn()

        val json = mapper.readTree(filtered.response.contentAsString)
        assertEquals(1, json.get("totalElements").asInt())
        assertEquals(1, json.get("content").size())
    }

    @Test
    fun `platform admin can read troupe audit without membership`() {
        val troupeAdminSub = "audit-read-platform-troupe-${UUID.randomUUID()}"
        val troupeAdminCookie = sessionCookie(troupeAdminSub)
        promoteToAdmin(troupeAdminSub)
        val seasonId = createSeason(troupeAdminCookie)
        seedSeasonRow(seasonId, AuditActionType.SEASON_PARTICIPANT_ADDED)

        val platformCookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-delete-platform-1",
                email = "platform-admin@hatcast.test",
                name = "Platform Audit",
            )

        val res =
            mockMvc
                .perform(
                    get("/v1/audit/events")
                        .param("troupeId", seedTroupeId.toString())
                        .param("page", "0")
                        .param("size", "10")
                        .cookie(platformCookie),
                ).andExpect(status().isOk)
                .andReturn()

        val json = mapper.readTree(res.response.contentAsString)
        assertTrue(json.get("content").size() >= 1)
    }

    @Test
    fun `event organizer reads only organized event audit rows`() {
        val adminSub = "audit-read-ev-orga-admin-${UUID.randomUUID()}"
        val adminCookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(adminCookie)

        fun createEvent(title: String): UUID {
            val eventRes =
                mockMvc
                    .perform(
                        post("/v1/seasons/$seasonId/events")
                            .cookie(adminCookie)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(
                                """{"title":"$title","templateType":"cabaret","startsAt":"2032-06-01T19:00:00Z"}""",
                            ).with(csrf()),
                    ).andExpect(status().isOk)
                    .andReturn()
            return UUID.fromString(mapper.readTree(eventRes.response.contentAsString).get("id").asText())
        }

        val organizedEventId = createEvent("Organized show")
        val otherEventId = createEvent("Other show")

        val organizerSub = "audit-read-ev-orga-${UUID.randomUUID()}"
        val organizerEmail = "$organizerSub@example.com"
        sessionCookie(organizerSub)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$organizedEventId/organizers")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$organizerEmail"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val organizerCookie = sessionCookie(organizerSub)

        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T10:00:00Z"),
                actionType = AuditActionType.EVENT_UPDATED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = organizedEventId,
            ),
        )
        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T11:00:00Z"),
                actionType = AuditActionType.EVENT_UPDATED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = otherEventId,
            ),
        )

        val scoped =
            mockMvc
                .perform(
                    get("/v1/audit/events")
                        .param("troupeId", seedTroupeId.toString())
                        .param("seasonId", seasonId.toString())
                        .param("eventId", organizedEventId.toString())
                        .cookie(organizerCookie),
                ).andExpect(status().isOk)
                .andReturn()

        val scopedJson = mapper.readTree(scoped.response.contentAsString)
        assertTrue(scopedJson.get("totalElements").asInt() >= 1)
        scopedJson.get("content").forEach { row ->
            assertEquals(organizedEventId.toString(), row.get("scope").get("eventId").asText())
        }

        mockMvc
            .perform(
                get("/v1/audit/events")
                    .param("troupeId", seedTroupeId.toString())
                    .param("seasonId", seasonId.toString())
                    .param("eventId", otherEventId.toString())
                    .cookie(organizerCookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `participant moi filter includes system lifecycle rows on event`() {
        val adminSub = "audit-read-lifecycle-${UUID.randomUUID()}"
        val adminCookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(adminCookie)

        val memberSub = "audit-read-lifecycle-member-${UUID.randomUUID()}"
        val memberEmail = "$memberSub@example.com"
        sessionCookie(memberSub)
        val memberUserId = userRepository.findByGoogleSub(memberSub)!!.id

        val participantRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Lifecycle Member","email":"$memberEmail"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId =
            UUID.fromString(mapper.readTree(participantRes.response.contentAsString).get("id").asText())

        val eventRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Lifecycle event","templateType":"cabaret","startsAt":"2032-06-01T19:00:00Z"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(eventRes.response.contentAsString).get("id").asText())

        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T12:00:00Z"),
                actorUserId = null,
                actionType = AuditActionType.COMPOSITION_LIFECYCLE_CHANGED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = eventId,
                beforeJson = mapOf("compositionLifecycle" to "awaitingConfirmations"),
                afterJson = mapOf("compositionLifecycle" to "complete"),
            ),
        )
        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T12:01:00Z"),
                actorUserId = memberUserId,
                subjectSeasonParticipantId = participantId,
                actionType = AuditActionType.AVAILABILITY_UPDATED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
                eventId = eventId,
            ),
        )

        val memberCookie = sessionCookie(memberSub)

        val memberRes =
            mockMvc
                .perform(
                    get("/v1/audit/events")
                        .param("troupeId", seedTroupeId.toString())
                        .param("seasonId", seasonId.toString())
                        .param("eventId", eventId.toString())
                        .param("participantSeasonParticipantId", participantId.toString())
                        .cookie(memberCookie),
                ).andExpect(status().isOk)
                .andReturn()

        val memberJson = mapper.readTree(memberRes.response.contentAsString)
        assertEquals(2, memberJson.get("totalElements").asInt())
        val types = memberJson.get("content").map { it.get("actionType").asText() }.toSet()
        assertTrue(types.contains("COMPOSITION_LIFECYCLE_CHANGED"))
        assertTrue(types.contains("AVAILABILITY_UPDATED"))
    }

    @Test
    fun `audit identity emails are obfuscated in API response`() {
        val adminSub = "audit-read-email-${UUID.randomUUID()}"
        val cookie = sessionCookie(adminSub)
        promoteToAdmin(adminSub)
        val seasonId = createSeason(cookie)
        val user = userRepository.findByGoogleSub(adminSub)!!

        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = Instant.parse("2032-06-01T12:00:00Z"),
                actorUserId = user.id,
                actionType = AuditActionType.SEASON_PARTICIPANT_ADDED,
                troupeId = seedTroupeId,
                seasonId = seasonId,
            ),
        )

        val res =
            mockMvc
                .perform(
                    get("/v1/audit/events")
                        .param("troupeId", seedTroupeId.toString())
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andReturn()

        val body = res.response.contentAsString
        assertFalse(body.contains("$adminSub@example.com"))
    }
}
