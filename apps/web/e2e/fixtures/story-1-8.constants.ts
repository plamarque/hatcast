export { E2E_API_KEY } from './story-3-19.constants'

/** Minimum password length (parity signup form + Identity Platform). */
export const STORY_18_PASSWORD = 'E2eTest18!'

/** Recovery snackbar copy (story 1.8 / DW-104). */
export const STORY_18_RECOVERY_SNACKBAR =
  'Votre compte a été créé ; connectez-vous pour finaliser l’accès à HatCast.'

export function story18TestEmail(uid: string): string {
  return `${uid}@e2e.hatcast.test`
}

export function story18IdpToken(uid: string, email: string, displayName = 'E2E Story 18'): string {
  return `e2e-idp|${uid}|${email}|${displayName}`
}
