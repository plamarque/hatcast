export type MemberGender = 'male' | 'female' | 'non_specified'

/** V1 PlayerModal parity — account self-service wording. */
export const MEMBER_GENDER_FIELD_LABEL = 'Quel genre utiliser pour me désigner ?'

export const MEMBER_GENDER_OPTIONS: ReadonlyArray<{
  value: MemberGender
  label: string
}> = [
  { value: 'female', label: 'Féminin (ex: une improvisatrice)' },
  { value: 'male', label: 'Masculin (ex: un improvisateur)' },
  { value: 'non_specified', label: 'Non spécifié (ex: un.e improvisateur.trice)' },
]
