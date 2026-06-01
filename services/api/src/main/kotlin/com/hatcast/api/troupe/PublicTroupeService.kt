package com.hatcast.api.troupe

import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.troupe.dto.PublicTroupeDirectoryItemDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PublicTroupeService(
    private val troupeRepository: TroupeRepository,
    private val membershipRepository: TroupeMembershipRepository,
    private val troupeListStatsRepository: TroupeListStatsRepository,
) {
    @Transactional(readOnly = true)
    fun listPublicDirectory(): List<PublicTroupeDirectoryItemDto> {
        val troupes = troupeRepository.findByListedInDirectoryTrueAndIsDemoFalseOrderByNameAsc()
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
