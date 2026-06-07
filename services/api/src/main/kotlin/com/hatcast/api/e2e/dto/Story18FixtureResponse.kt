package com.hatcast.api.e2e.dto

data class Story18CleanupRequest(
    val email: String,
)

data class Story18CleanupResponse(
    val deleted: Boolean,
    val email: String,
)
