package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.season.dto.CreateSeasonRequest
import com.hatcast.api.season.dto.SeasonResponseDto
import com.hatcast.api.season.dto.UpdateSeasonRequest
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
class SeasonController(
    private val seasonService: SeasonService,
) {
    @GetMapping("/troupes/{troupeId}/seasons")
    fun listByTroupe(
        @PathVariable troupeId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) = seasonService.listForTroupe(troupeId, page, size, principal)

    @PostMapping("/troupes/{troupeId}/seasons")
    fun create(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: CreateSeasonRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonResponseDto = seasonService.create(troupeId, body, principal)

    @GetMapping("/troupes/{troupeId}/seasons/by-slug/{slug}")
    fun getBySlug(
        @PathVariable troupeId: UUID,
        @PathVariable slug: String,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonResponseDto = seasonService.getByTroupeIdAndSlug(troupeId, slug, principal)

    @GetMapping("/troupes/by-slug/{troupeSlug}/seasons/by-slug/{seasonSlug}")
    fun resolveByTroupeAndSeasonSlugs(
        @PathVariable troupeSlug: String,
        @PathVariable seasonSlug: String,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) = seasonService.resolveByTroupeSlugAndSeasonSlug(troupeSlug, seasonSlug, principal)

    @GetMapping("/seasons/{seasonId}")
    fun get(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonResponseDto = seasonService.getById(seasonId, principal)

    @PatchMapping("/seasons/{seasonId}")
    fun update(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: UpdateSeasonRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonResponseDto = seasonService.update(seasonId, body, principal)

    @PostMapping("/seasons/{seasonId}/actions/archive")
    fun archive(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonResponseDto = seasonService.archive(seasonId, principal)

    @PostMapping("/seasons/{seasonId}/actions/activate")
    fun activate(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonResponseDto = seasonService.activate(seasonId, principal)

    @DeleteMapping("/seasons/{seasonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable seasonId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        seasonService.delete(seasonId, principal)
    }
}
