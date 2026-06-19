package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
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
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import java.time.Instant

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.10")
class UnfulfilledRoleRequestServiceTest {
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
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var unfulfilledRoleRequestService: UnfulfilledRoleRequestService

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

    @Test
    fun `counts unfulfilled DJ requests when available but peer selected`() {
        val adminCookie = support.memberCookie("sub-urr-admin", admin = true)
        val requester = support.memberCookie("sub-urr-requester")
        val peer = support.memberCookie("sub-urr-peer")
        val seasonId = support.createSeason(adminCookie, title = "Unfulfilled role request season")
        val requesterId = support.participantIdForUser(seasonId, "sub-urr-requester")
        val peerId = support.participantIdForUser(seasonId, "sub-urr-peer")

        val pastId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-03-01T19:00:00Z"))
        support.setAvailability(requester, seasonId, pastId, listOf("dj"))
        support.setAvailability(peer, seasonId, pastId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, pastId, peerId)
        support.validateComposition(pastId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(requesterId, peerId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(1, counts[requesterId])
        assertEquals(0, counts[peerId])
    }

    @Test
    fun `excludes event when participant was selected for role`() {
        val adminCookie = support.memberCookie("sub-urr-fulfilled-admin", admin = true)
        val member = support.memberCookie("sub-urr-fulfilled-member")
        val seasonId = support.createSeason(adminCookie)
        val memberId = support.participantIdForUser(seasonId, "sub-urr-fulfilled-member")

        val pastId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-03-01T19:00:00Z"))
        support.setAvailability(member, seasonId, pastId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, pastId, memberId)
        support.validateComposition(pastId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(memberId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(0, counts[memberId])
    }

    @Test
    fun `empty roleKeys counts as available for all roles`() {
        val adminCookie = support.memberCookie("sub-urr-empty-admin", admin = true)
        val member = support.memberCookie("sub-urr-empty-member")
        val peer = support.memberCookie("sub-urr-empty-peer")
        val seasonId = support.createSeason(adminCookie)
        val memberId = support.participantIdForUser(seasonId, "sub-urr-empty-member")
        val peerId = support.participantIdForUser(seasonId, "sub-urr-empty-peer")

        val pastId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-03-01T19:00:00Z"))
        support.setAvailability(member, seasonId, pastId, emptyList())
        support.setAvailability(peer, seasonId, pastId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, pastId, peerId)
        support.validateComposition(pastId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(memberId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(1, counts[memberId])
    }

    @Test
    fun `excludes event when participant declined after assignment`() {
        val adminCookie = support.memberCookie("sub-urr-declined-admin", admin = true)
        val member = support.memberCookie("sub-urr-declined-member")
        val seasonId = support.createSeason(adminCookie)
        val memberId = support.participantIdForUser(seasonId, "sub-urr-declined-member")

        val pastId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-03-01T19:00:00Z"))
        support.setAvailability(member, seasonId, pastId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, pastId, memberId)
        support.validateComposition(pastId)
        support.declineSlotParticipation(member, seasonId, pastId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(memberId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(0, counts[memberId])
    }

    @Test
    fun `excludes unvalidated composition from count`() {
        val adminCookie = support.memberCookie("sub-urr-unvalidated-admin", admin = true)
        val member = support.memberCookie("sub-urr-unvalidated-member")
        val peer = support.memberCookie("sub-urr-unvalidated-peer")
        val seasonId = support.createSeason(adminCookie)
        val memberId = support.participantIdForUser(seasonId, "sub-urr-unvalidated-member")
        val peerId = support.participantIdForUser(seasonId, "sub-urr-unvalidated-peer")

        val pastId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-03-01T19:00:00Z"))
        support.setAvailability(member, seasonId, pastId, listOf("dj"))
        support.setAvailability(peer, seasonId, pastId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, pastId, peerId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(memberId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(0, counts[memberId])
    }

    @Test
    fun `excludes cross-compartment validated events`() {
        val adminCookie = support.memberCookie("sub-urr-compartment-admin", admin = true)
        val member = support.memberCookie("sub-urr-compartment-member")
        val peer = support.memberCookie("sub-urr-compartment-peer")
        val seasonId = support.createSeason(adminCookie)
        val memberId = support.participantIdForUser(seasonId, "sub-urr-compartment-member")
        val peerId = support.participantIdForUser(seasonId, "sub-urr-compartment-peer")

        val awayId =
            support.createEvent(
                adminCookie,
                seasonId,
                Instant.parse("2031-03-01T19:00:00Z"),
                category = "deplacements",
            )
        support.setAvailability(member, seasonId, awayId, listOf("dj"))
        support.setAvailability(peer, seasonId, awayId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, awayId, peerId)
        support.validateComposition(awayId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val counts =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(memberId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(0, counts[memberId])
    }

    @Test
    fun `retrospective mode excludes validated events after current event`() {
        val adminCookie = support.memberCookie("sub-urr-retro-admin", admin = true)
        val requester = support.memberCookie("sub-urr-retro-requester")
        val peer = support.memberCookie("sub-urr-retro-peer")
        val seasonId = support.createSeason(adminCookie)
        val requesterId = support.participantIdForUser(seasonId, "sub-urr-retro-requester")
        val peerId = support.participantIdForUser(seasonId, "sub-urr-retro-peer")

        val beforeCurrentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-03-01T19:00:00Z"))
        support.setAvailability(requester, seasonId, beforeCurrentId, listOf("dj"))
        support.setAvailability(peer, seasonId, beforeCurrentId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, beforeCurrentId, peerId)
        support.validateComposition(beforeCurrentId)

        val afterCurrentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-07-01T19:00:00Z"))
        support.setAvailability(requester, seasonId, afterCurrentId, listOf("dj"))
        support.setAvailability(peer, seasonId, afterCurrentId, listOf("dj"))
        support.assignSlot(adminCookie, seasonId, afterCurrentId, peerId)
        support.validateComposition(afterCurrentId)

        val currentId =
            support.createEvent(adminCookie, seasonId, Instant.parse("2031-06-01T19:00:00Z"))
        val currentEvent = eventRepository.findById(currentId).orElseThrow()

        val retrospective =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(requesterId),
                mode = SelectionHistoryMode.RETROSPECTIVE,
            )
        val operational =
            unfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(
                event = currentEvent,
                roleKey = "dj",
                participantIds = listOf(requesterId),
                mode = SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(1, retrospective[requesterId])
        assertEquals(2, operational[requesterId])
    }
}
