package com.hatcast.api.availability

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.isAvailabilityOpen

/**
 * Explainability gate for the Dispos surface (stories 5.8 / 5.9 / 19.7).
 *
 * Independent of composition draft/publish state — keyed on event publication only.
 */
object DisposExplainabilityAccess {
    fun canShowExplainability(
        event: EventEntity,
        canManageComposition: Boolean,
    ): Boolean {
        if (event.archived) {
            return false
        }
        if (event.isAvailabilityOpen()) {
            return true
        }
        // Story 3.21: organizers may preview chances on draft events they manage.
        return canManageComposition
    }
}
