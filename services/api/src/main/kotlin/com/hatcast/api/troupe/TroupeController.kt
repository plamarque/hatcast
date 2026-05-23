package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.AddTroupeMemberRequest
import com.hatcast.api.troupe.dto.MembershipSummaryDto
import com.hatcast.api.troupe.dto.PagedTroupeMembersResponse
import com.hatcast.api.troupe.dto.TroupeMemberAdminDto
import com.hatcast.api.troupe.dto.TroupeListItemDto
import com.hatcast.api.troupe.dto.UpdateTroupeMemberRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
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

    /**
     * Rejoindre (ou réactiver) l'adhésion courante à la troupe de démonstration.
     * Flux provisoire limité à la seed jusqu'aux invitations/rôles de la Story 2.2.
     */
    @PostMapping("/{troupeId}/memberships/me")
    fun joinTroupe(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MembershipSummaryDto {
        if (!troupeAccess.isSeedTroupe(troupeId)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Adhésion directe réservée à la troupe de démonstration.")
        }
        val membership = membershipService.ensureActiveMembership(principal.userId, troupeId)
        return MembershipSummaryDto.from(membership)
    }

    @GetMapping("/{troupeId}/memberships/me")
    fun getMyMembership(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MembershipSummaryDto {
        val membership =
            membershipService.getActiveMembershipForUser(principal.userId, troupeId)
                ?: throw ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Adhésion introuvable.",
                )
        return MembershipSummaryDto.from(membership)
    }

    @GetMapping("/{troupeId}/members")
    fun listMembers(
        @PathVariable troupeId: UUID,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "25") size: Int,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): PagedTroupeMembersResponse = membershipService.listMembersForAdmin(troupeId, page, size, principal)

    @PostMapping("/{troupeId}/members")
    fun addMember(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: AddTroupeMemberRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): TroupeMemberAdminDto = membershipService.addMemberByEmail(troupeId, body, principal)

    @PatchMapping("/{troupeId}/members/{membershipId}")
    fun updateMember(
        @PathVariable troupeId: UUID,
        @PathVariable membershipId: UUID,
        @RequestBody body: UpdateTroupeMemberRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): TroupeMemberAdminDto = membershipService.updateMember(troupeId, membershipId, body, principal)

    @DeleteMapping("/{troupeId}/members/{membershipId}")
    fun deactivateMember(
        @PathVariable troupeId: UUID,
        @PathVariable membershipId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ) {
        membershipService.deactivateMember(troupeId, membershipId, principal)
    }
}
