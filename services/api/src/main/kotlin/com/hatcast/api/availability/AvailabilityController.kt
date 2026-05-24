package com.hatcast.api.availability

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.dto.EventAvailabilitySummaryResponse
import com.hatcast.api.availability.dto.MyAvailabilityResponse
import com.hatcast.api.availability.dto.SetMyAvailabilityRequest
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/seasons/{seasonId}/events/{eventId}/availability")
class AvailabilityController(
    private val availabilityService: AvailabilityService,
) {
    @GetMapping("/me")
    fun getMyAvailability(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MyAvailabilityResponse = availabilityService.getMyStatus(seasonId, eventId, principal)

    @PutMapping("/me")
    fun setMyAvailability(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @Valid @RequestBody body: SetMyAvailabilityRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MyAvailabilityResponse = availabilityService.setMyStatus(seasonId, eventId, body, principal)

    @GetMapping("/summary")
    fun getAvailabilitySummary(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EventAvailabilitySummaryResponse = availabilityService.getSummary(seasonId, eventId, principal)
}
