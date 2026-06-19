package com.hatcast.api.draw.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import com.hatcast.api.draw.DrawCategoryRule
import com.hatcast.api.draw.DrawDefaultRule
import com.hatcast.api.draw.DrawPolicyEntity
import com.hatcast.api.draw.DrawPolicyScope
import com.hatcast.api.draw.DrawPolicySource
import com.hatcast.api.draw.DrawRuleMode
import com.hatcast.api.draw.DrawRuleSource
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.util.UUID

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawRuleDto(
    val mode: DrawRuleMode,
    val allowedFormulaIds: List<UUID>? = null,
    val mandatoryFormulaId: UUID? = null,
) {
    companion object {
        fun fromDefault(rule: DrawDefaultRule): DrawRuleDto =
            DrawRuleDto(
                mode = rule.mode,
                allowedFormulaIds = rule.allowedFormulaIds?.mapNotNull { parseUuid(it) },
                mandatoryFormulaId = rule.mandatoryFormulaId?.let { parseUuid(it) },
            )

        fun fromCategory(rule: DrawCategoryRule): DrawRuleDto =
            DrawRuleDto(
                mode = rule.mode,
                allowedFormulaIds = rule.allowedFormulaIds?.mapNotNull { parseUuid(it) },
                mandatoryFormulaId = rule.mandatoryFormulaId?.let { parseUuid(it) },
            )

        private fun parseUuid(raw: String): UUID? = runCatching { UUID.fromString(raw) }.getOrNull()
    }
}

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawPolicyDto(
    val id: UUID,
    val troupeId: UUID,
    val seasonId: UUID?,
    val scope: DrawPolicyScope,
    val defaultRule: DrawRuleDto,
    val categoryRules: List<DrawCategoryRuleDto>,
    val updatedAt: Instant,
) {
    companion object {
        fun from(entity: DrawPolicyEntity): DrawPolicyDto =
            DrawPolicyDto(
                id = entity.id,
                troupeId = entity.troupeId,
                seasonId = entity.seasonId,
                scope = entity.scope,
                defaultRule = DrawRuleDto.fromDefault(entity.defaultRule),
                categoryRules =
                    entity.categoryRules.map {
                        DrawCategoryRuleDto(
                            category = it.category,
                            mode = it.mode,
                            allowedFormulaIds = it.allowedFormulaIds?.mapNotNull { ref -> parseUuid(ref) },
                            mandatoryFormulaId = it.mandatoryFormulaId?.let { ref -> parseUuid(ref) },
                        )
                    },
                updatedAt = entity.updatedAt,
            )

        private fun parseUuid(raw: String): UUID? = runCatching { UUID.fromString(raw) }.getOrNull()
    }
}

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawCategoryRuleDto(
    val category: String?,
    val mode: DrawRuleMode,
    val allowedFormulaIds: List<UUID>? = null,
    val mandatoryFormulaId: UUID? = null,
)

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class UpsertDrawPolicyRequest(
    @field:NotNull
    @field:Valid
    val defaultRule: DrawDefaultRule,
    val categoryRules: List<DrawCategoryRule> = emptyList(),
)

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawFormulaSummaryDto(
    val id: UUID,
    val name: String,
)

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class EffectiveDrawPolicyDto(
    val policySource: DrawPolicySource,
    val resolvedRuleSource: DrawRuleSource,
    val eventCategory: String?,
    val eventCategoryLabel: String? = null,
    val resolvedMode: DrawRuleMode,
    val allowedFormulaIds: List<UUID>,
    val allowedFormulas: List<DrawFormulaSummaryDto>,
    val effectiveFormulaId: UUID?,
    val effectiveFormulaName: String?,
    val selectorVisible: Boolean,
    val requiresFormulaIdOnDraw: Boolean,
)
