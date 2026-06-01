package com.hatcast.api.troupe

import com.hatcast.api.troupe.dto.PublicTroupeDirectoryItemDto
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/public/troupes")
class PublicTroupeController(
    private val publicTroupeService: PublicTroupeService,
) {
    /** Public troupe directory for anonymous browse (FR32). No authentication required. */
    @GetMapping
    fun listPublicTroupes(): List<PublicTroupeDirectoryItemDto> = publicTroupeService.listPublicDirectory()
}
