package com.hatcast.api.troupe

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import org.springframework.beans.factory.annotation.Value
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
    @Value("\${hatcast.troupe.seed-troupe-id}") private val seedTroupeIdRaw: String,
    private val membershipService: TroupeMembershipService,
    private val platformAdminService: PlatformAdminService,
) {
    private val seedTroupeId: UUID = UUID.fromString(seedTroupeIdRaw.trim())

    fun seedTroupeId(): UUID = seedTroupeId

    fun isSeedTroupe(troupeId: UUID): Boolean = troupeId == seedTroupeId

    /** Lecture : saisons, événements, contexte troupe pour un membre actif. */
    fun requireActiveMember(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) {
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
