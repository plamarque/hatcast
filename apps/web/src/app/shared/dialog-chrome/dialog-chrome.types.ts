/** Libellés dismiss autorisés — UX-DR23 / ux-design-dialog-patterns.md */
export const HATCAST_DISMISS_LABELS = {
  annuler: 'Annuler',
  fermer: 'Fermer',
  plus_tard: 'Plus tard',
} as const

export type HatcastDismissKey = keyof typeof HATCAST_DISMISS_LABELS

/** sheet = bottom sheet mobile (drag + ✕) ; dialog = MatDialog desktop */
export type HatcastPickerSurface = 'sheet' | 'dialog'
