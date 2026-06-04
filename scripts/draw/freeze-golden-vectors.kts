#!/usr/bin/env kotlin

import java.util.UUID
import kotlin.random.Random

fun weightForParticipant(pastSelectionCount: Int, requiredCount: Int): Double {
    val malus = 1.0 / (1.0 + pastSelectionCount)
    return malus * requiredCount
}

data class WeightedCandidate(val id: UUID, val name: String, val weight: Double)

data class WeightedDrawResult(val selected: WeightedCandidate, val randomValue: Double, val totalWeight: Double)

fun performWeightedDraw(candidates: List<WeightedCandidate>, random: Random): WeightedDrawResult? {
    if (candidates.isEmpty()) return null
    val totalWeight = candidates.sumOf { it.weight }
    if (totalWeight <= 0.0) return null
    val randomValue = random.nextDouble() * totalWeight
    var cumulative = 0.0
    for (candidate in candidates) {
        cumulative += candidate.weight
        if (randomValue <= cumulative) {
            return WeightedDrawResult(candidate, randomValue, totalWeight)
        }
    }
    return WeightedDrawResult(candidates.last(), randomValue, totalWeight)
}

fun main() {
    println("REF-W1=${weightForParticipant(0, 5)}")
    println("REF-W2=${weightForParticipant(3, 5)}")
    println("REF-W3=${weightForParticipant(2, 2)}")

    val w1 = WeightedCandidate(UUID.randomUUID(), "A", 3.0)
    val w2 = WeightedCandidate(UUID.randomUUID(), "B", 1.0)
    val w3 = WeightedCandidate(UUID.randomUUID(), "C", 1.0)
    val d2 = performWeightedDraw(listOf(w1, w2, w3), Random(42))!!
    val idxD2 = listOf(w1, w2, w3).indexOfFirst { it.id == d2.selected.id }
    println("REF-D2 index=$idxD2 randomValue=${d2.randomValue} totalWeight=${d2.totalWeight}")

    val h1 = WeightedCandidate(UUID.randomUUID(), "Heavy", 10.0)
    val l1 = WeightedCandidate(UUID.randomUUID(), "Light", 1.0)
    val d3 = performWeightedDraw(listOf(h1, l1), Random(7))!!
    val idxD3 = listOf(h1, l1).indexOfFirst { it.id == d3.selected.id }
    println("REF-D3 index=$idxD3 randomValue=${d3.randomValue} totalWeight=${d3.totalWeight}")
}
