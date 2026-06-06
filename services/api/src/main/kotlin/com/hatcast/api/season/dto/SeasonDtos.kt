package com.hatcast.api.season.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.participant.GuestSeasonWorkspaceMode
import com.hatcast.api.troupe.dto.TroupeAdminSummaryDto
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.openapitools.jackson.nullable.JsonNullable
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
    /** Viewer-specific workspace access (story 3.25). Omitted on admin write responses. */
    val guestSeasonWorkspaceMode: GuestSeasonWorkspaceMode? = null,
) {
    companion object {
        fun from(
            e: SeasonEntity,
            guestSeasonWorkspaceMode: GuestSeasonWorkspaceMode? = null,
        ): SeasonResponseDto =
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
                guestSeasonWorkspaceMode = guestSeasonWorkspaceMode,
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

@JsonDeserialize(using = UpdateSeasonRequestDeserializer::class)
@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateSeasonRequest(
    /** Absent = inchangé ; présent avec une chaîne = mise à jour ; présent avec `null` = interdit (le titre est obligatoire). */
    val title: JsonNullable<String> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = effacer la description. */
    val description: JsonNullable<String> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = effacer la date. */
    val startDate: JsonNullable<LocalDate> = JsonNullable.undefined(),
    val endDate: JsonNullable<LocalDate> = JsonNullable.undefined(),
)

/** Résolution globale d'une saison par slug pour un admin plateforme (navigation directe par URL). */
data class PlatformAdminSeasonResolutionDto(
    val troupe: TroupeAdminSummaryDto,
    val season: SeasonResponseDto,
)
