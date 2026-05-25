import type { StatCounts } from '../../core/seasons/season-statistics-api.service'

export type { StatCounts }

/** Re-export V1 sel/dispo formulas for tests and CSV (story 3.6). */
export function effectiveDispos(dispos: number, declines: number): number {
  return Math.max(0, dispos - declines)
}

export function statPercent(
  selections: number,
  dispos: number,
  declines: number,
): number | null {
  const effective = effectiveDispos(dispos, declines)
  if (effective <= 0 && selections <= 0) {
    return null
  }
  const denominator = Math.max(effective, selections)
  if (denominator <= 0) {
    return null
  }
  return Math.min(100, Math.round((selections / denominator) * 100))
}

export function statTooltip(
  selections: number,
  dispos: number,
  declines: number,
): string {
  if (dispos === 0) {
    return 'Aucune dispo dans cette catégorie'
  }
  if (declines === 0) {
    return `${selections} sélection${selections !== 1 ? 's' : ''} sur ${dispos} dispo${dispos !== 1 ? 's' : ''}`
  }
  return `${selections} sélection${selections !== 1 ? 's' : ''} sur ${dispos} dispos (dont ${declines} désistement${declines !== 1 ? 's' : ''})`
}

export function formatStatExportValue(
  selections: number,
  dispos: number,
  declines: number,
): string {
  if (selections === 0 && dispos === 0) {
    return ''
  }
  const pct = statPercent(selections, dispos, declines)
  if (dispos > 0) {
    return pct !== null ? `${selections}/${dispos} (${pct}%)` : `${selections}/${dispos}`
  }
  return selections > 0 ? String(selections) : ''
}

export function formatStatCell(counts: StatCounts | undefined): {
  ratio: string
  percent: string | null
  tooltip: string
  empty: boolean
} {
  if (!counts) {
    return { ratio: '—', percent: null, tooltip: 'Aucune dispo dans cette catégorie', empty: true }
  }
  const { selections, dispos, declines } = counts
  const denominator = Math.max(effectiveDispos(dispos, declines), selections)
  if (denominator <= 0 && selections <= 0) {
    return { ratio: '—', percent: null, tooltip: statTooltip(0, 0, 0), empty: true }
  }
  const pct = statPercent(selections, dispos, declines)
  return {
    ratio: `${selections}/${denominator}`,
    percent: pct !== null ? `(${pct}%)` : null,
    tooltip: statTooltip(selections, dispos, declines),
    empty: false,
  }
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  if (!y || !m) {
    return monthKey
  }
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}
