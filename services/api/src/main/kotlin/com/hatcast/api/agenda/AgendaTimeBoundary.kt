package com.hatcast.api.agenda

import com.hatcast.api.event.EventService
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

object AgendaTimeBoundary {
  val ZONE: ZoneId = EventService.AGENDA_ZONE

  fun startOfTodayInclusive(zone: ZoneId = ZONE): Instant {
    val z: ZonedDateTime = ZonedDateTime.now(zone)
    return z.toLocalDate().atStartOfDay(zone).toInstant()
  }
}
