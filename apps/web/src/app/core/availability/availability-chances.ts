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

/** Pool segment tier — 4 intuitive bands for at-a-glance reading. */
export type ChancePoolTier = 'green' | 'yellow' | 'orange' | 'red'

export function chancePoolTier(chancePercent: number): ChancePoolTier {
  if (chancePercent >= 75) return 'green'
  if (chancePercent >= 50) return 'yellow'
  if (chancePercent >= 25) return 'orange'
  return 'red'
}

/** 5 % buckets across 0–100 for distinct muted tints within a tier. */
export function chancePoolColorStep(chancePercent: number): number {
  const clamped = Math.min(100, Math.max(0, chancePercent))
  return Math.min(20, Math.floor(clamped / 5))
}

const CHANCE_POOL_TIER_STEPS: Record<ChancePoolTier, { min: number; max: number }> = {
  green: { min: 15, max: 20 },
  yellow: { min: 10, max: 14 },
  orange: { min: 5, max: 9 },
  red: { min: 0, max: 4 },
}

/** Per-tier anchor: separated hues, yellow clearly golden vs warm orange. */
const CHANCE_POOL_TIER_BASE: Record<
  ChancePoolTier,
  { hue: number; sat: number; light: number; lightStep: number }
> = {
  green: { hue: 156, sat: 38, light: 37, lightStep: 4 },
  yellow: { hue: 54, sat: 46, light: 42, lightStep: 3 },
  orange: { hue: 22, sat: 44, light: 38, lightStep: 3 },
  red: { hue: 5, sat: 42, light: 35, lightStep: 3 },
}

/** Pool bar fill — tier hue + subtle 5 % step (lighter when higher in band). */
export function chancePoolSegmentBackground(chancePercent: number): string {
  const tier = chancePoolTier(chancePercent)
  const step = chancePoolColorStep(chancePercent)
  const { min, max } = CHANCE_POOL_TIER_STEPS[tier]
  const t = max > min ? (step - min) / (max - min) : 0
  const base = CHANCE_POOL_TIER_BASE[tier]
  const hue = base.hue
  const sat = base.sat + t * 3
  const light = base.light + t * base.lightStep
  const sat2 = sat - 3
  const light2 = light - 4
  return `linear-gradient(160deg, hsl(${hue} ${sat}% ${light}%), hsl(${hue} ${sat2}% ${light2}%))`
}

/** Pool bar fill — delegates to {@link chancePoolSegmentBackground}. */
export function chanceSpectrumSegmentBackground(chancePercent: number): string {
  return chancePoolSegmentBackground(chancePercent)
}
