import { describe, expect, it } from 'vitest'

import { isMemberStatsPath, shouldShowMemberNav } from './member-shell-nav-visibility'

describe('isMemberStatsPath', () => {
  it('matches member stats route only', () => {
    expect(isMemberStatsPath('/membre/patrice')).toBe(true)
    expect(isMemberStatsPath('/membre/patrice/')).toBe(false)
    expect(isMemberStatsPath('/saison/foo')).toBe(false)
    expect(isMemberStatsPath('/accueil')).toBe(false)
  })
})

describe('shouldShowMemberNav', () => {
  it('shows nav on member shell routes', () => {
    expect(shouldShowMemberNav('/accueil')).toBe(true)
    expect(shouldShowMemberNav('/agenda')).toBe(true)
    expect(shouldShowMemberNav('/compte')).toBe(true)
    expect(shouldShowMemberNav('/troupes')).toBe(true)
    expect(shouldShowMemberNav('/troupes/foo')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo/event/bar')).toBe(true)
    expect(shouldShowMemberNav('/membre/patrice')).toBe(true)
    expect(shouldShowMemberNav('/membre/patrice/')).toBe(true)
    expect(shouldShowMemberNav('/accueil?foo=1')).toBe(true)
  })

  it('hides nav on auth and admin routes', () => {
    expect(shouldShowMemberNav('/connexion')).toBe(false)
    expect(shouldShowMemberNav('/mot-de-passe-oublie')).toBe(false)
    expect(shouldShowMemberNav('/saison/foo/admin/membres')).toBe(false)
    expect(shouldShowMemberNav('/saison/foo/event/bar/admin/participants')).toBe(false)
    expect(shouldShowMemberNav('/troupes/foo/admin/membres')).toBe(false)
  })
})
