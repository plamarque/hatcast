package com.hatcast.api.availability.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.validation.constraints.NotBlank
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
data class SetMyAvailabilityRequest(
    @field:NotBlank
    val status: String,
)

data class MyAvailabilityResponse(
    val status: String,
    val updatedAt: Instant? = null,
)
