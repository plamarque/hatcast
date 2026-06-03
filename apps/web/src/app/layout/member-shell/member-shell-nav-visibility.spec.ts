import { describe, expect, it } from 'vitest'

import { isMemberStatsPath, isAccountPath, shouldShowMemberNav } from './member-shell-nav-visibility'

describe('isAccountPath', () => {
  it('matches compte root and child tab routes', () => {
    expect(isAccountPath('/compte')).toBe(true)
    expect(isAccountPath('/compte/preferences')).toBe(true)
    expect(isAccountPath('/compte/notifications')).toBe(true)
    expect(isAccountPath('/compte/securite')).toBe(true)
    expect(isAccountPath('/compte/a-propos')).toBe(true)
    expect(isAccountPath('/agenda')).toBe(false)
  })
})

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
    expect(shouldShowMemberNav('/compte/notifications')).toBe(true)
    expect(shouldShowMemberNav('/compte/securite')).toBe(true)
    expect(shouldShowMemberNav('/troupes')).toBe(true)
    expect(shouldShowMemberNav('/troupes/foo')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo/event/bar')).toBe(true)
    expect(shouldShowMemberNav('/membre/patrice')).toBe(true)
    expect(shouldShowMemberNav('/membre/patrice/')).toBe(true)
    expect(shouldShowMemberNav('/accueil?foo=1')).toBe(true)
  })

  it('shows nav on admin routes', () => {
    expect(shouldShowMemberNav('/saison/foo/admin/membres')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo/admin/participants')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo/admin/audit')).toBe(true)
    expect(shouldShowMemberNav('/saison/foo/event/bar/admin/participants')).toBe(true)
    expect(shouldShowMemberNav('/troupes/foo/admin/membres')).toBe(true)
    expect(shouldShowMemberNav('/troupes/foo/admin/audit')).toBe(true)
    expect(shouldShowMemberNav('/troupe/admin/membres')).toBe(true)
  })

  it('shows nav on canonical saison routes with troupe slug', () => {
    expect(shouldShowMemberNav('/saison/demo/saison-2026-2027')).toBe(true)
    expect(shouldShowMemberNav('/saison/demo/saison-2026-2027?view=agenda')).toBe(true)
    expect(
      shouldShowMemberNav('/saison/demo/saison-2026-2027/event/demo-cabaret-juin'),
    ).toBe(true)
    expect(
      shouldShowMemberNav('/saison/demo/saison-2026-2027/event/demo-cabaret-juin?tab=equipe'),
    ).toBe(true)
    expect(shouldShowMemberNav('/saison/la-malice/saison-2026-2027/admin/participants')).toBe(
      true,
    )
    expect(shouldShowMemberNav('/saison/demo/saison-2026-2027/admin/participants')).toBe(true)
  })

  it('hides nav on auth routes', () => {
    expect(shouldShowMemberNav('/connexion')).toBe(false)
    expect(shouldShowMemberNav('/mot-de-passe-oublie')).toBe(false)
  })
})
