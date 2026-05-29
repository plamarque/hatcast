package com.hatcast.api.participant

import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeMembershipEntity
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
        val normalizedEmail = participantLink.normalizeEmail(membership.user.email)
        val existing =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
                season.id,
                membership.id,
            )
        val now = Instant.now()
        val toSave: SeasonParticipantEntity? =
            if (existing != null) {
                if (
                    existing.displayName == membership.displayName &&
                        existing.user?.id == membership.user.id &&
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

    private fun refreshParticipantCount(season: SeasonEntity) {
        val count =
            seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE).toInt()
        season.participantCount = count
        season.updatedAt = Instant.now()
        seasonRepository.save(season)
    }
}
