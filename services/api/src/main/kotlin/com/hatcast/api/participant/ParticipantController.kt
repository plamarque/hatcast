package com.hatcast.api.participant

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.participant.dto.EventParticipantAdminDto
import com.hatcast.api.participant.dto.ParticipantCreateRequest
import com.hatcast.api.participant.dto.ParticipantSelectorDto
import com.hatcast.api.participant.dto.ParticipantUpdateRequest
import com.hatcast.api.participant.dto.SeasonParticipantAdminDto
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
class ParticipantController(
    private val seasonParticipantService: SeasonParticipantService,
    private val eventParticipantService: EventParticipantService,
    private val eventRosterService: EventRosterService,
) {
    @GetMapping("/seasons/{seasonId}/participants")
    fun listSeasonParticipants(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<SeasonParticipantAdminDto> = seasonParticipantService.listAdmin(seasonId, principal)

    @PostMapping("/seasons/{seasonId}/participants")
    fun createSeasonParticipant(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: ParticipantCreateRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonParticipantAdminDto = seasonParticipantService.create(seasonId, body, principal)

    @PatchMapping("/seasons/{seasonId}/participants/{participantId}")
    fun updateSeasonParticipant(
        @PathVariable seasonId: UUID,
        @PathVariable participantId: UUID,
        @Valid @RequestBody body: ParticipantUpdateRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonParticipantAdminDto = seasonParticipantService.update(seasonId, participantId, body, principal)

    @DeleteMapping("/seasons/{seasonId}/participants/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeSeasonParticipant(
        @PathVariable seasonId: UUID,
        @PathVariable participantId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        seasonParticipantService.remove(seasonId, participantId, principal)
    }

    @GetMapping("/seasons/{seasonId}/participants/selectors")
    fun listSeasonParticipantSelectors(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<ParticipantSelectorDto> = seasonParticipantService.listSelectors(seasonId, principal)

    @GetMapping("/seasons/{seasonId}/events/{eventId}/participants")
    fun listEventParticipants(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<EventParticipantAdminDto> = eventParticipantService.listAdmin(seasonId, eventId, principal)

    @GetMapping("/seasons/{seasonId}/events/{eventId}/participants/roster")
    fun listEventParticipantRoster(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<com.hatcast.api.participant.dto.EventRosterParticipantDto> =
        eventRosterService.listRoster(seasonId, eventId, principal)

    @PostMapping("/seasons/{seasonId}/events/{eventId}/participants/roster/season/{seasonParticipantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun includeSeasonParticipantOnEvent(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @PathVariable seasonParticipantId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        eventRosterService.includeSeasonParticipant(seasonId, eventId, seasonParticipantId, principal)
    }

    @DeleteMapping("/seasons/{seasonId}/events/{eventId}/participants/roster/season/{seasonParticipantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun excludeSeasonParticipantFromEvent(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @PathVariable seasonParticipantId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        eventRosterService.excludeSeasonParticipant(seasonId, eventId, seasonParticipantId, principal)
    }

    @PostMapping("/seasons/{seasonId}/events/{eventId}/participants")
    fun createEventParticipant(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @Valid @RequestBody body: ParticipantCreateRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventParticipantAdminDto = eventParticipantService.create(seasonId, eventId, body, principal)

    @DeleteMapping("/seasons/{seasonId}/events/{eventId}/participants/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeEventParticipant(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @PathVariable participantId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        eventParticipantService.remove(seasonId, eventId, participantId, principal)
    }
}
