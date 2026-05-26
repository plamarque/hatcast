package com.hatcast.api.memberglance

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.memberglance.dto.MemberSeasonGlanceResponseDto
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/members")
class MemberSeasonGlanceController(
    private val memberSeasonGlanceService: MemberSeasonGlanceService,
) {
    @GetMapping("/{userSlug}/season-glance")
    fun getSeasonGlance(
        @PathVariable userSlug: String,
        @RequestParam(required = false) troupeId: UUID?,
        @RequestParam(required = false) leagueId: UUID?,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MemberSeasonGlanceResponseDto =
        memberSeasonGlanceService.getSeasonGlance(
            userSlug = userSlug,
            principal = principal,
            troupeId = troupeId,
            leagueId = leagueId,
        )
}
