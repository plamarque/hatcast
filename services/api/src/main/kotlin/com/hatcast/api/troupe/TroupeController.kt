package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.MembershipSummaryDto
import com.hatcast.api.troupe.dto.TroupeListItemDto
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/troupes")
class TroupeController(
    private val membershipService: TroupeMembershipService,
    private val troupeAccess: TroupeAccessService,
) {
    /** Troupe(s) où l'utilisateur courant a une adhésion active. */
    @GetMapping
    fun listMyTroupes(
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<TroupeListItemDto> = membershipService.listActiveTroupesForUser(principal.userId)

    /** Rejoindre (ou réactiver) l'adhésion courante à une troupe — flux explicite minimal (Story 2.1). */
    @PostMapping("/{troupeId}/memberships/me")
    fun joinTroupe(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MembershipSummaryDto {
        val membership = membershipService.ensureActiveMembership(principal.userId, troupeId)
        return MembershipSummaryDto.from(membership)
    }

    @GetMapping("/{troupeId}/memberships/me")
    fun getMyMembership(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MembershipSummaryDto {
        troupeAccess.requireActiveMember(principal, troupeId)
        val membership =
            membershipService.getActiveMembershipForUser(principal.userId, troupeId)
                ?: throw org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "Adhésion introuvable.",
                )
        return MembershipSummaryDto.from(membership)
    }
}
