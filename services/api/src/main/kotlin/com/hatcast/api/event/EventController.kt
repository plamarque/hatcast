package com.hatcast.api.event

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.event.dto.CreateEventRequest
import com.hatcast.api.event.dto.EventPageResponseDto
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.event.dto.PagedEventsResponse
import com.hatcast.api.event.dto.UpdateEventRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/v1/seasons/{seasonId}/events")
class EventController(
    private val eventService: EventService,
    private val eventPageService: EventPageService,
) {
    @GetMapping
    fun list(
        @PathVariable seasonId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "all") scope: String,
        @RequestParam(required = false) participantId: UUID?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): PagedEventsResponse {
        val s =
            when (scope.lowercase()) {
                "upcoming" -> EventListScope.UPCOMING
                "past" -> EventListScope.PAST
                "all" -> EventListScope.ALL
                else ->
                    throw ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "scope doit être all, upcoming ou past",
                    )
            }
        return eventService.listForSeason(seasonId, page, size, s, principal, participantId)
    }

    @GetMapping("/by-slug/{slug}")
    fun getBySlug(
        @PathVariable seasonId: UUID,
        @PathVariable slug: String,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.getBySlug(seasonId, slug, principal)

    @GetMapping("/by-slug/{slug}/page")
    fun pageBySlug(
        @PathVariable seasonId: UUID,
        @PathVariable slug: String,
        @RequestParam(defaultValue = "infos") tab: String,
        @RequestParam(defaultValue = "false") includeChances: Boolean,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventPageResponseDto {
        val parsedTab =
            EventPageTab.parse(tab)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "tab doit être infos, dispos ou equipe")
        return eventPageService.loadPageBySlug(seasonId, slug, parsedTab, includeChances, principal)
    }

    @GetMapping("/{eventId}")
    fun getById(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.getById(seasonId, eventId, principal)

    @GetMapping("/{eventId}/page")
    fun pageById(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @RequestParam(defaultValue = "infos") tab: String,
        @RequestParam(defaultValue = "false") includeChances: Boolean,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventPageResponseDto {
        val parsedTab =
            EventPageTab.parse(tab)
                ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "tab doit être infos, dispos ou equipe")
        return eventPageService.loadPageById(seasonId, eventId, parsedTab, includeChances, principal)
    }

    @PostMapping
    fun create(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: CreateEventRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.create(seasonId, body, principal)

    @PatchMapping("/{eventId}")
    fun update(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @Valid @RequestBody body: UpdateEventRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.update(seasonId, eventId, body, principal)

    @PostMapping("/{eventId}/actions/archive")
    fun archive(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.archive(seasonId, eventId, principal)

    @PostMapping("/{eventId}/actions/unarchive")
    fun unarchive(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.unarchive(seasonId, eventId, principal)

    @PostMapping("/{eventId}/actions/open-availability")
    fun openAvailability(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.openAvailability(seasonId, eventId, principal)

    @PostMapping("/{eventId}/actions/close-availability")
    fun closeAvailability(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventResponseDto = eventService.closeAvailability(seasonId, eventId, principal)
}
