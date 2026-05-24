package com.hatcast.api.agenda.dto

import com.hatcast.api.agenda.UserAgendaRow
import java.time.Instant
import java.util.UUID

data class UserAgendaItemDto(
  val eventId: UUID,
  val title: String,
  val startsAt: Instant,
  val location: String?,
  val troupeId: UUID,
  val troupeName: String,
  val troupeSlug: String,
  val leagueId: UUID,
  val leagueSlug: String,
  val leagueTitle: String,
  val myAvailabilityStatus: String?,
) {
  companion object {
    fun from(
      row: UserAgendaRow,
      myAvailabilityStatus: String?,
    ): UserAgendaItemDto {
      return UserAgendaItemDto(
        eventId = row.eventId,
        title = row.title,
        startsAt = row.startsAt,
        location = row.location,
        troupeId = row.troupeId,
        troupeName = row.troupeName,
        troupeSlug = row.troupeSlug,
        leagueId = row.leagueId,
        leagueSlug = row.leagueSlug,
        leagueTitle = row.leagueTitle,
        myAvailabilityStatus = myAvailabilityStatus,
      )
    }
  }
}

data class UserAgendaResponse(
  val content: List<UserAgendaItemDto>,
  val page: Int,
  val size: Int,
  val totalElements: Long,
  val totalPages: Int,
  val filterBarVisible: Boolean,
  val noParticipation: Boolean,
)
