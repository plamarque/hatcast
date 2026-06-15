package com.hatcast.api.draw

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import java.util.UUID

/** One factor toggle in a persisted draw formula recipe (order matters). */
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawFactorConfigEntry(
    val factorId: String,
    val enabled: Boolean,
    val params: Map<String, Any>? = null,
)

typealias DrawFactorConfig = List<DrawFactorConfigEntry>

enum class DrawFormulaStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED,
}

enum class DrawPolicyScope {
    TROUPE,
    SEASON,
}

enum class DrawRuleMode {
    CHOICE,
    MANDATORY,
}

enum class DrawPolicySource {
    IMPLICIT,
    TROUPE,
    SEASON,
}

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawDefaultRule(
    val mode: DrawRuleMode,
    val allowedFormulaIds: List<String>? = null,
    val mandatoryFormulaId: String? = null,
)

@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy::class)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class DrawCategoryRule(
    val category: String?,
    val mode: DrawRuleMode,
    val allowedFormulaIds: List<String>? = null,
    val mandatoryFormulaId: String? = null,
)

/** Result of implicit troupe default resolution (story 19.16 AC 8–10). */
data class ResolvedDrawRule(
    val policySource: DrawPolicySource,
    val resolvedMode: DrawRuleMode,
    val allowedFormulaIds: List<UUID>,
    val categoryRules: List<DrawCategoryRule> = emptyList(),
    val selectorVisible: Boolean,
    val effectiveFormulaId: UUID? = null,
)
