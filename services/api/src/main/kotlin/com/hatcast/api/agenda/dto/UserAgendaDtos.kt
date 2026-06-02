package com.hatcast.api.agenda.dto

import com.hatcast.api.agenda.UserAgendaRow
import com.hatcast.api.composition.TeamStatusBadgeDto
import com.hatcast.api.event.dto.ParticipantFocusSummaryDto
import java.time.Instant
import java.util.UUID

data class UserAgendaItemDto(
  val eventId: UUID,
  val eventSlug: String,
  val title: String,
  val startsAt: Instant,
  val location: String?,
  val description: String? = null,
  val troupeId: UUID,
  val troupeName: String,
  val troupeSlug: String,
  val seasonId: UUID,
  val seasonSlug: String,
  val seasonTitle: String,
  val myAvailabilityStatus: String?,
  val teamStatusBadge: TeamStatusBadgeDto? = null,
  val participantFocus: ParticipantFocusSummaryDto? = null,
) {
  companion object {
    fun from(
      row: UserAgendaRow,
      myAvailabilityStatus: String?,
      teamStatusBadge: TeamStatusBadgeDto? = null,
      participantFocus: ParticipantFocusSummaryDto? = null,
    ): UserAgendaItemDto {
      return UserAgendaItemDto(
        eventId = row.eventId,
        eventSlug = row.eventSlug,
        title = row.title,
        startsAt = row.startsAt,
        location = row.location,
        description = row.description,
        troupeId = row.troupeId,
        troupeName = row.troupeName,
        troupeSlug = row.troupeSlug,
        seasonId = row.seasonId,
        seasonSlug = row.seasonSlug,
        seasonTitle = row.seasonTitle,
        myAvailabilityStatus = myAvailabilityStatus,
        teamStatusBadge = teamStatusBadge,
        participantFocus = participantFocus,
      )
    }
  }
}

data class UserAgendaTroupeFilterDto(
  val id: UUID,
  val name: String,
  val slug: String,
)

data class UserAgendaSeasonFilterDto(
  val id: UUID,
  val title: String,
  val slug: String,
  val troupeId: UUID,
)

data class UserAgendaParticipationFiltersDto(
  val troupes: List<UserAgendaTroupeFilterDto>,
  val seasons: List<UserAgendaSeasonFilterDto>,
)

data class UserAgendaResponse(
  val content: List<UserAgendaItemDto>,
  val page: Int,
  val size: Int,
  val totalElements: Long,
  val totalPages: Int,
  val filterBarVisible: Boolean,
  val noParticipation: Boolean,
  val participationFilters: UserAgendaParticipationFiltersDto? = null,
)
