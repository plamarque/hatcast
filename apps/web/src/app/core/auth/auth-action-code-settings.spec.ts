import { describe, expect, it, vi } from 'vitest'

import {
  passwordResetEmailSettings,
  readFirebaseActionLinkParams,
  verifyBeforeUpdateEmailSettings,
} from './auth-action-code-settings'

describe('auth-action-code-settings', () => {
  it('passwordResetEmailSettings uses handleCodeInApp true', () => {
    vi.stubGlobal('location', { ...globalThis.location, origin: 'https://localhost:4200' })
    const settings = passwordResetEmailSettings()
    expect(settings.handleCodeInApp).toBe(true)
    expect(settings.url).toBe('https://localhost:4200/reinitialiser-mot-de-passe')
    vi.unstubAllGlobals()
  })

  it('verifyBeforeUpdateEmailSettings uses handleCodeInApp true', () => {
    vi.stubGlobal('location', { ...globalThis.location, origin: 'https://localhost:4200' })
    const settings = verifyBeforeUpdateEmailSettings()
    expect(settings.handleCodeInApp).toBe(true)
    expect(settings.url).toBe('https://localhost:4200/compte/verification-email')
    vi.unstubAllGlobals()
  })

  it('readFirebaseActionLinkParams reads query params', () => {
    const params = readFirebaseActionLinkParams(
      'https://example.com/compte/verification-email?mode=verifyAndChangeEmail&oobCode=abc123',
    )
    expect(params.mode).toBe('verifyAndChangeEmail')
    expect(params.oobCode).toBe('abc123')
  })

  it('readFirebaseActionLinkParams reads hash params', () => {
    const params = readFirebaseActionLinkParams(
      'https://example.com/compte/verification-email#mode=verifyAndChangeEmail&oobCode=hash456',
    )
    expect(params.mode).toBe('verifyAndChangeEmail')
    expect(params.oobCode).toBe('hash456')
  })
})
