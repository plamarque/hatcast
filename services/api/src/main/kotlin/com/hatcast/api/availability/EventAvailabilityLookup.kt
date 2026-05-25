package com.hatcast.api.availability

import java.util.UUID

/** Rows keyed by linked user id (name-only / participant-scoped rows are excluded). */
fun List<EventAvailabilityEntity>.associateByLinkedUserId(): Map<UUID, EventAvailabilityEntity> =
    mapNotNull { row -> row.user?.id?.let { it to row } }.toMap()
