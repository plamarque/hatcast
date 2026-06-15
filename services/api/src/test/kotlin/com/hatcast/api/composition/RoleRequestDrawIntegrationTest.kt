package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.composition.dto.DrawCompositionRequestDto
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import java.time.Instant
import kotlin.random.Random

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.10")
class RoleRequestDrawIntegrationTest {
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
    private lateinit var compositionDrawService: CompositionDrawService

    @Autowired
    private lateinit var unfulfilledRoleRequestService: UnfulfilledRoleRequestService

    @Autowired
    private lateinit var eventRepository: EventRepository

    /**
     * Deterministic draw seed for Boubou scenario (n=7 → weight 8 vs peer weight 1).
     * With total weight 9, [Random.nextDouble] on seed 0 selects the requester slice first.
     */
    private val requesterWinsDrawSeed: Long = 0L

    private val support by lazy {
        RoleRequestIntegrationTestSupport(
            mockMvc = mockMvc,
            googleIdTokenService = googleIdTokenService,
            membershipRepository = membershipRepository,
            userRepository = userRepository,
            seasonRepository = seasonRepository,
            seasonParticipantRepository = seasonParticipantRepository,
            seasonParticipantService = seasonParticipantService,
            compositionRepository = compositionRepository,
        )
    }

    @TestConfiguration
    class RoleRequestPipelineConfig {
        @Bean
        @Primary
        fun drawWeightPipeline(): DrawWeightPipeline = DrawWeightPipelines.withRoleRequest()
    }

    @Test
    @Tag("FR19")
    fun `role request bonus selects high-count requester over peer with equal past participation`() {
        val adminCookie = support.memberCookie("sub-rr-draw-admin", admin = true)
        val requester = support.memberCookie("sub-rr-draw-requester")
        val peer = support.memberCookie("sub-rr-draw-peer")
        val seasonId = support.createSeason(adminCookie, title = "Role request draw season")
        val requesterId = support.participantIdForUser(seasonId, "sub-rr-draw-requester")
        val peerId = support.participantIdForUser(seasonId, "sub-rr-draw-peer")
        val adminPrincipal = support.adminPrincipal("sub-rr-draw-admin")

        val pastStarts =
            (1..7).map { month ->
                Instant.parse("2031-${month.toString().padStart(2, '0')}-01T19:00:00Z")
            }
        for ((index, startsAt) in pastStarts.withIndex()) {
            val pastEventId =
                support.createEvent(
                    adminCookie,
                    seasonId,
                    startsAt = startsAt,
                    title = "Past DJ show ${index + 1}",
                    roleSlots = mapOf("dj" to 1),
                )
            support.setAvailability(requester, seasonId, pastEventId, listOf("dj"))
            support.setAvailability(peer, seasonId, pastEventId, listOf("dj"))
            support.assignSlot(adminCookie, seasonId, pastEventId, peerId)
            support.validateComposition(pastEventId)
        }

        val currentId =
            support.createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-08-01T19:00:00Z"),
                title = "Current DJ show",
                roleSlots = mapOf("dj" to 1),
            )
        support.setAvailability(requester, seasonId, currentId, listOf("dj"))
        support.setAvailability(peer, seasonId, currentId, listOf("dj"))

        val currentEvent = eventRepository.findById(currentId).orElseThrow()
        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(requesterId, peerId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(7, counts[requesterId])
        assertEquals(0, counts[peerId])

        val result =
            compositionDrawService.drawComposition(
                seasonId = seasonId,
                eventId = currentId,
                body = DrawCompositionRequestDto(mode = "full"),
                principal = adminPrincipal,
                random = Random(requesterWinsDrawSeed),
            )
        assertEquals(
            requesterId,
            result.composition.slots.first { it.roleKey == "dj" }.participantId,
        )
    }
}
