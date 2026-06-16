package com.hatcast.api.draw.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import com.hatcast.api.draw.DrawFactorConfig
import com.hatcast.api.draw.DrawFormulaEntity
import com.hatcast.api.draw.DrawFormulaStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawFormulaDto(
    val id: UUID,
    val troupeId: UUID,
    val name: String,
    val description: String?,
    val status: DrawFormulaStatus,
    val factorConfig: DrawFactorConfig,
    val version: Int,
    val isSystem: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(entity: DrawFormulaEntity): DrawFormulaDto =
            DrawFormulaDto(
                id = entity.id,
                troupeId = entity.troupeId,
                name = entity.name,
                description = entity.description,
                status = entity.status,
                factorConfig = entity.factorConfig,
                version = entity.version,
                isSystem = entity.isSystem,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
            )
    }
}

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class CreateDrawFormulaRequest(
    @field:NotBlank(message = "Le nom ne peut pas être vide.")
    @field:Size(max = 255)
    val name: String,
    @field:Size(max = 2000)
    val description: String? = null,
    val status: DrawFormulaStatus? = null,
    val factorConfig: DrawFactorConfig? = null,
)

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class UpdateDrawFormulaRequest(
    @field:Size(max = 255)
    val name: String? = null,
    @field:Size(max = 2000)
    val description: String? = null,
    val status: DrawFormulaStatus? = null,
    val factorConfig: DrawFactorConfig? = null,
)
