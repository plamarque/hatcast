import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildAvailabilityCompositionsLoadSql,
  deterministicAvailabilityUuid,
  deterministicDeclineUuid,
  deterministicSlotUuid,
  mapCompositionLifecycle,
  mapParticipationStatus,
  transformAvailability,
  transformAvailabilityCompositions,
  transformCompositions,
} from './maliceAvailabilityCompositions.js'

const MANIFEST = {
  seasonV2Id: 'a0000001-0000-4000-8000-000000000099',
  players: [
    { v1PlayerId: 'p1', email: 'alice@example.com', v2UserId: 'u-1', v2SeasonParticipantId: 'sp-1' },
    { v1PlayerId: 'p2', email: 'bob@example.com', v2UserId: 'u-2', v2SeasonParticipantId: 'sp-2' },
    { v1PlayerId: 'p3', email: 'carol@example.com', v2UserId: 'u-3', v2SeasonParticipantId: 'sp-3' },
  ],
  events: [
    { v1EventId: 'evtA', v2EventId: 'e0000001-0000-4000-8000-000000000001', slug: 'cabaret', date: '2025-09-11' },
    { v1EventId: 'evtB', v2EventId: 'e0000002-0000-4000-8000-000000000002', slug: 'match', date: '2025-10-03' },
    { v1EventId: 'evtGhost', v2EventId: 'e0000003-0000-4000-8000-000000000003', slug: 'ghost', date: '2025-11-01' },
  ],
}

const CONFIRMED_AT = '2025-10-01T18:30:00.000Z'

describe('maliceAvailabilityCompositions — transformAvailability (AC2, AC7)', () => {
  it('maps available flag, roles, and comment via manifest', () => {
    const { rows, rejects } = transformAvailability(
      [
        { v1PlayerId: 'p1', v1EventId: 'evtA', available: true, roles: ['mc'], comment: 'Peut arriver tard' },
        { v1PlayerId: 'p2', v1EventId: 'evtA', available: false, roles: [], comment: null },
      ],
      MANIFEST,
    )
    assert.equal(rows.length, 2)
    assert.equal(rejects.length, 0)
    assert.deepEqual(rows[0], {
      id: deterministicAvailabilityUuid('e0000001-0000-4000-8000-000000000001', 'u-1'),
      eventId: 'e0000001-0000-4000-8000-000000000001',
      userId: 'u-1',
      status: 'AVAILABLE',
      roleKeys: ['mc'],
      comment: 'Peut arriver tard',
    })
    assert.equal(rows[1].status, 'UNAVAILABLE')
    assert.equal(rows[1].comment, null)
  })

  it('lists rejects for unknown player or event without aborting', () => {
    const { rows, rejects } = transformAvailability(
      [
        { v1PlayerId: 'unknown', v1EventId: 'evtA', available: true, roles: [] },
        { v1PlayerId: 'p1', v1EventId: 'missing', available: true, roles: [] },
      ],
      MANIFEST,
    )
    assert.equal(rows.length, 0)
    assert.equal(rejects.length, 2)
    assert.deepEqual(
      rejects.map((r) => r.reason).sort(),
      ['EVENT_UNRESOLVED', 'PLAYER_UNRESOLVED'],
    )
  })
})

describe('maliceAvailabilityCompositions — transformCompositions (AC3–AC7)', () => {
  it('maps slots with slot_index, participation_status, and self-decline', () => {
    const { compositions, slots, declines, rejects } = transformCompositions(
      [
        {
          v1EventId: 'evtA',
          status: 'confirmed',
          confirmedAt: CONFIRMED_AT,
          roles: { player: ['p1', 'p2'], mc: ['p3'] },
          declined: { player: ['p2'] },
          playerStatuses: { p1: 'confirmed', p2: 'declined', p3: 'pending' },
        },
      ],
      MANIFEST,
    )
    assert.equal(rejects.length, 0)
    assert.equal(compositions.length, 1)
    assert.equal(compositions[0].validatedAt, CONFIRMED_AT)
    assert.equal(compositions[0].publishedAt, CONFIRMED_AT)
    assert.equal(slots.length, 3)
    assert.equal(slots.find((s) => s.roleKey === 'player' && s.slotIndex === 0)?.participationStatus, 'CONFIRMED')
    assert.equal(slots.find((s) => s.roleKey === 'mc')?.participationStatus, 'PENDING')
    assert.equal(declines.length, 1)
    assert.equal(declines[0].declinedByUserId, 'u-2')
    assert.equal(declines[0].seasonParticipantId, 'sp-2')
  })

  it('maps cast.status lifecycle: confirmed, pending_confirmation, incomplete (AC6)', () => {
    const cases = [
      { status: 'confirmed', validatedAt: CONFIRMED_AT, publishedAt: CONFIRMED_AT },
      { status: 'pending_confirmation', validatedAt: CONFIRMED_AT, publishedAt: null },
      { status: 'incomplete', validatedAt: null, publishedAt: null },
    ]
    for (const c of cases) {
      const { compositions } = transformCompositions(
        [{ v1EventId: 'evtB', status: c.status, confirmedAt: CONFIRMED_AT, roles: {} }],
        MANIFEST,
      )
      assert.equal(compositions[0].validatedAt, c.validatedAt)
      assert.equal(compositions[0].publishedAt, c.publishedAt)
    }
  })

  it('maps incomplete cast with organizer confirmed like V1 cast.confirmed (understaffed event)', () => {
    const { compositions } = transformCompositions(
      [
        {
          v1EventId: 'evtB',
          status: 'incomplete',
          confirmed: true,
          confirmedAt: CONFIRMED_AT,
          roles: { assistant_referee: ['p1'] },
          playerStatuses: { p1: 'confirmed' },
        },
      ],
      MANIFEST,
    )
    assert.equal(compositions[0].validatedAt, CONFIRMED_AT)
    assert.equal(compositions[0].publishedAt, CONFIRMED_AT)
  })

  it('rejects empty slot player and unknown manifest player (AC7)', () => {
    const { slots, rejects } = transformCompositions(
      [
        {
          v1EventId: 'evtA',
          status: 'incomplete',
          roles: { player: ['', 'ghost'] },
          declined: {},
          playerStatuses: {},
        },
      ],
      MANIFEST,
    )
    assert.equal(slots.length, 0)
    assert.equal(rejects.length, 2)
    assert.ok(rejects.some((r) => r.reason === 'SLOT_EMPTY_PLAYER'))
    assert.ok(rejects.some((r) => r.reason === 'PLAYER_UNRESOLVED'))
  })

  it('rejects cast for event missing from manifest', () => {
    const { compositions, rejects } = transformCompositions(
      [{ v1EventId: 'evtMissing', status: 'incomplete', roles: { player: ['p1'] } }],
      MANIFEST,
    )
    assert.equal(compositions.length, 0)
    assert.equal(rejects[0].reason, 'EVENT_UNRESOLVED')
  })
})

describe('maliceAvailabilityCompositions — helpers + SQL (AC4, AC8)', () => {
  it('maps participation_status 1:1', () => {
    assert.equal(mapParticipationStatus('confirmed'), 'CONFIRMED')
    assert.equal(mapParticipationStatus('declined'), 'DECLINED')
    assert.equal(mapParticipationStatus('pending'), 'PENDING')
    assert.equal(mapParticipationStatus(undefined), 'PENDING')
  })

  it('mapCompositionLifecycle matches ADR rules', () => {
    assert.deepEqual(mapCompositionLifecycle('confirmed', CONFIRMED_AT), {
      validatedAt: CONFIRMED_AT,
      publishedAt: CONFIRMED_AT,
    })
    assert.deepEqual(mapCompositionLifecycle('pending_confirmation', CONFIRMED_AT), {
      validatedAt: CONFIRMED_AT,
      publishedAt: null,
    })
    assert.deepEqual(mapCompositionLifecycle('incomplete', CONFIRMED_AT), {
      validatedAt: null,
      publishedAt: null,
    })
  })

  const UUID_V5_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

  it('derives stable slot and decline UUIDs', () => {
    const eventId = 'e0000001-0000-4000-8000-000000000001'
    const a = deterministicSlotUuid(eventId, 'player', 0)
    const b = deterministicSlotUuid(eventId, 'player', 0)
    assert.equal(a, b)
    assert.match(a, UUID_V5_RE)
    assert.notEqual(a, deterministicSlotUuid(eventId, 'player', 1))

    const av1 = deterministicAvailabilityUuid(eventId, 'user-1')
    const av2 = deterministicAvailabilityUuid(eventId, 'user-1')
    assert.equal(av1, av2)
    assert.match(av1, UUID_V5_RE)

    const d1 = deterministicDeclineUuid(eventId, 'player', 'p2')
    const d2 = deterministicDeclineUuid(eventId, 'player', 'p2')
    assert.equal(d1, d2)
    assert.match(d1, UUID_V5_RE)
    assert.notEqual(d1, deterministicDeclineUuid(eventId, 'player', 'p3'))
    assert.notEqual(d1, deterministicDeclineUuid(eventId, 'mc', 'p2'))
  })

  it('emits idempotent INSERT … ON CONFLICT for all target tables', () => {
    const result = transformAvailabilityCompositions({
      availabilityRecords: [{ v1PlayerId: 'p1', v1EventId: 'evtA', available: true, roles: ['mc'], comment: null }],
      casts: [{
        v1EventId: 'evtA',
        status: 'confirmed',
        confirmedAt: CONFIRMED_AT,
        roles: { mc: ['p1'] },
        declined: { mc: ['p2'] },
        playerStatuses: { p1: 'confirmed', p2: 'declined' },
      }],
      manifest: MANIFEST,
    })
    const sql = result.sql
    assert.match(sql, /INSERT INTO event_availability \(id, event_id, user_id, status/)
    assert.match(sql, /ON CONFLICT \(event_id, user_id\) DO UPDATE/)
    assert.match(sql, /INSERT INTO event_compositions/)
    assert.match(sql, /ON CONFLICT \(event_id\) DO UPDATE/)
    assert.match(sql, /INSERT INTO event_composition_slots/)
    assert.match(sql, /ON CONFLICT \(event_id, role_key, slot_index\) DO UPDATE/)
    assert.match(sql, /INSERT INTO event_composition_declines/)
    assert.match(sql, /ON CONFLICT \(id\) DO UPDATE/)
    assert.match(sql, /UPDATE events[\s\S]*availability_opened_at = created_at/)
  })

  it('buildAvailabilityCompositionsLoadSql escapes quotes in comments', () => {
    const sql = buildAvailabilityCompositionsLoadSql({
      availabilityRows: [
        {
          eventId: 'e1',
          userId: 'u1',
          status: 'AVAILABLE',
          roleKeys: [],
          comment: "L'impro",
        },
      ],
      compositions: [],
      slots: [],
      declines: [],
    })
    assert.match(sql, /'L''impro'/)
  })
})

describe('maliceAvailabilityCompositions — reject + lifecycle edge cases', () => {
  const UPDATED_AT = '2025-09-15T12:00:00.000Z'
  const EVT = 'e0000002-0000-4000-8000-000000000002'

  it('rejects (with detail) a manifest player missing v2UserId', () => {
    const manifest = {
      players: [{ v1PlayerId: 'p1', email: 'a@b.c', v2UserId: null, v2SeasonParticipantId: 'sp-1' }],
      events: [{ v1EventId: 'evtB', v2EventId: EVT }],
    }
    const { slots, rejects } = transformCompositions(
      [{ v1EventId: 'evtB', status: 'incomplete', roles: { mc: ['p1'] } }],
      manifest,
    )
    assert.equal(slots.length, 0)
    assert.equal(rejects.length, 1)
    assert.equal(rejects[0].reason, 'PLAYER_NO_V2_USER')
    assert.match(rejects[0].detail, /p1/)
  })

  it('rejects a slot when the manifest player has no v2SeasonParticipantId', () => {
    const manifest = {
      players: [{ v1PlayerId: 'p1', email: 'a@b.c', v2UserId: 'u-1', v2SeasonParticipantId: null }],
      events: [{ v1EventId: 'evtB', v2EventId: EVT }],
    }
    const { slots, declines, rejects } = transformCompositions(
      [{ v1EventId: 'evtB', status: 'incomplete', roles: { mc: ['p1'] }, declined: { mc: ['p1'] } }],
      manifest,
    )
    assert.equal(slots.length, 0)
    assert.equal(declines.length, 0)
    assert.equal(rejects.length, 2)
    assert.ok(rejects.every((r) => r.reason === 'PLAYER_NO_V2_PARTICIPANT'))
  })

  it('availability still resolves for a player without v2SeasonParticipantId (only user needed)', () => {
    const manifest = {
      players: [{ v1PlayerId: 'p1', email: 'a@b.c', v2UserId: 'u-1', v2SeasonParticipantId: null }],
      events: [{ v1EventId: 'evtB', v2EventId: EVT }],
    }
    const { rows, rejects } = transformAvailability(
      [{ v1PlayerId: 'p1', v1EventId: 'evtB', available: true, roles: [] }],
      manifest,
    )
    assert.equal(rejects.length, 0)
    assert.equal(rows[0].userId, 'u-1')
  })

  it('maps the slot season_participant_id from the manifest (AC3)', () => {
    const manifest = {
      players: [{ v1PlayerId: 'p1', email: 'a@b.c', v2UserId: 'u-1', v2SeasonParticipantId: 'sp-9' }],
      events: [{ v1EventId: 'evtB', v2EventId: EVT }],
    }
    const { slots } = transformCompositions(
      [{ v1EventId: 'evtB', status: 'incomplete', roles: { mc: ['p1'] }, playerStatuses: { p1: 'confirmed' } }],
      manifest,
    )
    assert.equal(slots[0].seasonParticipantId, 'sp-9')
    assert.equal(slots[0].slotIndex, 0)
  })

  it('confirmed cast without confirmedAt falls back to updatedAt, then now()', () => {
    assert.deepEqual(mapCompositionLifecycle('confirmed', null, UPDATED_AT), {
      validatedAt: UPDATED_AT,
      publishedAt: UPDATED_AT,
    })
    const noTs = mapCompositionLifecycle('confirmed', null, null)
    assert.notEqual(noTs.validatedAt, null)
    assert.equal(noTs.validatedAt, noTs.publishedAt)
    assert.ok(!Number.isNaN(Date.parse(noTs.validatedAt)))
  })

  it('declined_at falls back to updatedAt when the cast has no validated/confirmed timestamp', () => {
    const manifest = {
      players: [{ v1PlayerId: 'p1', email: 'a@b.c', v2UserId: 'u-1', v2SeasonParticipantId: 'sp-1' }],
      events: [{ v1EventId: 'evtB', v2EventId: EVT }],
    }
    const { declines } = transformCompositions(
      [{ v1EventId: 'evtB', status: 'incomplete', updatedAt: UPDATED_AT, declined: { mc: ['p1'] } }],
      manifest,
    )
    assert.equal(declines.length, 1)
    assert.equal(declines[0].declinedAt, UPDATED_AT)
  })
})
