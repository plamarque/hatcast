export type DrawFactorDirection = 'MALUS' | 'BONUS' | 'NEUTRAL'

export interface DrawFactorParamSpec {
  key: string
  type: 'number' | 'enum'
  range?: { min: number; max: number; step: number }
  enumValues?: string[]
  default: number | string
  effect: string
  sliderLabel: string
  decimals: number
}

export interface DrawFactorCatalogEntry {
  factorId: string
  label: string
  direction: DrawFactorDirection
  params: DrawFactorParamSpec[] | null
  reserved?: boolean
}

/** Tunable malus/bonus criteria shown in F2 editor and F2-V donut (excludes equity_tag). */
export const MALUS_BONUS_FACTOR_ORDER = [
  'past_participation',
  'immediate_replay',
  'role_request',
] as const

export type MalusBonusFactorId = (typeof MALUS_BONUS_FACTOR_ORDER)[number]

/** Stable payload order for save (REF-V + story AC2). */
export const IMPLEMENTED_FACTOR_ORDER = [
  'equity_tag',
  ...MALUS_BONUS_FACTOR_ORDER,
] as const

const PAST_STRENGTH: DrawFactorParamSpec = {
  key: 'strength',
  type: 'number',
  range: { min: 0, max: 2, step: 0.1 },
  default: 1.0,
  effect:
    "Plus la valeur est haute, plus les participations passées pèsent sur les cotes ; `0` = pas d'effet ; `1` = comportement V1",
  sliderLabel: 'Intensité du malus',
  decimals: 1,
}

const REPLAY_MODE: DrawFactorParamSpec = {
  key: 'mode',
  type: 'enum',
  enumValues: ['EXCLUDE', 'MALUS'],
  default: 'EXCLUDE',
  effect:
    'Exclure ou pénaliser un candidat qui occupait le même rôle au spectacle précédent (même compartiment)',
  sliderLabel: 'Intensité du malus',
  decimals: 2,
}

const REPLAY_MULT: DrawFactorParamSpec = {
  key: 'malusMultiplier',
  type: 'number',
  range: { min: 0, max: 1, step: 0.05 },
  default: 0.25,
  effect: 'Si mode MALUS : multiplicateur appliqué au poids (ex. `0.25` = forte pénalité)',
  sliderLabel: 'Intensité du malus',
  decimals: 2,
}

const ROLE_BONUS: DrawFactorParamSpec = {
  key: 'bonusPerUnfulfilled',
  type: 'number',
  range: { min: 0, max: 5, step: 0.1 },
  default: 1.0,
  effect: 'Bonus ajouté par demande de rôle non satisfaite dans le passé',
  sliderLabel: 'Bonus par demande passée',
  decimals: 1,
}

const ROLE_CAP: DrawFactorParamSpec = {
  key: 'maxBonusMultiplier',
  type: 'number',
  range: { min: 1, max: 20, step: 0.5 },
  default: 10.0,
  effect: 'Plafond du multiplicateur de bonus',
  sliderLabel: 'Plafond du bonus total',
  decimals: 1,
}

export const DRAW_FACTOR_CATALOG: DrawFactorCatalogEntry[] = [
  {
    factorId: 'equity_tag',
    label: 'Compartiment par catégorie',
    direction: 'NEUTRAL',
    params: null,
  },
  {
    factorId: 'past_participation',
    label: 'Participations passées',
    direction: 'MALUS',
    params: [PAST_STRENGTH],
  },
  {
    factorId: 'immediate_replay',
    label: 'Rejouer immédiatement',
    direction: 'MALUS',
    params: [REPLAY_MODE, REPLAY_MULT],
  },
  {
    factorId: 'role_request',
    label: 'Aspirations de rôle',
    direction: 'BONUS',
    params: [ROLE_BONUS, ROLE_CAP],
  },
  {
    factorId: 'gender_parity',
    label: 'Parité genre',
    direction: 'NEUTRAL',
    params: null,
    reserved: true,
  },
  {
    factorId: 'volunteer_bonus',
    label: 'Bonus bénévole',
    direction: 'NEUTRAL',
    params: null,
    reserved: true,
  },
  {
    factorId: 'class_mix',
    label: "Mix d'expérience",
    direction: 'NEUTRAL',
    params: null,
    reserved: true,
  },
  {
    factorId: 'prestige',
    label: 'Prestige',
    direction: 'NEUTRAL',
    params: null,
    reserved: true,
  },
]

const catalogById = new Map(DRAW_FACTOR_CATALOG.map((entry) => [entry.factorId, entry]))

export function catalogEntry(factorId: string): DrawFactorCatalogEntry | undefined {
  return catalogById.get(factorId)
}

export function implementedFactors(): DrawFactorCatalogEntry[] {
  return DRAW_FACTOR_CATALOG.filter((entry) => !entry.reserved)
}

export function reservedFactors(): DrawFactorCatalogEntry[] {
  return DRAW_FACTOR_CATALOG.filter((entry) => entry.reserved === true)
}

export function malusBonusFactors(): DrawFactorCatalogEntry[] {
  return MALUS_BONUS_FACTOR_ORDER.map((id) => catalogById.get(id)!)
}

export function directionLabel(direction: DrawFactorDirection): string | null {
  switch (direction) {
    case 'MALUS':
      return 'Malus'
    case 'BONUS':
      return 'Bonus'
    default:
      return null
  }
}

export function factorLabel(factorId: string): string {
  return catalogById.get(factorId)?.label ?? factorId
}

export function paramDefault(factorId: string, key: string): number | string | undefined {
  const entry = catalogById.get(factorId)
  return entry?.params?.find((param) => param.key === key)?.default
}

export function formulaStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Brouillon'
    case 'PUBLISHED':
      return 'Publiée'
    case 'ARCHIVED':
      return 'Archivée'
    default:
      return status
  }
}
