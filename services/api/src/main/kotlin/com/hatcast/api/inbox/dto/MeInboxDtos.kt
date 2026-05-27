package com.hatcast.api.inbox.dto

import com.fasterxml.jackson.annotation.JsonValue
import com.hatcast.api.agenda.UserAgendaRow
import com.hatcast.api.agenda.dto.UserAgendaItemDto
import java.time.Instant
import java.util.UUID

enum class InboxActionType(
  @get:JsonValue val wireName: String,
) {
  AVAILABILITY_UNKNOWN("availability_unknown"),
  COMPOSITION_CONFIRM_PENDING("composition_confirm_pending"),
}

data class InboxActionDto(
  val type: InboxActionType,
  val eventId: UUID,
  val eventSlug: String,
  val leagueSlug: String,
  val title: String,
  val startsAt: Instant,
  val troupeName: String,
  val troupeSlug: String,
  val leagueTitle: String,
  val location: String?,
  val troupeId: UUID,
  val leagueId: UUID,
  val deepLink: String,
  val roleKey: String? = null,
  val roleLabel: String? = null,
) {
  companion object {
    fun availabilityUnknown(
      row: UserAgendaRow,
    ): InboxActionDto =
      base(row, InboxActionType.AVAILABILITY_UNKNOWN) {
        "/saison/${row.leagueSlug}/event/${row.eventSlug}?tab=dispos"
      }

    fun compositionConfirmPending(
      row: UserAgendaRow,
      roleKey: String,
      roleLabel: String,
    ): InboxActionDto =
      base(row, InboxActionType.COMPOSITION_CONFIRM_PENDING) {
        "/saison/${row.leagueSlug}/event/${row.eventSlug}?showConfirm=true"
      }.copy(roleKey = roleKey, roleLabel = roleLabel)

    private fun base(
      row: UserAgendaRow,
      type: InboxActionType,
      deepLink: () -> String,
    ): InboxActionDto =
      InboxActionDto(
        type = type,
        eventId = row.eventId,
        eventSlug = row.eventSlug,
        leagueSlug = row.leagueSlug,
        title = row.title,
        startsAt = row.startsAt,
        troupeName = row.troupeName,
        troupeSlug = row.troupeSlug,
        leagueTitle = row.leagueTitle,
        location = row.location,
        troupeId = row.troupeId,
        leagueId = row.leagueId,
        deepLink = deepLink(),
      )
  }
}

data class InboxSeasonGlanceQueryDto(
  val troupeId: UUID? = null,
  val leagueId: UUID? = null,
)

data class InboxShortcutsDto(
  val lastSeasonSlug: String?,
  val seasonGlanceQuery: InboxSeasonGlanceQueryDto,
)

data class MeInboxResponse(
  val actions: List<InboxActionDto>,
  val nextEvent: UserAgendaItemDto?,
  val shortcuts: InboxShortcutsDto,
  val noParticipation: Boolean,
)
