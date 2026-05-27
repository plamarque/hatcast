package com.hatcast.api.inbox

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventSlugGenerator
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import org.hamcrest.Matchers.hasSize
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
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MeInboxIntegrationTest {
  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var googleIdTokenService: GoogleIdTokenService

  @MockBean
  private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

  @Autowired
  private lateinit var troupeMembershipRepository: TroupeMembershipRepository

  @Autowired
  private lateinit var userRepository: UserRepository

  @Autowired
  private lateinit var seasonRepository: SeasonRepository

  @Autowired
  private lateinit var eventRepository: EventRepository

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

  private data class SessionFixture(
    val cookie: jakarta.servlet.http.Cookie,
    val userId: String,
  )

  private fun signInAdmin(
    googleSub: String,
    email: String,
    displayName: String,
  ): SessionFixture {
    val fixture = signIn(googleSub, email, displayName)
    val membership =
      troupeMembershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, UUID.fromString(fixture.userId))
        ?: error("Missing seed membership")
    membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
    troupeMembershipRepository.save(membership)
    return fixture
  }

  private fun signIn(
    googleSub: String,
    email: String,
    displayName: String,
  ): SessionFixture {
    val jwt =
      Jwt
        .withTokenValue("header.payload.sig")
        .header("alg", "RS256")
        .claim("sub", googleSub)
        .claim("email", email)
        .claim("name", displayName)
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plusSeconds(3600))
        .issuer("https://accounts.google.com")
        .build()
    whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)
    val result =
      mockMvc
        .perform(
          post("/v1/auth/google")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"idToken":"fake","rememberMe":true}"""),
        ).andExpect(status().isOk)
        .andReturn()
    val root = mapper.readTree(result.response.contentAsString)
    return SessionFixture(
      cookie =
        result.response.getCookie("HATCAST_SESSION")!!.also { cookie ->
          TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        },
      userId = root.path("user").path("id").asText(),
    )
  }

  private fun createSeason(
    cookie: jakarta.servlet.http.Cookie,
    title: String,
  ): UUID {
    val result =
      mockMvc
        .perform(
          post("/v1/troupes/$seedTroupeId/seasons")
            .cookie(cookie)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"title":"$title"}""")
            .with(csrf()),
        ).andExpect(status().isOk)
        .andReturn()
    return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
  }

  private fun futureStartsAtIso(daysFromNow: Long = 10): String =
    Instant.now().plus(daysFromNow, ChronoUnit.DAYS).toString()

  private fun createEvent(
    cookie: jakarta.servlet.http.Cookie,
    seasonId: UUID,
    title: String,
    startsAt: String = futureStartsAtIso(),
    playerCount: Int = 1,
  ): UUID {
    val result =
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
                "roleSlots": { "player": $playerCount }
              }
              """.trimIndent(),
            ).with(csrf()),
        ).andExpect(status().isOk)
        .andReturn()
    return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
  }

  private fun participantIdForUser(
    seasonId: UUID,
    googleSub: String,
  ): UUID {
    val season = seasonRepository.findById(seasonId).orElseThrow()
    seasonParticipantService.ensureMembershipParticipants(season)
    val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
    val membership =
      troupeMembershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
        ?: error("Missing membership")
    return seasonParticipantRepository
      .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
      ?.id
      ?: error("Missing season participant")
  }

  private fun seedValidatedUnassignedComposition(eventId: UUID) {
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
        seasonParticipantId = null,
        eventParticipantId = null,
        participationStatus = SlotParticipationStatus.PENDING,
      ),
    )
  }

  private fun seedValidatedComposition(
    eventId: UUID,
    participantId: UUID,
    participationStatus: SlotParticipationStatus = SlotParticipationStatus.PENDING,
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
        seasonParticipantId = participantId,
        participationStatus = participationStatus,
      ),
    )
  }

  private fun seedDraftComposition(
    eventId: UUID,
    participantId: UUID,
  ) {
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

  private fun linkDirectSeasonParticipant(
    season: SeasonEntity,
    fixture: SessionFixture,
  ) {
    val user = userRepository.findById(UUID.fromString(fixture.userId)).orElseThrow()
    seasonParticipantRepository.save(
      SeasonParticipantEntity(
        season = season,
        displayName = "Inbox participant",
        normalizedEmail = requireNotNull(user.email).lowercase(),
        user = user,
        status = ParticipantStatus.ACTIVE,
      ),
    )
  }

  private fun linkMembershipOnlySeasonParticipant(
    season: SeasonEntity,
    fixture: SessionFixture,
  ): UUID {
    val user = userRepository.findById(UUID.fromString(fixture.userId)).orElseThrow()
    val membership =
      troupeMembershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
        ?: error("Missing membership")
    return seasonParticipantRepository
      .save(
        SeasonParticipantEntity(
          season = season,
          displayName = "Inbox membership participant",
          normalizedEmail = requireNotNull(user.email).lowercase(),
          user = null,
          troupeMembership = membership,
          status = ParticipantStatus.ACTIVE,
        ),
      ).id
  }

  private fun createDirectSeason(title: String): SeasonEntity =
    seasonRepository.save(
      SeasonEntity(
        troupe = troupeRepository.findById(seedTroupeId).orElseThrow(),
        slug = "inbox-${UUID.randomUUID().toString().take(8)}",
        title = title,
      ),
    )

  @Autowired
  private lateinit var troupeRepository: TroupeRepository

  private fun createDirectEvent(
    season: SeasonEntity,
    title: String,
    startsAt: Instant = Instant.now().plus(10, ChronoUnit.DAYS),
  ): EventEntity =
    eventRepository.save(
      EventEntity(
        season = season,
        title = title,
        slug =
          EventSlugGenerator.slugify(title).ifEmpty {
            "event-${UUID.randomUUID().toString().take(8)}"
          },
        startsAt = startsAt,
      ),
    )

  @Test
  fun `unauthenticated request returns 401`() {
    mockMvc
      .perform(get("/v1/me/inbox"))
      .andExpect(status().isUnauthorized)
  }

  @Test
  fun `validated composition with pending assigned slot returns composition_confirm_pending`() {
    val admin = signInAdmin("inbox-confirm-admin", "inbox-confirm-admin@example.com", "Inbox Confirm Admin")
    val member = signIn("inbox-confirm-member", "inbox-confirm-member@example.com", "Inbox Confirm Member")
    val seasonId = createSeason(admin.cookie, "Inbox confirm season")
    val eventId = createEvent(admin.cookie, seasonId, "Confirm match")
    val linkedId = participantIdForUser(seasonId, "inbox-confirm-member")
    seedValidatedComposition(eventId, linkedId)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(2)))
      .andExpect(jsonPath("$.actions[0].type").value("composition_confirm_pending"))
      .andExpect(jsonPath("$.actions[0].roleKey").value("player"))
      .andExpect(jsonPath("$.actions[0].roleLabel").value("Comédien·ne"))
      .andExpect(
        jsonPath("$.actions[0].deepLink").value(org.hamcrest.Matchers.containsString("showConfirm=true")),
      )
  }

  @Test
  fun `unknown availability within horizon returns availability_unknown`() {
    val member = signIn("inbox-dispo-member", "inbox-dispo-member@example.com", "Inbox Dispo Member")
    val season = createDirectSeason("Inbox dispo season")
    createDirectEvent(season, "Dispo needed")
    linkDirectSeasonParticipant(season, member)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(1)))
      .andExpect(jsonPath("$.actions[0].type").value("availability_unknown"))
      .andExpect(
        jsonPath("$.actions[0].deepLink").value(org.hamcrest.Matchers.containsString("tab=dispos")),
      )
  }

  @Test
  fun `same event with confirm and dispo lists confirm first at equal startsAt`() {
    val admin = signInAdmin("inbox-both-admin", "inbox-both-admin@example.com", "Inbox Both Admin")
    val member = signIn("inbox-both-member", "inbox-both-member@example.com", "Inbox Both Member")
    val seasonId = createSeason(admin.cookie, "Inbox both season")
    val startsAt = futureStartsAtIso(12)
    val eventId = createEvent(admin.cookie, seasonId, "Both actions", startsAt = startsAt)
    val linkedId = participantIdForUser(seasonId, "inbox-both-member")
    seedValidatedComposition(eventId, linkedId)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(2)))
      .andExpect(jsonPath("$.actions[0].type").value("composition_confirm_pending"))
      .andExpect(jsonPath("$.actions[1].type").value("availability_unknown"))
  }

  @Test
  fun `draft composition and confirmed slot are excluded from actions`() {
    val admin = signInAdmin("inbox-exclude-admin", "inbox-exclude-admin@example.com", "Inbox Exclude Admin")
    val member = signIn("inbox-exclude-member", "inbox-exclude-member@example.com", "Inbox Exclude Member")
    val seasonId = createSeason(admin.cookie, "Inbox exclude season")
    val draftEventId = createEvent(admin.cookie, seasonId, "Draft only")
    val confirmedEventId = createEvent(admin.cookie, seasonId, "Already confirmed")
    val linkedId = participantIdForUser(seasonId, "inbox-exclude-member")
    seedDraftComposition(draftEventId, linkedId)
    seedValidatedComposition(confirmedEventId, linkedId, SlotParticipationStatus.CONFIRMED)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(2)))
      .andExpect(
        jsonPath(
          "$.actions[*].type",
          org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.equalTo("availability_unknown")),
        ),
      )
  }

  @Test
  fun `noParticipation mirrors agenda semantics`() {
    val member = signIn("inbox-no-part", "inbox-no-part@example.com", "Inbox No Part")
    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.noParticipation").value(true))
      .andExpect(jsonPath("$.actions").isEmpty)
      .andExpect(jsonPath("$.nextEvent").isEmpty)
  }

  @Test
  fun `membership-linked participant without user id receives composition_confirm_pending`() {
    val member = signIn("inbox-mem-link", "inbox-mem-link@example.com", "Inbox Mem Link")
    val season = createDirectSeason("Inbox membership season")
    val event = createDirectEvent(season, "Membership confirm")
    val participantId = linkMembershipOnlySeasonParticipant(season, member)
    seedValidatedComposition(event.id, participantId)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.noParticipation").value(false))
      .andExpect(jsonPath("$.actions", hasSize<Any>(2)))
      .andExpect(jsonPath("$.actions[0].type").value("composition_confirm_pending"))
  }

  @Test
  fun `availability_unknown excludes events beyond 30 calendar days`() {
    val member = signIn("inbox-horizon", "inbox-horizon@example.com", "Inbox Horizon")
    val season = createDirectSeason("Inbox horizon season")
    createDirectEvent(
      season,
      "Far dispo",
      startsAt = Instant.now().plus(31, ChronoUnit.DAYS),
    )
    createDirectEvent(
      season,
      "Near dispo",
      startsAt = Instant.now().plus(5, ChronoUnit.DAYS),
    )
    linkDirectSeasonParticipant(season, member)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(1)))
      .andExpect(jsonPath("$.actions[0].type").value("availability_unknown"))
      .andExpect(jsonPath("$.actions[0].title").value("Near dispo"))
  }

  @Test
  fun `unassigned pending slot is excluded from actions`() {
    val member = signIn("inbox-unassigned", "inbox-unassigned@example.com", "Inbox Unassigned")
    val season = createDirectSeason("Inbox unassigned season")
    val event = createDirectEvent(season, "Open slot")
    linkDirectSeasonParticipant(season, member)
    seedValidatedUnassignedComposition(event.id)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(1)))
      .andExpect(jsonPath("$.actions[0].type").value("availability_unknown"))
  }

  @Test
  fun `pending slot assigned to another member is excluded`() {
    val admin = signInAdmin("inbox-other-admin", "inbox-other-admin@example.com", "Inbox Other Admin")
    val assignee = signIn("inbox-other-assignee", "inbox-other-assignee@example.com", "Inbox Assignee")
    val viewer = signIn("inbox-other-viewer", "inbox-other-viewer@example.com", "Inbox Viewer")
    val seasonId = createSeason(admin.cookie, "Inbox other season")
    val eventId = createEvent(admin.cookie, seasonId, "Shared event")
    val assigneeParticipantId = participantIdForUser(seasonId, "inbox-other-assignee")
    seedValidatedComposition(eventId, assigneeParticipantId)

    mockMvc
      .perform(get("/v1/me/inbox").cookie(viewer.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.actions", hasSize<Any>(1)))
      .andExpect(jsonPath("$.actions[0].type").value("availability_unknown"))
  }
}
