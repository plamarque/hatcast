package com.hatcast.api.composition

import com.hatcast.api.event.EventEntity
import java.time.Instant

/**
 * How validated composition history is scoped when computing draw weights and Dispos %.
 *
 * - [OPERATIONAL]: all validated assignments in the season/compartment except the current event
 *   (includes future confirmed events — supports out-of-order selection).
 * - [RETROSPECTIVE]: only events strictly before the target event (approximation for past-event
 *   Dispos until slice 2 snapshots exist).
 */
enum class SelectionHistoryMode {
    OPERATIONAL,
    RETROSPECTIVE,
}

object SelectionHistoryModeResolver {
    fun forEvent(
        event: EventEntity,
        now: Instant = Instant.now(),
    ): SelectionHistoryMode =
        if (event.startsAt.isBefore(now)) {
            SelectionHistoryMode.RETROSPECTIVE
        } else {
            SelectionHistoryMode.OPERATIONAL
        }
}
