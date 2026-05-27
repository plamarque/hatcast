package com.hatcast.api.agenda

import com.hatcast.api.event.EventService
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

object AgendaTimeBoundary {
  val ZONE: ZoneId = EventService.AGENDA_ZONE

  const val INBOX_AVAILABILITY_HORIZON_DAYS = 30

  fun startOfTodayInclusive(zone: ZoneId = ZONE): Instant {
    val z: ZonedDateTime = ZonedDateTime.now(zone)
    return z.toLocalDate().atStartOfDay(zone).toInstant()
  }

  fun calendarDateKey(
    instant: Instant,
    zone: ZoneId = ZONE,
  ): String {
    val z = instant.atZone(zone)
    return String.format(
      "%04d-%02d-%02d",
      z.year,
      z.monthValue,
      z.dayOfMonth,
    )
  }

  fun calendarDaysBetween(
    eventInstant: Instant,
    reference: Instant,
    zone: ZoneId = ZONE,
  ): Int {
    val eventKey = calendarDateKey(eventInstant, zone)
    val refKey = calendarDateKey(reference, zone)
    val (ey, em, ed) = eventKey.split('-').map { it.toInt() }
    val (ry, rm, rd) = refKey.split('-').map { it.toInt() }
    val eventUtc = java.time.LocalDate.of(ey, em, ed).toEpochDay()
    val refUtc = java.time.LocalDate.of(ry, rm, rd).toEpochDay()
    return (eventUtc - refUtc).toInt()
  }

  fun isWithinCalendarDaysFromNow(
    eventInstant: Instant,
    reference: Instant = Instant.now(),
    maxDays: Int,
    zone: ZoneId = ZONE,
  ): Boolean {
    val offset = calendarDaysBetween(eventInstant, reference, zone)
    return offset in 0..maxDays
  }
}
