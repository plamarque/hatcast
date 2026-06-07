package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.availability.DrawGoldenFixtureLoader
import com.hatcast.api.composition.dto.CompositionDrawResponseDto
import com.hatcast.api.composition.dto.DrawCompositionRequestDto
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID
import kotlin.random.Random

/**
 * Shared integration helpers for composition draw tests (19.3 golden orchestration + legacy suites).
 */
class DrawTestSupport(
    private val mockMvc: MockMvc,
    private val googleIdTokenService: GoogleIdTokenService,
    private val membershipRepository: TroupeMembershipRepository,
    private val userRepository: UserRepository,
    private val seasonRepository: SeasonRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonParticipantService: SeasonParticipantService,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val eventRepository: EventRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val compositionDrawService: CompositionDrawService,
    private val drawChanceSnapshotRepository: EventDrawChanceSnapshotRepository,
) {
    private val mapper = ObjectMapper()
    val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    data class DrawScenario(
        val seasonId: UUID,
        val eventId: UUID,
        val adminPrincipal: SessionUserPrincipal,
        val participantIds: Map<String, UUID>,
    )

    fun memberCookie(
        googleSub: String,
        admin: Boolean = false,
    ): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Draw Test",
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

    fun adminPrincipal(googleSub: String): SessionUserPrincipal {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user $googleSub")
        return SessionUserPrincipal(
            userId = user.id,
            googleSub = user.googleSub ?: googleSub,
            idpUid = user.idpUid,
            email = user.email,
        )
    }

    fun createSeason(adminCookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Draw season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    fun createEvent(
        adminCookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        roleSlots: Map<String, Int>,
    ): UUID {
        val future = Instant.parse("2031-04-01T19:00:00Z")
        val roleSlotsJson = mapper.writeValueAsString(roleSlots)
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Draw event",
                              "startsAt": "$future",
                              "roleSlots": $roleSlotsJson
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, adminCookie, seasonId, eventId)
        return eventId
    }

    fun createSeasonParticipant(
        seasonId: UUID,
        key: String,
        displayName: String = key,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val id = DrawGoldenFixtureLoader.participantId(key)
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    id = id,
                    season = season,
                    displayName = displayName,
                ),
            ).id
    }

    fun setParticipantAvailability(
        event: EventEntity,
        participantId: UUID,
        status: String,
        roleKeys: List<String>,
        recordedByUserId: UUID,
    ) {
        val stored =
            when (status.lowercase()) {
                "available" -> StoredAvailabilityStatus.AVAILABLE
                "unavailable" -> StoredAvailabilityStatus.UNAVAILABLE
                else -> error("Unknown availability status: $status")
            }
        val participant =
            seasonParticipantRepository.findById(participantId).orElseThrow()
        val existing =
            availabilityRepository.findByEvent_IdAndSeasonParticipant_Id(event.id, participantId)
        val row =
            existing
                ?: EventAvailabilityEntity(
                    event = event,
                    seasonParticipant = participant,
                    status = stored,
                    roleKeys = roleKeys,
                    recordedByUserId = recordedByUserId,
                )
        row.status = stored
        row.roleKeys = roleKeys
        row.updatedAt = Instant.now()
        availabilityRepository.save(row)
    }

    fun assignSlot(
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
        participantId: UUID,
        now: Instant = Instant.now(),
    ) {
        val existing = slotRepository.findByEventIdAndRoleKeyAndSlotIndex(eventId, roleKey, slotIndex)
        val slot =
            existing
                ?: EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = roleKey,
                    slotIndex = slotIndex,
                )
        slot.seasonParticipantId = participantId
        slot.participationStatus = SlotParticipationStatus.PENDING
        slot.updatedAt = now
        slotRepository.save(slot)
        ensureCompositionRow(eventId, now)
    }

    fun validateComposition(eventId: UUID) {
        val now = Instant.now()
        val composition =
            compositionRepository.findById(eventId).orElseGet {
                EventCompositionEntity(
                    eventId = eventId,
                    validatedAt = null,
                    publishedAt = null,
                    createdAt = now,
                    updatedAt = now,
                )
            }
        composition.validatedAt = now
        composition.updatedAt = now
        compositionRepository.save(composition)
    }

    fun lockCompositionWithSlots(
        eventId: UUID,
        slots: List<Triple<String, Int, UUID>>,
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
        slots.forEach { (roleKey, slotIndex, participantId) ->
            slotRepository.save(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = roleKey,
                    slotIndex = slotIndex,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.PENDING,
                ),
            )
        }
    }

    fun drawViaService(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
        mode: String = "full",
        random: Random = Random.Default,
    ): CompositionDrawResponseDto =
        compositionDrawService.drawComposition(
            seasonId = seasonId,
            eventId = eventId,
            body = DrawCompositionRequestDto(mode = mode),
            principal = principal,
            random = random,
        )

    fun slotsForEvent(eventId: UUID): List<EventCompositionSlotEntity> =
        slotRepository.findByEventId(eventId)

    fun snapshotsForEvent(eventId: UUID): List<EventDrawChanceSnapshotEntity> =
        drawChanceSnapshotRepository.findByIdEventId(eventId)

    fun participantIdsFromComposition(body: JsonNode): Set<String> =
        (0 until body.get("composition").get("slots").size())
            .map { body.get("composition").get("slots").get(it) }
            .mapNotNull { slot ->
                slot.get("participantId")?.takeIf { !it.isNull }?.asText()
            }.toSet()

    private fun ensureCompositionRow(
        eventId: UUID,
        now: Instant,
    ) {
        if (compositionRepository.findById(eventId).isEmpty) {
            compositionRepository.save(
                EventCompositionEntity(
                    eventId = eventId,
                    validatedAt = null,
                    publishedAt = null,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        }
    }

    fun setupValidatedPastEvent(
        adminCookie: jakarta.servlet.http.Cookie,
        adminPrincipal: SessionUserPrincipal,
        seasonId: UUID,
        roleSlots: Map<String, Int>,
        assigneeKey: String,
        participantIds: Map<String, UUID>,
    ): UUID {
        val pastEventId = createEvent(adminCookie, seasonId, roleSlots)
        val event = eventRepository.findById(pastEventId).orElseThrow()
        val assigneeId = participantIds.getValue(assigneeKey)
        val roleKey = roleSlots.keys.first()
        participantIds.values.forEach { pid ->
            setParticipantAvailability(
                event = event,
                participantId = pid,
                status = "available",
                roleKeys = listOf(roleKey),
                recordedByUserId = adminPrincipal.userId,
            )
        }
        assignSlot(pastEventId, roleKey, 0, assigneeId)
        validateComposition(pastEventId)
        return pastEventId
    }
}
