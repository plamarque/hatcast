package com.hatcast.api.memberglance

import com.hatcast.api.agenda.UserAgendaRepository
import com.hatcast.api.agenda.dto.UserAgendaLeagueFilterDto
import com.hatcast.api.agenda.dto.UserAgendaParticipationFiltersDto
import com.hatcast.api.agenda.dto.UserAgendaTroupeFilterDto
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.memberglance.dto.MemberSeasonGlanceResponseDto
import com.hatcast.api.memberprofile.MemberProfileStatsProvider
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.PreferredRoleKeys
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.UUID

@Service
class MemberSeasonGlanceService(
    private val userRepository: UserRepository,
    private val seasonRepository: SeasonRepository,
    private val membershipRepository: TroupeMembershipRepository,
    private val userAgendaRepository: UserAgendaRepository,
    private val statsProvider: MemberProfileStatsProvider,
    private val troupeAccess: TroupeAccessService,
) {
    @Transactional(readOnly = true)
    fun getSeasonGlance(
        userSlug: String,
        principal: SessionUserPrincipal,
        troupeId: UUID?,
        leagueId: UUID?,
    ): MemberSeasonGlanceResponseDto {
        val targetUser =
            userRepository.findBySlug(userSlug.trim())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")
        val targetUserId = targetUser.id
        val isSelf = principal.userId == targetUserId

        val participation = participationContext(targetUserId)
        val filterBarVisible = participation.filterBarVisible

        val resolvedSeason =
            resolveSeason(
                targetUserId = targetUserId,
                troupeId = troupeId,
                leagueId = leagueId,
                participation = participation,
                filterBarVisible = filterBarVisible,
            )

        requireCanViewGlance(
            principal = principal,
            targetUserId = targetUserId,
            season = resolvedSeason,
        )

        val troupeMembership =
            membershipRepository.findByTroupe_IdAndUser_Id(resolvedSeason.troupe.id, targetUserId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")

        if (troupeMembership.status != TroupeMembershipStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")
        }

        val seasonId = resolvedSeason.id
        val stats = statsProvider.loadStats(seasonId, targetUserId)
        val monthlyChart = statsProvider.loadMonthlyChart(seasonId, targetUserId)
        val favoriteRoleCounts = statsProvider.loadFavoriteRoleCounts(seasonId, targetUserId)

        return MemberSeasonGlanceResponseDto(
            userId = targetUserId,
            userSlug = targetUser.slug ?: userSlug,
            displayName = troupeMembership.displayName,
            avatarUrl = AvatarService.publicAvatarUrl(targetUser.id, targetUser.avatarUpdatedAt),
            isSelf = isSelf,
            resolvedSeasonId = seasonId,
            troupeId = resolvedSeason.troupe.id,
            leagueId = seasonId,
            preferredRolesTroupeId = resolvedSeason.troupe.id,
            filterBarVisible = filterBarVisible,
            participationFilters =
                if (filterBarVisible) {
                    participationFilters(participation.troupeIds, participation.leagueIds)
                } else {
                    null
                },
            stats = stats,
            monthlyChart = monthlyChart,
            favoriteRoleCounts = favoriteRoleCounts,
            preferredRoleKeys =
                if (isSelf) {
                    PreferredRoleKeys.effectiveKeys(troupeMembership.preferredRoleKeys)
                } else {
                    null
                },
        )
    }

    private fun resolveSeason(
        targetUserId: UUID,
        troupeId: UUID?,
        leagueId: UUID?,
        participation: ParticipationContext,
        filterBarVisible: Boolean,
    ): SeasonEntity {
        if (leagueId != null) {
            val season =
                seasonRepository
                    .findById(leagueId)
                    .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Ligue inconnue.") }
            if (season.archived) {
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Ligue inconnue.")
            }
            if (season.id !in participation.leagueIds) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Ligue hors périmètre du membre.")
            }
            if (troupeId != null && season.troupe.id != troupeId) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Troupe et ligue incohérentes.")
            }
            return season
        }

        val candidates = candidateSeasons(participation.leagueIds, troupeId)
        when {
            candidates.isEmpty() -> {
                val message =
                    if (troupeId != null) {
                        "Aucune ligue pour cette troupe."
                    } else {
                        "Aucune participation active."
                    }
                throw ResponseStatusException(HttpStatus.NOT_FOUND, message)
            }
            candidates.size == 1 -> return candidates.single()
            filterBarVisible -> return selectPrimarySeason(candidates)
            else ->
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Aucune participation active.")
        }
    }

    private fun candidateSeasons(
        leagueIds: Set<UUID>,
        troupeId: UUID?,
    ): List<SeasonEntity> =
        leagueIds.mapNotNull { id ->
            seasonRepository.findById(id).orElse(null)?.takeIf { season ->
                !season.archived && (troupeId == null || season.troupe.id == troupeId)
            }
        }

    /** MVP: no cross-league merge — pick the most relevant single season when filters are unset. */
    private fun selectPrimarySeason(candidates: List<SeasonEntity>): SeasonEntity =
        candidates.maxWith(
            compareBy<SeasonEntity> { it.isActive }
                .thenByDescending { it.startDate ?: LocalDate.MIN }
                .thenByDescending { it.updatedAt }
                .thenBy { it.title.lowercase() },
        )

    private fun requireCanViewGlance(
        principal: SessionUserPrincipal,
        targetUserId: UUID,
        season: SeasonEntity,
    ) {
        if (principal.userId == targetUserId) {
            return
        }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
    }

    private fun participationContext(userId: UUID): ParticipationContext {
        val troupeIds =
            (
                userAgendaRepository.findParticipatingTroupeIdsFromSeason(userId) +
                    userAgendaRepository.findParticipatingTroupeIdsFromEventOnly(userId)
            ).toSet()
        val leagueIds =
            (
                userAgendaRepository.findParticipatingLeagueIdsFromSeason(userId) +
                    userAgendaRepository.findParticipatingLeagueIdsFromEventOnly(userId)
            ).toSet()
        return ParticipationContext(
            troupeIds = troupeIds,
            leagueIds = leagueIds,
            filterBarVisible = troupeIds.size > 1 || leagueIds.size > 1,
        )
    }

    private fun participationFilters(
        troupeIds: Set<UUID>,
        leagueIds: Set<UUID>,
    ): UserAgendaParticipationFiltersDto {
        val troupes =
            if (troupeIds.isEmpty()) {
                emptyList()
            } else {
                userAgendaRepository.findTroupeCatalogByIds(troupeIds).map { row ->
                    UserAgendaTroupeFilterDto(
                        id = row.id,
                        name = row.name,
                        slug = row.slug,
                    )
                }
            }
        val leagues =
            if (leagueIds.isEmpty()) {
                emptyList()
            } else {
                userAgendaRepository.findLeagueCatalogByIds(leagueIds).map { row ->
                    UserAgendaLeagueFilterDto(
                        id = row.id,
                        title = row.title,
                        slug = row.slug,
                        troupeId = row.troupeId,
                    )
                }
            }
        return UserAgendaParticipationFiltersDto(
            troupes = troupes,
            leagues = leagues,
        )
    }

    private data class ParticipationContext(
        val troupeIds: Set<UUID>,
        val leagueIds: Set<UUID>,
        val filterBarVisible: Boolean,
    )
}
