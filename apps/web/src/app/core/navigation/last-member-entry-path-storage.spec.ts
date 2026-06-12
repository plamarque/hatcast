import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearLastMemberEntryPath,
  getLastMemberEntryPath,
  isPersistableMemberEntryPath,
  memberStatsSlugFromMemberEntryPath,
  rememberLastMemberEntryPath,
  saisonMemberEntryPath,
  seasonSlugFromMemberEntryPath,
} from './last-member-entry-path-storage'

describe('lastMemberEntryPathStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('stores and reads troupe hub path', () => {
    rememberLastMemberEntryPath('/troupes/improbots')

    expect(getLastMemberEntryPath()).toBe('/troupes/improbots')
  })

  it('returns null when nothing stored', () => {
    expect(getLastMemberEntryPath()).toBeNull()
  })

  it('stores and reads persistable paths', () => {
    rememberLastMemberEntryPath('/accueil')

    expect(getLastMemberEntryPath()).toBe('/accueil')
    expect(localStorage.getItem('lastMemberEntryPath')).toBe('/accueil')
  })

  it('clears stored path', () => {
    rememberLastMemberEntryPath('/agenda')
    clearLastMemberEntryPath()

    expect(getLastMemberEntryPath()).toBeNull()
  })

  it('ignores non-persistable paths on write', () => {
    rememberLastMemberEntryPath('/connexion')
    rememberLastMemberEntryPath('/saison/festibask/event/abc')

    expect(getLastMemberEntryPath()).toBeNull()
  })

  it('returns null when stored path is not persistable', () => {
    localStorage.setItem('lastMemberEntryPath', '/troupes')

    expect(getLastMemberEntryPath()).toBeNull()
  })

  describe('isPersistableMemberEntryPath', () => {
    it('allows shell and season workspace paths', () => {
      expect(isPersistableMemberEntryPath('/accueil')).toBe(true)
      expect(isPersistableMemberEntryPath('/agenda')).toBe(true)
      expect(isPersistableMemberEntryPath('/saison/festibask')).toBe(true)
      expect(isPersistableMemberEntryPath('/membre/alice')).toBe(true)
      expect(isPersistableMemberEntryPath('/troupes/improbots')).toBe(true)
    })

    it('rejects admin, login, event detail, and malformed paths', () => {
      expect(isPersistableMemberEntryPath('/connexion')).toBe(false)
      expect(isPersistableMemberEntryPath('/saison/festibask/event/abc')).toBe(false)
      expect(isPersistableMemberEntryPath('https://evil.example/agenda')).toBe(false)
      expect(isPersistableMemberEntryPath('//agenda')).toBe(false)
      expect(isPersistableMemberEntryPath('/saison/')).toBe(false)
    })
  })

  it('extracts season and member slugs from paths', () => {
    expect(seasonSlugFromMemberEntryPath('/saison/festibask')).toBe('festibask')
    expect(memberStatsSlugFromMemberEntryPath('/membre/alice')).toBe('alice')
    expect(saisonMemberEntryPath('la-malice', 'festibask')).toBe('/saison/la-malice/festibask')
  })
})
