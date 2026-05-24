package com.hatcast.api.composition

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.dto.CompositionCandidateListResponseDto
import com.hatcast.api.composition.dto.CompositionDrawResponseDto
import com.hatcast.api.composition.dto.CompositionResponseDto
import com.hatcast.api.composition.dto.AssignSlotRequestDto
import com.hatcast.api.composition.dto.DrawCompositionRequestDto
import com.hatcast.api.composition.dto.UpdateSlotParticipationRequestDto
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/seasons/{seasonId}/events/{eventId}/composition")
class CompositionController(
    private val compositionService: CompositionService,
    private val compositionDrawService: CompositionDrawService,
    private val compositionSlotAssignmentService: CompositionSlotAssignmentService,
    private val compositionParticipationService: CompositionParticipationService,
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

    @PostMapping("/validate")
    fun validateComposition(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionResponseDto = compositionService.validateComposition(seasonId, eventId, principal)

    @PostMapping("/unlock")
    fun unlockComposition(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionResponseDto = compositionService.unlockComposition(seasonId, eventId, principal)

    @PostMapping("/draw")
    fun drawComposition(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @RequestBody(required = false) body: DrawCompositionRequestDto?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionDrawResponseDto =
        compositionDrawService.drawComposition(seasonId, eventId, body, principal)

    @GetMapping("/candidates")
    fun getCompositionCandidates(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @RequestParam roleKey: String,
        @RequestParam(required = false) slotIndex: Int?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionCandidateListResponseDto =
        compositionSlotAssignmentService.getCandidates(seasonId, eventId, roleKey, slotIndex, principal)

    @PostMapping("/slots/{roleKey}/{slotIndex}/participation")
    fun updateSlotParticipation(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @PathVariable roleKey: String,
        @PathVariable slotIndex: Int,
        @RequestBody body: UpdateSlotParticipationRequestDto,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionResponseDto =
        compositionParticipationService.updateParticipation(
            seasonId,
            eventId,
            roleKey,
            slotIndex,
            body,
            principal,
        )

    @PutMapping("/slots/{roleKey}/{slotIndex}")
    fun assignCompositionSlot(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @PathVariable roleKey: String,
        @PathVariable slotIndex: Int,
        @RequestBody body: AssignSlotRequestDto,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): CompositionResponseDto =
        compositionSlotAssignmentService.assignSlot(
            seasonId,
            eventId,
            roleKey,
            slotIndex,
            body,
            principal,
        )
}
