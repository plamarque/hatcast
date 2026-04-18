import { describe, it, expect } from 'vitest'
import {
  mapGoogleSignInError,
  googleSignInGenericCleanError,
} from '../../src/utils/googleSignInErrors.js'

describe('googleSignInErrors', () => {
  it('mapGoogleSignInError: popup fermée', () => {
    const r = mapGoogleSignInError({ code: 'auth/popup-closed-by-user' })
    expect(r.code).toBe('AUTH_POPUP_CANCELLED')
    expect(r.message).toContain('annulée')
  })

  it('mapGoogleSignInError: popup bloquée', () => {
    const r = mapGoogleSignInError({ code: 'auth/popup-blocked' })
    expect(r.code).toBe('AUTH_POPUP_BLOCKED')
    expect(r.message).toContain('Popup bloquée')
  })

  it('mapGoogleSignInError: requête popup annulée (conflit)', () => {
    const r = mapGoogleSignInError({ code: 'auth/cancelled-popup-request' })
    expect(r.code).toBe('AUTH_POPUP_CONFLICT')
    expect(r.message).toContain('interrompue')
  })

  it('mapGoogleSignInError: compte existant autre méthode', () => {
    const r = mapGoogleSignInError({ code: 'auth/account-exists-with-different-credential' })
    expect(r.code).toBe('AUTH_ACCOUNT_EXISTS')
  })

  it('mapGoogleSignInError: inconnu → null', () => {
    expect(mapGoogleSignInError({ code: 'auth/unknown' })).toBeNull()
    expect(mapGoogleSignInError({})).toBeNull()
  })

  it('googleSignInGenericCleanError', () => {
    const g = googleSignInGenericCleanError()
    expect(g.code).toBe('AUTH_GOOGLE_ERROR')
    expect(g.message.length).toBeGreaterThan(0)
  })
})
