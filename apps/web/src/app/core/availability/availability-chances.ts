import type { AvailabilityStatus } from './availability-status'

/** Mirrors server-side candidate filter for role grids (FR19). */
export function isCandidateForRole(
  status: AvailabilityStatus,
  roleKeys: string[],
  roleKey: string,
): boolean {
  return status === 'available' && (roleKeys.length === 0 || roleKeys.includes(roleKey))
}

export function calculateMalus(pastSelectionCount: number): number {
  return 1 / (1 + pastSelectionCount)
}

export function calculateWeightedChances(malus: number, requiredCount: number): number {
  return malus * requiredCount
}

export function calculatePracticalChance(weightedChances: number, totalWeight: number): number {
  if (totalWeight === 0) return 0
  return (weightedChances / totalWeight) * 100
}

export interface WeightedChanceCandidate {
  participantId: string
  weight: number
}

/**
 * Probability of being selected in at least one of [places] weighted draws without replacement
 * (port of V1 calculateExactSelectionProbability).
 */
export function exactSelectionProbability(
  places: number,
  candidates: WeightedChanceCandidate[],
  targetIndex: number,
): number {
  if (places === 0 || candidates.length === 0 || targetIndex < 0 || targetIndex >= candidates.length) {
    return 0
  }
  if (places >= candidates.length) {
    return 1
  }

  const targetWeight = candidates[targetIndex].weight
  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight === 0) {
    return 0
  }

  if (places === 1) {
    return targetWeight / totalWeight
  }

  const allWeightsEqual = candidates.every((c) => Math.abs(c.weight - targetWeight) < 0.0001)
  if (allWeightsEqual) {
    return places / candidates.length
  }

  let probNotSelected = 1
  let remainingCandidates = [...candidates]
  let remainingTotalWeight = totalWeight
  const targetParticipantId = candidates[targetIndex].participantId

  for (let tirage = 1; tirage <= places; tirage++) {
    if (remainingCandidates.length <= 1) {
      break
    }

    const probNotSelectedThisTirage = 1 - targetWeight / remainingTotalWeight
    probNotSelected *= probNotSelectedThisTirage

    const otherCandidates = remainingCandidates.filter((c) => c.participantId !== targetParticipantId)
    const otherTotalWeight = remainingTotalWeight - targetWeight

    let expectedWeightRemoved = 0
    if (otherCandidates.length > 0 && otherTotalWeight > 0) {
      for (const candidate of otherCandidates) {
        expectedWeightRemoved += (candidate.weight / remainingTotalWeight) * candidate.weight
      }
    } else {
      expectedWeightRemoved = otherTotalWeight / Math.max(1, otherCandidates.length)
    }

    remainingTotalWeight -= expectedWeightRemoved
    if (remainingCandidates.length > 1 && otherCandidates.length > 0) {
      let closestCandidate = otherCandidates[0]
      let minDiff = Math.abs(closestCandidate.weight - expectedWeightRemoved)
      for (const candidate of otherCandidates) {
        const diff = Math.abs(candidate.weight - expectedWeightRemoved)
        if (diff < minDiff) {
          minDiff = diff
          closestCandidate = candidate
        }
      }
      remainingCandidates = remainingCandidates.filter(
        (c) => c.participantId !== closestCandidate.participantId,
      )
    }
  }

  return Math.min(1, Math.max(0, 1 - probNotSelected))
}

export interface ChanceCandidate {
  participantId: string
  pastSelectionCount?: number
}

export interface ScoredChance {
  participantId: string
  chancePercent: number
}

/** Port of V1 chancesService — used for unit tests and optional client-side previews. */
export function scoreCandidates(
  candidates: ChanceCandidate[],
  requiredCount: number,
): ScoredChance[] {
  if (candidates.length === 0) return []
  const weights = candidates.map((c) => {
    const past = c.pastSelectionCount ?? 0
    const malus = calculateMalus(past)
    return {
      participantId: c.participantId,
      weight: calculateWeightedChances(malus, requiredCount),
    }
  })
  const total = weights.reduce((sum, row) => sum + row.weight, 0)
  if (total === 0) {
    return candidates.map((c) => ({ participantId: c.participantId, chancePercent: 0 }))
  }
  return weights
    .map((row, index) => ({
      participantId: row.participantId,
      chancePercent: Math.round(exactSelectionProbability(requiredCount, weights, index) * 100),
    }))
    .sort((a, b) => b.chancePercent - a.chancePercent)
}

export function chanceColorClass(chancePercent: number): 'high' | 'medium' | 'low' {
  if (chancePercent >= 20) return 'high'
  if (chancePercent >= 10) return 'medium'
  return 'low'
}
