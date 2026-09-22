package com.hatcast.api.memberglance

import com.hatcast.api.agenda.UserAgendaRepository
import com.hatcast.api.agenda.dto.UserAgendaSeasonFilterDto
import com.hatcast.api.agenda.dto.UserAgendaParticipationFiltersDto
import com.hatcast.api.agenda.dto.UserAgendaTroupeFilterDto
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.memberglance.dto.MemberSeasonGlanceResponseDto
import com.hatcast.api.memberprofile.MemberProfileStatsProvider
import com.hatcast.api.participant.ParticipantRowPresentation
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserMemberPreferencesService
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.ZoneId
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
    private val avatarService: AvatarService,
) {
    @Transactional(readOnly = true)
    fun getSeasonGlance(
        userSlug: String,
        principal: SessionUserPrincipal,
        troupeId: UUID?,
        seasonId: UUID?,
    ): MemberSeasonGlanceResponseDto =
        getSeasonGlance(userSlug, principal, troupeId?.let(::setOf).orEmpty(), seasonId?.let(::setOf).orEmpty())

    @Transactional(readOnly = true)
    fun getSeasonGlance(
        userSlug: String,
        principal: SessionUserPrincipal,
        troupeIds: Set<UUID>,
        seasonIds: Set<UUID>,
    ): MemberSeasonGlanceResponseDto {
        val targetUser =
            userRepository.findBySlug(userSlug.trim())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")
        val targetUserId = targetUser.id
        val isSelf = principal.userId == targetUserId

        val participation = participationContext(targetUserId)
        val filterBarVisible = participation.filterBarVisible

        val resolvedSeasons =
            resolveSeasons(
                troupeIds = troupeIds,
                seasonIds = seasonIds,
                participation = participation,
            )

        requireCanViewGlance(
            principal = principal,
            targetUserId = targetUserId,
            seasons = resolvedSeasons,
        )

        val troupeMembership =
            membershipRepository.findByTroupe_IdAndUser_Id(resolvedSeasons.first().troupe.id, targetUserId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")

        if (troupeMembership.status != TroupeMembershipStatus.ACTIVE) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable.")
        }

        val resolvedSeasonIds = resolvedSeasons.map { it.id }
        val stats = statsProvider.loadStats(resolvedSeasonIds, targetUserId)
        val monthlyChart = statsProvider.loadMonthlyChart(resolvedSeasonIds, targetUserId)
        val favoriteRoleCounts = statsProvider.loadFavoriteRoleCounts(resolvedSeasonIds, targetUserId)
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
            avatarUrl = ParticipantRowPresentation.avatarUrl(avatarService, targetUser),
            isSelf = isSelf,
            resolvedSeasonIds = resolvedSeasonIds,
            resolvedTroupeIds = resolvedSeasons.map { it.troupe.id }.distinct(),
            preferredRolesTroupeId = resolvedSeasons.map { it.troupe.id }.distinct().singleOrNull(),
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
            gender = MemberGender.effective(targetUser.gender).wireValue,
        )
    }

    private fun resolveSeasons(
        troupeIds: Set<UUID>,
        seasonIds: Set<UUID>,
        participation: ParticipationContext,
    ): List<SeasonEntity> {
        if (!troupeIds.all { it in participation.troupeIds }) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Troupe hors périmètre du membre.")
        }
        if (!seasonIds.all { it in participation.seasonIds }) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Saison hors périmètre du membre.")
        }
        val scoped = candidateSeasons(participation.seasonIds, troupeIds)
        val resolved = if (seasonIds.isEmpty()) scoped.filter(::isEligibleCurrentSeason) else scoped.filter { it.id in seasonIds }
        if (resolved.any { it.troupe.id !in troupeIds } && troupeIds.isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Troupe et saison incohérentes.")
        }
        if (resolved.isEmpty()) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, if (troupeIds.isEmpty()) "Aucune participation active." else "Aucune saison pour cette troupe.")
        }
        return resolved.sortedBy { it.startDate }
    }

    private fun candidateSeasons(
        seasonIds: Set<UUID>,
        troupeIds: Set<UUID>,
    ): List<SeasonEntity> =
        seasonIds.mapNotNull { id ->
            seasonRepository.findById(id).orElse(null)?.takeIf { season ->
                !season.archived && (troupeIds.isEmpty() || season.troupe.id in troupeIds)
            }
        }

    private fun isEligibleCurrentSeason(season: SeasonEntity): Boolean {
        val today = LocalDate.now(ZoneId.of("Europe/Paris"))
        return season.isActive && season.startDate != null && season.endDate != null &&
            !today.isBefore(season.startDate) && !today.isAfter(season.endDate)
    }

    private fun requireCanViewGlance(
        principal: SessionUserPrincipal,
        targetUserId: UUID,
        seasons: List<SeasonEntity>,
    ) {
        if (principal.userId == targetUserId) {
            return
        }
        seasons.map { it.troupe.id }.distinct().forEach { troupeAccess.requireActiveMember(principal, it) }
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
