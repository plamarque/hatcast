package com.hatcast.api.troupe

import com.hatcast.api.troupe.dto.TroupeListItemDto
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/troupes")
class TroupeController(
    private val troupeRepository: TroupeRepository,
    private val troupeAccess: TroupeAccessService,
) {
    /**
     * Liste des troupes accessibles à l’écran d’admin (pour l’instant : la troupe seed uniquement).
     */
    @GetMapping
    fun listTroupesForAdmin(): List<TroupeListItemDto> {
        val t =
            troupeRepository
                .findById(troupeAccess.seedTroupeId())
                .orElseThrow()
        return listOf(
            TroupeListItemDto(
                id = t.id,
                name = t.name,
                slug = t.slug,
            ),
        )
    }
}
