package com.hatcast.api.agenda

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.agenda.dto.UserAgendaItemDto
import com.hatcast.api.agenda.dto.UserAgendaLeagueFilterDto
import com.hatcast.api.agenda.dto.UserAgendaParticipationFiltersDto
import com.hatcast.api.agenda.dto.UserAgendaResponse
import com.hatcast.api.agenda.dto.UserAgendaTroupeFilterDto
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

enum class UserAgendaScope {
  UPCOMING,
}

@Service
class UserAgendaService(
  private val userAgendaRepository: UserAgendaRepository,
  private val availabilityService: AvailabilityService,
  private val compositionLifecycleEnrichment: CompositionLifecycleEnrichmentService,
) {
  @Transactional(readOnly = true)
  fun list(
    principal: SessionUserPrincipal,
    page: Int,
    size: Int,
    scope: UserAgendaScope,
    troupeId: UUID?,
    leagueId: UUID?,
  ): UserAgendaResponse {
    validatePagination(page, size)
    if (scope != UserAgendaScope.UPCOMING) {
      throw ResponseStatusException(HttpStatus.BAD_REQUEST, "scope doit être upcoming")
    }

    val participationContext = participationContext(principal.userId)
    val filterBarVisible = participationContext.filterBarVisible
    val from = AgendaTimeBoundary.startOfTodayInclusive()
    val pageable = PageRequest.of(page, size)
    val eventsPage =
      userAgendaRepository.findUpcomingForUser(
        userId = principal.userId,
        fromInclusive = from,
        troupeId = troupeId,
        leagueId = leagueId,
        pageable = pageable,
      )

    val eventIds = eventsPage.content.map { it.eventId }
    val availabilityByEvent = availabilityService.myStatusByEventIds(eventIds, principal.userId)
    val lifecycleByEvent =
      compositionLifecycleEnrichment.loadViewsByEventIdsAcrossSeasons(eventIds, principal)

    return UserAgendaResponse(
      content =
        eventsPage.content.map { event ->
          UserAgendaItemDto.from(
            row = event,
            myAvailabilityStatus = availabilityByEvent[event.eventId],
            teamStatusBadge = lifecycleByEvent[event.eventId]?.teamStatusBadge?.toDto(),
          )
        },
      page = eventsPage.number,
      size = eventsPage.size,
      totalElements = eventsPage.totalElements,
      totalPages = eventsPage.totalPages,
      filterBarVisible = filterBarVisible,
      noParticipation = participationContext.noParticipation,
      participationFilters =
        if (filterBarVisible) {
          participationFilters(
            troupeIds = participationContext.troupeIds,
            leagueIds = participationContext.leagueIds,
          )
        } else {
          null
        },
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
      noParticipation = leagueIds.isEmpty(),
    )
  }

  private fun validatePagination(
    page: Int,
    size: Int,
  ) {
    if (size < 1 || size > 50) {
      throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 50")
    }
    if (page < 0) {
      throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
    }
  }
}

private data class ParticipationContext(
  val troupeIds: Set<UUID>,
  val leagueIds: Set<UUID>,
  val filterBarVisible: Boolean,
  val noParticipation: Boolean,
)
