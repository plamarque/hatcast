import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  assignObfuscatedEmails,
  buildAvailabilityRows,
  buildCompositionSqlLines,
  buildFlywaySupersededVersionedStubs,
  buildImprobotsDevDemoSql,
  buildMembersWithIds,
  buildMvpPilotSqlLines,
  MVP_PILOT_EVENTS,
  parseMembersCsv,
  pickRoleKeys,
  SEED_COMPOSITION_DRAFTS,
  SEED_EVENTS,
  SEED_EMAIL_DOMAIN,
  shouldHaveAvailability,
  slugFromDisplayName,
  slotsFor,
} from './generate-improbots-seed-sql.js'

const SAMPLE_CSV = `email,displayName,baselineRole,status
angel.arambel@gmail.com,Angie,MEMBER,active
maxime.cieutat@gmail.com,Max,TROUPE_ADMIN,active
patrice.lamarque+auryl@gmail.com,patrice lamarque+auryl,MEMBER,active
`

describe('generate-improbots-seed-sql', () => {
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

  it('dev demo sql contains obfuscated domain and current schema inserts', () => {
    const members = buildMembersWithIds(assignObfuscatedEmails(parseMembersCsv(SAMPLE_CSV)))
    const availability = buildAvailabilityRows(members, SEED_EVENTS)
    const sql = buildImprobotsDevDemoSql(members, availability)
    assert.match(sql, /@seed\.improbots\.test/)
    assert.match(sql, /INSERT INTO users \(id, google_sub, idp_uid, email, display_name, slug/)
    assert.match(sql, /INSERT INTO events \(id, season_id, slug, title/)
    assert.match(sql, /INSERT INTO event_availability \(id, event_id, user_id/)
    assert.match(sql, /season_participant_id/)
    assert.match(sql, /-- MVP pilot recette/)
    assert.match(sql, /'match'.*"coach":1/)
    assert.doesNotMatch(sql, /gmail\.com/)
    assert.doesNotMatch(sql, /DO \$improbots_/)
  })

  it('superseded versioned seeds are no-op stubs', () => {
    const stubs = buildFlywaySupersededVersionedStubs()
    assert.equal(stubs.length, 7)
    for (const stub of stubs) {
      assert.match(stub.sql, /R__seed_improbots_dev_demo\.sql/)
      assert.match(stub.sql, /SELECT 1 WHERE 1 = 0/)
    }
  })

  it('deterministic availability gate', () => {
    assert.equal(shouldHaveAvailability(0, 0), true)
    assert.equal(shouldHaveAvailability(5, 9), shouldHaveAvailability(5, 9))
  })

  it('composition seed covers unpublished and published drafts', () => {
    const unpublished = SEED_COMPOSITION_DRAFTS.filter((d) => !d.publishedAt)
    const published = SEED_COMPOSITION_DRAFTS.filter((d) => d.publishedAt)
    assert.ok(unpublished.length >= 2)
    assert.ok(published.length >= 1)
    for (const draft of SEED_COMPOSITION_DRAFTS) {
      assert.ok(draft.slots.length > 0)
    }
  })

  it('composition sql uses season_participant_id and idempotent inserts', () => {
    const sql = buildCompositionSqlLines({ repair: true }).join('\n')
    assert.match(sql, /INSERT INTO event_compositions/)
    assert.match(sql, /INSERT INTO event_composition_slots/)
    assert.match(sql, /season_participant_id, event_participant_id/)
    assert.match(sql, /WHERE NOT EXISTS/)
    assert.match(sql, /Cabaret de rentrée/)
  })

  it('builds MVP pilot lines with six prefixed events', () => {
    const sql = buildMvpPilotSqlLines({ repair: true }).join('\n')
    assert.equal(MVP_PILOT_EVENTS.length, 6)
    for (const ev of MVP_PILOT_EVENTS) {
      assert.match(sql, new RegExp(ev.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
    assert.match(sql, /INSERT INTO season_organizers/)
    assert.match(sql, /WHERE NOT EXISTS/)
    assert.match(sql, /\[MVP\] 04 · Déclin et compléter/)
    assert.match(sql, /CONFIRMED/)
    assert.match(sql, /event_availability \(id, event_id, user_id/)
  })
})
