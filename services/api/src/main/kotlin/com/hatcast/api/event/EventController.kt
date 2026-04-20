package com.hatcast.api.event

import com.hatcast.api.event.dto.CreateEventRequest
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.event.dto.PagedEventsResponse
import com.hatcast.api.event.dto.UpdateEventRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
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
) {
    @GetMapping
    fun list(
        @PathVariable seasonId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "all") scope: String,
    ): PagedEventsResponse {
        val s =
            when (scope.lowercase()) {
                "upcoming" -> EventListScope.UPCOMING
                "all" -> EventListScope.ALL
                else ->
                    throw ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "scope doit être all ou upcoming",
                    )
            }
        return eventService.listForSeason(seasonId, page, size, s)
    }

    @PostMapping
    fun create(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: CreateEventRequest,
    ): EventResponseDto = eventService.create(seasonId, body)

    @PatchMapping("/{eventId}")
    fun update(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @Valid @RequestBody body: UpdateEventRequest,
    ): EventResponseDto = eventService.update(seasonId, eventId, body)

    @PostMapping("/{eventId}/actions/archive")
    fun archive(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
    ): EventResponseDto = eventService.archive(seasonId, eventId)
}
