package com.hatcast.api.memberprofile

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.memberprofile.dto.MemberProfileSummaryDto
import com.hatcast.api.memberprofile.dto.PreferredRolesResponseDto
import com.hatcast.api.memberprofile.dto.UpdatePreferredRolesRequest
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
@RequestMapping("/v1")
class MemberProfileController(
    private val memberProfileService: MemberProfileService,
) {
    @GetMapping("/seasons/{seasonId}/member-profile/{userId}")
    fun getProfileSummary(
        @PathVariable seasonId: UUID,
        @PathVariable userId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MemberProfileSummaryDto =
        memberProfileService.getProfileSummary(seasonId, userId, principal)

    @GetMapping("/troupes/{troupeId}/memberships/me/preferred-roles")
    fun getMyPreferredRoles(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): PreferredRolesResponseDto =
        memberProfileService.getPreferredRoles(principal.userId, troupeId)

    @PutMapping("/troupes/{troupeId}/memberships/me/preferred-roles")
    fun updateMyPreferredRoles(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: UpdatePreferredRolesRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): PreferredRolesResponseDto =
        memberProfileService.updatePreferredRoles(principal.userId, troupeId, body)
}
