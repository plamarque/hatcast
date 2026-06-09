package com.hatcast.api.season.dto

import com.hatcast.api.event.dto.PagedEventsResponse
import com.hatcast.api.organizer.dto.MySeasonPermissionsDto
import com.hatcast.api.participant.dto.ParticipantSelectorDto
import com.hatcast.api.troupe.dto.TroupeCategoryDto

/** Read-only bootstrap payload for season workspace (PERF-07 BFF). */
data class SeasonWorkspaceResponseDto(
    val permissions: MySeasonPermissionsDto,
    val participantSelectors: List<ParticipantSelectorDto>,
    val categories: List<TroupeCategoryDto>,
    val upcomingEvents: PagedEventsResponse,
)
