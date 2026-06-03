import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { TroupeContextService } from '../troupes/troupe-context.service'
import {
  clearStaleSeasonNavigation,
  memberOnboardingPath,
  onboardingPathForUnreachableSeason,
  seasonSlugFromPathname,
} from './unreachable-season-navigation'
import { rememberLastMemberEntryPath } from './last-member-entry-path-storage'
import { rememberLastVisitedSeasonSlug } from './last-visited-season-storage'

describe('unreachableSeasonNavigation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('extracts season slug from pathname', () => {
    expect(seasonSlugFromPathname('/saison/festibask')).toBe('festibask')
    expect(seasonSlugFromPathname('/saison/festibask/event/ev')).toBe('festibask')
    expect(seasonSlugFromPathname('/agenda')).toBeNull()
  })

  it('clears last visited and member entry for the slug', () => {
    rememberLastVisitedSeasonSlug('stale')
    rememberLastMemberEntryPath('/saison/stale')

    clearStaleSeasonNavigation('stale')

    expect(localStorage.getItem('lastVisitedSeason')).toBeNull()
    expect(localStorage.getItem('lastMemberEntryPath')).toBeNull()
  })

  it('routes no-membership to agenda onboarding', () => {
    const troupeContext = {
      selectedTroupe: () => null,
      activeTroupes: () => [],
    } as unknown as TroupeContextService

    expect(onboardingPathForUnreachableSeason('no-membership', troupeContext)).toEqual(
      memberOnboardingPath(),
    )
  })

  it('routes not-found to troupe hub when a troupe is active', () => {
    const troupeContext = {
      selectedTroupe: () => ({ id: 't1', slug: 'ma-troupe', name: 'Ma troupe' }),
      activeTroupes: () => [{ id: 't1', slug: 'ma-troupe', name: 'Ma troupe' }],
    } as unknown as TroupeContextService

    expect(onboardingPathForUnreachableSeason('not-found', troupeContext)).toEqual([
      '/',
      'troupes',
      'ma-troupe',
    ])
  })
})
