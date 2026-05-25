import { describe, expect, it } from 'vitest'

import {
  saisonAdminMembresPath,
  saisonAdminParticipantsPath,
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
    expect(troupeHubPath('la-malice')).toEqual(['/', 'troupes', 'la-malice'])
  })

  it('builds saison workspace path', () => {
    expect(saisonWorkspacePath('festibask')).toEqual(['/', 'saison', 'festibask'])
  })

  it('builds saison admin participants path', () => {
    expect(saisonAdminParticipantsPath('festibask')).toEqual([
      '/',
      'saison',
      'festibask',
      'admin',
      'participants',
    ])
  })

  it('builds saison admin membres path', () => {
    expect(saisonAdminMembresPath('festibask')).toEqual([
      '/',
      'saison',
      'festibask',
      'admin',
      'membres',
    ])
  })

  it('builds troupe admin membres path', () => {
    expect(troupeAdminMembresPath('la-malice')).toEqual([
      '/',
      'troupe',
      'la-malice',
      'admin',
      'membres',
    ])
  })
})
