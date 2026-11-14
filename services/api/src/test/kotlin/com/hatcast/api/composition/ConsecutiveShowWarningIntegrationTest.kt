package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Tag
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ConsecutiveShowWarningIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

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
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var categoryResolver: ImmediatePredecessorEventResolver

    @Autowired
    private lateinit var globalResolver: GlobalWarningPredecessorResolver

    @Autowired
    private lateinit var jdbc: org.springframework.jdbc.core.JdbcTemplate

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Consecutive Warning Test",
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
                        .content("""{"title":"Consecutive warning season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        title: String = "Spectacle",
        startsAt: Instant = Instant.parse("2031-06-01T19:00:00Z"),
        roleSlotsJson: String = """{ "player": 1 }""",
        category: String? = null,
    ): UUID {
        category?.let { EventTestSupport.ensureGlossaryCategory(mockMvc, cookie, seedTroupeId, it) }
        val categoryJson = category?.let { """, "category": "$it"""" } ?: ""
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
                              "startsAt": "$startsAt",
                              "roleSlots": $roleSlotsJson$categoryJson
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
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

    private fun assignSlot(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
    ): JsonNode {
        val res =
            mockMvc
                .perform(
                    put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"participantId":"$participantId"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return mapper.readTree(res.response.contentAsString)
    }

    private fun validateComposition(eventId: UUID) {
        val now = Instant.now()
        val composition = compositionRepository.findById(eventId).orElseThrow()
        composition.validatedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)
    }

    private fun participantIdForUser(
        seasonId: UUID,
        googleSub: String,
    ): UUID {
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

    @Test
    @Tag("FR21")
    fun `warning present when same role on immediate predecessor in same compartment`() {
        val adminCookie = memberCookie("sub-csw-admin-1", admin = true)
        val member = memberCookie("sub-csw-member-1")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-1")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Cabaret du 12",
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Match Malice",
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)

        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventBId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.previousEventId").value(eventAId.toString()))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.previousEventTitle").value("Cabaret du 12"))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.events[0].scopes[0]").value("global"))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.events[0].scopes[1]").value("category"))
    }

    @Test
    @Tag("FR21")
    fun `global warning when predecessor is in different compartment`() {
        val adminCookie = memberCookie("sub-csw-admin-2", admin = true)
        val member = memberCookie("sub-csw-member-2")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-2")

        val aperockEventId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Aperock show",
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
                category = "aperock",
            )
        val principalEventId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Principal show",
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, aperockEventId)
        setAvailability(member, seasonId, principalEventId)

        assignSlot(adminCookie, seasonId, aperockEventId, participantId)
        validateComposition(aperockEventId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$principalEventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.previousEventId").value(aperockEventId.toString()))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.events[0].eventId").value(aperockEventId.toString()))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.events[0].scopes[0]").value("global"))
    }

    @Test
    fun `category and global predecessors are matched independently`() {
        val admin = memberCookie("sub-csw-scopes-admin", admin = true)
        val member = memberCookie("sub-csw-scopes-member")
        val season = createSeason(admin)
        val person = participantIdForUser(season, "sub-csw-scopes-member")
        val categoryEvent = createEvent(admin, season, "Category show", Instant.parse("2031-04-01T19:00:00Z"))
        val globalEvent = createEvent(admin, season, "Travel show", Instant.parse("2031-05-01T19:00:00Z"), category = "deplacements")
        val current = createEvent(admin, season, "Current show", Instant.parse("2031-06-01T19:00:00Z"))
        listOf(categoryEvent, globalEvent, current).forEach { setAvailability(member, season, it) }
        assignSlot(admin, season, categoryEvent, person)
        validateComposition(categoryEvent)
        assignSlot(admin, season, globalEvent, person)
        validateComposition(globalEvent)
        val currentEntity = eventRepository.findById(current).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals(categoryEvent, categoryResolver.resolve(currentEntity)?.id)
        org.junit.jupiter.api.Assertions.assertEquals(globalEvent, globalResolver.resolve(currentEntity)?.id)
        val warning = assignSlot(admin, season, current, person).path("slots")[0].path("consecutiveShowWarning")
        org.junit.jupiter.api.Assertions.assertEquals(categoryEvent.toString(), warning.path("previousEventId").asText())
        org.junit.jupiter.api.Assertions.assertEquals("Category show", warning.path("previousEventTitle").asText())
        org.junit.jupiter.api.Assertions.assertEquals("2031-04-01T19:00:00Z", warning.path("previousEventStartsAt").asText())
        val both = warning.path("events")
        org.junit.jupiter.api.Assertions.assertEquals(2, both.size())
        org.junit.jupiter.api.Assertions.assertEquals(globalEvent.toString(), both[0].path("eventId").asText())
        org.junit.jupiter.api.Assertions.assertEquals("global", both[0].path("scopes")[0].asText())
        org.junit.jupiter.api.Assertions.assertEquals(categoryEvent.toString(), both[1].path("eventId").asText())
        org.junit.jupiter.api.Assertions.assertEquals("category", both[1].path("scopes")[0].asText())
        val globalSlot = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(globalEvent, "player", 0)!!
        globalSlot.participationStatus = SlotParticipationStatus.DECLINED
        slotRepository.save(globalSlot)
        val categoryOnly = mockMvc.perform(get("/v1/seasons/$season/events/$current/composition").cookie(admin))
            .andExpect(status().isOk).andReturn()
        val events = mapper.readTree(categoryOnly.response.contentAsString).path("slots")[0].path("consecutiveShowWarning").path("events")
        org.junit.jupiter.api.Assertions.assertEquals(1, events.size())
        org.junit.jupiter.api.Assertions.assertEquals(categoryEvent.toString(), events[0].path("eventId").asText())
        org.junit.jupiter.api.Assertions.assertEquals("category", events[0].path("scopes")[0].asText())
    }

    @Test
    fun `more recent validated event in another season cannot become a predecessor`() {
        val admin = memberCookie("sub-csw-season-admin", admin = true)
        val member = memberCookie("sub-csw-season-member")
        val season = createSeason(admin)
        val otherSeason = createSeason(admin)
        val person = participantIdForUser(season, "sub-csw-season-member")
        val otherPerson = participantIdForUser(otherSeason, "sub-csw-season-member")
        val eligible = createEvent(admin, season, "Eligible", Instant.parse("2031-01-01T19:00:00Z"))
        val foreign = createEvent(admin, otherSeason, "Other season", Instant.parse("2031-02-01T19:00:00Z"), category = "deplacements")
        val current = createEvent(admin, season, "Current", Instant.parse("2031-03-01T19:00:00Z"))
        setAvailability(member, season, eligible)
        setAvailability(member, otherSeason, foreign)
        setAvailability(member, season, current)
        assignSlot(admin, season, eligible, person)
        validateComposition(eligible)
        assignSlot(admin, otherSeason, foreign, otherPerson)
        validateComposition(foreign)
        val currentEntity = eventRepository.findById(current).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals(eligible, globalResolver.resolve(currentEntity)?.id)
        val warning = assignSlot(admin, season, current, person).path("slots")[0].path("consecutiveShowWarning")
        org.junit.jupiter.api.Assertions.assertEquals(eligible.toString(), warning.path("previousEventId").asText())
        org.junit.jupiter.api.Assertions.assertEquals(1, warning.path("events").size())
        org.junit.jupiter.api.Assertions.assertEquals(eligible.toString(), warning.path("events")[0].path("eventId").asText())
        org.junit.jupiter.api.Assertions.assertEquals(listOf("global", "category"), warning.path("events")[0].path("scopes").map { it.asText() })
    }

    @Test
    fun `archived and unvalidated shows are ignored before selecting a predecessor`() {
        val admin = memberCookie("sub-csw-filter-admin", admin = true)
        val member = memberCookie("sub-csw-filter-member")
        val season = createSeason(admin)
        val person = participantIdForUser(season, "sub-csw-filter-member")
        val prior = createEvent(admin, season, "Eligible", Instant.parse("2031-01-01T19:00:00Z"))
        val archived = createEvent(admin, season, "Archived", Instant.parse("2031-02-01T19:00:00Z"))
        val draft = createEvent(admin, season, "Unvalidated", Instant.parse("2031-03-01T19:00:00Z"))
        val current = createEvent(admin, season, "Current", Instant.parse("2031-04-01T19:00:00Z"))
        listOf(prior, archived, draft, current).forEach { setAvailability(member, season, it) }
        listOf(prior, archived, draft).forEach { assignSlot(admin, season, it, person) }
        validateComposition(prior)
        validateComposition(archived)
        eventRepository.save(eventRepository.findById(archived).orElseThrow().apply { this.archived = true })
        val warning = assignSlot(admin, season, current, person).path("slots")[0].path("consecutiveShowWarning")
        org.junit.jupiter.api.Assertions.assertEquals(prior.toString(), warning.path("previousEventId").asText())
    }

    @Test
    fun `a previous MC does not warn for a player`() {
        val admin = memberCookie("sub-csw-role-admin", admin = true)
        val member = memberCookie("sub-csw-role-member")
        val season = createSeason(admin)
        val person = participantIdForUser(season, "sub-csw-role-member")
        val previous = createEvent(admin, season, "Previous", Instant.parse("2031-01-01T19:00:00Z"))
        val current = createEvent(admin, season, "Current", Instant.parse("2031-02-01T19:00:00Z"))
        listOf(previous, current).forEach { setAvailability(member, season, it) }
        assignSlot(admin, season, previous, person)
        val player = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(previous, "player", 0)!!
        player.participationStatus = SlotParticipationStatus.DECLINED
        slotRepository.save(player)
        slotRepository.save(EventCompositionSlotEntity(eventId = previous, roleKey = "mc", slotIndex = 0, seasonParticipantId = person))
        validateComposition(previous)
        val warning = assignSlot(admin, season, current, person).path("slots")[0].path("consecutiveShowWarning")
        org.junit.jupiter.api.Assertions.assertTrue(warning.isMissingNode || warning.isNull)
    }

    @Test
    fun `equal event times use creation time then id as strict tie breakers`() {
        val admin = memberCookie("sub-csw-order-admin", admin = true)
        val member = memberCookie("sub-csw-order-member")
        val season = createSeason(admin)
        val person = participantIdForUser(season, "sub-csw-order-member")
        val sameTime = Instant.parse("2031-05-01T19:00:00Z")
        val ids = (1..3).map { createEvent(admin, season, "Equal $it", sameTime) }.sortedBy { it.toString() }
        ids.forEach { setAvailability(member, season, it); assignSlot(admin, season, it, person); validateComposition(it) }
        val timestamp = java.sql.Timestamp.from(Instant.parse("2030-01-01T00:00:00Z"))
        ids.forEach { jdbc.update("UPDATE events SET created_at = ? WHERE id = ?", timestamp, it) }
        val current = eventRepository.findById(ids[2]).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals(ids[1], globalResolver.resolve(current)?.id)
        org.junit.jupiter.api.Assertions.assertEquals(ids[1], categoryResolver.resolve(current)?.id)
        jdbc.update("UPDATE events SET created_at = ? WHERE id = ?", java.sql.Timestamp.from(Instant.parse("2030-01-02T00:00:00Z")), ids[0])
        val laterCurrent = eventRepository.findById(ids[0]).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals(ids[2], globalResolver.resolve(laterCurrent)?.id)
        org.junit.jupiter.api.Assertions.assertEquals(ids[2], categoryResolver.resolve(laterCurrent)?.id)
        val response = mockMvc.perform(get("/v1/seasons/$season/events/${ids[0]}/composition").cookie(admin))
            .andExpect(status().isOk).andReturn()
        val warning = mapper.readTree(response.response.contentAsString).path("slots")[0].path("consecutiveShowWarning")
        org.junit.jupiter.api.Assertions.assertEquals(ids[2].toString(), warning.path("previousEventId").asText())
    }

    @Test
    fun `warning refreshes on replacement publish validation and unlock`() {
        val admin = memberCookie("sub-csw-lifecycle-admin", admin = true)
        val member = memberCookie("sub-csw-lifecycle-member")
        val other = memberCookie("sub-csw-lifecycle-other")
        val season = createSeason(admin)
        val person = participantIdForUser(season, "sub-csw-lifecycle-member")
        val otherPerson = participantIdForUser(season, "sub-csw-lifecycle-other")
        val previous = createEvent(admin, season, "Previous", Instant.parse("2031-01-01T19:00:00Z"))
        val current = createEvent(admin, season, "Current", Instant.parse("2031-02-01T19:00:00Z"))
        setAvailability(member, season, previous)
        setAvailability(member, season, current)
        setAvailability(other, season, current)
        assignSlot(admin, season, previous, person)
        validateComposition(previous)
        org.junit.jupiter.api.Assertions.assertFalse(assignSlot(admin, season, current, person).path("slots")[0].path("consecutiveShowWarning").isNull)
        val replaced = assignSlot(admin, season, current, otherPerson).path("slots")[0].path("consecutiveShowWarning")
        org.junit.jupiter.api.Assertions.assertTrue(replaced.isMissingNode || replaced.isNull)
        assignSlot(admin, season, current, person)
        for (action in listOf("publish", "validate", "unlock", "validate")) {
            mockMvc.perform(post("/v1/seasons/$season/events/$current/composition/$action").cookie(admin).with(csrf()))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.slots[0].consecutiveShowWarning.previousEventId").value(previous.toString()))
        }
        mockMvc.perform(get("/v1/seasons/$season/events/$current/composition").cookie(other))
            .andExpect(status().isOk).andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `no warning when no validated predecessor in compartment`() {
        val adminCookie = memberCookie("sub-csw-admin-3", admin = true)
        val member = memberCookie("sub-csw-member-3")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-3")
        val eventId = createEvent(adminCookie, seasonId)
        setAvailability(member, seasonId, eventId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `warning disappears after slot clear`() {
        val adminCookie = memberCookie("sub-csw-admin-4", admin = true)
        val member = memberCookie("sub-csw-member-4")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-4")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)
        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)
        assignSlot(adminCookie, seasonId, eventBId, participantId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventBId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `member GET composition omits consecutive show warning`() {
        val adminCookie = memberCookie("sub-csw-admin-5", admin = true)
        val member = memberCookie("sub-csw-member-5")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-5")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)
        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)
        assignSlot(adminCookie, seasonId, eventBId, participantId)
        validateComposition(eventBId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventBId/composition")
                    .cookie(member),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(participantId.toString()))
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `no warning when predecessor slot was declined`() {
        val adminCookie = memberCookie("sub-csw-admin-6", admin = true)
        val member = memberCookie("sub-csw-member-6")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-member-6")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-05-01T19:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)
        assignSlot(adminCookie, seasonId, eventAId, participantId)
        val slotA = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventAId, "player", 0)!!
        slotA.participationStatus = SlotParticipationStatus.DECLINED
        slotRepository.save(slotA)
        validateComposition(eventAId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventBId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `POST draw returns warning when same role on same-day predecessor`() {
        val adminCookie = memberCookie("sub-csw-draw-admin", admin = true)
        val member = memberCookie("sub-csw-draw-member")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-draw-member")

        val eventAId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Premier spectacle",
                startsAt = Instant.parse("2026-06-05T16:00:00Z"),
            )
        val eventBId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Deuxième spectacle",
                startsAt = Instant.parse("2026-06-05T20:00:00Z"),
            )
        setAvailability(member, seasonId, eventAId)
        setAvailability(member, seasonId, eventBId)

        assignSlot(adminCookie, seasonId, eventAId, participantId)
        validateComposition(eventAId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventBId/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath("$.composition.slots[0].consecutiveShowWarning.previousEventId")
                    .value(eventAId.toString()),
            )
            .andExpect(
                jsonPath("$.composition.slots[0].consecutiveShowWarning.previousEventTitle")
                    .value("Premier spectacle"),
            )
    }

    @Test
    @Tag("FR21")
    fun `no warning when validated predecessor is chronologically after current event`() {
        val adminCookie = memberCookie("sub-csw-midnight-admin", admin = true)
        val member = memberCookie("sub-csw-midnight-member")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-midnight-member")

        val laterValidatedId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Spectacle plus tard",
                startsAt = Instant.parse("2026-06-05T22:00:00Z"),
            )
        val earlierCurrentId =
            createEvent(
                adminCookie,
                seasonId,
                title = "Spectacle 22h",
                startsAt = Instant.parse("2026-06-05T20:00:00Z"),
            )
        setAvailability(member, seasonId, laterValidatedId)
        setAvailability(member, seasonId, earlierCurrentId)
        assignSlot(adminCookie, seasonId, laterValidatedId, participantId)
        validateComposition(laterValidatedId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$earlierCurrentId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$participantId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].consecutiveShowWarning").doesNotExist())
    }

    @Test
    @Tag("FR21")
    fun `same Paris calendar day midnight then 22h warns on evening show`() {
        val adminCookie = memberCookie("sub-csw-paris-day-admin", admin = true)
        val member = memberCookie("sub-csw-paris-day-member")
        val seasonId = createSeason(adminCookie)
        val participantId = participantIdForUser(seasonId, "sub-csw-paris-day-member")

        val midnightParisJune5 =
            createEvent(
                adminCookie,
                seasonId,
                title = "Matin 5 juin",
                startsAt = Instant.parse("2026-06-04T22:00:00Z"),
            )
        val tenPmParisJune5 =
            createEvent(
                adminCookie,
                seasonId,
                title = "Soir 22h",
                startsAt = Instant.parse("2026-06-05T20:00:00Z"),
            )
        setAvailability(member, seasonId, midnightParisJune5)
        setAvailability(member, seasonId, tenPmParisJune5)
        assignSlot(adminCookie, seasonId, midnightParisJune5, participantId)
        validateComposition(midnightParisJune5)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$tenPmParisJune5/composition/draw")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"mode":"full"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath("$.composition.slots[0].consecutiveShowWarning.previousEventId")
                    .value(midnightParisJune5.toString()),
            )
    }
}
