package com.hatcast.api.troupe

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

/**
 * Règle provisoire (avant epic-2) : seule la troupe seed (Flyway V3 + [hatcast.troupe.seed-troupe-id])
 * est administrable par tout utilisateur authentifié. Remplacer par contrôle d’adhésion / rôles plus tard.
 */
@Component
class TroupeAccessService(
    @Value("\${hatcast.troupe.seed-troupe-id}") private val seedTroupeIdRaw: String,
) {
    private val seedTroupeId: UUID = UUID.fromString(seedTroupeIdRaw.trim())

    fun seedTroupeId(): UUID = seedTroupeId

    fun requireCanManageTroupe(troupeId: UUID) {
        if (troupeId != seedTroupeId) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Accès refusé pour cette troupe.",
            )
        }
    }
}
