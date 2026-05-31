import { afterEach, describe, expect, it } from 'vitest'

import {
  clearLastVisitedSeasonSlug,
  getLastVisitedSeasonSlug,
  getLastVisitedSeasonSlugForTroupe,
  rememberLastVisitedSeasonSlug,
} from './last-visited-season-storage'

describe('lastVisitedLeagueStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing stored', () => {
    expect(getLastVisitedSeasonSlug()).toBeNull()
  })

  it('stores and reads slug with V1 key', () => {
    rememberLastVisitedSeasonSlug('ma-ligue')

    expect(getLastVisitedSeasonSlug()).toBe('ma-ligue')
    expect(localStorage.getItem('lastVisitedSeason')).toBe('ma-ligue')
    // Timestamp is not written by V2 (no expiry in this story — see comment in storage module)
    expect(localStorage.getItem('lastVisitedSeasonTimestamp')).toBeNull()
  })

  it('clears slug and timestamp', () => {
    rememberLastVisitedSeasonSlug('ma-ligue')
    clearLastVisitedSeasonSlug()

    expect(getLastVisitedSeasonSlug()).toBeNull()
    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
    expect(localStorage.getItem('lastVisitedSeasonTimestamp')).toBeNull()
  })

  it('ignores blank slug', () => {
    rememberLastVisitedSeasonSlug('   ')
    expect(getLastVisitedSeasonSlug()).toBeNull()
  })

  it('stores per-troupe slug map when troupeId is provided', () => {
    rememberLastVisitedSeasonSlug('saison-a', 'troupe-1')
    rememberLastVisitedSeasonSlug('saison-b', 'troupe-2')

    expect(getLastVisitedSeasonSlug()).toBe('saison-b')
    expect(getLastVisitedSeasonSlugForTroupe('troupe-1')).toBe('saison-a')
    expect(getLastVisitedSeasonSlugForTroupe('troupe-2')).toBe('saison-b')
  })

  it('clears per-troupe map with global clear', () => {
    rememberLastVisitedSeasonSlug('saison-a', 'troupe-1')
    clearLastVisitedSeasonSlug()

    expect(getLastVisitedSeasonSlugForTroupe('troupe-1')).toBeNull()
  })
})
