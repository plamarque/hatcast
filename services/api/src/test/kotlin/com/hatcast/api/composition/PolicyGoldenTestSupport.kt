package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatcast.api.draw.DrawCategoryRule
import com.hatcast.api.draw.DrawDefaultRule
import com.hatcast.api.draw.DrawFormulaEntity
import com.hatcast.api.draw.DrawFormulaIds
import com.hatcast.api.draw.DrawFormulaRepository
import com.hatcast.api.draw.DrawFormulaSeedConstants
import com.hatcast.api.draw.DrawFormulaSeedService
import com.hatcast.api.draw.DrawFormulaStatus
import com.hatcast.api.draw.DrawPolicyEntity
import com.hatcast.api.draw.DrawPolicyRepository
import com.hatcast.api.draw.DrawPolicyScope
import com.hatcast.api.draw.DrawRuleMode
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeCategoryEntity
import com.hatcast.api.troupe.TroupeCategoryRepository
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeRepository
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.UUID

@Component
class PolicyGoldenTestSupport(
    private val troupeRepository: TroupeRepository,
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val drawFormulaRepository: DrawFormulaRepository,
    private val drawFormulaSeedService: DrawFormulaSeedService,
    private val drawPolicyRepository: DrawPolicyRepository,
    private val troupeCategoryRepository: TroupeCategoryRepository,
) {
    private val mapper = ObjectMapper().registerModule(kotlinModule())

    data class Scenario(
        val troupeId: UUID,
        val seasonId: UUID,
        val event: EventEntity,
        val formulaIds: Map<String, UUID>,
    )

    fun buildScenario(setup: JsonNode): Scenario {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Policy Golden Troupe",
                    slug = "policy-golden-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        drawFormulaSeedService.ensureSystemFormula(troupe.id)
        val formulaIds = linkedMapOf<String, UUID>()
        formulaIds["system-v1"] = DrawFormulaIds.systemV1(troupe.id)

        setup.path("troupeFormulas").forEach { node ->
            saveFormulaFromNode(node, troupe.id, formulaIds, now)
        }
        ensurePolicyFormulaRefs(setup, troupe.id, formulaIds, now)
        ensureGlossaryFromPolicies(setup, troupe, now)

        setup.path("glossaryCategories").forEach { slug ->
            saveCategoryIfAbsent(troupe, slug.asText(), now)
        }

        setup.path("troupePolicy").takeIf { !it.isMissingNode && !it.isNull }?.let { policyNode ->
            savePolicy(troupe.id, null, DrawPolicyScope.TROUPE, policyNode, formulaIds, troupe.id, null)
        }
        val season =
            seasonRepository.save(
                SeasonEntity(
                    id = UUID.randomUUID(),
                    troupe = troupe,
                    title = "Policy Season",
                    slug = "policy-season-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        setup.path("seasonPolicy").takeIf { !it.isMissingNode && !it.isNull }?.let { policyNode ->
            savePolicy(troupe.id, season.id, DrawPolicyScope.SEASON, policyNode, formulaIds, null, season.id)
        }

        val eventCategory =
            setup.path("event").path("category").takeIf { !it.isMissingNode && !it.isNull }?.asText()
        val event =
            eventRepository.save(
                EventEntity(
                    id = UUID.randomUUID(),
                    season = season,
                    title = "Policy Event",
                    slug = "policy-event-${UUID.randomUUID()}",
                    startsAt = now.plusSeconds(3600),
                    roleSlots = mapOf("player" to 1),
                    category = eventCategory,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        return Scenario(troupe.id, season.id, event, formulaIds)
    }

    fun resolveFormulaRef(
        ref: String,
        formulaIds: Map<String, UUID>,
        troupeId: UUID,
    ): UUID =
        when (ref) {
            "system-v1" -> DrawFormulaIds.systemV1(troupeId)
            else -> formulaIds[ref] ?: UUID.fromString(ref)
        }

    private fun saveFormulaFromNode(
        node: JsonNode,
        troupeId: UUID,
        formulaIds: MutableMap<String, UUID>,
        now: Instant,
    ) {
        val ref = node.path("id").asText()
        if (formulaIds.containsKey(ref)) return
        val status = DrawFormulaStatus.valueOf(node.path("status").asText("PUBLISHED"))
        val factorConfig =
            node.path("factorConfigRef").takeIf { !it.isMissingNode && !it.isNull }?.asText()?.let { configRef ->
                PolicyFactorConfigFixtures.factorConfigForRef(configRef)
            } ?: DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG
        val entity =
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    id = UUID.randomUUID(),
                    troupeId = troupeId,
                    name = node.path("name").asText(ref),
                    status = status,
                    factorConfig = factorConfig,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        formulaIds[ref] = entity.id
    }

    private fun ensurePolicyFormulaRefs(
        setup: JsonNode,
        troupeId: UUID,
        formulaIds: MutableMap<String, UUID>,
        now: Instant,
    ) {
        listOf("troupePolicy", "seasonPolicy").forEach { key ->
            setup.path(key).takeIf { !it.isMissingNode && !it.isNull }?.let { policy ->
                collectFormulaRefs(policy).forEach { ref ->
                    if (ref != "system-v1" && !formulaIds.containsKey(ref)) {
                        saveFormulaFromNode(
                            mapper.createObjectNode().put("id", ref).put("status", "PUBLISHED"),
                            troupeId,
                            formulaIds,
                            now,
                        )
                    }
                }
            }
        }
        setup.path("factorConfigRef").takeIf { !it.isMissingNode && !it.isNull }?.asText()?.let { configRef ->
            setup.path("selectedFormulaId").takeIf { !it.isMissingNode && !it.isNull }?.asText()?.let { selectedRef ->
                formulaIds[selectedRef]?.let { formulaId ->
                    val entity = drawFormulaRepository.findById(formulaId).orElseThrow()
                    entity.factorConfig = PolicyFactorConfigFixtures.factorConfigForRef(configRef)
                    drawFormulaRepository.save(entity)
                }
            }
        }
    }

    private fun ensureGlossaryFromPolicies(
        setup: JsonNode,
        troupe: TroupeEntity,
        now: Instant,
    ) {
        listOf("troupePolicy", "seasonPolicy").forEach { key ->
            setup.path(key).takeIf { !it.isMissingNode && !it.isNull }?.let { policy ->
                policy.path("categoryRules").forEach { rule ->
                    rule.path("category").takeIf { !it.isMissingNode && !it.isNull }?.asText()?.let { slug ->
                        saveCategoryIfAbsent(troupe, slug, now)
                    }
                }
            }
        }
    }

    private fun saveCategoryIfAbsent(
        troupe: TroupeEntity,
        slug: String,
        now: Instant,
    ) {
        if (!troupeCategoryRepository.existsByTroupe_IdAndSlug(troupe.id, slug)) {
            troupeCategoryRepository.save(
                TroupeCategoryEntity(
                    troupe = troupe,
                    slug = slug,
                    label = slug,
                    createdAt = now,
                ),
            )
        }
    }

    private fun collectFormulaRefs(policyNode: JsonNode): Set<String> {
        val refs = mutableSetOf<String>()
        fun fromRule(node: JsonNode) {
            node.path("allowedFormulaIds").forEach { refs.add(it.asText()) }
            if (node.has("mandatoryFormulaId")) {
                refs.add(node.path("mandatoryFormulaId").asText())
            }
        }
        fromRule(policyNode.path("defaultRule"))
        policyNode.path("categoryRules").forEach { fromRule(it) }
        return refs
    }

    private fun savePolicy(
        troupeId: UUID,
        seasonId: UUID?,
        scope: DrawPolicyScope,
        policyNode: JsonNode,
        formulaIds: Map<String, UUID>,
        troupeScopeKey: UUID?,
        seasonScopeKey: UUID?,
    ) {
        val now = Instant.now()
        val defaultRule = parseRule(policyNode.path("defaultRule"), formulaIds, troupeId)
        val categoryRules =
            policyNode.path("categoryRules").map { parseCategoryRule(it, formulaIds, troupeId) }
        drawPolicyRepository.save(
            DrawPolicyEntity(
                troupeId = troupeId,
                seasonId = seasonId,
                scope = scope,
                troupeScopeKey = troupeScopeKey,
                seasonScopeKey = seasonScopeKey,
                defaultRule = defaultRule,
                categoryRules = categoryRules,
                updatedAt = now,
            ),
        )
    }

    private fun parseRule(
        node: JsonNode,
        formulaIds: Map<String, UUID>,
        troupeId: UUID,
    ): DrawDefaultRule {
        val mode = DrawRuleMode.valueOf(node.path("mode").asText())
        return when (mode) {
            DrawRuleMode.CHOICE ->
                DrawDefaultRule(
                    mode = mode,
                    allowedFormulaIds =
                        node.path("allowedFormulaIds").map {
                            resolveFormulaRef(it.asText(), formulaIds, troupeId).toString()
                        },
                )
            DrawRuleMode.MANDATORY ->
                DrawDefaultRule(
                    mode = mode,
                    mandatoryFormulaId =
                        resolveFormulaRef(
                            node.path("mandatoryFormulaId").asText(),
                            formulaIds,
                            troupeId,
                        ).toString(),
                )
        }
    }

    private fun parseCategoryRule(
        node: JsonNode,
        formulaIds: Map<String, UUID>,
        troupeId: UUID,
    ): DrawCategoryRule {
        val category =
            node.path("category").takeIf { !it.isMissingNode && !it.isNull }?.asText()
        val mode = DrawRuleMode.valueOf(node.path("mode").asText())
        return when (mode) {
            DrawRuleMode.CHOICE ->
                DrawCategoryRule(
                    category = category,
                    mode = mode,
                    allowedFormulaIds =
                        node.path("allowedFormulaIds").map {
                            resolveFormulaRef(it.asText(), formulaIds, troupeId).toString()
                        },
                )
            DrawRuleMode.MANDATORY ->
                DrawCategoryRule(
                    category = category,
                    mode = mode,
                    mandatoryFormulaId =
                        resolveFormulaRef(
                            node.path("mandatoryFormulaId").asText(),
                            formulaIds,
                            troupeId,
                        ).toString(),
                )
        }
    }

    companion object {
        fun loadResolutionFixtures(): List<JsonNode> {
            val mapper = ObjectMapper().registerModule(kotlinModule())
            val stream =
                requireNotNull(
                    PolicyGoldenTestSupport::class.java.classLoader.getResourceAsStream(
                        "draw/golden/policies/resolution.json",
                    ),
                ) { "Missing resolution.json" }
            return mapper.readValue(stream)
        }

        fun loadPolicyValidationFixtures(): List<JsonNode> {
            val mapper = ObjectMapper().registerModule(kotlinModule())
            val stream =
                requireNotNull(
                    PolicyGoldenTestSupport::class.java.classLoader.getResourceAsStream(
                        "draw/golden/policies/validation.json",
                    ),
                ) { "Missing validation.json" }
            return mapper.readValue(stream)
        }
    }
}
