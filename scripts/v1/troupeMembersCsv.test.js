import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildV2MemberRowsFromV1Season,
  buildV2UserRowsFromV1Season,
  escapeCsvField,
  formatMemberCsv,
  formatUserCsv,
  playerDisplayName,
} from './troupeMembersCsv.js'

describe('troupeMembersCsv', () => {
  it('escapes commas in CSV fields', () => {
    assert.equal(escapeCsvField('Bob, directeur'), '"Bob, directeur"')
  })

  it('maps players and season admins to V2 rows', () => {
    const { rows, skipped } = buildV2MemberRowsFromV1Season({
      seasonId: 'season-1',
      seasonData: {
        roles: {
          admins: ['admin@example.com'],
          users: ['member@example.com', 'orphan@example.com'],
        },
      },
      players: [
        { id: 'p1', email: 'member@example.com', name: 'Membre Un', order: 1 },
        { id: 'p2', email: 'admin@example.com', name: 'Admin', order: 2 },
        { id: 'p3', name: 'Sans email', order: 3 },
      ],
    })

    assert.equal(rows.length, 3)
    assert.equal(skipped.length, 1)
    assert.deepEqual(rows.find((r) => r.email === 'admin@example.com'), {
      email: 'admin@example.com',
      displayName: 'Admin',
      baselineRole: 'TROUPE_ADMIN',
      status: 'active',
    })
    assert.deepEqual(rows.find((r) => r.email === 'orphan@example.com'), {
      email: 'orphan@example.com',
      displayName: 'orphan',
      baselineRole: 'MEMBER',
      status: 'active',
    })
  })

  it('uses player.name as displayName', () => {
    assert.equal(playerDisplayName({ name: '  Patrice  ', firstName: 'X' }), 'Patrice')
  })

  it('formats header and rows', () => {
    const csv = formatMemberCsv([
      {
        email: 'a@example.com',
        displayName: 'Alice',
        baselineRole: 'MEMBER',
        status: 'active',
      },
    ])
    assert.match(csv, /^email,displayName,baselineRole,status/)
    assert.match(csv, /a@example.com,Alice,MEMBER,active/)
  })

  it('builds user rows without roles', () => {
    const { rows } = buildV2UserRowsFromV1Season({
      seasonId: 'season-1',
      seasonData: { roles: { admins: ['admin@example.com'] } },
      players: [{ id: 'p1', email: 'admin@example.com', name: 'Admin', order: 1 }],
    })
    assert.deepEqual(rows, [{ email: 'admin@example.com', displayName: 'Admin' }])
  })

  it('formats user csv', () => {
    const csv = formatUserCsv([{ email: 'a@example.com', displayName: 'Alice' }])
    assert.match(csv, /^email,displayName/)
    assert.match(csv, /a@example.com,Alice/)
  })
})
