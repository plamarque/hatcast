package com.hatcast.api.availability

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

/** The same synthetic fixtures are checked by scripts/v2/role-chance-v1-parity.test.mjs. */
class RoleChanceV1ParityTest {
    @Test
    fun `Kotlin V1 matches replay fixtures for varied pools`() {
        val stream = requireNotNull(javaClass.getResourceAsStream("/draw/role-chance-v1-parity.json"))
        val cases = stream.use { jacksonObjectMapper().readTree(it) }
        cases.forEachIndexed { caseIndex, fixture ->
            val input = fixture["candidates"]
            val candidates = input.mapIndexed { i, p ->
                AvailabilityChanceCalculator.Candidate(UUID.nameUUIDFromBytes("$caseIndex:$i".toByteArray()), p["name"].asText(), null)
            }
            val past = candidates.mapIndexed { i, c -> c.participantId to input[i]["pastSelectionCount"].asInt() }.toMap()
            val result = AvailabilityChanceCalculator.scoreCandidates(candidates, fixture["places"].asInt(), past).associateBy { it.participantId }
            candidates.forEachIndexed { i, c ->
                assertEquals(input[i]["expected"].asInt(), result.getValue(c.participantId).chancePercent, "case $caseIndex candidate $i")
            }
        }
    }
}
