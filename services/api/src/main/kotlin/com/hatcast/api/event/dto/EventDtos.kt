package com.hatcast.api.event.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.hatcast.api.event.EventEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class EventResponseDto(
    val id: UUID,
    val seasonId: UUID,
    val title: String,
    val description: String?,
    val location: String?,
    val startsAt: Instant,
    val archived: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(e: EventEntity): EventResponseDto =
            EventResponseDto(
                id = e.id,
                seasonId = e.season.id,
                title = e.title,
                description = e.description,
                location = e.location,
                startsAt = e.startsAt,
                archived = e.archived,
                createdAt = e.createdAt,
                updatedAt = e.updatedAt,
            )
    }
}

data class PagedEventsResponse(
    val content: List<EventResponseDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateEventRequest(
    @field:NotBlank
    @field:Size(max = 255)
    val title: String,
    @field:NotNull
    val startsAt: Instant,
    @field:Size(max = 4000)
    val description: String? = null,
    @field:Size(max = 512)
    val location: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateEventRequest(
    @field:Size(max = 255)
    val title: String? = null,
    val startsAt: Instant? = null,
    @field:Size(max = 4000)
    val description: String? = null,
    @field:Size(max = 512)
    val location: String? = null,
)
