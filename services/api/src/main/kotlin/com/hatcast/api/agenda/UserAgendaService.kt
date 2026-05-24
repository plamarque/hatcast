package com.hatcast.api.agenda

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.agenda.dto.UserAgendaItemDto
import com.hatcast.api.agenda.dto.UserAgendaResponse
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

    return UserAgendaResponse(
      content =
        eventsPage.content.map { event ->
          UserAgendaItemDto.from(
            row = event,
            myAvailabilityStatus = availabilityByEvent[event.eventId],
          )
        },
      page = eventsPage.number,
      size = eventsPage.size,
      totalElements = eventsPage.totalElements,
      totalPages = eventsPage.totalPages,
      filterBarVisible = filterBarVisible,
      noParticipation = participationContext.noParticipation,
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
  val filterBarVisible: Boolean,
  val noParticipation: Boolean,
)
