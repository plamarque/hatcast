import { effectiveMemberGender } from '../account/member-gender'
import type { CompositionSlot } from './composition-api.service'

export type CompositionPlayerGenderParityScore = 'bon' | 'acceptable' | 'faible'

export interface CompositionPlayerGenderParity {
  f: number
  m: number
  u: number
  ecart: number
  score: CompositionPlayerGenderParityScore
  label: string
  detailLabel: string
}

const SCORE_LABELS: Record<CompositionPlayerGenderParityScore, string> = {
  bon: 'Mixité équilibrée',
  acceptable: 'Mixité acceptable',
  faible: 'Mixité faible',
}

/** Player-slot gender mix score for organizer équipe tab (story 6.21). */
export function computeCompositionPlayerGenderParity(
  slots: readonly CompositionSlot[],
): CompositionPlayerGenderParity | null {
  const filled = slots.filter(
    (slot) => slot.roleKey === 'player' && slot.participantId != null,
  )
  if (filled.length === 0) {
    return null
  }

  let u = 0
  let f = 0
  let m = 0

  for (const slot of filled) {
    const gender = effectiveMemberGender(slot.participantGender)
    if (gender === 'non_specified') {
      u++
    } else if (gender === 'female') {
      f++
    } else if (gender === 'male') {
      m++
    }
  }

  if (u > 0) {
    return null
  }

  const n = f + m
  if (n < 2) {
    return null
  }

  const ecart = Math.abs(f - m)
  let score: CompositionPlayerGenderParityScore
  if (ecart === 0) {
    score = 'bon'
  } else if (ecart === 1) {
    score = 'acceptable'
  } else {
    score = 'faible'
  }

  return {
    f,
    m,
    u,
    ecart,
    score,
    label: SCORE_LABELS[score],
    detailLabel: `${f} F · ${m} H`,
  }
}
