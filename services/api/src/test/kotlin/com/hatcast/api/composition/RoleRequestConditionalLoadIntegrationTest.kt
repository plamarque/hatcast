package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.dto.DrawCompositionRequestDto
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import java.time.Instant
import kotlin.random.Random

/**
 * AC18 — role-request counts load only when [DrawWeightPipelines.includesRoleRequest] (19.10, deferred until 19.16 prod).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Tag("19.10")
class RoleRequestConditionalLoadIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var unfulfilledRoleRequestService: UnfulfilledRoleRequestService

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
    @Tag("AC18")
    fun `DEFAULT pipeline draw never loads unfulfilled role request counts`() {
        val adminCookie = support.memberCookie("sub-rr-ac18-admin", admin = true)
        val memberA = support.memberCookie("sub-rr-ac18-a")
        val memberB = support.memberCookie("sub-rr-ac18-b")
        val seasonId = support.createSeason(adminCookie, title = "Role request AC18 season")
        support.participantIdForUser(seasonId, "sub-rr-ac18-a")
        support.participantIdForUser(seasonId, "sub-rr-ac18-b")
        val adminPrincipal = support.adminPrincipal("sub-rr-ac18-admin")

        val eventId =
            support.createEvent(
                adminCookie,
                seasonId,
                startsAt = Instant.parse("2031-09-01T19:00:00Z"),
                title = "AC18 draw show",
                roleSlots = mapOf("dj" to 1),
            )
        support.setAvailability(memberA, seasonId, eventId, listOf("dj"))
        support.setAvailability(memberB, seasonId, eventId, listOf("dj"))

        compositionDrawService.drawComposition(
            seasonId = seasonId,
            eventId = eventId,
            body = DrawCompositionRequestDto(mode = "full"),
            principal = adminPrincipal,
            random = Random(0),
        )

        verify(unfulfilledRoleRequestService, never()).unfulfilledRoleRequestCountByParticipant(
            any(),
            any(),
            any(),
            any(),
        )
    }
}
