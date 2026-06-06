package com.hatcast.api.participant

import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeExterneCarnetService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import java.util.UUID

class SeasonParticipantServiceTest {
    private val seasonParticipantRepository = mock<SeasonParticipantRepository>()
    private val seasonRepository = mock<SeasonRepository>()
    private val troupeMembershipRepository = mock<TroupeMembershipRepository>()
    private val userRepository = mock<UserRepository>()
    private val participantAccess = mock<ParticipantAccessService>()
    private val participantLink = ParticipantLinkService(userRepository, seasonParticipantRepository, mock())
    private val membershipSync =
        SeasonParticipantMembershipSync(seasonParticipantRepository, seasonRepository, participantLink)
    private val auditRecorder = mock<AuditEventRecorder>()
    private val avatarService = mock<AvatarService>()
    private val troupeExterneCarnetService = mock<TroupeExterneCarnetService>()

    private val service =
        SeasonParticipantService(
            seasonParticipantRepository,
            seasonRepository,
            troupeMembershipRepository,
            userRepository,
            participantAccess,
            participantLink,
            membershipSync,
            auditRecorder,
            avatarService,
            troupeExterneCarnetService,
        )

    @Test
    fun `ensureMembershipParticipants is idempotent for existing membership rows`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val user = UserEntity(id = UUID.randomUUID(), email = "member@example.com", displayName = "Member")
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = "Member",
            )
        val existing =
            SeasonParticipantEntity(
                season = season,
                displayName = "Member",
                normalizedEmail = "member@example.com",
                user = user,
                troupeMembership = membership,
                status = ParticipantStatus.ACTIVE,
            )

        whenever(
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                troupe.id,
                listOf(TroupeMembershipStatus.ACTIVE),
            ),
        ).thenReturn(listOf(membership))
        whenever(seasonParticipantRepository.findBySeason_IdAndTroupeMembership_IdIn(season.id, listOf(membership.id)))
            .thenReturn(listOf(existing))
        whenever(seasonParticipantRepository.findActiveLinkedToInactiveMembershipsForSeason(season.id))
            .thenReturn(emptyList())
        whenever(seasonParticipantRepository.save(any())).thenAnswer { it.getArgument(0) }
        whenever(seasonParticipantRepository.saveAll(any<List<SeasonParticipantEntity>>()))
            .thenAnswer { it.getArgument<List<SeasonParticipantEntity>>(0) }
        whenever(seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE))
            .thenReturn(1)
        whenever(seasonRepository.save(any())).thenAnswer { it.getArgument(0) }

        MembershipSyncScope.clear()
        MembershipParticipantSyncCache.invalidate(season.id)
        service.ensureMembershipParticipants(season)
        service.ensureMembershipParticipants(season)

        verify(seasonParticipantRepository, times(1))
            .findBySeason_IdAndTroupeMembership_IdIn(season.id, listOf(membership.id))
        verify(seasonParticipantRepository, never()).saveAll(any<List<SeasonParticipantEntity>>())
        verify(seasonParticipantRepository, never()).save(any())

        MembershipSyncScope.clear()
        service.ensureMembershipParticipants(season)
        verify(troupeMembershipRepository, times(1)).findByTroupe_IdAndStatusIn(any(), any())
    }

    @Test
    fun `ensureSeasonParticipantForMembership is idempotent`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val user = UserEntity(id = UUID.randomUUID(), email = "member@example.com", displayName = "Member")
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = "Member",
            )
        val existing =
            SeasonParticipantEntity(
                season = season,
                displayName = "Member",
                normalizedEmail = "member@example.com",
                user = user,
                troupeMembership = membership,
                status = ParticipantStatus.ACTIVE,
            )

        whenever(
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(season.id, membership.id),
        ).thenReturn(existing)

        service.ensureSeasonParticipantForMembership(season, membership)
        service.ensureSeasonParticipantForMembership(season, membership)

        verify(seasonParticipantRepository, never()).save(any())
    }

    @Test
    fun `ensureMembershipParticipants does not reactivate season admin removals`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val user = UserEntity(id = UUID.randomUUID(), email = "member@example.com", displayName = "Member")
        val membership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = "Member",
            )
        val removedBySeasonAdmin =
            SeasonParticipantEntity(
                season = season,
                displayName = "Member",
                normalizedEmail = "member@example.com",
                user = user,
                troupeMembership = membership,
                status = ParticipantStatus.REMOVED,
                removalSource = SeasonParticipantRemovalSource.SEASON_ADMIN,
            )

        whenever(
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                troupe.id,
                listOf(TroupeMembershipStatus.ACTIVE),
            ),
        ).thenReturn(listOf(membership))
        whenever(seasonParticipantRepository.findBySeason_IdAndTroupeMembership_IdIn(season.id, listOf(membership.id)))
            .thenReturn(listOf(removedBySeasonAdmin))
        whenever(seasonParticipantRepository.findActiveLinkedToInactiveMembershipsForSeason(season.id))
            .thenReturn(emptyList())

        MembershipSyncScope.clear()
        MembershipParticipantSyncCache.invalidate(season.id)
        service.ensureMembershipParticipants(season)

        verify(seasonParticipantRepository, never()).save(any())
        verify(seasonParticipantRepository, never()).saveAll(any<List<SeasonParticipantEntity>>())
    }

    @Test
    fun `ensureMembershipParticipants skips EXTERNE troupe memberships`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, slug = "saison", title = "Saison")
        val memberUser = UserEntity(id = UUID.randomUUID(), email = "member@example.com", displayName = "Member")
        val memberMembership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = memberUser,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = "Member",
            )
        val externeMembership =
            TroupeMembershipEntity(
                troupe = troupe,
                user = null,
                normalizedEmail = "dj@example.com",
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = com.hatcast.api.troupe.TroupeBaselineRole.EXTERNE,
                displayName = "DJ local",
            )

        whenever(
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                troupe.id,
                listOf(TroupeMembershipStatus.ACTIVE),
            ),
        ).thenReturn(listOf(memberMembership, externeMembership))
        whenever(
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_IdIn(
                season.id,
                listOf(memberMembership.id, externeMembership.id),
            ),
        ).thenReturn(emptyList())
        whenever(seasonParticipantRepository.findActiveLinkedToInactiveMembershipsForSeason(season.id))
            .thenReturn(emptyList())
        whenever(seasonParticipantRepository.saveAll(any<List<SeasonParticipantEntity>>()))
            .thenAnswer { it.getArgument<List<SeasonParticipantEntity>>(0) }
        whenever(seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE))
            .thenReturn(1)
        whenever(seasonRepository.save(any())).thenAnswer { it.getArgument(0) }

        MembershipSyncScope.clear()
        MembershipParticipantSyncCache.invalidate(season.id)
        service.ensureMembershipParticipants(season)

        verify(seasonParticipantRepository, times(1)).saveAll(
            org.mockito.kotlin.argThat { saved: List<SeasonParticipantEntity> ->
                saved.size == 1 && saved[0].troupeMembership?.id == memberMembership.id
            },
        )
    }
}
