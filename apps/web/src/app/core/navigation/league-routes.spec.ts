import { describe, expect, it } from 'vitest'

import {
  LEAGUE_ROUTE_PREFIX,
  leagueAdminMembresPath,
  leagueAdminParticipantsPath,
  leagueEventPath,
  leagueWorkspacePath,
} from './league-routes'

describe('league-routes', () => {
  it('uses ligue as route prefix segment', () => {
    expect(LEAGUE_ROUTE_PREFIX).toBe('ligue')
  })

  it('builds league workspace path', () => {
    expect(leagueWorkspacePath('festibask')).toEqual(['/', 'ligue', 'festibask'])
  })

  it('builds league event path', () => {
    expect(leagueEventPath('festibask', 'e1')).toEqual(['/', 'ligue', 'festibask', 'event', 'e1'])
  })

  it('builds admin membres path', () => {
    expect(leagueAdminMembresPath('festibask')).toEqual([
      '/',
      'ligue',
      'festibask',
      'admin',
      'membres',
    ])
  })

  it('builds admin participants path', () => {
    expect(leagueAdminParticipantsPath('festibask')).toEqual([
      '/',
      'ligue',
      'festibask',
      'admin',
      'participants',
    ])
  })
})
