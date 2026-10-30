package com.hatcast.api.agenda

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID
import kotlin.math.ceil

/**
 * NFR-P2 / PERF-11: GET /me/agenda p95 ≤ 500 ms on a representative, future-relative fixture.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("perf")
class UserAgendaPerformanceIntegrationTest {
  @Autowired
  private lateinit var mockMvc: MockMvc

  @MockBean
  private lateinit var googleIdTokenService: GoogleIdTokenService

  @Autowired
  private lateinit var seasonRepository: SeasonRepository

  @Autowired
  private lateinit var seasonParticipantRepository: SeasonParticipantRepository

  @Autowired
  private lateinit var userRepository: UserRepository

  @Autowired private lateinit var troupeRepository: TroupeRepository
  @Autowired private lateinit var eventRepository: EventRepository
  @Autowired private lateinit var availabilityRepository: EventAvailabilityRepository
  @Autowired private lateinit var compositionRepository: EventCompositionRepository
  @Autowired private lateinit var slotRepository: EventCompositionSlotRepository
  private val mapper = ObjectMapper()

  @Test
  fun `GET me agenda p95 is at most 500ms over 10 sequential requests on representative troupe`() {
    val troupe = TestAuthSupport.isolatedTroupe(troupeRepository)
    val season = seasonRepository.save(SeasonEntity(troupe = troupe, slug = "performance", title = "Performance season"))
    val identity = "agenda-perf-${UUID.randomUUID()}"
    val email = "$identity@example.com"
    val cookie =
      TestAuthSupport.memberSessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = identity,
        email = email,
        name = "Agenda Perf",
        seedTroupeId = troupe.id,
      )
    val user = userRepository.findFirstByEmailIgnoreCase(email)!!
    val participant = seasonParticipantRepository.findActiveForSeasonLinkedToUser(
      season.id, ParticipantStatus.ACTIVE, user.id,
    ).single()
    val roster = listOf(participant) + (1..23).map { index ->
      seasonParticipantRepository.save(SeasonParticipantEntity(season = season, displayName = "Performer $index"))
    }
    val now = Instant.now()
    val events = (1..24).map { index ->
      val event = eventRepository.save(EventEntity(
        season = season, title = "Performance show $index", slug = "performance-$index",
        startsAt = now.plus(index.toLong(), ChronoUnit.DAYS), availabilityOpenedAt = now,
        roleSlots = mapOf("player" to 6, "mc" to 1, "dj" to 1),
      ))
      roster.forEach { member ->
        availabilityRepository.save(EventAvailabilityEntity(
          event = event,
          user = if (member.id == participant.id) user else null,
          seasonParticipant = if (member.id == participant.id) null else member,
          status = StoredAvailabilityStatus.AVAILABLE,
          roleKeys = listOf("player"), recordedByUserId = user.id,
        ))
      }
      if (index % 2 == 0) {
        compositionRepository.save(EventCompositionEntity(eventId = event.id, validatedAt = now))
        roster.take(6).forEachIndexed { slotIndex, member ->
          slotRepository.save(EventCompositionSlotEntity(
            eventId = event.id, roleKey = "player", slotIndex = slotIndex, seasonParticipantId = member.id,
          ))
        }
      }
      event
    }
    assertTrue(events.size >= 24 && events.all { it.startsAt.isAfter(now) && it.availabilityOpenedAt != null })

    val warmupBody =
      mockMvc
        .perform(get("/v1/me/agenda").cookie(cookie))
        .andExpect(status().isOk)
        .andReturn()
        .response
        .contentAsString
    val content = mapper.readTree(warmupBody).path("content")
    val eventCount = content.size()
    assertTrue(
      eventCount >= 20,
      "Expected representative agenda (≥20 upcoming events), got content.length=$eventCount",
    )
    val composedIds = events.filterIndexed { index, _ -> index % 2 == 1 }.map { it.id.toString() }.toSet()
    val collectingIds = events.map { it.id.toString() }.toSet() - composedIds
    val returnedIds = content.map { it.path("eventId").asText() }.toSet()
    assertTrue(returnedIds.any { it in composedIds }, "Warmup must include composed shows")
    assertTrue(returnedIds.any { it in collectingIds }, "Warmup must include collecting shows")
    content.forEach { row ->
      val eventId = row.path("eventId").asText()
      assertTrue(eventId in composedIds || eventId in collectingIds, "Unexpected event $eventId")
      assertEquals("available", row.path("myAvailabilityStatus").asText())
      val focus = row.path("participantFocus")
      assertEquals("available", focus.path("availabilityStatus").asText())
      assertTrue(focus.path("inTeam").isBoolean)
      val composed = eventId in composedIds
      assertEquals(composed, focus.path("inTeam").asBoolean())
      assertEquals(if (composed) "player" else null, focus.path("compositionRoleKey").textValue())
      assertEquals(if (composed) "pending" else null, focus.path("slotParticipationStatus").textValue())
      if (!composed) {
        assertEquals("collecting", row.path("teamStatusBadge").path("key").asText())
      }
    }

    val durationsMs =
      (1..10).map {
        val startedAt = System.nanoTime()
        mockMvc
          .perform(get("/v1/me/agenda").cookie(cookie))
          .andExpect(status().isOk)
        (System.nanoTime() - startedAt) / 1_000_000
      }

    val p95Ms = percentile95(durationsMs)
    assertTrue(
      p95Ms <= 500,
      "Expected agenda p95 ≤ 500 ms, got p95=$p95Ms ms (samples=$durationsMs)",
    )
  }

  private fun percentile95(samplesMs: List<Long>): Long {
    val sorted = samplesMs.sorted()
    val index = ceil(sorted.size * 0.95).toInt() - 1
    return sorted[index.coerceIn(0, sorted.lastIndex)]
  }
}
