package com.hatcast.api.agenda

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.SlotParticipationStatus
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

/** Verifies role precedence in the member agenda. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserAgendaRolePriorityIntegrationTest {
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
  fun `agenda chooses draw priority when a member has multiple roles`() {
    val troupe = TestAuthSupport.isolatedTroupe(troupeRepository)
    val season = seasonRepository.save(SeasonEntity(troupe = troupe, slug = "priority", title = "Priority"))
    val identity = "agenda-priority-${UUID.randomUUID()}"
    val email = "$identity@example.com"
    val cookie = TestAuthSupport.memberSessionCookieFromGoogleSignIn(
      mockMvc = mockMvc, googleIdTokenService = googleIdTokenService,
      googleSub = identity, email = email, name = "Multi-role", seedTroupeId = troupe.id,
    )
    val user = userRepository.findFirstByEmailIgnoreCase(email)!!
    val participant = seasonParticipantRepository.findActiveForSeasonLinkedToUser(
      season.id, ParticipantStatus.ACTIVE, user.id,
    ).single()
    val now = Instant.now()
    val event = eventRepository.save(EventEntity(
      season = season, title = "Multi-role show", slug = "multi-role",
      startsAt = now.plus(5, ChronoUnit.DAYS), availabilityOpenedAt = now,
      roleSlots = mapOf("volunteer" to 1, "assistant_referee" to 1),
    ))
    compositionRepository.save(EventCompositionEntity(eventId = event.id, validatedAt = now))
    listOf("volunteer", "assistant_referee").forEach { role ->
      slotRepository.save(EventCompositionSlotEntity(
        eventId = event.id, roleKey = role, slotIndex = 0, seasonParticipantId = participant.id,
        participationStatus = SlotParticipationStatus.CONFIRMED,
      ))
    }
    val response = mockMvc.perform(get("/v1/me/agenda").cookie(cookie))
      .andExpect(status().isOk).andReturn().response.contentAsString
    val row = mapper.readTree(response).path("content").first { it.path("eventId").asText() == event.id.toString() }
    assertEquals("assistant_referee", row.path("participantFocus").path("compositionRoleKey").asText())
    assertTrue(row.path("participantFocus").path("inTeam").asBoolean())
    assertEquals("confirmed", row.path("participantFocus").path("slotParticipationStatus").asText())
  }

}
