package com.hatcast.api.draw

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.draw.dto.CreateDrawFormulaRequest
import com.hatcast.api.draw.dto.DrawFormulaDto
import com.hatcast.api.draw.dto.UpdateDrawFormulaRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1/troupes/{troupeId}/draw-formulas")
class DrawFormulaController(
    private val drawFormulaService: DrawFormulaService,
) {
    @GetMapping
    fun list(
        @PathVariable troupeId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): List<DrawFormulaDto> = drawFormulaService.list(troupeId, principal)

    @GetMapping("/{formulaId}")
    fun get(
        @PathVariable troupeId: UUID,
        @PathVariable formulaId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawFormulaDto = drawFormulaService.get(troupeId, formulaId, principal)

    @PostMapping
    fun create(
        @PathVariable troupeId: UUID,
        @Valid @RequestBody body: CreateDrawFormulaRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): ResponseEntity<DrawFormulaDto> =
        ResponseEntity
            .status(HttpStatus.CREATED)
            .body(drawFormulaService.create(troupeId, body, principal))

    @PatchMapping("/{formulaId}")
    fun update(
        @PathVariable troupeId: UUID,
        @PathVariable formulaId: UUID,
        @Valid @RequestBody body: UpdateDrawFormulaRequest,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawFormulaDto = drawFormulaService.update(troupeId, formulaId, body, principal)

    @DeleteMapping("/{formulaId}")
    fun archive(
        @PathVariable troupeId: UUID,
        @PathVariable formulaId: UUID,
        @AuthenticationPrincipal principal: SessionUserPrincipal,
    ): DrawFormulaDto = drawFormulaService.archive(troupeId, formulaId, principal)
}
