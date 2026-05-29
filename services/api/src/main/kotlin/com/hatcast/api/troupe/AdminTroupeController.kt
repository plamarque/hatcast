package com.hatcast.api.troupe

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.TroupeAdminSummaryDto
import com.hatcast.api.troupe.dto.UpdateTroupeJoinPolicyRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/v1/admin/troupes")
class AdminTroupeController(
    private val troupeService: TroupeService,
    private val platformAdminService: PlatformAdminService,
) {
    @PatchMapping("/{troupeId}")
    fun updateJoinPolicy(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: UpdateTroupeJoinPolicyRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): TroupeAdminSummaryDto {
        if (!platformAdminService.isPlatformAdmin(principal)) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Accès réservé aux administrateurs de la plateforme.",
            )
        }
        return troupeService.updateJoinPolicy(troupeId, body.joinPolicy)
    }
}
