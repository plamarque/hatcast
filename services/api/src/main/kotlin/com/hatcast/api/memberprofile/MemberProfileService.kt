package com.hatcast.api.memberprofile

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.memberprofile.dto.MemberProfileSummaryDto
import com.hatcast.api.memberprofile.dto.PreferredRolesResponseDto
import com.hatcast.api.memberprofile.dto.UpdatePreferredRolesRequest
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.PreferredRoleKeys
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipService
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class MemberProfileService(
    private val seasonRepository: SeasonRepository,
    private val membershipRepository: TroupeMembershipRepository,
    private val membershipService: TroupeMembershipService,
    private val troupeAccess: TroupeAccessService,
    private val statsProvider: MemberProfileStatsProvider,
) {
    @Transactional(readOnly = true)
    fun getProfileSummary(
        seasonId: UUID,
        targetUserId: UUID,
        principal: SessionUserPrincipal,
    ): MemberProfileSummaryDto {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val targetMembership =
            membershipRepository.findByTroupe_IdAndUser_Id(season.troupe.id, targetUserId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")
        if (targetMembership.status != TroupeMembershipStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")
        }
        val isSelf = principal.userId == targetUserId
        val stats = statsProvider.loadStats(seasonId, targetUserId)
        val monthlyChart = statsProvider.loadMonthlyChart(seasonId, targetUserId)
        val favoriteRoleCounts = statsProvider.loadFavoriteRoleCounts(seasonId, targetUserId)
        return MemberProfileSummaryDto(
            userId = targetUserId,
            membershipId = targetMembership.id,
            displayName = targetMembership.displayName,
            avatarUrl =
                AvatarService.publicAvatarUrl(
                    targetMembership.user.id,
                    targetMembership.user.avatarUpdatedAt,
                ),
            isSelf = isSelf,
            stats = stats,
            monthlyChart = monthlyChart,
            favoriteRoleCounts = favoriteRoleCounts,
            preferredRoleKeys =
                if (isSelf) {
                    PreferredRoleKeys.effectiveKeys(targetMembership.preferredRoleKeys)
                } else {
                    null
                },
        )
    }

    @Transactional(readOnly = true)
    fun getPreferredRoles(
        userId: UUID,
        troupeId: UUID,
    ): PreferredRolesResponseDto {
        val membership = membershipService.requireActiveMembership(userId, troupeId)
        return PreferredRolesResponseDto(
            preferredRoleKeys = PreferredRoleKeys.effectiveKeys(membership.preferredRoleKeys),
        )
    }

    @Transactional
    fun updatePreferredRoles(
        userId: UUID,
        troupeId: UUID,
        body: UpdatePreferredRolesRequest,
    ): PreferredRolesResponseDto {
        val membership = membershipService.requireActiveMembership(userId, troupeId)
        val normalized = PreferredRoleKeys.normalize(body.preferredRoleKeys)
        membership.preferredRoleKeys = normalized
        membership.updatedAt = Instant.now()
        membershipRepository.save(membership)
        return PreferredRolesResponseDto(preferredRoleKeys = normalized)
    }
}
