package com.hatcast.api.memberglance

import com.hatcast.api.agenda.UserAgendaRepository
import com.hatcast.api.agenda.dto.UserAgendaSeasonFilterDto
import com.hatcast.api.agenda.dto.UserAgendaParticipationFiltersDto
import com.hatcast.api.agenda.dto.UserAgendaTroupeFilterDto
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.memberglance.dto.MemberSeasonGlanceResponseDto
import com.hatcast.api.memberprofile.MemberProfileStatsProvider
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserMemberPreferencesService
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
    private val userMemberPreferencesService: UserMemberPreferencesService,
) {
    @Transactional(readOnly = true)
    fun getSeasonGlance(
        userSlug: String,
        principal: SessionUserPrincipal,
        troupeId: UUID?,
        seasonId: UUID?,
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
                seasonId = seasonId,
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
        val selfPreferences =
            if (isSelf) {
                userMemberPreferencesService.getPreferences(targetUserId)
            } else {
                null
            }

        return MemberSeasonGlanceResponseDto(
            userId = targetUserId,
            userSlug = targetUser.slug ?: userSlug,
            displayName = selfPreferences?.memberDisplayName ?: troupeMembership.displayName,
            avatarUrl = AvatarService.publicAvatarUrl(targetUser.id, targetUser.avatarUpdatedAt),
            isSelf = isSelf,
            resolvedSeasonId = seasonId,
            troupeId = resolvedSeason.troupe.id,
            preferredRolesTroupeId = resolvedSeason.troupe.id,
            filterBarVisible = filterBarVisible,
            participationFilters =
                if (filterBarVisible) {
                    participationFilters(participation.troupeIds, participation.seasonIds)
                } else {
                    null
                },
            stats = stats,
            monthlyChart = monthlyChart,
            favoriteRoleCounts = favoriteRoleCounts,
            preferredRoleKeys =
                selfPreferences?.preferredRoleKeys,
        )
    }

    private fun resolveSeason(
        targetUserId: UUID,
        troupeId: UUID?,
        seasonId: UUID?,
        participation: ParticipationContext,
        filterBarVisible: Boolean,
    ): SeasonEntity {
        if (seasonId != null) {
            val season =
                seasonRepository
                    .findById(seasonId)
                    .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue.") }
            if (season.archived) {
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue.")
            }
            if (season.id !in participation.seasonIds) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Saison hors périmètre du membre.")
            }
            if (troupeId != null && season.troupe.id != troupeId) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Troupe et saison incohérentes.")
            }
            return season
        }

        val candidates = candidateSeasons(participation.seasonIds, troupeId)
        when {
            candidates.isEmpty() -> {
                val message =
                    if (troupeId != null) {
                        "Aucune saison pour cette troupe."
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
        seasonIds: Set<UUID>,
        troupeId: UUID?,
    ): List<SeasonEntity> =
        seasonIds.mapNotNull { id ->
            seasonRepository.findById(id).orElse(null)?.takeIf { season ->
                !season.archived && (troupeId == null || season.troupe.id == troupeId)
            }
        }

    /** MVP: no cross-season merge — pick the most relevant single season when filters are unset. */
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
        val seasonIds =
            (
                userAgendaRepository.findParticipatingSeasonIdsFromSeason(userId) +
                    userAgendaRepository.findParticipatingSeasonIdsFromEventOnly(userId)
            ).toSet()
        return ParticipationContext(
            troupeIds = troupeIds,
            seasonIds = seasonIds,
            filterBarVisible = troupeIds.size > 1 || seasonIds.size > 1,
        )
    }

    private fun participationFilters(
        troupeIds: Set<UUID>,
        seasonIds: Set<UUID>,
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
        val seasons =
            if (seasonIds.isEmpty()) {
                emptyList()
            } else {
                userAgendaRepository.findSeasonCatalogByIds(seasonIds).map { row ->
                    UserAgendaSeasonFilterDto(
                        id = row.id,
                        title = row.title,
                        slug = row.slug,
                        troupeId = row.troupeId,
                    )
                }
            }
        return UserAgendaParticipationFiltersDto(
            troupes = troupes,
            seasons = seasons,
        )
    }

    private data class ParticipationContext(
        val troupeIds: Set<UUID>,
        val seasonIds: Set<UUID>,
        val filterBarVisible: Boolean,
    )
}
