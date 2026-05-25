package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.season.dto.SeasonStatisticsResponseDto
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/seasons")
class SeasonStatisticsController(
    private val seasonStatisticsService: SeasonStatisticsService,
) {
    @GetMapping("/{seasonId}/statistics")
    fun getStatistics(
        @PathVariable seasonId: UUID,
        @RequestParam(required = false) eventId: UUID?,
        @RequestParam(required = false) participantId: UUID?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): SeasonStatisticsResponseDto =
        seasonStatisticsService.loadStatistics(
            seasonId = seasonId,
            principal = principal,
            eventId = eventId,
            participantId = participantId,
        )
}
