import { describe, expect, it } from 'vitest'

import {
  canonicalSaisonCommands,
  legacySaisonSuffixFromPathname,
  legacySaisonWorkspacePath,
  parseCanonicalSaisonScopedPath,
  saisonAdminMembresPath,
  saisonAdminParticipantsPath,
  saisonEventPath,
  saisonMemberEntryPath,
  saisonWorkspacePath,
  troupeAdminMembresPath,
  troupeHubPath,
  TROUPE_HUB_ROUTE_PREFIX,
} from './troupe-routes'

describe('troupe-routes', () => {
  it('uses troupes as hub route prefix', () => {
    expect(TROUPE_HUB_ROUTE_PREFIX).toBe('troupes')
  })

  it('builds troupe hub path', () => {
    expect(troupeHubPath('les-improbots')).toEqual(['/', 'troupes', 'les-improbots'])
  })

  it('builds saison workspace path with troupe slug', () => {
    expect(saisonWorkspacePath('la-malice', 'festibask')).toEqual([
      '/saison',
      'la-malice',
      'festibask',
    ])
  })

  it('builds saison event path', () => {
    expect(saisonEventPath('la-malice', 'festibask', 'event-1')).toEqual([
      '/saison',
      'la-malice',
      'festibask',
      'event',
      'event-1',
    ])
  })

  it('builds saison admin participants path', () => {
    expect(saisonAdminParticipantsPath('la-malice', 'festibask')).toEqual([
      '/saison',
      'la-malice',
      'festibask',
      'admin',
      'participants',
    ])
  })

  it('builds saison admin membres path', () => {
    expect(saisonAdminMembresPath('la-malice', 'festibask')).toEqual([
      '/saison',
      'la-malice',
      'festibask',
      'admin',
      'membres',
    ])
  })

  it('builds member entry path', () => {
    expect(saisonMemberEntryPath('la-malice', 'festibask')).toBe('/saison/la-malice/festibask')
  })

  it('builds legacy workspace path', () => {
    expect(legacySaisonWorkspacePath('festibask')).toEqual(['/saison', 'festibask'])
  })

  it('parses canonical scoped paths', () => {
    expect(parseCanonicalSaisonScopedPath('/saison/la-malice/festibask')).toEqual({
      troupeSlug: 'la-malice',
      seasonSlug: 'festibask',
      suffixSegments: [],
    })
    expect(parseCanonicalSaisonScopedPath('/saison/la-malice/festibask/event/ev-1')).toEqual({
      troupeSlug: 'la-malice',
      seasonSlug: 'festibask',
      suffixSegments: ['event', 'ev-1'],
    })
    expect(parseCanonicalSaisonScopedPath('/saison/festibask/event/ev-1')).toBeNull()
  })

  it('extracts legacy suffix and builds canonical commands', () => {
    expect(legacySaisonSuffixFromPathname('/saison/festibask/event/ev-1')).toBe('event/ev-1')
    expect(legacySaisonSuffixFromPathname('/saison/festibask/admin/participants')).toBe(
      'admin/participants',
    )
    expect(legacySaisonSuffixFromPathname('/saison/festibask')).toBe('')
    expect(canonicalSaisonCommands('la-malice', 'festibask', 'event/ev-1')).toEqual([
      '/saison',
      'la-malice',
      'festibask',
      'event',
      'ev-1',
    ])
  })

  it('builds troupe admin membres path', () => {
    expect(troupeAdminMembresPath('les-improbots')).toEqual([
      '/',
      'troupes',
      'les-improbots',
      'admin',
      'membres',
    ])
  })
})
