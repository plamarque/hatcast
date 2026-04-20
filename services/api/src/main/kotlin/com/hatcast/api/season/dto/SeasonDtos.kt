package com.hatcast.api.season.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.hatcast.api.season.SeasonEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class SeasonResponseDto(
    val id: UUID,
    val troupeId: UUID,
    val slug: String,
    val title: String,
    val description: String?,
    val startDate: LocalDate?,
    val endDate: LocalDate?,
    val archived: Boolean,
    val active: Boolean,
    val eventCount: Int,
    val participantCount: Int,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(e: SeasonEntity): SeasonResponseDto =
            SeasonResponseDto(
                id = e.id,
                troupeId = e.troupe.id,
                slug = e.slug,
                title = e.title,
                description = e.description,
                startDate = e.startDate,
                endDate = e.endDate,
                archived = e.archived,
                active = e.isActive,
                eventCount = e.eventCount,
                participantCount = e.participantCount,
                createdAt = e.createdAt,
                updatedAt = e.updatedAt,
            )
    }
}

data class PagedSeasonsResponse(
    val content: List<SeasonResponseDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateSeasonRequest(
    @field:NotBlank
    @field:Size(max = 255)
    val title: String,
    @field:Size(max = 4000)
    val description: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateSeasonRequest(
    @field:Size(max = 255)
    val title: String? = null,
    @field:Size(max = 4000)
    val description: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
)
