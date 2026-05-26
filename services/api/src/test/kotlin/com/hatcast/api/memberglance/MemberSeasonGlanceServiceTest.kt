package com.hatcast.api.memberglance

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.memberprofile.MemberProfileStatsProvider
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import com.hatcast.api.agenda.UserAgendaRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional
import java.util.UUID

class MemberSeasonGlanceServiceTest {
    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")

    private val userRepository: UserRepository = mock()
    private val seasonRepository: SeasonRepository = mock()
    private val membershipRepository: TroupeMembershipRepository = mock()
    private val userAgendaRepository: UserAgendaRepository = mock()
    private val statsProvider: MemberProfileStatsProvider = mock()
    private val troupeAccess: TroupeAccessService = mock()

    private val service =
        MemberSeasonGlanceService(
            userRepository = userRepository,
            seasonRepository = seasonRepository,
            membershipRepository = membershipRepository,
            userAgendaRepository = userAgendaRepository,
            statsProvider = statsProvider,
            troupeAccess = troupeAccess,
        )

    @Test
    fun `self glance does not require viewer troupe membership`() {
        val userId = UUID.randomUUID()
        val target = user(id = userId, slug = "self-user")
        val season = season(seedSeasonId, seedTroupeId)
        val membership = activeMembership(target, "Self")

        stubParticipation(userId, troupeIds = setOf(seedTroupeId), leagueIds = setOf(seedSeasonId))
        whenever(userRepository.findBySlug("self-user")).thenReturn(target)
        whenever(seasonRepository.findById(seedSeasonId)).thenReturn(Optional.of(season))
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, userId)).thenReturn(membership)
        whenever(statsProvider.loadStats(seedSeasonId, userId)).thenReturn(null)
        whenever(statsProvider.loadMonthlyChart(seedSeasonId, userId)).thenReturn(emptyList())
        whenever(statsProvider.loadFavoriteRoleCounts(seedSeasonId, userId)).thenReturn(emptyList())

        val result =
            service.getSeasonGlance(
                userSlug = "self-user",
                principal = principal(userId),
                troupeId = null,
                leagueId = seedSeasonId,
            )

        assertEquals(userId, result.userId)
        verify(troupeAccess, never()).requireActiveMember(any(), any())
    }

    @Test
    fun `non-self viewer must be active member of resolved season troupe`() {
        val viewerId = UUID.randomUUID()
        val targetId = UUID.randomUUID()
        val target = user(id = targetId, slug = "other-user")
        val season = season(seedSeasonId, seedTroupeId)
        val membership = activeMembership(target, "Other")

        stubParticipation(targetId, troupeIds = setOf(seedTroupeId), leagueIds = setOf(seedSeasonId))
        whenever(userRepository.findBySlug("other-user")).thenReturn(target)
        whenever(seasonRepository.findById(seedSeasonId)).thenReturn(Optional.of(season))
        whenever(membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, targetId)).thenReturn(membership)
        whenever(troupeAccess.requireActiveMember(any(), eq(seedTroupeId))).thenThrow(
            ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé pour cette troupe."),
        )

        val ex =
            assertThrows<ResponseStatusException> {
                service.getSeasonGlance(
                    userSlug = "other-user",
                    principal = principal(viewerId),
                    troupeId = null,
                    leagueId = seedSeasonId,
                )
            }

        assertEquals(HttpStatus.FORBIDDEN, ex.statusCode)
        verify(troupeAccess).requireActiveMember(any(), eq(seedTroupeId))
    }

    private fun stubParticipation(
        userId: UUID,
        troupeIds: Set<UUID>,
        leagueIds: Set<UUID>,
    ) {
        whenever(userAgendaRepository.findParticipatingTroupeIdsFromSeason(userId)).thenReturn(troupeIds.toList())
        whenever(userAgendaRepository.findParticipatingTroupeIdsFromEventOnly(userId)).thenReturn(emptyList())
        whenever(userAgendaRepository.findParticipatingLeagueIdsFromSeason(userId)).thenReturn(leagueIds.toList())
        whenever(userAgendaRepository.findParticipatingLeagueIdsFromEventOnly(userId)).thenReturn(emptyList())
    }

    private fun user(
        id: UUID,
        slug: String,
    ): UserEntity =
        UserEntity(
            id = id,
            slug = slug,
            displayName = "User",
            email = "$slug@example.com",
        )

    private fun season(
        id: UUID,
        troupeId: UUID,
    ): SeasonEntity {
        val troupe = TroupeEntity(id = troupeId, name = "Troupe", slug = "troupe")
        return SeasonEntity(
            id = id,
            troupe = troupe,
            slug = "season",
            title = "Season",
            archived = false,
        )
    }

    private fun activeMembership(
        user: UserEntity,
        displayName: String,
    ): TroupeMembershipEntity {
        val membership = mock<TroupeMembershipEntity>()
        whenever(membership.status).thenReturn(TroupeMembershipStatus.ACTIVE)
        whenever(membership.displayName).thenReturn(displayName)
        whenever(membership.preferredRoleKeys).thenReturn(emptyList())
        whenever(membership.user).thenReturn(user)
        return membership
    }

    private fun principal(userId: UUID) =
        SessionUserPrincipal(
            userId = userId,
            googleSub = "sub-$userId",
            idpUid = "idp-$userId",
            email = "$userId@example.com",
        )
}
