import { afterEach, describe, expect, it } from 'vitest'

import {
  clearPendingPostLoginRedirect,
  getPendingPostLoginRedirect,
  isValidInternalRedirectPath,
  rememberPendingPostLoginRedirect,
} from './post-login-redirect-storage'

describe('postLoginRedirectStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing stored', () => {
    expect(getPendingPostLoginRedirect()).toBeNull()
  })

  it('stores and reads a valid internal path', () => {
    rememberPendingPostLoginRedirect('/saison/festibask/event/abc?showConfirm=true')

    expect(getPendingPostLoginRedirect()).toBe('/saison/festibask/event/abc?showConfirm=true')
    expect(localStorage.getItem('hatcast.postLoginRedirect')).toBe(
      '/saison/festibask/event/abc?showConfirm=true',
    )
  })

  it('clears stored redirect', () => {
    rememberPendingPostLoginRedirect('/agenda')
    clearPendingPostLoginRedirect()

    expect(getPendingPostLoginRedirect()).toBeNull()
  })

  it('ignores invalid paths on store', () => {
    rememberPendingPostLoginRedirect('https://evil.example/phish')
    rememberPendingPostLoginRedirect('//evil.example/phish')
    rememberPendingPostLoginRedirect('/connexion')
    rememberPendingPostLoginRedirect('/unknown-route')

    expect(getPendingPostLoginRedirect()).toBeNull()
  })

  it('accepts routable member routes', () => {
    expect(isValidInternalRedirectPath('/agenda')).toBe(true)
    expect(isValidInternalRedirectPath('/agenda?from=mail#top')).toBe(true)
    expect(isValidInternalRedirectPath('/saison/festibask/event/e1')).toBe(true)
    expect(isValidInternalRedirectPath('/saison/festibask/admin/membres')).toBe(true)
    expect(isValidInternalRedirectPath('/saison/festibask/admin/participants')).toBe(true)
    expect(isValidInternalRedirectPath('/compte')).toBe(true)
    expect(isValidInternalRedirectPath('/seasons')).toBe(true)
    expect(isValidInternalRedirectPath('/troupes')).toBe(true)
    expect(isValidInternalRedirectPath('/troupes/la-malice')).toBe(true)
    expect(isValidInternalRedirectPath('/troupes/la-malice/admin/membres')).toBe(true)
    expect(isValidInternalRedirectPath('/troupe/admin/membres')).toBe(true)
    expect(isValidInternalRedirectPath('/troupe/demo/admin/membres')).toBe(true)
  })

  it('rejects open-redirect and login-loop paths', () => {
    expect(isValidInternalRedirectPath('javascript:alert(1)')).toBe(false)
    expect(isValidInternalRedirectPath('http://evil.example/')).toBe(false)
    expect(isValidInternalRedirectPath('https://evil.example/')).toBe(false)
    expect(isValidInternalRedirectPath('//evil.example/')).toBe(false)
    expect(isValidInternalRedirectPath('/connexion')).toBe(false)
    expect(isValidInternalRedirectPath('/connexion?returnUrl=%2Fagenda')).toBe(false)
  })

  it('rejects same-origin but non-routable paths', () => {
    expect(isValidInternalRedirectPath('/unknown-route')).toBe(false)
    expect(isValidInternalRedirectPath('/agenda/extra')).toBe(false)
    expect(isValidInternalRedirectPath('/troupe/demo')).toBe(false)
    expect(isValidInternalRedirectPath('/saison/festibask/unknown')).toBe(false)
    expect(isValidInternalRedirectPath('/saison/festibask/event')).toBe(false)
    expect(isValidInternalRedirectPath('/saison//event/e1')).toBe(false)
    expect(isValidInternalRedirectPath('/ligue/festibask')).toBe(false)
    expect(isValidInternalRedirectPath('/ligue/festibask/event/e1')).toBe(false)
  })
})
