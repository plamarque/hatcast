package com.hatcast.api.availability

object AvailabilityStatusMapper {
    const val AVAILABLE = "available"
    const val UNAVAILABLE = "unavailable"
    const val UNKNOWN = "unknown"

    fun toApi(stored: StoredAvailabilityStatus?): String =
        when (stored) {
            StoredAvailabilityStatus.AVAILABLE -> AVAILABLE
            StoredAvailabilityStatus.UNAVAILABLE -> UNAVAILABLE
            null -> UNKNOWN
        }

    fun parseApi(raw: String): String {
        val normalized = raw.trim().lowercase()
        if (normalized !in setOf(AVAILABLE, UNAVAILABLE, UNKNOWN)) {
            throw IllegalArgumentException("status invalide")
        }
        return normalized
    }

    fun toStored(api: String): StoredAvailabilityStatus? =
        when (api) {
            AVAILABLE -> StoredAvailabilityStatus.AVAILABLE
            UNAVAILABLE -> StoredAvailabilityStatus.UNAVAILABLE
            UNKNOWN -> null
            else -> throw IllegalArgumentException("status invalide")
        }
}
