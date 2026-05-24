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
    .map((row) => ({
      participantId: row.participantId,
      chancePercent: Math.round(calculatePracticalChance(row.weight, total)),
    }))
    .sort((a, b) => b.chancePercent - a.chancePercent)
}

export function chanceColorClass(chancePercent: number): 'high' | 'medium' | 'low' {
  if (chancePercent >= 20) return 'high'
  if (chancePercent >= 10) return 'medium'
  return 'low'
}
