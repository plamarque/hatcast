export type CompositionLifecycle =
  | 'preparing'
  | 'draftComposition'
  | 'awaitingConfirmations'
  | 'gapsToFill'
  | 'complete'

export type TeamStatusBadgeKey = 'collecting' | 'preparing' | 'confirmed'

export interface TeamStatusBadge {
  key: TeamStatusBadgeKey
  label: string
  tone: TeamStatusBadgeKey
  shortLabel: string
}

export function teamStatusBadgeModifier(tone: TeamStatusBadgeKey): string {
  return `--${tone}`
}

export function teamStatusBadgeShortLabel(badge: TeamStatusBadge | undefined): string {
  return badge?.shortLabel ?? 'Collecte'
}

export function teamStatusBadgeAriaLabel(badge: TeamStatusBadge | undefined): string {
  return badge?.label ?? 'Collecte des dispos'
}
