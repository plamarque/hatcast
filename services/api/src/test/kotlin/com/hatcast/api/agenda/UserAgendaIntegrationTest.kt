package com.hatcast.api.agenda

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventSlugGenerator
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.Cookie
import org.hamcrest.Matchers.containsInAnyOrder
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
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class UserAgendaIntegrationTest {
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
  private lateinit var troupeRepository: TroupeRepository

  @Autowired
  private lateinit var seasonRepository: SeasonRepository

  @Autowired
  private lateinit var eventRepository: EventRepository

  @Autowired
  private lateinit var seasonParticipantRepository: SeasonParticipantRepository

  @Autowired
  private lateinit var eventParticipantRepository: EventParticipantRepository

  private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
  private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
  private val mapper = ObjectMapper()

  private data class SessionFixture(
    val cookie: Cookie,
    val userId: String,
  )

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

  private fun signInAdmin(
    googleSub: String,
    email: String,
    displayName: String,
  ): SessionFixture =
    signIn(googleSub, email, displayName).also { fixture ->
      val membership =
        troupeMembershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, UUID.fromString(fixture.userId))
          ?: error("Missing seed membership")
      membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
      troupeMembershipRepository.save(membership)
    }

  private fun createSeason(
    cookie: Cookie,
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

  private fun syncSeasonParticipants(
    cookie: Cookie,
    seasonId: UUID,
  ) {
    mockMvc
      .perform(get("/v1/seasons/$seasonId/participants").cookie(cookie))
      .andExpect(status().isOk)
  }

  private fun createEvent(
    cookie: Cookie,
    seasonId: UUID,
    title: String,
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
                "startsAt": "2030-06-15T18:00:00Z"
              }
              """.trimIndent(),
            ).with(csrf()),
        ).andExpect(status().isOk)
        .andReturn()
    return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
  }

  private fun seedTroupe(): TroupeEntity =
    troupeRepository.findById(seedTroupeId).orElseThrow { error("Missing seed troupe") }

  private fun createDirectSeason(
    troupe: TroupeEntity = seedTroupe(),
    title: String,
  ): SeasonEntity =
    seasonRepository.save(
      SeasonEntity(
        troupe = troupe,
        slug = "agenda-${UUID.randomUUID().toString().take(8)}",
        title = title,
      ),
    )

  private fun createDirectEvent(
    season: SeasonEntity,
    title: String,
    startsAt: Instant = Instant.parse("2030-06-15T18:00:00Z"),
    archived: Boolean = false,
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
        archived = archived,
      ),
    )

  private fun linkDirectSeasonParticipant(
    season: SeasonEntity,
    fixture: SessionFixture,
    displayName: String = "Agenda Direct Participant",
  ) {
    val user = userRepository.findById(UUID.fromString(fixture.userId)).orElseThrow()
    seasonParticipantRepository.save(
      SeasonParticipantEntity(
        season = season,
        displayName = displayName,
        normalizedEmail = requireNotNull(user.email).lowercase(),
        user = user,
        status = ParticipantStatus.ACTIVE,
      ),
    )
  }

  private fun linkDirectEventParticipant(
    event: EventEntity,
    fixture: SessionFixture,
    displayName: String = "Agenda Direct Event Participant",
  ) {
    val user = userRepository.findById(UUID.fromString(fixture.userId)).orElseThrow()
    eventParticipantRepository.save(
      EventParticipantEntity(
        event = event,
        displayName = displayName,
        normalizedEmail = requireNotNull(user.email).lowercase(),
        user = user,
        status = ParticipantStatus.ACTIVE,
      ),
    )
  }

  @Test
  fun `unauthenticated request returns 401`() {
    mockMvc
      .perform(get("/v1/me/agenda"))
      .andExpect(status().isUnauthorized)
  }

  @Test
  fun `size above 50 returns 400`() {
    val admin = signInAdmin("agenda-admin-size", "agenda-admin-size@example.com", "Agenda Admin Size")
    mockMvc
      .perform(get("/v1/me/agenda?size=51").cookie(admin.cookie))
      .andExpect(status().isBadRequest)
  }

  @Test
  fun `user with no participation gets empty agenda and filterBarVisible false`() {
    val member = signIn("agenda-no-part", "agenda-no-part@example.com", "No Part")
    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content").isEmpty)
      .andExpect(jsonPath("$.filterBarVisible").value(false))
      .andExpect(jsonPath("$.noParticipation").value(true))
  }

  @Test
  fun `participating user with no upcoming event gets empty agenda and noParticipation false`() {
    val member = signIn("agenda-no-upcoming", "agenda-no-upcoming@example.com", "No Upcoming")
    val season = createDirectSeason(title = "Agenda no upcoming season")
    linkDirectSeasonParticipant(season, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content").isEmpty)
      .andExpect(jsonPath("$.filterBarVisible").value(false))
      .andExpect(jsonPath("$.noParticipation").value(false))
  }

  @Test
  fun `default list returns upcoming events with league and troupe context`() {
    val admin = signInAdmin("agenda-admin-list", "agenda-admin-list@example.com", "Agenda Admin List")
    val seasonId = createSeason(admin.cookie, "Agenda list season")
    syncSeasonParticipants(admin.cookie, seasonId)
    val eventId = createEvent(admin.cookie, seasonId, "Agenda match")

    mockMvc
      .perform(get("/v1/me/agenda").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.content[0].eventId").value(eventId.toString()))
      .andExpect(jsonPath("$.content[0].title").value("Agenda match"))
      .andExpect(jsonPath("$.content[0].troupeId").value(seedTroupeId.toString()))
      .andExpect(jsonPath("$.content[0].leagueId").value(seasonId.toString()))
      .andExpect(jsonPath("$.content[0].myAvailabilityStatus").value("unknown"))
      .andExpect(jsonPath("$.content[0].teamStatusBadge.key").value("collecting"))
      .andExpect(jsonPath("$.content[0].teamStatusBadge.shortLabel").value("Collecte"))
      .andExpect(jsonPath("$.filterBarVisible").value(false))
      .andExpect(jsonPath("$.noParticipation").value(false))
  }

  @Test
  fun `default list aggregates events from multiple leagues`() {
    val member = signIn("agenda-multi-league", "agenda-multi-league@example.com", "Agenda Multi League")
    val seasonOne = createDirectSeason(title = "Agenda aggregate one")
    val seasonTwo = createDirectSeason(title = "Agenda aggregate two")
    val eventOne = createDirectEvent(seasonOne, "Aggregate one")
    val eventTwo = createDirectEvent(seasonTwo, "Aggregate two")
    linkDirectSeasonParticipant(seasonOne, member)
    linkDirectSeasonParticipant(seasonTwo, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(2))
      .andExpect(jsonPath("$.content[*].eventId", containsInAnyOrder(eventOne.id.toString(), eventTwo.id.toString())))
      .andExpect(jsonPath("$.filterBarVisible").value(true))
      .andExpect(jsonPath("$.participationFilters.troupes.length()").value(1))
      .andExpect(jsonPath("$.participationFilters.leagues.length()").value(2))
      .andExpect(
        jsonPath(
          "$.participationFilters.leagues[*].id",
          containsInAnyOrder(seasonOne.id.toString(), seasonTwo.id.toString()),
        ),
      )
  }

  @Test
  fun `participationFilters omitted when filterBarVisible false`() {
    val member = signIn("agenda-no-filters-catalog", "agenda-no-filters-catalog@example.com", "Agenda No Filters Catalog")
    val season = createDirectSeason(title = "Agenda single catalog")
    linkDirectSeasonParticipant(season, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.filterBarVisible").value(false))
      .andExpect(jsonPath("$.participationFilters").doesNotExist())
  }

  @Test
  fun `participationFilters unchanged when troupeId filters content`() {
    val member = signIn("agenda-filter-catalog", "agenda-filter-catalog@example.com", "Agenda Filter Catalog")
    val otherTroupe =
      troupeRepository.save(
        TroupeEntity(
          id = UUID.randomUUID(),
          name = "Agenda Catalog Other Troupe",
          slug = "agenda-catalog-other-${UUID.randomUUID().toString().take(8)}",
        ),
      )
    val seedSeason = createDirectSeason(title = "Agenda catalog home")
    val otherSeason = createDirectSeason(troupe = otherTroupe, title = "Agenda catalog away")
    createDirectEvent(seedSeason, "Catalog home event")
    createDirectEvent(otherSeason, "Catalog away event")
    linkDirectSeasonParticipant(seedSeason, member)
    linkDirectSeasonParticipant(otherSeason, member)

    mockMvc
      .perform(get("/v1/me/agenda?troupeId=$seedTroupeId").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.filterBarVisible").value(true))
      .andExpect(jsonPath("$.participationFilters.troupes.length()").value(2))
      .andExpect(jsonPath("$.participationFilters.leagues.length()").value(2))
  }

  @Test
  fun `inter troupe encounter returns two separate agenda items`() {
    val member = signIn("agenda-inter-troupe", "agenda-inter-troupe@example.com", "Agenda Inter Troupe")
    val otherTroupe =
      troupeRepository.save(
        TroupeEntity(
          id = UUID.randomUUID(),
          name = "Agenda Other Troupe",
          slug = "agenda-other-${UUID.randomUUID().toString().take(8)}",
        ),
      )
    val seedSeason = createDirectSeason(title = "Agenda home encounter")
    val otherSeason = createDirectSeason(troupe = otherTroupe, title = "Agenda away encounter")
    val homeEvent = createDirectEvent(seedSeason, "Shared encounter")
    val awayEvent = createDirectEvent(otherSeason, "Shared encounter")
    linkDirectSeasonParticipant(seedSeason, member)
    linkDirectSeasonParticipant(otherSeason, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(2))
      .andExpect(jsonPath("$.content[*].eventId", containsInAnyOrder(homeEvent.id.toString(), awayEvent.id.toString())))
      .andExpect(jsonPath("$.content[*].troupeId", containsInAnyOrder(seedTroupeId.toString(), otherTroupe.id.toString())))
  }

  @Test
  fun `archived events and archived leagues are excluded`() {
    val member = signIn("agenda-archived", "agenda-archived@example.com", "Agenda Archived")
    val visibleSeason = createDirectSeason(title = "Agenda visible archive test")
    val archivedSeason = createDirectSeason(title = "Agenda archived league").also {
      it.archived = true
      seasonRepository.save(it)
    }
    val visibleEvent = createDirectEvent(visibleSeason, "Visible agenda event")
    val archivedEvent = createDirectEvent(visibleSeason, "Archived agenda event", archived = true)
    val eventInArchivedSeason = createDirectEvent(archivedSeason, "Hidden archived league event")
    linkDirectSeasonParticipant(visibleSeason, member)
    linkDirectSeasonParticipant(archivedSeason, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.content[0].eventId").value(visibleEvent.id.toString()))
      .andExpect(jsonPath("$.content[*].eventId", containsInAnyOrder(visibleEvent.id.toString())))
  }

  @Test
  fun `archived event only participation does not make filter bar visible`() {
    val member = signIn("agenda-archived-event-only", "agenda-archived-event-only@example.com", "Agenda Archived Event Only")
    val visibleSeason = createDirectSeason(title = "Agenda visible event-only")
    val archivedEventOnlySeason = createDirectSeason(title = "Agenda hidden event-only")
    val visibleEvent = createDirectEvent(visibleSeason, "Visible season event")
    val archivedEventOnly = createDirectEvent(archivedEventOnlySeason, "Archived event-only", archived = true)
    linkDirectSeasonParticipant(visibleSeason, member)
    linkDirectEventParticipant(archivedEventOnly, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.content[0].eventId").value(visibleEvent.id.toString()))
      .andExpect(jsonPath("$.filterBarVisible").value(false))
  }

  @Test
  fun `pagination response exposes spring page metadata`() {
    val member = signIn("agenda-page-metadata", "agenda-page-metadata@example.com", "Agenda Page Metadata")
    val season = createDirectSeason(title = "Agenda metadata")
    createDirectEvent(season, "First metadata event")
    createDirectEvent(season, "Second metadata event")
    linkDirectSeasonParticipant(season, member)

    mockMvc
      .perform(get("/v1/me/agenda?page=0&size=1").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.page").value(0))
      .andExpect(jsonPath("$.size").value(1))
      .andExpect(jsonPath("$.totalElements").value(2))
      .andExpect(jsonPath("$.totalPages").value(2))
  }

  @Test
  fun `invalid uuid filters return 400`() {
    val member = signIn("agenda-invalid-uuid", "agenda-invalid-uuid@example.com", "Agenda Invalid UUID")
    mockMvc
      .perform(get("/v1/me/agenda?troupeId=not-a-uuid").cookie(member.cookie))
      .andExpect(status().isBadRequest)

    mockMvc
      .perform(get("/v1/me/agenda?leagueId=not-a-uuid").cookie(member.cookie))
      .andExpect(status().isBadRequest)
  }

  @Test
  fun `upcoming scope starts at paris civil day boundary`() {
    val member = signIn("agenda-paris-boundary", "agenda-paris-boundary@example.com", "Agenda Paris Boundary")
    val season = createDirectSeason(title = "Agenda Paris boundary")
    val boundary = AgendaTimeBoundary.startOfTodayInclusive()
    val pastEvent = createDirectEvent(season, "Before Paris day", startsAt = boundary.minusSeconds(1))
    val boundaryEvent = createDirectEvent(season, "At Paris day", startsAt = boundary)
    linkDirectSeasonParticipant(season, member)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(member.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.content[0].eventId").value(boundaryEvent.id.toString()))
      .andExpect(jsonPath("$.content[*].eventId", containsInAnyOrder(boundaryEvent.id.toString())))
  }

  @Test
  fun `troupeId filter restricts results`() {
    val admin = signInAdmin("agenda-admin-troupe", "agenda-admin-troupe@example.com", "Agenda Admin Troupe")
    val seasonId = createSeason(admin.cookie, "Agenda troupe filter")
    syncSeasonParticipants(admin.cookie, seasonId)
    createEvent(admin.cookie, seasonId, "Filtered event")

    mockMvc
      .perform(get("/v1/me/agenda?troupeId=$seedTroupeId").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))

    val otherTroupeId = UUID.fromString("00000000-0000-4000-8000-000000000099")
    mockMvc
      .perform(get("/v1/me/agenda?troupeId=$otherTroupeId").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content").isEmpty)
  }

  @Test
  fun `leagueId filter restricts results`() {
    val admin = signInAdmin("agenda-admin-league", "agenda-admin-league@example.com", "Agenda Admin League")
    val seasonId = createSeason(admin.cookie, "Agenda league filter")
    syncSeasonParticipants(admin.cookie, seasonId)
    createEvent(admin.cookie, seasonId, "League filtered event")

    mockMvc
      .perform(get("/v1/me/agenda?leagueId=$seasonId").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))

    val otherLeagueId = UUID.fromString("00000000-0000-4000-8000-000000000098")
    mockMvc
      .perform(get("/v1/me/agenda?leagueId=$otherLeagueId").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content").isEmpty)
  }

  @Test
  fun `filterBarVisible is true when user participates in two leagues`() {
    val admin = signInAdmin("agenda-admin-filters", "agenda-admin-filters@example.com", "Agenda Admin Filters")
    val seasonOne = createSeason(admin.cookie, "Agenda league one")
    val seasonTwo = createSeason(admin.cookie, "Agenda league two")
    syncSeasonParticipants(admin.cookie, seasonOne)
    syncSeasonParticipants(admin.cookie, seasonTwo)
    createEvent(admin.cookie, seasonOne, "League one event")

    mockMvc
      .perform(get("/v1/me/agenda").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.filterBarVisible").value(true))
  }

  @Test
  fun `event-only participant sees event without season roster row`() {
    val admin = signInAdmin("agenda-admin-event-only", "agenda-admin-event-only@example.com", "Agenda Admin Event Only")
    val guest = signIn("agenda-guest-only", "agenda-guest-only@example.com", "Agenda Guest Only")
    val seasonId = createSeason(admin.cookie, "Agenda event-only season")
    syncSeasonParticipants(admin.cookie, seasonId)
    val eventId = createEvent(admin.cookie, seasonId, "Guest-only show")

    mockMvc
      .perform(
        post("/v1/seasons/$seasonId/events/$eventId/participants")
          .cookie(admin.cookie)
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            """
            {
              "displayName": "Guest Player",
              "email": "agenda-guest-only@example.com"
            }
            """.trimIndent(),
          ).with(csrf()),
      ).andExpect(status().isOk)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(guest.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content.length()").value(1))
      .andExpect(jsonPath("$.content[0].eventId").value(eventId.toString()))
      .andExpect(jsonPath("$.filterBarVisible").value(false))
  }

  @Test
  fun `seed season upcoming events appear for linked season participant`() {
    val admin = signInAdmin("agenda-admin-seed", "agenda-admin-seed@example.com", "Agenda Admin Seed")
    mockMvc
      .perform(
        post("/v1/seasons/$seedSeasonId/participants")
          .cookie(admin.cookie)
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            """
            {
              "displayName": "Agenda Admin Seed",
              "email": "agenda-admin-seed@example.com"
            }
            """.trimIndent(),
          ).with(csrf()),
      ).andExpect(status().isOk)

    mockMvc
      .perform(get("/v1/me/agenda").cookie(admin.cookie))
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.content").isNotEmpty)
      .andExpect(jsonPath("$.content[0].leagueId").value(seedSeasonId.toString()))
      .andExpect(jsonPath("$.content[0].troupeSlug").value("les-improbots"))
  }
}
