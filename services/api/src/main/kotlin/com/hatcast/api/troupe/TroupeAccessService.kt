package com.hatcast.api.troupe

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Contrôle d'accès troupe.
 *
 * - **Lecture membre** : adhésion active dans la troupe.
 * - **Gestion troupe** : adhésion active avec rôle de base `TROUPE_ADMIN`, ou admin plateforme.
 */
@Component
class TroupeAccessService(
    private val membershipService: TroupeMembershipService,
    private val platformAdminService: PlatformAdminService,
) {
    /** Lecture : saisons, événements, contexte troupe pour un membre actif (ou admin plateforme). */
    fun requireActiveMember(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return
        }
        membershipService.requireActiveMembership(principal.userId, troupeId)
    }

    /**
     * Gestion troupe : administration des membres, saisons, événements et délégations.
     */
    fun requireCanManageTroupe(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) = requireTroupeAdmin(principal, troupeId)

    fun requireTroupeAdmin(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return
        }
        membershipService.requireTroupeAdmin(principal.userId, troupeId)
    }

    fun isTroupeAdmin(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ): Boolean {
        if (platformAdminService.isPlatformAdmin(principal)) {
            return true
        }
        return membershipService.isTroupeAdmin(principal.userId, troupeId)
    }
}
