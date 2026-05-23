package com.hatcast.api.season

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.TroupeMembershipService
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class SeasonAccessService(
    private val platformAdminService: PlatformAdminService,
    private val membershipService: TroupeMembershipService,
) {
    /**
     * Suppression définitive : admin troupe **ou** admin plateforme (sans exiger adhésion active pour ce dernier).
     */
    fun requireCanDeleteSeason(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return
        }
        membershipService.requireTroupeAdmin(principal.userId, troupeId)
    }
}
