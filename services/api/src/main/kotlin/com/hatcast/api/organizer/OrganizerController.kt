package com.hatcast.api.organizer

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.organizer.dto.MySeasonPermissionsDto
import com.hatcast.api.organizer.dto.OrganizerAssignmentRequest
import com.hatcast.api.organizer.dto.OrganizerResponseDto
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
class OrganizerController(
    private val organizerAccessService: OrganizerAccessService,
) {
    @GetMapping("/seasons/{seasonId}/organizers")
    fun listSeasonOrganizers(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<OrganizerResponseDto> = organizerAccessService.listSeasonOrganizers(seasonId, principal)

    @PostMapping("/seasons/{seasonId}/organizers")
    fun grantSeasonOrganizer(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: OrganizerAssignmentRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): OrganizerResponseDto = organizerAccessService.grantSeasonOrganizer(seasonId, body, principal)

    @DeleteMapping("/seasons/{seasonId}/organizers/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun revokeSeasonOrganizer(
        @PathVariable seasonId: UUID,
        @PathVariable userId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        organizerAccessService.revokeSeasonOrganizer(seasonId, userId, principal)
    }

    @GetMapping("/seasons/{seasonId}/events/{eventId}/organizers")
    fun listEventOrganizers(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<OrganizerResponseDto> = organizerAccessService.listEventOrganizers(seasonId, eventId, principal)

    @PostMapping("/seasons/{seasonId}/events/{eventId}/organizers")
    fun grantEventOrganizer(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @Valid @RequestBody body: OrganizerAssignmentRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): OrganizerResponseDto = organizerAccessService.grantEventOrganizer(seasonId, eventId, body, principal)

    @DeleteMapping("/seasons/{seasonId}/events/{eventId}/organizers/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun revokeEventOrganizer(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @PathVariable userId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        organizerAccessService.revokeEventOrganizer(seasonId, eventId, userId, principal)
    }

    @GetMapping("/seasons/{seasonId}/permissions/me")
    fun mySeasonPermissions(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MySeasonPermissionsDto = organizerAccessService.mySeasonPermissions(seasonId, principal)
}
