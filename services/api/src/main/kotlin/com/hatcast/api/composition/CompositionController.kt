package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.dto.CompositionResponseDto
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/seasons/{seasonId}/events/{eventId}/composition")
class CompositionController(
    private val compositionService: CompositionService,
) {
    @GetMapping
    fun getComposition(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionResponseDto = compositionService.getComposition(seasonId, eventId, principal)

    @PostMapping("/publish")
    fun publishComposition(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionResponseDto = compositionService.publishComposition(seasonId, eventId, principal)
}
