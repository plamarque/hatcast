import { environment } from '../../../environments/environment'

const SEED_EMAIL_DOMAIN = '@seed.improbots.test'
export const DEV_SEED_IDP_PREFIX = 'dev-seed-idp|'

/** Local API recette (ng serve dev ou build prod servi sur localhost / Tailscale dev). */
export function isLocalDevRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.ts.net')
}

export function isDevSeedImprobotsEmail(email: string): boolean {
  return (
    (isLocalDevRuntime() || !environment.production) &&
    email.trim().toLowerCase().endsWith(SEED_EMAIL_DOMAIN)
  )
}

export function buildDevSeedIdpToken(email: string, password: string): string {
  return `${DEV_SEED_IDP_PREFIX}${email.trim().toLowerCase()}|${password}`
}
