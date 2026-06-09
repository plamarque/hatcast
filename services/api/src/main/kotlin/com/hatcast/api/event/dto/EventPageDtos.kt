package com.hatcast.api.event.dto

import com.hatcast.api.availability.dto.EventAvailabilitySummaryResponse
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.organizer.dto.MySeasonPermissionsDto
import com.hatcast.api.organizer.dto.OrganizerResponseDto
import com.hatcast.api.participant.dto.ParticipantSelectorDto
import com.hatcast.api.troupe.dto.TroupeCategoryDto

/** Read-only bootstrap payload for event detail by tab (PERF-10 BFF). */
data class EventPageResponseDto(
    val event: EventResponseDto,
    val permissions: MySeasonPermissionsDto,
    val participantSelectors: List<ParticipantSelectorDto>,
    val organizers: List<OrganizerResponseDto>? = null,
    val categories: List<TroupeCategoryDto>? = null,
    val availabilitySummary: EventAvailabilitySummaryResponse? = null,
    val composition: CompositionResponseDto? = null,
)
