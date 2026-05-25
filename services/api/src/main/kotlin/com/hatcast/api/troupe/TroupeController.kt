package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.AddTroupeMemberRequest
import com.hatcast.api.troupe.dto.MemberImportResultDto
import com.hatcast.api.troupe.dto.MembershipSummaryDto
import com.hatcast.api.troupe.dto.PagedTroupeMembersResponse
import com.hatcast.api.troupe.dto.TroupeMemberAdminDto
import com.hatcast.api.troupe.dto.TroupeEquityTagDto
import com.hatcast.api.troupe.dto.TroupeListItemDto
import com.hatcast.api.troupe.dto.UpdateMyMembershipRequest
import com.hatcast.api.troupe.dto.UpdateTroupeMemberRequest
import com.hatcast.api.user.UserImportService
import com.hatcast.api.user.dto.UserImportResultDto
import jakarta.validation.Valid
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
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
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.nio.charset.StandardCharsets
import java.util.UUID

@RestController
@RequestMapping("/v1/troupes")
class TroupeController(
    private val membershipService: TroupeMembershipService,
    private val userImportService: UserImportService,
    private val troupeAccess: TroupeAccessService,
    private val troupeEquityTagService: TroupeEquityTagService,
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

    @GetMapping("/{troupeId}/equity-tags")
    fun listEquityTags(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<TroupeEquityTagDto> = troupeEquityTagService.listForTroupe(troupeId, principal)

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

    @PatchMapping("/{troupeId}/memberships/me")
    fun updateMyMembership(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: UpdateMyMembershipRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MembershipSummaryDto =
        membershipService.updateMyMembership(principal.userId, troupeId, body)

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

    @GetMapping("/{troupeId}/members/export", produces = ["text/csv"])
    fun exportMembers(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): ResponseEntity<ByteArray> {
        val csv = membershipService.exportActiveMembersCsv(troupeId, principal)
        return ResponseEntity
            .ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"troupe-members-$troupeId.csv\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csv.toByteArray(StandardCharsets.UTF_8))
    }

    @PostMapping("/{troupeId}/members/import", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun importMembers(
        @PathVariable troupeId: UUID,
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): MemberImportResultDto {
        if (file.isEmpty) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier CSV est vide.")
        }
        val content = file.bytes.toString(StandardCharsets.UTF_8)
        return membershipService.importMembersCsv(troupeId, content, principal)
    }

    @PostMapping("/{troupeId}/users/import", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun importUsers(
        @PathVariable troupeId: UUID,
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): UserImportResultDto {
        if (file.isEmpty) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier CSV est vide.")
        }
        val content = file.bytes.toString(StandardCharsets.UTF_8)
        return userImportService.importUsersCsv(troupeId, content, principal)
    }
}
