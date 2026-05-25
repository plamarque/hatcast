package com.hatcast.api.event.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.RoleTemplates
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.openapitools.jackson.nullable.JsonNullable
import com.hatcast.api.composition.CompositionLifecycleView
import com.hatcast.api.composition.TeamStatusBadgeDto
import java.time.Instant
import java.util.UUID

data class EventResponseDto(
    val id: UUID,
    val seasonId: UUID,
    val slug: String,
    /** NULL = compartiment principal. */
    val equityTag: String? = null,
    val title: String,
    val description: String?,
    val location: String?,
    val startsAt: Instant,
    val archived: Boolean,
    val templateType: String,
    val roleSlots: Map<String, Int>,
    val createdAt: Instant,
    val updatedAt: Instant,
    val myAvailabilityStatus: String? = null,
    /** Résumé dispo + rôle composition pour le participant ciblé (Historique, story 3.6b). */
    val participantFocus: ParticipantFocusSummaryDto? = null,
    val compositionLifecycle: String? = null,
    val teamStatusBadge: TeamStatusBadgeDto? = null,
    val compositionPublishedAt: Instant? = null,
) {
    companion object {
        fun from(
            e: EventEntity,
            myAvailabilityStatus: String? = null,
            participantFocus: ParticipantFocusSummaryDto? = null,
            compositionView: CompositionLifecycleView? = null,
        ): EventResponseDto =
            EventResponseDto(
                id = e.id,
                seasonId = e.season.id,
                slug = e.slug,
                equityTag = e.equityTag,
                title = e.title,
                description = e.description,
                location = e.location,
                startsAt = e.startsAt,
                archived = e.archived,
                templateType = e.templateType,
                roleSlots = RoleTemplates.normalize(e.roleSlots),
                createdAt = e.createdAt,
                updatedAt = e.updatedAt,
                myAvailabilityStatus = myAvailabilityStatus,
                participantFocus = participantFocus,
                compositionLifecycle = compositionView?.compositionLifecycle?.toApiValue(),
                teamStatusBadge = compositionView?.teamStatusBadge?.toDto(),
                compositionPublishedAt = compositionView?.publishedAt,
            )
    }
}

data class ParticipantFocusSummaryDto(
    val availabilityStatus: String,
    val compositionRoleKey: String? = null,
    val inTeam: Boolean = false,
)

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
    val templateType: String? = null,
    val roleSlots: Map<String, Int>? = null,
    @field:Size(max = 128)
    val slug: String? = null,
    @field:Size(max = 64)
    val equityTag: String? = null,
)

@JsonDeserialize(using = UpdateEventRequestDeserializer::class)
@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateEventRequest(
    /** Absent = inchangé ; `null` explicite = interdit (titre obligatoire). */
    val title: JsonNullable<String> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = interdit (date obligatoire). */
    val startsAt: JsonNullable<Instant> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = effacer. */
    val description: JsonNullable<String> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = effacer. */
    val location: JsonNullable<String> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = interdit (400). */
    val templateType: JsonNullable<String> = JsonNullable.undefined(),
    /**
     * Absent = inchangé ; `null` explicite = interdit (400).
     * Présent = remplacement complet de la map (pas de merge partiel).
     */
    val roleSlots: JsonNullable<Map<String, Int>> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = interdit (400). */
    val slug: JsonNullable<String> = JsonNullable.undefined(),
    /** Absent = inchangé ; `null` explicite = effacer (compartiment principal). */
    val equityTag: JsonNullable<String> = JsonNullable.undefined(),
)
