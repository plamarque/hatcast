package com.hatcast.api.season

import com.hatcast.api.season.dto.CreateSeasonRequest
import com.hatcast.api.season.dto.SeasonResponseDto
import com.hatcast.api.season.dto.UpdateSeasonRequest
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
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
    ) = seasonService.listForTroupe(troupeId, page, size)

    @PostMapping("/troupes/{troupeId}/seasons")
    fun create(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: CreateSeasonRequest,
    ): SeasonResponseDto = seasonService.create(troupeId, body)

    @GetMapping("/troupes/{troupeId}/seasons/by-slug/{slug}")
    fun getBySlug(
        @PathVariable troupeId: UUID,
        @PathVariable slug: String,
    ): SeasonResponseDto = seasonService.getByTroupeIdAndSlug(troupeId, slug)

    @GetMapping("/seasons/{seasonId}")
    fun get(
        @PathVariable seasonId: UUID,
    ): SeasonResponseDto = seasonService.getById(seasonId)

    @PatchMapping("/seasons/{seasonId}")
    fun update(
        @PathVariable seasonId: UUID,
        @Valid @RequestBody body: UpdateSeasonRequest,
    ): SeasonResponseDto = seasonService.update(seasonId, body)

    @PostMapping("/seasons/{seasonId}/actions/archive")
    fun archive(
        @PathVariable seasonId: UUID,
    ): SeasonResponseDto = seasonService.archive(seasonId)

    @PostMapping("/seasons/{seasonId}/actions/activate")
    fun activate(
        @PathVariable seasonId: UUID,
    ): SeasonResponseDto = seasonService.activate(seasonId)
}
