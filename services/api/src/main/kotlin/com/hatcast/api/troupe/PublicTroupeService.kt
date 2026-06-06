package com.hatcast.api.troupe

import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.PublicTroupeDirectoryItemDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PublicTroupeService(
    private val troupeRepository: TroupeRepository,
    private val membershipRepository: TroupeMembershipRepository,
    private val membershipService: TroupeMembershipService,
    private val troupeListStatsRepository: TroupeListStatsRepository,
    private val platformAdminService: PlatformAdminService,
) {
    @Transactional(readOnly = true)
    fun listPublicDirectory(): List<PublicTroupeDirectoryItemDto> {
        val troupes = troupeRepository.findByListedInDirectoryTrueAndIsDemoFalseOrderByNameAsc()
        return mapToDirectoryItems(troupes)
    }

    /**
     * Annuaire Découvrir pour utilisateur authentifié : annuaire public plus troupes absentes
     * du répertoire public (Démo pour tous ; toutes les troupes non rejointes pour admin plateforme).
     */
    @Transactional(readOnly = true)
    fun listDiscoverForViewer(principal: SessionUserPrincipal): List<PublicTroupeDirectoryItemDto> {
        val myTroupeIds =
            membershipService
                .listActiveTroupesForUser(principal.userId)
                .map { it.id }
                .toSet()
        val public = listPublicDirectory().filter { it.id !in myTroupeIds }
        val publicIds = public.map { it.id }.toSet()
        val supplementalTroupes =
            if (platformAdminService.isPlatformAdmin(principal)) {
                troupeRepository
                    .findAllByOrderByNameAsc()
                    .filter { it.id !in myTroupeIds && it.id !in publicIds }
            } else {
                troupeRepository
                    .findByIsDemoTrueOrderByNameAsc()
                    .filter { it.id !in myTroupeIds && it.id !in publicIds }
            }
        if (supplementalTroupes.isEmpty()) {
            return public
        }
        return public + mapToDirectoryItems(supplementalTroupes)
    }

    private fun mapToDirectoryItems(troupes: List<TroupeEntity>): List<PublicTroupeDirectoryItemDto> {
        if (troupes.isEmpty()) {
            return emptyList()
        }
        val troupeIds = troupes.map { it.id }
        val memberCounts =
            membershipRepository
                .countActiveMembersByTroupeIds(troupeIds)
                .associate { it.troupeId to it.memberCount }
        val fromInclusive = AgendaTimeBoundary.startOfTodayInclusive()
        val upcomingCounts =
            troupeListStatsRepository
                .countUpcomingEventsByTroupeIds(troupeIds, fromInclusive)
                .associate { it.troupeId to it.eventCount }
        return troupes.map { troupe ->
            PublicTroupeDirectoryItemDto(
                id = troupe.id,
                name = troupe.name,
                slug = troupe.slug,
                logoUrl = TroupeLogoService.publicLogoUrl(troupe.id, troupe.logoStorageKey, troupe.logoUpdatedAt),
                description = troupe.description,
                activeMemberCount = memberCounts[troupe.id] ?: 0L,
                upcomingEventCount = upcomingCounts[troupe.id] ?: 0L,
            )
        }
    }
}
