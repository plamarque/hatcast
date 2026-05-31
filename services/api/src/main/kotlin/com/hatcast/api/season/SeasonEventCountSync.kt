package com.hatcast.api.season

import com.hatcast.api.event.EventRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * Maintains [SeasonEntity.eventCount] as the count of **non-archived** events for the season.
 *
 * Canonical rule (aligned with seeds V26/V34 and migration reconcile SQL):
 * `event_count = COUNT(events WHERE season_id = ? AND archived = FALSE)`.
 *
 * Updated on API archive and via post-migration / admin reconcile — not on every season list read
 * (denormalized cache for hub cards; recount-on-read rejected for performance).
 */
@Component
class SeasonEventCountSync(
    private val eventRepository: EventRepository,
    private val seasonRepository: SeasonRepository,
) {
    @Transactional
    fun recountEvents(seasonId: UUID): Int {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { IllegalArgumentException("Season not found: $seasonId") }
        return recountEvents(season)
    }

    @Transactional
    fun recountEvents(season: SeasonEntity): Int {
        val count = eventRepository.countBySeason_IdAndArchivedFalse(season.id).toInt()
        season.eventCount = count
        season.updatedAt = Instant.now()
        seasonRepository.save(season)
        return count
    }
}
