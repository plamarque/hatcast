import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  assignObfuscatedEmails,
  buildAvailabilityRows,
  buildMalicieSeedSql,
  buildMembersWithIds,
  parseMembersCsv,
  pickRoleKeys,
  SEED_EVENTS,
  SEED_EMAIL_DOMAIN,
  shouldHaveAvailability,
  slugFromDisplayName,
  slotsFor,
} from './generate-malice-seed-sql.js'

const SAMPLE_CSV = `email,displayName,baselineRole,status
angel.arambel@gmail.com,Angie,MEMBER,active
maxime.cieutat@gmail.com,Max,TROUPE_ADMIN,active
patrice.lamarque+auryl@gmail.com,patrice lamarque+auryl,MEMBER,active
`

describe('generate-malice-seed-sql', () => {
  it('parses members csv without retaining real emails in output', () => {
    const rows = parseMembersCsv(SAMPLE_CSV)
    assert.equal(rows.length, 3)
    assert.equal(rows[0].displayName, 'Angie')
    assert.equal(rows[1].baselineRole, 'TROUPE_ADMIN')
  })

  it('obfuscates emails from displayName slugs', () => {
    const parsed = parseMembersCsv(SAMPLE_CSV)
    const obfuscated = assignObfuscatedEmails(parsed)
    assert.equal(obfuscated[0].obfuscatedEmail, `angie@${SEED_EMAIL_DOMAIN}`)
    assert.equal(obfuscated[2].obfuscatedEmail, `auryl@${SEED_EMAIL_DOMAIN}`)
    for (const row of obfuscated) {
      assert.doesNotMatch(row.obfuscatedEmail, /@gmail\.com$/)
    }
  })

  it('slugifies accented names', () => {
    assert.equal(slugFromDisplayName('Céline'), 'celine')
    assert.equal(slugFromDisplayName('Nicolas N.'), 'nicolas-n')
  })

  it('maps all 30 seed events to non-empty role slots', () => {
    for (const event of SEED_EVENTS) {
      const slots = slotsFor(event.templateType, event.customSlots ?? null)
      const total = Object.values(slots).reduce((a, b) => a + b, 0)
      assert.ok(total > 0, `event ${event.id} should have role slots`)
    }
  })

  it('generates partial availability around 65 percent coverage', () => {
    const parsed = parseMembersCsv(SAMPLE_CSV)
    const members = buildMembersWithIds(assignObfuscatedEmails(parsed))
    const rows = buildAvailabilityRows(members, SEED_EVENTS)
    const totalPairs = members.length * SEED_EVENTS.length
    const ratio = rows.length / totalPairs
    assert.ok(ratio >= 0.55 && ratio <= 0.75, `coverage ratio ${ratio}`)
  })

  it('match availability includes player+volunteer variant', () => {
    const keys = pickRoleKeys(0, 0, 'match', slotsFor('match'))
    assert.deepEqual(keys, ['player', 'volunteer'])
  })

  it('sql output contains obfuscated domain and no gmail', () => {
    const sql = buildMalicieSeedSql(SAMPLE_CSV)
    assert.match(sql, /@seed\.la-malice\.test/)
    assert.match(sql, /INSERT INTO users/)
    assert.match(sql, /UPDATE events SET template_type/)
    assert.match(sql, /INSERT INTO event_availability/)
    assert.doesNotMatch(sql, /gmail\.com/)
  })

  it('deterministic availability gate', () => {
    assert.equal(shouldHaveAvailability(0, 0), true)
    assert.equal(shouldHaveAvailability(5, 9), shouldHaveAvailability(5, 9))
  })
})
