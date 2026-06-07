export type MemberGender = 'male' | 'female' | 'non_specified'

const MEMBER_GENDER_VALUES: ReadonlySet<MemberGender> = new Set([
  'male',
  'female',
  'non_specified',
])

/** Null, absent, or invalid API values → non_specified (default). */
/** Draw animation winner line only — not role labels. */
export function drawSelectionStatusLabel(gender?: MemberGender | unknown): string {
  switch (effectiveMemberGender(gender)) {
    case 'male':
      return 'Sélectionné'
    case 'female':
      return 'Sélectionnée'
    default:
      return 'Sélectionné·e'
  }
}

/** « pris » / « prise » — null when genre non spécifié (reformulation sans participe). */
export function drawPickPastParticipleLabel(gender?: MemberGender | unknown): string | null {
  switch (effectiveMemberGender(gender)) {
    case 'male':
      return 'pris'
    case 'female':
      return 'prise'
    default:
      return null
  }
}

export function multiPlaceChanceTooltipCopy(options: {
  viewingSelf: boolean
  gender?: MemberGender | unknown
  placesCount: number
}): string {
  const placesLabel = `${options.placesCount} place${options.placesCount > 1 ? 's' : ''}`
  const chanceLabel = options.viewingSelf ? 'ta chance' : 'sa chance'
  const participle = drawPickPastParticipleLabel(options.gender)
  if (participle) {
    return `Ce % reflète ${chanceLabel} d’être ${participle} une fois parmi les ${placesLabel}`
  }
  return `Ce % reflète ${chanceLabel} d’obtenir une place au tirage parmi les ${placesLabel}`
}

export function effectiveMemberGender(raw: unknown): MemberGender {
  if (typeof raw !== 'string' || !raw.trim()) {
    return 'non_specified'
  }
  const normalized = raw.trim().toLowerCase().replace(/-/g, '_')
  if (MEMBER_GENDER_VALUES.has(normalized as MemberGender)) {
    return normalized as MemberGender
  }
  return 'non_specified'
}

/** V1 PlayerModal parity — account self-service wording. */
export const MEMBER_GENDER_FIELD_LABEL = 'Quel genre utiliser pour me désigner ?'

export const MEMBER_GENDER_OPTIONS: ReadonlyArray<{
  value: MemberGender
  /** Short label for segmented control (mat-button-toggle). */
  toggleLabel: string
  /** Full label with V1 examples (aria-label, tooltips). */
  label: string
}> = [
  {
    value: 'female',
    toggleLabel: 'Féminin',
    label: 'Féminin (ex: une improvisatrice)',
  },
  {
    value: 'non_specified',
    toggleLabel: 'Non spéc.',
    label: 'Non spécifié (ex: un.e improvisateur.trice)',
  },
  {
    value: 'male',
    toggleLabel: 'Masculin',
    label: 'Masculin (ex: un improvisateur)',
  },
]
