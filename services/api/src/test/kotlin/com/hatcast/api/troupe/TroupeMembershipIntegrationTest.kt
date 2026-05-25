package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertTrue
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeMembershipIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val seedSeasonSlug = "la-malice-2026-2027"
    private val mapper = ObjectMapper()

    @Test
    fun `join seed troupe is idempotent and lists membership troupes only`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-1")

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
            .andExpect(jsonPath("$.displayName").exists())

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$.[0].id").value(seedTroupeId.toString()))
            .andExpect(jsonPath("$.[0].slug").value("la-malice"))
            .andExpect(jsonPath("$.[0].membership.status").value("ACTIVE"))
            .andExpect(jsonPath("$.[0].membership.baselineRole").value("MEMBER"))
    }

    @Test
    fun `troupe list returns batched member and upcoming counts for two troupes`() {
        val cookie = signIn("sub-troupe-list-two", "troupe-list-two@example.com", "Two Troupes")
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)

        val otherTroupe =
            troupeRepository.save(
                TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "List Counts Other",
                    slug = "list-counts-other-${UUID.randomUUID().toString().take(8)}",
                ),
            )
        mockMvc
            .perform(
                post("/v1/troupes/${otherTroupe.id}/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        val user = userRepository.findByGoogleSub("sub-troupe-list-two")!!
        val season =
            seasonRepository.save(
                SeasonEntity(
                    troupe = otherTroupe,
                    slug = "list-counts-season-${UUID.randomUUID().toString().take(8)}",
                    title = "List counts season",
                ),
            )
        eventRepository.save(
            EventEntity(
                season = season,
                title = "Upcoming for list",
                slug = "upcoming-for-list",
                startsAt = Instant.parse("2030-06-15T18:00:00Z"),
            ),
        )
        seasonParticipantRepository.save(
            SeasonParticipantEntity(
                season = season,
                displayName = "Two Troupes",
                normalizedEmail = requireNotNull(user.email).lowercase(),
                user = user,
                status = ParticipantStatus.ACTIVE,
            ),
        )

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[?(@.slug == 'la-malice')].upcomingEventCount[0]").value(0))
            .andExpect(
                jsonPath("$[?(@.slug == 'la-malice')].activeMemberCount[0]")
                    .value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)),
            )
            .andExpect(jsonPath("$[?(@.id == '${otherTroupe.id}')].activeMemberCount[0]").value(1))
            .andExpect(jsonPath("$[?(@.id == '${otherTroupe.id}')].upcomingEventCount[0]").value(1))

        val outsider = signIn("sub-troupe-list-outsider", "outsider@example.com", "Outsider")
        mockMvc
            .perform(get("/v1/troupes").cookie(outsider))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `non member cannot list seasons for troupe`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-2")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `non member cannot access member only season event and permission routes`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-4")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons/by-slug/$seedSeasonSlug").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/events").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/permissions/me").cookie(cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `membership lookup returns not found for non member`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-5")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me").cookie(cookie))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `direct join is limited to seed troupe`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-6")
        val otherTroupeId = UUID.randomUUID()
        troupeRepository.save(
            TroupeEntity(
                id = otherTroupeId,
                name = "Private ${otherTroupeId.toString().take(8)}",
                slug = "private-${otherTroupeId.toString().take(8)}",
            ),
        )

        mockMvc
            .perform(
                post("/v1/troupes/$otherTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `join seed troupe requires csrf`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-7")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `member can list seasons after join`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-3")
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons?page=0&size=5").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
    }

    @Test
    fun `member can patch own display name via memberships me`() {
        val cookie = signInAndJoin("sub-self-pseudo-1", "self-pseudo-1@example.com", "Self Pseudo")

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"  Patou  "}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Patou"))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Patou"))
    }

    @Test
    fun `empty display name on self patch returns 400`() {
        val cookie = signInAndJoin("sub-self-pseudo-empty", "self-pseudo-empty@example.com", "Self Empty")

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"   "}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Self Empty"))
    }

    @Test
    fun `display name longer than 255 on self patch returns 400`() {
        val cookie = signInAndJoin("sub-self-pseudo-long", "self-pseudo-long@example.com", "Self Long")
        val tooLong = "x".repeat(256)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"$tooLong"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `non member cannot patch own membership display name`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            "sub-self-pseudo-nonmember",
        )

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Hacker"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `self patch display name in troupe A does not change troupe B`() {
        val troupeBId = UUID.randomUUID()
        val troupeB =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeBId,
                    name = "Other ${troupeBId.toString().take(8)}",
                    slug = "other-${troupeBId.toString().take(8)}",
                ),
            )
        val cookie = signIn("sub-self-pseudo-cross", "self-pseudo-cross@example.com", "Cross User")
        val user = userRepository.findByGoogleSub("sub-self-pseudo-cross")!!
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        membershipRepository.save(
            TroupeMembershipEntity(
                troupe = troupeB,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.MEMBER,
                displayName = "Troupe B Name",
            ),
        )

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Troupe A Name"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Troupe A Name"))

        val troupeBMembership = membershipRepository.findByTroupe_IdAndUser_Id(troupeBId, user.id)!!
        org.junit.jupiter.api.Assertions.assertEquals("Troupe B Name", troupeBMembership.displayName)
    }

    @Test
    fun `self patch ignores role and status fields`() {
        val cookie = signInAndJoin("sub-self-pseudo-fields", "self-pseudo-fields@example.com", "Self Fields")

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "displayName":"Updated Name",
                          "baselineRole":"TROUPE_ADMIN",
                          "status":"INACTIVE"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Updated Name"))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
    }

    @Test
    fun `troupe admin can list add update and deactivate members`() {
        val adminCookie = signInAndJoin("sub-admin-members-1", "admin-members-1@example.com", "Admin Members")
        promoteSeedMemberToAdmin("sub-admin-members-1")
        signIn("sub-target-members-1", "target-members-1@example.com", "Target Member")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "email": " TARGET-MEMBERS-1@example.com ",
                              "displayName": "Pseudo cible"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.email").value("target-members-1@example.com"))
                .andExpect(jsonPath("$.displayName").value("Pseudo cible"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
                .andReturn()

        val membershipId = UUID.fromString(mapper.readTree(addResult.response.contentAsString).path("id").asText())

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members?page=0&size=100").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.email == 'target-members-1@example.com')]").exists())

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Pseudo modifié","baselineRole":"TROUPE_ADMIN"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Pseudo modifié"))
            .andExpect(jsonPath("$.baselineRole").value("TROUPE_ADMIN"))

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members?page=0&size=100").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == '$membershipId')].status").value("INACTIVE"))
    }

    @Test
    fun `non admin member cannot manage members or create seasons`() {
        val cookie = signInAndJoin("sub-ordinary-members-1", "ordinary-members-1@example.com", "Ordinary Member")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/seasons")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"title":"Forbidden season"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `last active troupe admin cannot be demoted or deactivated`() {
        val troupeId = UUID.randomUUID()
        val cookie = signIn("sub-last-admin-1", "last-admin-1@example.com", "Last Admin")
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeId,
                    name = "Guard ${troupeId.toString().take(8)}",
                    slug = "guard-${troupeId.toString().take(8)}",
                ),
            )
        val user = userRepository.findByGoogleSub("sub-last-admin-1")!!
        val membership =
            membershipRepository.save(
                TroupeMembershipEntity(
                    troupe = troupe,
                    user = user,
                    status = TroupeMembershipStatus.ACTIVE,
                    baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                    displayName = "Last Admin",
                ),
            )

        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/members/${membership.id}")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"baselineRole":"MEMBER"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                delete("/v1/troupes/$troupeId/members/${membership.id}")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `last active troupe admin cannot be demoted via add member`() {
        val troupeId = UUID.randomUUID()
        val cookie = signIn("sub-last-admin-add-1", "last-admin-add-1@example.com", "Last Admin Add")
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeId,
                    name = "Guard Add ${troupeId.toString().take(8)}",
                    slug = "guard-add-${troupeId.toString().take(8)}",
                ),
            )
        val user = userRepository.findByGoogleSub("sub-last-admin-add-1")!!
        membershipRepository.save(
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                displayName = "Last Admin Add",
            ),
        )

        mockMvc
            .perform(
                post("/v1/troupes/$troupeId/members")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"last-admin-add-1@example.com","baselineRole":"MEMBER"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `troupe admin can reactivate inactive member via add`() {
        val adminCookie = signInAndJoin("sub-reactivate-admin-1", "reactivate-admin-1@example.com", "Reactivate Admin")
        promoteSeedMemberToAdmin("sub-reactivate-admin-1")
        signIn("sub-reactivate-target-1", "reactivate-target-1@example.com", "Reactivate Target")
        val targetUser = userRepository.findByGoogleSub("sub-reactivate-target-1")!!
        val inactiveMembership =
            membershipRepository.save(
                TroupeMembershipEntity(
                    troupe = troupeRepository.findById(seedTroupeId).orElseThrow(),
                    user = targetUser,
                    status = TroupeMembershipStatus.INACTIVE,
                    baselineRole = TroupeBaselineRole.MEMBER,
                    displayName = "Inactive Target",
                ),
            )

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"reactivate-target-1@example.com","displayName":"Reactivated"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(inactiveMembership.id.toString()))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.displayName").value("Reactivated"))
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
    }

    @Test
    fun `troupe admin can export and import members csv`() {
        val adminCookie = signInAndJoin("sub-csv-admin-1", "csv-admin-1@example.com", "CSV Admin")
        promoteSeedMemberToAdmin("sub-csv-admin-1")
        signIn("sub-csv-target-1", "csv-target-1@example.com", "CSV Target")
        signIn("sub-csv-target-2", "csv-target-2@example.com", "CSV Target 2")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"csv-target-1@example.com","displayName":"Export Target"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val exportResult =
            mockMvc
                .perform(get("/v1/troupes/$seedTroupeId/members/export").cookie(adminCookie))
                .andExpect(status().isOk)
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andReturn()

        val exportedCsv = exportResult.response.contentAsString
        assertTrue(exportedCsv.contains("email,displayName,baselineRole,status"))
        assertTrue(exportedCsv.contains("csv-target-1@example.com"))

        val importCsv =
            """
            email,displayName,baselineRole,status
            csv-target-1@example.com,Export Target Updated,MEMBER,active
            csv-target-2@example.com,Nouveau membre,MEMBER,active
            unknown-user@example.com,Missing,,active
            """.trimIndent()

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/members/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "members.csv",
                            "text/csv",
                            importCsv.toByteArray(),
                        ),
                    ).cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.summary.success").value(2))
            .andExpect(jsonPath("$.summary.error").value(1))
            .andExpect(jsonPath("$.rows[?(@.email == 'unknown-user@example.com')].code").value("USER_NOT_FOUND"))

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members?page=0&size=100").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.email == 'csv-target-2@example.com')].displayName").value("Nouveau membre"))
            .andExpect(
                jsonPath("$.content[?(@.email == 'csv-target-1@example.com')].displayName").value("Export Target Updated"),
            )
    }

    @Test
    fun `non admin cannot export or import members csv`() {
        val cookie = signInAndJoin("sub-csv-ordinary-1", "csv-ordinary-1@example.com", "CSV Ordinary")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members/export").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/members/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "members.csv",
                            "text/csv",
                            "email\ntest@example.com\n".toByteArray(),
                        ),
                    ).cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `import duplicate email is idempotent update`() {
        val adminCookie = signInAndJoin("sub-csv-idempotent-1", "csv-idempotent-admin@example.com", "CSV Idempotent Admin")
        promoteSeedMemberToAdmin("sub-csv-idempotent-1")
        signIn("sub-csv-idempotent-target", "csv-idempotent-target@example.com", "CSV Idempotent Target")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"csv-idempotent-target@example.com","displayName":"Original"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val importCsv =
            """
            email,displayName,baselineRole,status
            csv-idempotent-target@example.com,Updated Name,MEMBER,active
            """.trimIndent()

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/members/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "members.csv",
                            "text/csv",
                            importCsv.toByteArray(),
                        ),
                    ).cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.summary.success").value(1))

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/members/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "members.csv",
                            "text/csv",
                            importCsv.toByteArray(),
                        ),
                    ).cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.summary.skipped").value(1))
    }

    @Test
    fun `last active troupe admin cannot be demoted via members csv import`() {
        val troupeId = UUID.randomUUID()
        val cookie = signIn("sub-last-admin-csv-1", "last-admin-csv-1@example.com", "Last Admin CSV")
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeId,
                    name = "Guard CSV ${troupeId.toString().take(8)}",
                    slug = "guard-csv-${troupeId.toString().take(8)}",
                ),
            )
        val user = userRepository.findByGoogleSub("sub-last-admin-csv-1")!!
        membershipRepository.save(
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                displayName = "Last Admin CSV",
            ),
        )

        val importCsv =
            """
            email,displayName,baselineRole,status
            last-admin-csv-1@example.com,Last Admin CSV,MEMBER,active
            """.trimIndent()

        mockMvc
            .perform(
                multipart("/v1/troupes/$troupeId/members/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "members.csv",
                            "text/csv",
                            importCsv.toByteArray(),
                        ),
                    ).cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.summary.error").value(1))
            .andExpect(jsonPath("$.rows[0].code").value("LAST_ADMIN_VIOLATION"))
    }

    @Test
    fun `troupe admin can import users then members csv`() {
        val adminCookie = signInAndJoin("sub-csv-users-admin", "csv-users-admin@example.com", "Users Admin")
        promoteSeedMemberToAdmin("sub-csv-users-admin")

        val usersCsv =
            """
            email,displayName
            csv-migrated-1@example.com,Migré Un
            csv-migrated-2@example.com,Migré Deux
            """.trimIndent()

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/users/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "users.csv",
                            "text/csv",
                            usersCsv.toByteArray(),
                        ),
                    ).cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.summary.success").value(2))

        val membersCsv =
            """
            email,displayName,baselineRole,status
            csv-migrated-1@example.com,Migré Un,MEMBER,active
            csv-migrated-2@example.com,Migré Deux,TROUPE_ADMIN,active
            """.trimIndent()

        mockMvc
            .perform(
                multipart("/v1/troupes/$seedTroupeId/members/import")
                    .file(
                        org.springframework.mock.web.MockMultipartFile(
                            "file",
                            "members.csv",
                            "text/csv",
                            membersCsv.toByteArray(),
                        ),
                    ).cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.summary.success").value(2))

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members?page=0&size=100").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.email == 'csv-migrated-2@example.com')].baselineRole").value("TROUPE_ADMIN"))
    }

    private fun signInAndJoin(
        googleSub: String,
        email: String,
        name: String,
    ) = signIn(googleSub, email, name).also { cookie ->
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
    }

    private fun signIn(
        googleSub: String,
        email: String,
        name: String,
    ) = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub, email, name)

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id) ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }
}
