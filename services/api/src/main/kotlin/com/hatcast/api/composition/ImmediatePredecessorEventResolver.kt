package com.hatcast.api.composition

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.SpectacleCategory
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service

/**
 * Resolves the immediately preceding validated event in the same category compartment.
 *
 * @see Story 19.9 — draw weight factor for consecutive-show replay will reuse this resolver.
 */
interface ImmediatePredecessorEventResolver {
    fun resolve(currentEvent: EventEntity): EventEntity?
}

@Service
class DefaultImmediatePredecessorEventResolver(
    private val eventRepository: EventRepository,
) : ImmediatePredecessorEventResolver {
    override fun resolve(currentEvent: EventEntity): EventEntity? =
        eventRepository
            .findImmediateValidatedPredecessorInCategory(
                seasonId = currentEvent.season.id,
                beforeEventId = currentEvent.id,
                beforeStartsAt = currentEvent.startsAt,
                beforeCreatedAt = currentEvent.createdAt,
                categorySlug = SpectacleCategory.slug(currentEvent),
                pageable = PageRequest.of(0, 1),
            ).firstOrNull()
}
