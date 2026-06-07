package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.availability.DrawGoldenFixtureLoader
import java.util.UUID

data class DrawOrchestrationFixture(
    val id: String,
    val description: String,
    val tags: List<String> = emptyList(),
    val setup: JsonNode,
    val drawSteps: List<JsonNode> = emptyList(),
    val randomSeed: Long? = null,
    val expected: JsonNode,
)

object DrawOrchestrationFixtureLoader {
    private val mapper = ObjectMapper().registerModule(kotlinModule())
    private const val RESOURCE = "draw/golden/orchestration.json"

    fun loadAll(): List<DrawOrchestrationFixture> {
        val stream =
            requireNotNull(javaClass.classLoader.getResourceAsStream(RESOURCE)) {
                "Missing orchestration golden fixture resource: $RESOURCE"
            }
        val raw: List<JsonNode> = mapper.readValue(stream)
        val fixtures =
            raw.map { node ->
                DrawOrchestrationFixture(
                    id = node.get("id").asText(),
                    description = node.get("description").asText(),
                    tags = node.path("tags").map { it.asText() },
                    setup = node.get("setup"),
                    drawSteps = node.path("drawSteps").map { it },
                    randomSeed = node.path("randomSeed").takeIf { !it.isMissingNode && !it.isNull }?.asLong(),
                    expected = node.get("expected"),
                )
            }
        val duplicateIds =
            fixtures
                .groupBy { it.id }
                .filter { (_, entries) -> entries.size > 1 }
                .keys
        require(duplicateIds.isEmpty()) {
            "Duplicate orchestration fixture IDs: ${duplicateIds.sorted().joinToString()}"
        }
        return fixtures
    }

    fun participantId(key: String): UUID = DrawGoldenFixtureLoader.participantId(key)

    fun parseRoleSlots(setup: JsonNode): Map<String, Int> {
        val node = setup.get("roleSlots")
        return node.fields().asSequence().associate { (key, value) -> key to value.asInt() }
    }

    /**
     * Opening snapshot semantics (E-04): score full role pool at draw opening with only
     * [openingCrossRoleExcluded] removed — not post-pick exclusions from the same request.
     */
    fun computeOpeningChancePercent(
        requiredCount: Int,
        candidateKeys: List<String>,
        pastByKey: Map<String, Int>,
        openingExcludedKeys: Set<String>,
        targetKey: String,
    ): Pair<Int, Int> {
        val pool =
            candidateKeys
                .filter { it !in openingExcludedKeys }
                .map { key ->
                    AvailabilityChanceCalculator.Candidate(
                        participantId = participantId(key),
                        displayName = key,
                        avatarUrl = null,
                    )
                }
        val past =
            pool.associate { candidate ->
                val key = candidateKeys.first { participantId(it) == candidate.participantId }
                candidate.participantId to (pastByKey[key] ?: 0)
            }
        val scored = AvailabilityChanceCalculator.scoreCandidates(pool, requiredCount, past)
        val targetId = participantId(targetKey)
        val row =
            scored.firstOrNull { it.participantId == targetId }
                ?: throw AssertionError("No opening score for key $targetKey")
        return row.chancePercent to pool.size
    }
}
