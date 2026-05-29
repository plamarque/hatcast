import { describe, expect, it } from 'vitest'

import {
  saisonAdminMembresPath,
  saisonAdminParticipantsPath,
  saisonEventPath,
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

  it('builds saison workspace path', () => {
    expect(saisonWorkspacePath('festibask')).toEqual(['/saison', 'festibask'])
  })

  it('builds saison event path', () => {
    expect(saisonEventPath('festibask', 'event-1')).toEqual([
      '/saison',
      'festibask',
      'event',
      'event-1',
    ])
  })

  it('builds saison admin participants path', () => {
    expect(saisonAdminParticipantsPath('festibask')).toEqual([
      '/saison',
      'festibask',
      'admin',
      'participants',
    ])
  })

  it('builds saison admin membres path', () => {
    expect(saisonAdminMembresPath('festibask')).toEqual([
      '/saison',
      'festibask',
      'admin',
      'membres',
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
