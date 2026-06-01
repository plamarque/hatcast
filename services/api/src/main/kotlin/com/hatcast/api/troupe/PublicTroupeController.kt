package com.hatcast.api.troupe

import com.hatcast.api.troupe.dto.PublicTroupeDirectoryItemDto
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.util.UUID
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/v1/public/troupes")
class PublicTroupeController(
    private val publicTroupeService: PublicTroupeService,
    private val troupeLogoService: TroupeLogoService,
) {
    /** Public troupe directory for anonymous browse (FR32). No authentication required. */
    @GetMapping
    fun listPublicTroupes(): List<PublicTroupeDirectoryItemDto> = publicTroupeService.listPublicDirectory()

    /** Public logo bytes for directory-eligible troupes only. */
    @GetMapping("/{troupeId}/logo")
    fun getPublicLogo(
        @PathVariable troupeId: UUID,
    ): ResponseEntity<ByteArray> {
        val content =
            troupeLogoService.readPublicLogo(troupeId)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return ResponseEntity
            .ok()
            .contentType(content.second)
            .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
            .body(content.first)
    }
}
