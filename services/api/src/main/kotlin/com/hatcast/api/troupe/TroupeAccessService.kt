package com.hatcast.api.troupe

import com.hatcast.api.auth.SessionUserPrincipal
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

/**
 * Contrôle d'accès troupe (Epic 2.1).
 *
 * - **Lecture membre** : adhésion active dans la troupe.
 * - **Gestion provisoire** (Story 3.x, remplacée en 2.2) : adhésion active **et** troupe seed —
 *   tout membre actif de la troupe seed peut administrer saisons/événements jusqu'à l'introduction
 *   des rôles de base (Story 2.2).
 */
@Component
class TroupeAccessService(
    @Value("\${hatcast.troupe.seed-troupe-id}") private val seedTroupeIdRaw: String,
    private val membershipService: TroupeMembershipService,
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
     * Gestion provisoire (seed troupe + membre actif). Remplace l'ancienne règle « tout utilisateur
     * authentifié sur la troupe seed ».
     */
    fun requireCanManageTroupe(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ) {
        membershipService.requireActiveMembership(principal.userId, troupeId)
        if (troupeId != seedTroupeId) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Accès refusé pour cette troupe.",
            )
        }
    }

    /** Admin provisoire pour la troupe seed (organisateurs, CRUD saisons/événements). */
    fun isProvisionalTroupeAdmin(
        principal: SessionUserPrincipal,
        troupeId: UUID,
    ): Boolean =
        troupeId == seedTroupeId &&
            membershipService.isActiveMember(principal.userId, troupeId)
}
