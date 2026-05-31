package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.season.dto.PlatformAdminSeasonResolutionDto
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/admin/seasons")
class AdminSeasonController(
    private val seasonService: SeasonService,
) {
    /**
     * Résout une saison par slug dans toutes les troupes (admin plateforme).
     * Retourne une liste : un seul élément si non ambigu, plusieurs si homonymes.
     */
    @GetMapping("/by-slug/{slug}")
    fun resolveBySlug(
        @PathVariable slug: String,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<PlatformAdminSeasonResolutionDto> =
        seasonService.resolveBySlugForPlatformAdmin(slug, principal)
}
