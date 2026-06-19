package com.hatcast.api.draw

import com.hatcast.api.event.EventEntity
import com.hatcast.api.troupe.TroupeCategoryRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class DrawPolicyResolutionService(
    private val drawFormulaRepository: DrawFormulaRepository,
    private val drawFormulaSeedService: DrawFormulaSeedService,
    private val drawFormulaRuntimeService: DrawFormulaRuntimeService,
    private val drawPolicyRepository: DrawPolicyRepository,
    private val troupeCategoryRepository: TroupeCategoryRepository,
) {
    @Transactional
    fun resolveImplicitDefault(troupeId: UUID): ResolvedDrawRule {
        drawFormulaSeedService.ensureSystemFormula(troupeId)
        val systemV1Id = DrawFormulaIds.systemV1(troupeId)
        val publishedNonSystemIds =
            drawFormulaRepository
                .findByTroupeIdAndStatusOrderByNameAsc(troupeId, DrawFormulaStatus.PUBLISHED)
                .filter { !it.isSystem }
                .map { it.id }
        val allowedFormulaIds = publishedNonSystemIds + systemV1Id
        val selectorVisible = allowedFormulaIds.size >= 2
        val effectiveFormulaId = if (!selectorVisible) systemV1Id else null
        return ResolvedDrawRule(
            policySource = DrawPolicySource.IMPLICIT,
            resolvedMode = DrawRuleMode.CHOICE,
            allowedFormulaIds = allowedFormulaIds,
            categoryRules = emptyList(),
            selectorVisible = selectorVisible,
            effectiveFormulaId = effectiveFormulaId,
        )
    }

    @Transactional
    fun resolveForEvent(
        event: EventEntity,
        requestedFormulaId: UUID? = null,
        validateForDraw: Boolean = false,
    ): ResolvedDrawContext {
        val troupeId = event.season.troupe.id
        val seasonId = event.season.id
        drawFormulaSeedService.ensureSystemFormula(troupeId)

        val seasonPolicy =
            drawPolicyRepository.findBySeasonIdAndScope(seasonId, DrawPolicyScope.SEASON)
        val troupePolicy =
            drawPolicyRepository.findByTroupeIdAndScope(troupeId, DrawPolicyScope.TROUPE)

        val policySource: DrawPolicySource
        val defaultRule: DrawDefaultRule
        val categoryRules: List<DrawCategoryRule>

        when {
            seasonPolicy != null -> {
                policySource = DrawPolicySource.SEASON
                defaultRule = seasonPolicy.defaultRule
                categoryRules = seasonPolicy.categoryRules
            }
            troupePolicy != null -> {
                policySource = DrawPolicySource.TROUPE
                defaultRule = troupePolicy.defaultRule
                categoryRules = troupePolicy.categoryRules
            }
            else -> {
                val implicit = resolveImplicitDefault(troupeId)
                validateRequestedFormulaMembership(
                    requestedFormulaId = requestedFormulaId,
                    allowedFormulaIds = implicit.allowedFormulaIds,
                )
                val effectiveId =
                    implicit.effectiveFormulaId
                        ?: requestedFormulaId
                        ?: implicit.allowedFormulaIds.first()
                return buildContext(
                    policySource = DrawPolicySource.IMPLICIT,
                    resolvedRuleSource = DrawRuleSource.DEFAULT,
                    eventCategory = event.category,
                    resolvedMode = implicit.resolvedMode,
                    allowedFormulaIds = implicit.allowedFormulaIds,
                    effectiveFormulaId = effectiveId,
                    selectorVisible = implicit.selectorVisible,
                    troupeId = troupeId,
                    requiresFormulaIdOnDraw = false,
                )
            }
        }

        val eventCategory = event.category
        val (resolvedRuleSource, rule) = resolveApplicableRule(eventCategory, troupeId, defaultRule, categoryRules)

        val allowedIds = parseAllowedFormulaIds(rule)
        val mandatoryId = rule.mandatoryFormulaId?.let { parseUuid(it) }

        val effectiveFormulaId =
            resolveEffectiveFormulaForDraw(
                troupeId = troupeId,
                resolvedMode = rule.mode,
                allowedFormulaIds = allowedIds,
                requestedFormulaId = requestedFormulaId,
                mandatoryFormulaId = mandatoryId,
                validateForDraw = validateForDraw,
                defaultRule = defaultRule,
                eventCategory = eventCategory,
            )

        val selectorVisible =
            when (rule.mode) {
                DrawRuleMode.MANDATORY -> false
                DrawRuleMode.CHOICE -> allowedIds.size >= 2
            }
        val requiresFormulaIdOnDraw =
            rule.mode == DrawRuleMode.CHOICE && allowedIds.size >= 2

        return buildContext(
            policySource = policySource,
            resolvedRuleSource = resolvedRuleSource,
            eventCategory = eventCategory,
            resolvedMode = rule.mode,
            allowedFormulaIds = allowedIds,
            effectiveFormulaId = effectiveFormulaId,
            selectorVisible = selectorVisible,
            troupeId = troupeId,
            requiresFormulaIdOnDraw = requiresFormulaIdOnDraw,
        )
    }

    @Transactional(readOnly = true)
    fun toEffectiveDto(
        context: ResolvedDrawContext,
        troupeId: UUID,
    ): com.hatcast.api.draw.dto.EffectiveDrawPolicyDto {
        val namesById =
            context.allowedFormulaIds.associateWith { id ->
                drawFormulaRuntimeService.loadFormulaName(troupeId, id)
                    ?: if (id == DrawFormulaIds.systemV1(troupeId)) {
                        DrawFormulaSeedConstants.SYSTEM_V1_NAME
                    } else {
                        null
                    }
            }
        val effectiveName =
            drawFormulaRuntimeService.loadFormulaName(troupeId, context.effectiveFormulaId)
                ?: if (context.effectiveFormulaId == DrawFormulaIds.systemV1(troupeId)) {
                    DrawFormulaSeedConstants.SYSTEM_V1_NAME
                } else {
                    null
                }
        val categoryLabel =
            context.eventCategory?.let { slug ->
                troupeCategoryRepository.findByTroupe_IdAndSlug(troupeId, slug)?.label
            }
        return com.hatcast.api.draw.dto.EffectiveDrawPolicyDto(
            policySource = context.policySource,
            resolvedRuleSource = context.resolvedRuleSource,
            eventCategory = context.eventCategory,
            eventCategoryLabel = categoryLabel,
            resolvedMode = context.resolvedMode,
            allowedFormulaIds = context.allowedFormulaIds,
            allowedFormulas =
                context.allowedFormulaIds.mapNotNull { id ->
                    namesById[id]?.let { com.hatcast.api.draw.dto.DrawFormulaSummaryDto(id, it) }
                },
            effectiveFormulaId = context.effectiveFormulaId,
            effectiveFormulaName = effectiveName,
            selectorVisible = context.selectorVisible,
            requiresFormulaIdOnDraw = context.requiresFormulaIdOnDraw,
        )
    }

    private fun resolveApplicableRule(
        eventCategory: String?,
        troupeId: UUID,
        defaultRule: DrawDefaultRule,
        categoryRules: List<DrawCategoryRule>,
    ): Pair<DrawRuleSource, DrawCategoryRule> {
        if (eventCategory != null &&
            !troupeCategoryRepository.existsByTroupe_IdAndSlug(troupeId, eventCategory)
        ) {
            return DrawRuleSource.DEFAULT to defaultRule.toCategoryRule()
        }
        val categoryRule =
            categoryRules.firstOrNull { it.category == eventCategory }
                ?: return DrawRuleSource.DEFAULT to defaultRule.toCategoryRule()
        return DrawRuleSource.CATEGORY to categoryRule
    }

    private fun resolveEffectiveFormulaForDraw(
        troupeId: UUID,
        resolvedMode: DrawRuleMode,
        allowedFormulaIds: List<UUID>,
        requestedFormulaId: UUID?,
        mandatoryFormulaId: UUID?,
        validateForDraw: Boolean,
        defaultRule: DrawDefaultRule?,
        eventCategory: String?,
    ): UUID {
        validateRequestedFormulaMembership(requestedFormulaId, allowedFormulaIds)

        val rawEffectiveId =
            when (resolvedMode) {
                DrawRuleMode.MANDATORY -> {
                    mandatoryFormulaId
                        ?: throw ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Politique MANDATORY invalide",
                        )
                }
                DrawRuleMode.CHOICE -> {
                    when {
                        allowedFormulaIds.size == 1 -> allowedFormulaIds.first()
                        allowedFormulaIds.size >= 2 -> {
                            if (validateForDraw) {
                                requestedFormulaId
                                    ?: throw ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "formulaId requis pour cette politique de tirage",
                                    )
                            } else {
                                requestedFormulaId ?: allowedFormulaIds.first()
                            }
                        }
                        else ->
                            throw ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Politique CHOICE invalide",
                            )
                    }
                }
            }

        val resolvedId =
            resolveFormulaAvailability(
                troupeId = troupeId,
                preferredFormulaId = rawEffectiveId,
                resolvedMode = resolvedMode,
                allowedFormulaIds = allowedFormulaIds,
                defaultRule = defaultRule,
            )

        if (validateForDraw &&
            resolvedMode == DrawRuleMode.MANDATORY &&
            requestedFormulaId != null &&
            requestedFormulaId != resolvedId
        ) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "formulaId incompatible avec la politique",
            )
        }

        return resolvedId
    }

    private fun validateRequestedFormulaMembership(
        requestedFormulaId: UUID?,
        allowedFormulaIds: List<UUID>,
    ) {
        if (requestedFormulaId != null && requestedFormulaId !in allowedFormulaIds) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Formule non autorisée pour cette politique",
            )
        }
    }

    private fun resolveFormulaAvailability(
        troupeId: UUID,
        preferredFormulaId: UUID,
        resolvedMode: DrawRuleMode,
        allowedFormulaIds: List<UUID>,
        defaultRule: DrawDefaultRule?,
    ): UUID {
        drawFormulaRuntimeService.resolvePublishedFormulaOrNull(troupeId, preferredFormulaId)?.let {
            return it
        }

        if (resolvedMode == DrawRuleMode.CHOICE) {
            for (candidate in allowedFormulaIds) {
                if (candidate == preferredFormulaId) continue
                drawFormulaRuntimeService.resolvePublishedFormulaOrNull(troupeId, candidate)?.let {
                    return it
                }
            }
        }

        if (defaultRule != null) {
            val fallbackRule = defaultRule.toCategoryRule()
            val fallbackIds = parseAllowedFormulaIds(fallbackRule)
            val fallbackPreferred =
                when (fallbackRule.mode) {
                    DrawRuleMode.MANDATORY ->
                        fallbackRule.mandatoryFormulaId?.let { parseUuid(it) }
                    DrawRuleMode.CHOICE -> fallbackIds.firstOrNull()
                }
            if (fallbackPreferred != null) {
                drawFormulaRuntimeService
                    .resolvePublishedFormulaOrNull(troupeId, fallbackPreferred)
                    ?.let { return it }
                if (fallbackRule.mode == DrawRuleMode.CHOICE) {
                    for (candidate in fallbackIds) {
                        drawFormulaRuntimeService.resolvePublishedFormulaOrNull(troupeId, candidate)?.let {
                            return it
                        }
                    }
                }
            }
        }

        return DrawFormulaIds.systemV1(troupeId)
    }

    private fun buildContext(
        policySource: DrawPolicySource,
        resolvedRuleSource: DrawRuleSource,
        eventCategory: String?,
        resolvedMode: DrawRuleMode,
        allowedFormulaIds: List<UUID>,
        effectiveFormulaId: UUID,
        selectorVisible: Boolean,
        troupeId: UUID,
        requiresFormulaIdOnDraw: Boolean =
            resolvedMode == DrawRuleMode.CHOICE && allowedFormulaIds.size >= 2,
    ): ResolvedDrawContext {
        val systemV1Id = DrawFormulaIds.systemV1(troupeId)
        val pipelineFormulaId =
            drawFormulaRuntimeService.resolvePublishedFormulaOrNull(troupeId, effectiveFormulaId)
                ?: systemV1Id
        val pipeline =
            runCatching {
                drawFormulaRuntimeService.assemblePipelineForFormula(troupeId, pipelineFormulaId)
            }.getOrElse {
                drawFormulaRuntimeService.assemblePipelineForFormula(troupeId, systemV1Id)
            }
        return ResolvedDrawContext(
            policySource = policySource,
            resolvedRuleSource = resolvedRuleSource,
            eventCategory = eventCategory,
            resolvedMode = resolvedMode,
            allowedFormulaIds = allowedFormulaIds,
            effectiveFormulaId = pipelineFormulaId,
            selectorVisible = selectorVisible,
            requiresFormulaIdOnDraw = requiresFormulaIdOnDraw,
            pipeline = pipeline,
        )
    }

    private fun parseAllowedFormulaIds(rule: DrawCategoryRule): List<UUID> =
        when (rule.mode) {
            DrawRuleMode.CHOICE ->
                rule.allowedFormulaIds.orEmpty().mapNotNull { parseUuid(it) }
            DrawRuleMode.MANDATORY ->
                rule.mandatoryFormulaId?.let { listOfNotNull(parseUuid(it)) }.orEmpty()
        }

    private fun parseUuid(raw: String): UUID? = runCatching { UUID.fromString(raw) }.getOrNull()

    private fun DrawDefaultRule.toCategoryRule(): DrawCategoryRule =
        DrawCategoryRule(
            category = null,
            mode = mode,
            allowedFormulaIds = allowedFormulaIds,
            mandatoryFormulaId = mandatoryFormulaId,
        )
}
