import {
  IMPLEMENTED_FACTOR_ORDER,
  MALUS_BONUS_FACTOR_ORDER,
  paramDefault,
  type MalusBonusFactorId,
} from './draw-factor-catalog'
import { replayDisplayFromParams, replayParamsFromDisplay } from './replay-intensity-map'

export type DrawFormulaStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface DrawFactorConfigEntry {
  factorId: string
  enabled: boolean
  params?: Record<string, number | string>
}

export interface DrawFormula {
  id: string
  troupeId: string
  name: string
  description?: string | null
  status: DrawFormulaStatus
  factorConfig: DrawFactorConfigEntry[]
  version: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDrawFormulaRequest {
  name: string
  description?: string | null
  status?: 'DRAFT' | 'PUBLISHED'
  factorConfig?: DrawFactorConfigEntry[]
}

export interface UpdateDrawFormulaRequest {
  name?: string
  description?: string | null
  status?: DrawFormulaStatus
  factorConfig?: DrawFactorConfigEntry[]
}

export interface DrawFormulaEditorFactorState {
  enabled: boolean
  strength: number
  replayDisplayIntensity: number
  bonusPerUnfulfilled: number
  maxBonusMultiplier: number
}

export interface DrawFormulaEditorState {
  past_participation: DrawFormulaEditorFactorState
  immediate_replay: DrawFormulaEditorFactorState
  role_request: DrawFormulaEditorFactorState
}

export function defaultEditorState(): DrawFormulaEditorState {
  return {
    past_participation: {
      enabled: true,
      strength: paramDefault('past_participation', 'strength') as number,
      replayDisplayIntensity: 1.0,
      bonusPerUnfulfilled: 1.0,
      maxBonusMultiplier: 10.0,
    },
    immediate_replay: {
      enabled: false,
      strength: 1.0,
      replayDisplayIntensity: 1.0,
      bonusPerUnfulfilled: 1.0,
      maxBonusMultiplier: 10.0,
    },
    role_request: {
      enabled: false,
      strength: 1.0,
      replayDisplayIntensity: 1.0,
      bonusPerUnfulfilled: paramDefault('role_request', 'bonusPerUnfulfilled') as number,
      maxBonusMultiplier: paramDefault('role_request', 'maxBonusMultiplier') as number,
    },
  }
}

export function editorStateFromFactorConfig(
  factorConfig: DrawFactorConfigEntry[] | undefined,
): DrawFormulaEditorState {
  const state = defaultEditorState()
  if (!factorConfig?.length) {
    return state
  }

  for (const entry of factorConfig) {
    if (!MALUS_BONUS_FACTOR_ORDER.includes(entry.factorId as MalusBonusFactorId)) {
      continue
    }
    const slot = state[entry.factorId as MalusBonusFactorId]
    slot.enabled = entry.enabled
    const params = entry.params ?? {}

    if (entry.factorId === 'past_participation' && typeof params['strength'] === 'number') {
      slot.strength = params['strength']
    }

    if (entry.factorId === 'immediate_replay') {
      slot.replayDisplayIntensity = replayDisplayFromParams(
        typeof params['mode'] === 'string' ? params['mode'] : undefined,
        typeof params['malusMultiplier'] === 'number' ? params['malusMultiplier'] : undefined,
      )
    }

    if (entry.factorId === 'role_request') {
      if (typeof params['bonusPerUnfulfilled'] === 'number') {
        slot.bonusPerUnfulfilled = params['bonusPerUnfulfilled']
      }
      if (typeof params['maxBonusMultiplier'] === 'number') {
        slot.maxBonusMultiplier = params['maxBonusMultiplier']
      }
    }
  }

  return state
}

function pastParticipationParams(strength: number): Record<string, number> | undefined {
  const defaultStrength = paramDefault('past_participation', 'strength') as number
  if (strength === defaultStrength) {
    return undefined
  }
  return { strength }
}

function immediateReplayParams(displayIntensity: number): Record<string, number | string> | undefined {
  if (displayIntensity >= 1.0) {
    return undefined
  }
  const mapped = replayParamsFromDisplay(displayIntensity)
  return {
    mode: 'MALUS',
    malusMultiplier: mapped.malusMultiplier ?? 0,
  }
}

function roleRequestParams(
  bonusPerUnfulfilled: number,
  maxBonusMultiplier: number,
): Record<string, number> | undefined {
  const defaultBonus = paramDefault('role_request', 'bonusPerUnfulfilled') as number
  const defaultCap = paramDefault('role_request', 'maxBonusMultiplier') as number
  const params: Record<string, number> = {}
  if (bonusPerUnfulfilled !== defaultBonus) {
    params['bonusPerUnfulfilled'] = bonusPerUnfulfilled
  }
  if (maxBonusMultiplier !== defaultCap) {
    params['maxBonusMultiplier'] = maxBonusMultiplier
  }
  return Object.keys(params).length ? params : undefined
}

export function buildFactorConfig(state: DrawFormulaEditorState): DrawFactorConfigEntry[] {
  return IMPLEMENTED_FACTOR_ORDER.map((factorId) => {
    if (factorId === 'equity_tag') {
      return { factorId, enabled: true }
    }

    const slot = state[factorId as MalusBonusFactorId]
    if (!slot.enabled) {
      return { factorId, enabled: false }
    }

    let params: Record<string, number | string> | undefined
    if (factorId === 'past_participation') {
      params = pastParticipationParams(slot.strength)
    } else if (factorId === 'immediate_replay') {
      params = immediateReplayParams(slot.replayDisplayIntensity)
    } else if (factorId === 'role_request') {
      params = roleRequestParams(slot.bonusPerUnfulfilled, slot.maxBonusMultiplier)
    }

    return params ? { factorId, enabled: true, params } : { factorId, enabled: true }
  })
}

export function enabledMalusBonusSummary(factorConfig: DrawFactorConfigEntry[]): string {
  return factorConfig
    .filter(
      (entry) =>
        entry.enabled &&
        MALUS_BONUS_FACTOR_ORDER.includes(entry.factorId as MalusBonusFactorId),
    )
    .map((entry) => {
      switch (entry.factorId) {
        case 'past_participation':
          return 'Participations passées'
        case 'immediate_replay':
          return 'Rejouer immédiatement'
        case 'role_request':
          return 'Aspirations de rôle'
        default:
          return entry.factorId
      }
    })
    .join(' · ')
}

/** Distinct segment colors per criterion (mockup FACTOR_COLORS — not shared malus/error-container). */
export const PROFILE_CHART_COLORS: Record<MalusBonusFactorId, string> = {
  past_participation: 'var(--mat-sys-error-container)',
  immediate_replay:
    'color-mix(in srgb, var(--mat-sys-error) 45%, var(--mat-sys-error-container))',
  role_request: 'var(--mat-sys-tertiary-container)',
}

export function profileChartColor(factorId: MalusBonusFactorId, enabled: boolean): string {
  const base = PROFILE_CHART_COLORS[factorId]
  if (enabled) {
    return base
  }
  return `color-mix(in srgb, ${base} 35%, var(--mat-sys-on-surface))`
}

export interface ProfileSegment {
  factorId: MalusBonusFactorId
  label: string
  enabled: boolean
  score: number
  percent: number
}

export function computeProfileSegments(state: DrawFormulaEditorState): ProfileSegment[] {
  const entries = MALUS_BONUS_FACTOR_ORDER.map((factorId) => {
    const slot = state[factorId]
    let score = 0
    if (slot.enabled) {
      if (factorId === 'past_participation') {
        score = slot.strength / 2
      } else if (factorId === 'immediate_replay') {
        score = slot.replayDisplayIntensity
      } else if (factorId === 'role_request') {
        score = slot.bonusPerUnfulfilled / 5
      }
    }
    return {
      factorId,
      score,
      enabled: slot.enabled,
      label:
        factorId === 'past_participation'
          ? 'Participations'
          : factorId === 'immediate_replay'
            ? 'Rejouer'
            : 'Aspirations',
    }
  })

  const enabledEntries = entries.filter((entry) => entry.enabled)
  const activeTotal = enabledEntries.reduce((sum, entry) => sum + entry.score, 0)
  let allocated = 0

  return entries.map((entry) => {
    let percent = 0
    if (entry.enabled && activeTotal > 0) {
      const enabledIndex = enabledEntries.findIndex(
        (candidate) => candidate.factorId === entry.factorId,
      )
      if (enabledIndex === enabledEntries.length - 1) {
        percent = 100 - allocated
      } else {
        percent = Math.round((entry.score / activeTotal) * 100)
        allocated += percent
      }
    }
    return {
      factorId: entry.factorId,
      label: entry.label,
      enabled: entry.enabled,
      score: entry.score,
      percent,
    }
  })
}

export function activeMalusBonusCount(state: DrawFormulaEditorState): number {
  return MALUS_BONUS_FACTOR_ORDER.filter((factorId) => state[factorId].enabled).length
}

export function hasEnabledMalusBonusCriterion(state: DrawFormulaEditorState): boolean {
  return activeMalusBonusCount(state) > 0
}

export function mapApiErrorToField(message: string): {
  field?: 'past_participation' | 'immediate_replay' | 'role_request'
  paramKey?: string
} {
  const lower = message.toLowerCase()
  if (lower.includes('past_participation')) {
    return { field: 'past_participation', paramKey: 'past_participation_strength' }
  }
  if (
    lower.includes('immediate_replay') ||
    lower.includes('malusmultiplier') ||
    lower.includes('mode=m')
  ) {
    return { field: 'immediate_replay', paramKey: 'replayDisplayIntensity' }
  }
  if (
    lower.includes('role_request') ||
    lower.includes('bonusperunfulfilled') ||
    lower.includes('maxbonusmultiplier')
  ) {
    return { field: 'role_request', paramKey: 'role_request' }
  }
  if (
    lower.includes('strength') &&
    !lower.includes('immediate_replay') &&
    !lower.includes('role_request')
  ) {
    return { field: 'past_participation', paramKey: 'past_participation_strength' }
  }
  return {}
}
