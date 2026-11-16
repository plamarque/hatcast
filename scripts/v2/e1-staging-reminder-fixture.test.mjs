import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { REMINDER_EVENT_SLUG, assertReminderFixtureSnapshot, assertStagingTarget, ensureRemovedOrganizerParticipant } from './e1-staging-reminder-fixture.mjs'

const valid = {
  organizerActiveMember: true,
  organizerSeasonOrganizer: true,
  organizerTroupeAdmin: false,
  organizerActiveParticipant: false,
  event: {
    slug: REMINDER_EVENT_SLUG,
    archived: false,
    availabilityOpenedAt: '2030-01-01T00:00:00Z',
    startsAt: '2031-01-01T00:00:00Z',
  },
  hasUnknownRecipient: true,
  hasNotifiableRecipient: true,
}

describe('e1-staging-reminder-fixture contract', () => {
  it('accepts the isolated active organizer and open future anchor', () => {
    assert.doesNotThrow(() => assertReminderFixtureSnapshot(valid, REMINDER_EVENT_SLUG))
  })

  it('rejects a participant organizer and invalid or aliased fixtures', () => {
    assert.throws(
      () => assertReminderFixtureSnapshot({ ...valid, organizerActiveParticipant: true }, REMINDER_EVENT_SLUG),
      /role boundary/,
    )
    assert.throws(
      () => assertReminderFixtureSnapshot({ ...valid, event: { ...valid.event, archived: true } }, REMINDER_EVENT_SLUG),
      /open, published, and future/,
    )
    assert.throws(
      () => assertReminderFixtureSnapshot({ ...valid, event: { ...valid.event, slug: 'another-event' } }, REMINDER_EVENT_SLUG),
      /missing or aliased/,
    )
    assert.throws(
      () => assertReminderFixtureSnapshot({ ...valid, hasUnknownRecipient: false }, REMINDER_EVENT_SLUG),
      /no unanswered recipient/,
    )
    assert.throws(
      () => assertReminderFixtureSnapshot({ ...valid, hasNotifiableRecipient: false }, REMINDER_EVENT_SLUG),
      /no notifiable recipient/,
    )
    assert.throws(
      () => assertReminderFixtureSnapshot({ ...valid, event: { ...valid.event, startsAt: 'not-a-date' } }, REMINDER_EVENT_SLUG),
      /open, published, and future/,
    )
  })

  it('requires the GitHub staging target and a non-production Neon URL', () => {
    const safe = {
      confirmStaging: 'staging',
      stagingTarget: 'staging',
      githubEnv: '/tmp/github-env',
      databaseUrl: 'postgresql://user:pass@ep-staging-123.neon.tech/neondb',
    }
    assert.doesNotThrow(() => assertStagingTarget(safe))
    assert.throws(() => assertStagingTarget({ ...safe, stagingTarget: 'production' }), /Refusing fixture write/)
    assert.throws(
      () => assertStagingTarget({ ...safe, databaseUrl: 'postgresql://user:pass@ep-production.neon.tech/neondb' }),
      /not an approved staging Neon target/,
    )
  })
})


describe('organizer participant bootstrap', () => {
  const ids = ['season', 'user', 'membership', 'organizer@example.test']
  function clientWith(rows) {
    const calls = []
    return { calls, async query(sql, params) {
      calls.push({ sql, params })
      return calls.length === 1 ? { rows, rowCount: rows.length } : { rows: [], rowCount: 1 }
    } }
  }
  it('creates a removed participant if absent', async () => {
    const client = clientWith([])
    await ensureRemovedOrganizerParticipant(client, ...ids)
    assert.match(client.calls[1].sql, /INSERT INTO season_participants/)
    assert.match(client.calls[1].sql, /'REMOVED'.*'SEASON_ADMIN'.*'MEMBER_SYNC'/s)
    assert.deepEqual(client.calls[1].params.slice(1), ids.slice(0, 3))
  })
  it('preserves the existing participant identity and removes it', async () => {
    const client = clientWith([{ id: 'existing', user_id: 'user', troupe_membership_id: 'membership' }])
    await ensureRemovedOrganizerParticipant(client, ...ids)
    assert.match(client.calls[1].sql, /status = 'REMOVED'.*removal_source = 'SEASON_ADMIN'/s)
    assert.equal(client.calls[1].params[0], 'existing')
  })
  it('rejects duplicate or conflicting rows without writes', async () => {
    for (const rows of [[{ id: 'a' }, { id: 'b' }], [{ id: 'a', user_id: 'other' }]]) {
      const client = clientWith(rows)
      await assert.rejects(ensureRemovedOrganizerParticipant(client, ...ids), /Conflicting or duplicate/)
      assert.equal(client.calls.length, 1)
    }
  })
})
