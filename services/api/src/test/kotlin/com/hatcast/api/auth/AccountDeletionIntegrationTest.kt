package com.hatcast.api.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.JsonNode
import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRepository
import com.hatcast.api.auth.IdpTokenPayload
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID
import jakarta.servlet.http.Cookie

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AccountDeletionIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

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
    private lateinit var auditEventRepository: AuditEventRepository

    @Autowired
    private lateinit var accountDeletionService: AccountDeletionService

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun stubGoogleToken(googleSub: String, email: String = "$googleSub@example.com") {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", googleSub)
                .claim("email", email)
                .claim("name", "Delete Test")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)
    }

    private fun memberCookie(googleSub: String): Cookie {
        stubGoogleToken(googleSub)
        return TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = "$googleSub@example.com",
            name = "Delete Test",
        )
    }

    private fun promoteToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun deleteAccount(cookie: Cookie, idToken: String = "reauth-token"): Cookie? =
        mockMvc
            .perform(
                delete("/v1/auth/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"$idToken"}""")
                    .with(csrf()),
            ).andExpect(status().isNoContent)
            .andReturn()
            .response
            .getCookie("HATCAST_SESSION")

    @Test
    fun `DELETE me anonymizes user deactivates memberships and records audit`() {
        val googleSub = "sub-account-delete-happy"
        val cookie = memberCookie(googleSub)
        val userBefore = userRepository.findByGoogleSub(googleSub)!!
        val membershipBefore =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, userBefore.id)!!

        deleteAccount(cookie)

        val userAfter = userRepository.findByGoogleSub(googleSub)!!
        assertNotNull(userAfter.deletedAt)
        assertNull(userAfter.email)
        assertNull(userAfter.displayName)
        assertNull(userAfter.memberDisplayName)

        val membershipAfter =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, userAfter.id)!!
        assertEquals(TroupeMembershipStatus.INACTIVE, membershipAfter.status)

        assertTrue(
            auditEventRepository
                .findAll()
                .any { it.actionType == AuditActionType.ACCOUNT_DELETED && it.actorUserId == userAfter.id },
        )

        mockMvc
            .perform(get("/v1/auth/me").cookie(cookie))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `DELETE me returns 409 when sole active troupe admin`() {
        val googleSub = "sub-account-delete-sole-admin"
        val cookie = memberCookie(googleSub)

        stubGoogleToken(googleSub)
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"name":"Troupe suppression compte test"}""")
                        .with(csrf()),
                ).andExpect(status().isCreated)
                .andReturn()

        assertNotNull(mapper.readTree(createRes.response.contentAsString).get("id").asText())

        mockMvc
            .perform(
                delete("/v1/auth/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"reauth-token"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("dernier administrateur")))

        val unchanged = userRepository.findByGoogleSub(googleSub)!!
        assertNull(unchanged.deletedAt)
    }

    @Test
    fun `deleteAccount returns 409 when account already deleted`() {
        val googleSub = "sub-account-delete-twice"
        val cookie = memberCookie(googleSub)
        deleteAccount(cookie)

        val user = userRepository.findByGoogleSub(googleSub)!!
        stubGoogleToken(googleSub)
        val ex =
            assertThrows<ResponseStatusException> {
                accountDeletionService.deleteAccount(
                    SessionUserPrincipal(
                        userId = user.id,
                        googleSub = user.googleSub,
                        idpUid = user.idpUid,
                        email = user.email,
                    ),
                    "reauth-token",
                )
            }
        assertEquals(HttpStatus.CONFLICT, ex.statusCode)
    }

    @Test
    fun `sign-in blocked with 403 after account deletion`() {
        val googleSub = "sub-account-delete-block-signin"
        val cookie = memberCookie(googleSub)
        deleteAccount(cookie)

        stubGoogleToken(googleSub)
        mockMvc
            .perform(
                post("/v1/auth/google")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"idToken":"reauth-token"}"""),
            ).andExpect(status().isForbidden)
            .andExpect(jsonPath("$.message").value("Ce compte a été supprimé."))
    }

    @Test
    fun `DELETE me preserves season statistics and ACTIVE season participant`() {
        val adminSub = "sub-account-delete-stats-admin"
        val memberSub = "sub-account-delete-stats-member"
        stubGoogleToken(adminSub)
        val adminCookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                adminSub,
                email = "$adminSub@example.com",
            )
        promoteToAdmin(adminSub)
        val memberCookie = memberCookie(memberSub)

        val season = seasonRepository.findById(seedSeasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)

        val memberUser = userRepository.findByGoogleSub(memberSub)!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        val participant =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seedSeasonId, membership.id)!!
        assertNotNull(participant)
        participant!!.user = memberUser
        participant.normalizedEmail = memberUser.email
        seasonParticipantRepository.save(participant)

        val future = Instant.parse("2033-06-01T19:00:00Z")
        val eventRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seedSeasonId/events")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Stats delete event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(eventRes.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, adminCookie, seedSeasonId, eventId)

        mockMvc
            .perform(
                put("/v1/seasons/$seedSeasonId/events/$eventId/availability/me")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

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
                seasonParticipantId = participant.id,
                participationStatus = SlotParticipationStatus.CONFIRMED,
            ),
        )

        val statsBefore =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/statistics").cookie(adminCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val rowsBefore = mapper.readTree(statsBefore.response.contentAsString).get("rows")
        val rowBefore = findStatsRowByParticipantId(rowsBefore, participant.id)
        assertNotNull(rowBefore)
        val selectionsBefore = rowBefore!!.get("annual").get("totalJeu").get("selections").asInt()
        val disposBefore = rowBefore.get("annual").get("totalJeu").get("dispos").asInt()

        stubGoogleToken(memberSub)
        deleteAccount(memberCookie)

        val participantAfter =
            seasonParticipantRepository.findById(participant.id).orElseThrow()
        assertEquals(ParticipantStatus.ACTIVE, participantAfter.status)
        assertNull(participantAfter.user)

        val statsAfter =
            mockMvc
                .perform(
                    get("/v1/seasons/$seedSeasonId/statistics").cookie(adminCookie),
                ).andExpect(status().isOk)
                .andReturn()
        val rowAfter = findStatsRowByParticipantId(mapper.readTree(statsAfter.response.contentAsString).get("rows"), participant.id)
        assertNotNull(rowAfter)
        assertEquals(selectionsBefore, rowAfter!!.get("annual").get("totalJeu").get("selections").asInt())
        assertEquals(disposBefore, rowAfter.get("annual").get("totalJeu").get("dispos").asInt())
        val slugAfter = rowAfter.path("userSlug")
        val avatarAfter = rowAfter.path("avatarUrl")
        assertTrue(slugAfter.isNull || slugAfter.isMissingNode)
        assertTrue(avatarAfter.isNull || avatarAfter.isMissingNode)
    }

    @Test
    fun `DELETE me accepts Identity Platform re-auth token`() {
        val uid = "firebase-uid-delete-idp"
        whenever(idpIdTokenVerifier.verify(any())).thenReturn(
            IdpTokenPayload(
                uid = uid,
                email = "idp-delete@example.com",
                displayName = "Idp Delete",
            ),
        )

        val signInResult =
            mockMvc
                .perform(
                    post("/v1/auth/idp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"signin-token"}"""),
                ).andExpect(status().isOk)
                .andReturn()
        val cookie = signInResult.response.getCookie("HATCAST_SESSION")!!

        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)

        val userBefore = userRepository.findByIdpUid(uid)!!
        whenever(idpIdTokenVerifier.verify(any())).thenReturn(
            IdpTokenPayload(uid = uid, email = null, displayName = null),
        )

        deleteAccount(cookie, "reauth-idp-token")

        val userAfter = userRepository.findById(userBefore.id).orElseThrow()
        assertNotNull(userAfter.deletedAt)
        assertNull(userAfter.email)
    }

    private fun findStatsRowByParticipantId(rows: JsonNode, participantId: UUID): JsonNode? {
        for (i in 0 until rows.size()) {
            val row = rows.get(i)
            if (row.get("participantId").asText() == participantId.toString()) {
                return row
            }
        }
        return null
    }
}
