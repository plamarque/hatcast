package com.hatcast.api.agenda

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.agenda.dto.UserAgendaItemDto
import com.hatcast.api.agenda.dto.UserAgendaSeasonFilterDto
import com.hatcast.api.agenda.dto.UserAgendaParticipationFiltersDto
import com.hatcast.api.agenda.dto.UserAgendaResponse
import com.hatcast.api.agenda.dto.UserAgendaTroupeFilterDto
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.event.EventDraftVisibility
import com.hatcast.api.event.EventParticipantFocusService
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.dto.ParticipantFocusSummaryDto
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
  private val participantFocusService: EventParticipantFocusService,
  private val eventRepository: EventRepository,
  private val draftVisibility: EventDraftVisibility,
) {
  @Transactional(readOnly = true)
  fun list(
    principal: SessionUserPrincipal,
    page: Int,
    size: Int,
    scope: UserAgendaScope,
    troupeId: UUID?,
    seasonId: UUID?,
  ): UserAgendaResponse {
    validatePagination(page, size)
    if (scope != UserAgendaScope.UPCOMING) {
      throw ResponseStatusException(HttpStatus.BAD_REQUEST, "scope doit être upcoming")
    }

    val participationContext = participationContext(principal.userId)
    val filterBarVisible = participationContext.filterBarVisible
    val from = AgendaTimeBoundary.startOfTodayInclusive()
    val pageable = PageRequest.of(page, size)
    val applyDraftVisibility = draftVisibility.applyDraftVisibilityFilter(principal)
    val eventsPage =
      userAgendaRepository.findUpcomingForUser(
        userId = principal.userId,
        fromInclusive = from,
        troupeId = troupeId,
        seasonId = seasonId,
        viewerUserId = principal.userId,
        applyDraftVisibility = applyDraftVisibility,
        pageable = pageable,
      )

    val visibleRows = eventsPage.content
    val eventIds = visibleRows.map { it.eventId }
    val availabilityByEvent = availabilityService.myStatusByEventIds(eventIds, principal.userId)
    val lifecycleByEvent =
      compositionLifecycleEnrichment.loadViewsByEventIdsAcrossSeasons(eventIds, principal)
    val focusByEvent =
      participantFocusByEventIds(
        rows = visibleRows,
        availabilityByEvent = availabilityByEvent,
        principal = principal,
      )

    return UserAgendaResponse(
      content =
        visibleRows.map { event ->
          UserAgendaItemDto.from(
            row = event,
            myAvailabilityStatus = availabilityByEvent[event.eventId],
            teamStatusBadge = lifecycleByEvent[event.eventId]?.teamStatusBadge?.toDto(),
            participantFocus = focusByEvent[event.eventId],
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
            seasonIds = participationContext.seasonIds,
          )
        } else {
          null
        },
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
      noParticipation = seasonIds.isEmpty(),
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

  private fun participantFocusByEventIds(
    rows: List<UserAgendaRow>,
    availabilityByEvent: Map<UUID, String>,
    principal: SessionUserPrincipal,
  ): Map<UUID, ParticipantFocusSummaryDto> {
    if (rows.isEmpty()) {
      return emptyMap()
    }
    val eventIds = rows.map { it.eventId }.toSet()
    val events = eventRepository.findAllById(eventIds)
    if (events.isEmpty()) {
      return emptyMap()
    }
    return events
      .groupBy { it.season.id }
      .flatMap { (seasonId, seasonEvents) ->
        val season = seasonEvents.first().season
        val seasonEventIds = seasonEvents.map { it.id }
        val focusParticipantId =
          participantFocusService.resolveFocusParticipantId(seasonId, null, principal)
            ?: return@flatMap emptyList()
        val availabilityForSeason =
          seasonEventIds.associateWith { eventId ->
            availabilityByEvent[eventId] ?: AvailabilityStatusMapper.UNKNOWN
          }
        participantFocusService
          .summariesByEventIds(
            season = season,
            eventIds = seasonEventIds,
            focusParticipantId = focusParticipantId,
            availabilityByEvent = availabilityForSeason,
            principal = principal,
          ).entries
      }.associate { it.key to it.value }
  }
}

private data class ParticipationContext(
  val troupeIds: Set<UUID>,
  val seasonIds: Set<UUID>,
  val filterBarVisible: Boolean,
  val noParticipation: Boolean,
)
