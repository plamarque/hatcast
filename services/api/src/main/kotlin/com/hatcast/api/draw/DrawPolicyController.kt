package com.hatcast.api.draw

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.draw.dto.DrawPolicyDto
import com.hatcast.api.draw.dto.EffectiveDrawPolicyDto
import com.hatcast.api.draw.dto.UpsertDrawPolicyRequest
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.OrganizerAccessRules
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
class DrawPolicyController(
    private val drawPolicyService: DrawPolicyService,
    private val drawPolicyResolutionService: DrawPolicyResolutionService,
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val organizerAccess: OrganizerAccessRules,
    private val troupeAccess: TroupeAccessService,
) {
    @GetMapping("/v1/troupes/{troupeId}/draw-policy")
    fun getTroupePolicy(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawPolicyDto = drawPolicyService.getTroupePolicy(troupeId, principal)

    @PutMapping("/v1/troupes/{troupeId}/draw-policy")
    fun upsertTroupePolicy(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: UpsertDrawPolicyRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawPolicyDto = drawPolicyService.upsertTroupePolicy(troupeId, body, principal)

    @GetMapping("/v1/seasons/{seasonId}/draw-policy")
    fun getSeasonPolicy(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawPolicyDto = drawPolicyService.getSeasonPolicy(seasonId, principal)

    @PutMapping("/v1/seasons/{seasonId}/draw-policy")
    fun upsertSeasonPolicy(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: UpsertDrawPolicyRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawPolicyDto = drawPolicyService.upsertSeasonPolicy(seasonId, body, principal)

    @GetMapping("/v1/seasons/{seasonId}/events/{eventId}/draw-policy/effective")
    fun getEffectiveDrawPolicy(
        @PathVariable seasonId: UUID,
        @PathVariable eventId: UUID,
        @RequestParam(required = false) formulaId: UUID?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): EffectiveDrawPolicyDto {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        if (!organizerAccess.canManageComposition(eventId, seasonId, principal)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé")
        }
        val context =
            drawPolicyResolutionService.resolveForEvent(
                event = event,
                requestedFormulaId = formulaId,
                validateForDraw = false,
            )
        return drawPolicyResolutionService.toEffectiveDto(context, event.season.troupe.id)
    }

    private fun loadAuthorizedEvent(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): com.hatcast.api.event.EventEntity {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return event
    }
}
