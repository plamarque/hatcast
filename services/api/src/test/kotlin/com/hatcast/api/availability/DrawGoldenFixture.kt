package com.hatcast.api.availability

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import java.util.UUID

data class DrawGoldenFixture(
    val id: String,
    val description: String,
    val function: String,
    val input: JsonNode,
    val expected: JsonNode,
    val tolerancePercent: Int = 0,
)

object DrawGoldenFixtureLoader {
    private val mapper = ObjectMapper().registerModule(kotlinModule())

    private val fixtureFiles =
        listOf(
            "draw/golden/weights.json",
            "draw/golden/probabilities.json",
            "draw/golden/draws.json",
            "draw/golden/edges.json",
        )

    fun loadAll(): List<DrawGoldenFixture> {
        val fixtures =
            fixtureFiles.flatMap { path ->
                val stream =
                    requireNotNull(javaClass.classLoader.getResourceAsStream(path)) {
                        "Missing golden fixture resource: $path"
                    }
                mapper.readValue<List<DrawGoldenFixture>>(stream)
            }
        val duplicateIds =
            fixtures
                .groupBy { it.id }
                .filter { (_, entries) -> entries.size > 1 }
                .keys
        require(duplicateIds.isEmpty()) {
            "Duplicate golden fixture IDs: ${duplicateIds.sorted().joinToString()}"
        }
        return fixtures
    }

    fun participantId(key: String): UUID = UUID.fromString("00000000-0000-4000-8000-${key.hashCode().toUInt().toString(16).padStart(12, '0')}")

    fun parseCandidates(input: JsonNode): List<AvailabilityChanceCalculator.Candidate> {
        val nodes = input.get("candidates") ?: return emptyList()
        return nodes.map { node ->
            AvailabilityChanceCalculator.Candidate(
                participantId = participantId(node.get("key").asText()),
                displayName = node.get("displayName").asText(),
                avatarUrl = null,
            )
        }
    }

    fun parseWeightedCandidates(input: JsonNode): List<AvailabilityChanceCalculator.WeightedCandidate> {
        val nodes = input.get("candidates") ?: return emptyList()
        return nodes.map { node ->
            AvailabilityChanceCalculator.WeightedCandidate(
                participantId = participantId(node.get("key").asText()),
                displayName = node.get("displayName").asText(),
                weight = node.get("weight").asDouble(),
                pastSelectionCount = node.path("pastSelectionCount").asInt(0),
            )
        }
    }

    fun parsePastMap(input: JsonNode): Map<UUID, Int> {
        val pastNode = input.get("pastSelectionCountByParticipant") ?: return emptyMap()
        return pastNode.fields().asSequence().associate { (key, value) ->
            participantId(key) to value.asInt()
        }
    }
}
