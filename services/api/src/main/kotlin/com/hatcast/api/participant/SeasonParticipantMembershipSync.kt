package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

/**
 * Sync d'un participant de saison à partir d'une adhésion troupe — sans dépendance
 * vers [SeasonParticipantService] (évite cycle Spring via [ParticipantAccessService]).
 */
@Component
class SeasonParticipantMembershipSync(
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val seasonRepository: SeasonRepository,
    private val participantLink: ParticipantLinkService,
) {
    @Transactional
    fun ensureForMembership(
        season: SeasonEntity,
        membership: TroupeMembershipEntity,
    ) {
        if (membership.baselineRole == com.hatcast.api.troupe.TroupeBaselineRole.EXTERNE) {
            return
        }
        if (membership.status != TroupeMembershipStatus.ACTIVE) {
            removeForMembership(season, membership)
            return
        }
        val normalizedEmail =
            membership.user?.email?.let { participantLink.normalizeEmail(it) }
                ?: membership.normalizedEmail
        val existing =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
                season.id,
                membership.id,
            )
        val now = Instant.now()
        val toSave: SeasonParticipantEntity? =
            if (existing != null) {
                if (existing.removalSource == SeasonParticipantRemovalSource.SEASON_ADMIN) {
                    null
                } else if (
                    existing.displayName == membership.displayName &&
                        existing.user?.id == membership.user?.id &&
                        existing.normalizedEmail == normalizedEmail &&
                        existing.status == ParticipantStatus.ACTIVE &&
                        existing.removedAt == null
                ) {
                    null
                } else {
                    existing.displayName = membership.displayName
                    existing.user = membership.user
                    existing.normalizedEmail = normalizedEmail
                    existing.status = ParticipantStatus.ACTIVE
                    existing.removedAt = null
                    existing.removalSource = null
                    existing.participationMode = SeasonParticipationMode.MEMBER_SYNC
                    existing.invitationScope = null
                    existing.updatedAt = now
                    existing
                }
            } else {
                SeasonParticipantEntity(
                    season = season,
                    displayName = membership.displayName,
                    normalizedEmail = normalizedEmail,
                    user = membership.user,
                    troupeMembership = membership,
                    status = ParticipantStatus.ACTIVE,
                    participationMode = SeasonParticipationMode.MEMBER_SYNC,
                    createdAt = now,
                    updatedAt = now,
                )
            }
        if (toSave != null) {
            seasonParticipantRepository.save(toSave)
            refreshParticipantCount(season)
            MembershipParticipantSyncCache.invalidate(season.id)
        }
    }

    /** Retire le participant de saison lié à une adhésion troupe désactivée. */
    @Transactional
    fun removeForMembershipAcrossTroupe(membership: TroupeMembershipEntity) {
        val troupeId = membership.troupe.id
        for (season in seasonRepository.findAllByTroupeIdList(troupeId)) {
            removeForMembership(season, membership)
        }
    }

    /** Réactive ou crée les participants de saison pour une adhésion troupe active. */
    @Transactional
    fun ensureForMembershipAcrossTroupe(membership: TroupeMembershipEntity) {
        if (membership.baselineRole == com.hatcast.api.troupe.TroupeBaselineRole.EXTERNE) {
            return
        }
        if (membership.status != TroupeMembershipStatus.ACTIVE) {
            return
        }
        val troupeId = membership.troupe.id
        for (season in seasonRepository.findAllByTroupeIdList(troupeId)) {
            ensureForMembership(season, membership)
        }
    }

    private fun removeForMembership(
        season: SeasonEntity,
        membership: TroupeMembershipEntity,
    ) {
        val existing =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
                season.id,
                membership.id,
            ) ?: return
        if (existing.status == ParticipantStatus.ACTIVE) {
            val now = Instant.now()
            existing.status = ParticipantStatus.REMOVED
            existing.removedAt = now
            existing.removalSource = SeasonParticipantRemovalSource.MEMBERSHIP_INACTIVE
            existing.updatedAt = now
            seasonParticipantRepository.save(existing)
            refreshParticipantCount(season)
            MembershipParticipantSyncCache.invalidate(season.id)
        }
    }

    private fun refreshParticipantCount(season: SeasonEntity) {
        val count =
            seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE).toInt()
        season.participantCount = count
        season.updatedAt = Instant.now()
        seasonRepository.save(season)
    }
}
