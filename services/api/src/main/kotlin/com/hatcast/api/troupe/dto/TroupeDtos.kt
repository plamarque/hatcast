package com.hatcast.api.troupe.dto

import java.util.UUID

data class TroupeListItemDto(
    val id: UUID,
    val name: String,
    val slug: String,
)
