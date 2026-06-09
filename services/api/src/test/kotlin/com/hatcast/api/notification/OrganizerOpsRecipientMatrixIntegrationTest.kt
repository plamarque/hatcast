package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.atLeastOnce
import org.mockito.kotlin.reset
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Pierrick (season organizer) + Charlene (event organizer) — story 8.4b CAP-5 / AC 15.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrganizerOpsRecipientMatrixIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var notificationDispatcher: NotificationDispatcher

    @Autowired
    private lateinit var recipientResolver: NotificationRecipientResolver

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        reset(notificationDispatcher)
    }

    @Test
    fun `pierrick receives draft signal charlene receives event operational audience`() {
        val admin = adminCookie("sub-matrix-admin")
        memberCookie("sub-matrix-pierrick", "pierrick-matrix@example.com", "Pierrick")
        memberCookie("sub-matrix-charlene", "charlene-matrix@example.com", "Charlene")
        val pierrickUserId = userRepository.findByGoogleSub("sub-matrix-pierrick")!!.id
        val charleneUserId = userRepository.findByGoogleSub("sub-matrix-charlene")!!.id

        val seasonId = createSeason(admin)
        grantSeasonOrganizer(admin, seasonId, "pierrick-matrix@example.com")
        val eventId = createDraftEvent(admin, seasonId)

        grantEventOrganizer(admin, seasonId, eventId, "charlene-matrix@example.com")
        removeEventOrganizer(admin, seasonId, eventId, pierrickUserId)

        assertEquals(
            listOf(pierrickUserId),
            recipientResolver.resolveSeasonOrganizerRecipients(seasonId).mapNotNull { it.userId },
        )
        assertEquals(
            listOf(charleneUserId),
            recipientResolver.resolveEventOrganizerRecipients(eventId).mapNotNull { it.userId },
        )

        reset(notificationDispatcher)
        createDraftEvent(admin, seasonId)

        val captor = argumentCaptor<NotificationDispatchContext>()
        verify(notificationDispatcher, atLeastOnce()).dispatch(captor.capture())
        val draftCtx =
            captor.allValues.last { it.intent == NotificationIntent.EVENT_DRAFT_CREATED }
        val draftRecipients =
            recipientResolver.resolveSeasonOrganizerRecipients(draftCtx.seasonId, draftCtx.actorUserId)
                .mapNotNull { it.userId }
        assertEquals(listOf(pierrickUserId), draftRecipients)
        assertFalse(draftRecipients.contains(charleneUserId))

        val compoRecipients = recipientResolver.resolveEventOrganizerRecipients(eventId)
        assertEquals(listOf(charleneUserId), compoRecipients.mapNotNull { it.userId })
        assertFalse(compoRecipients.mapNotNull { it.userId }.contains(pierrickUserId))
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie = memberCookie(googleSub, "$googleSub@example.com", "Matrix Admin")
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    private fun memberCookie(
        googleSub: String,
        email: String,
        name: String,
    ): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = email,
            name = name,
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Matrix saison"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createDraftEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
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
                              "title": "Matrix event ${UUID.randomUUID()}",
                              "startsAt": "2034-09-15T19:00:00Z",
                              "roleSlots": { "player": 4 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun grantSeasonOrganizer(
        admin: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        email: String,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$email"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun grantEventOrganizer(
        admin: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        email: String,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"$email"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun removeEventOrganizer(
        admin: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        userId: UUID,
    ) {
        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/events/$eventId/organizers/$userId")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
    }
}
