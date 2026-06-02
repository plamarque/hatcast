import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildEventsLoadSql,
  buildEventsManifest,
  buildManifest,
  buildPlayersManifest,
  buildTroupeDeplacementsCategorySqlLines,
  deterministicEventUuid,
  slugBaseFromTitle,
  transformEvents,
} from './maliceEventsManifest.js'

const SEASON_V2 = 'b0000001-0000-4000-8000-000000000001'

const V1_EVENTS = [
  {
    id: 'evtB',
    date: '2025-10-03',
    title: 'Aperock Mai (déplacé)',
    location: 'Lille',
    description: 'Soirée',
    templateType: 'cabaret',
    roles: { player: 5, mc: 1, dj: 1 },
    archived: false,
  },
  {
    id: 'evtA',
    date: '2025-09-11',
    title: 'Cabaret de rentrée',
    location: 'Théâtre',
    templateType: 'cabaret',
    roles: { player: 5, mc: 1 },
    archived: false,
  },
  {
    id: 'evtArch',
    date: '2025-09-11',
    title: 'Cabaret de rentrée',
    templateType: 'deplacement',
    roles: { player: 5 },
    archived: true,
  },
  { id: 'evtBad', date: null, title: 'Sans date' },
]

describe('maliceEventsManifest — transformEvents (AC2, AC3)', () => {
  it('maps V1 events to V2 rows with default time and faithful fields', () => {
    const { events, rejects } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    assert.equal(events.length, 3)
    assert.equal(rejects.length, 1)
    assert.equal(rejects[0].reason, 'EVENT_INVALID_DATE')

    const first = events[0]
    assert.equal(first.date, '2025-09-11')
    assert.equal(first.startsAt, '2025-09-11 19:00:00')
    assert.equal(first.seasonV2Id, SEASON_V2)
    assert.equal(first.templateType, 'cabaret')
    assert.deepEqual(first.roleSlots, { player: 5, mc: 1 })
  })

  it('orders by date then v1 id for deterministic, unique slugs per season (AC3)', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const slugs = events.map((e) => e.slug)
    assert.deepEqual(new Set(slugs).size, slugs.length, 'slugs unique per season')
    // Two "Cabaret de rentrée" on the same date → cabaret-de-rentree, cabaret-de-rentree-2
    assert.ok(slugs.includes('cabaret-de-rentree'))
    assert.ok(slugs.includes('cabaret-de-rentree-2'))
  })

  it('preserves archived flag', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const archived = events.filter((e) => e.archived)
    assert.equal(archived.length, 1)
  })

  it('maps templateType=deplacement to category=deplacements (MIG-4 AC1)', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const deplacement = events.find((e) => e.templateType === 'deplacement')
    assert.ok(deplacement)
    assert.equal(deplacement.category, 'deplacements')
    assert.equal(deplacement.templateType, 'deplacement')
  })

  it('keeps category null for non-deplacement events (MIG-4 AC2)', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const nonDeplacement = events.filter((e) => e.templateType !== 'deplacement')
    assert.ok(nonDeplacement.length >= 1)
    for (const ev of nonDeplacement) {
      assert.equal(ev.category, null)
    }
  })

  it('honors a configurable default time', () => {
    const { events } = transformEvents([V1_EVENTS[1]], {
      seasonV2Id: SEASON_V2,
      defaultTime: '20:30',
    })
    assert.equal(events[0].startsAt, '2025-09-11 20:30:00')
  })

  it('rejects invalid defaultTime and missing season', () => {
    assert.throws(() => transformEvents([], { seasonV2Id: SEASON_V2, defaultTime: '9h' }))
    assert.throws(() => transformEvents([], {}))
  })
})

describe('maliceEventsManifest — slug + uuid helpers', () => {
  it('strips accents and lowercases like V24', () => {
    assert.equal(slugBaseFromTitle('Aperock Mai (déplacé)'), 'aperock-mai-deplace')
    assert.equal(slugBaseFromTitle('  Été 2025 !! '), 'ete-2025')
  })

  it('derives a stable, valid UUID v5 from a V1 id', () => {
    const a = deterministicEventUuid('evtA')
    const b = deterministicEventUuid('evtA')
    assert.equal(a, b)
    assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    assert.notEqual(deterministicEventUuid('evtA'), deterministicEventUuid('evtB'))
  })
})

describe('maliceEventsManifest — buildEventsLoadSql (AC7, MIG-4 AC3–4)', () => {
  it('emits idempotent INSERT … ON CONFLICT DO UPDATE', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const sql = buildEventsLoadSql(events)
    assert.match(sql, /INSERT INTO events \(id, season_id, title/)
    assert.match(sql, /ON CONFLICT \(id\) DO UPDATE SET/)
    assert.match(sql, /role_slots = EXCLUDED\.role_slots/)
    assert.match(sql, /category = EXCLUDED\.category/)
    assert.match(sql, /UPDATE seasons/)
    assert.match(sql, /event_count = \(SELECT COUNT\(\*\)::int FROM events e WHERE e\.season_id = seasons\.id AND e\.archived = FALSE\)/)
    // role_slots stored as JSON text
    assert.match(sql, /\{"player":5,"mc":1\}/)
  })

  it('persists category=deplacements in SQL for deplacement events (MIG-4 AC3)', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const sql = buildEventsLoadSql(events)
    assert.match(sql, /'deplacement'.*'deplacements'/)
    assert.match(sql, /, NULL, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP\)/)
  })

  it('emits idempotent troupe_categories glossaire when deplacements exist (MIG-4 AC4)', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const sql = buildEventsLoadSql(events)
    assert.match(sql, /INSERT INTO troupe_categories \(id, troupe_id, slug, label\)/)
    assert.match(sql, /'deplacements', 'Déplacements'/)
    assert.match(sql, /AND NOT EXISTS/)
  })

  it('omits troupe_categories SQL when no deplacement events', () => {
    const { events } = transformEvents(
      [{ id: 'x', date: '2025-01-01', title: 'Cabaret', templateType: 'cabaret', roles: {} }],
      { seasonV2Id: SEASON_V2 },
    )
    const sql = buildEventsLoadSql(events)
    assert.doesNotMatch(sql, /INSERT INTO troupe_categories/)
  })

  it('buildTroupeDeplacementsCategorySqlLines uses deterministic UUID from season', () => {
    const lines = buildTroupeDeplacementsCategorySqlLines(SEASON_V2)
    const sql = lines.join('\n')
    const expectedId = deterministicEventUuid(SEASON_V2, 'hatcast:mig-4:troupe-category')
    assert.match(sql, new RegExp(`'${expectedId}'`))
    assert.match(sql, /EXISTS \(SELECT 1 FROM events e WHERE e\.season_id = s\.id AND e\.category = 'deplacements'\)/)
  })

  it('escapes single quotes in titles', () => {
    const { events } = transformEvents(
      [{ id: 'x', date: '2025-01-01', title: "L'impro d'hiver", roles: {} }],
      { seasonV2Id: SEASON_V2 },
    )
    const sql = buildEventsLoadSql(events)
    assert.match(sql, /'L''impro d''hiver'/)
  })
})

describe('maliceEventsManifest — manifest (AC4, AC5, AC6)', () => {
  const v1Players = [
    { id: 'p1', email: 'Alice@Example.com' },
    { id: 'p2', email: 'bob@example.com' },
    { id: 'p3', email: 'ghost@example.com' },
    { id: 'p4' },
  ]
  const participants = [
    { seasonParticipantId: 'sp-1', userId: 'u-1', normalizedEmail: 'alice@example.com' },
    { seasonParticipantId: 'sp-2', userId: null, normalizedEmail: 'bob@example.com' },
  ]

  it('resolves players by normalized email and lists rejects', () => {
    const { players, rejects } = buildPlayersManifest(v1Players, participants)
    assert.equal(players.length, 2)
    assert.deepEqual(players[0], {
      v1PlayerId: 'p1',
      email: 'alice@example.com',
      v2UserId: 'u-1',
      v2SeasonParticipantId: 'sp-1',
    })
    const reasons = rejects.map((r) => r.reason).sort()
    assert.deepEqual(reasons, ['PLAYER_NO_EMAIL', 'PLAYER_UNRESOLVED'])
  })

  it('keeps first season_participant by id when V2 emails duplicate', () => {
    const dupParticipants = [
      { seasonParticipantId: 'sp-a', userId: 'u-a', normalizedEmail: 'alice@example.com' },
      { seasonParticipantId: 'sp-b', userId: 'u-b', normalizedEmail: 'alice@example.com' },
    ]
    const { players, rejects } = buildPlayersManifest(
      [{ id: 'p1', email: 'alice@example.com' }],
      dupParticipants,
    )
    assert.equal(players.length, 1)
    assert.equal(players[0].v2SeasonParticipantId, 'sp-a')
    assert.equal(rejects.length, 1)
    assert.equal(rejects[0].reason, 'V2_DUPLICATE_PARTICIPANT_EMAIL')
    assert.match(rejects[0].detail, /sp-b/)
  })

  it('builds events manifest entries', () => {
    const { events } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const entries = buildEventsManifest(events)
    assert.equal(entries.length, 3)
    for (const e of entries) {
      assert.ok(e.v1EventId && e.v2EventId && e.slug && e.date)
    }
  })

  it('assembles full manifest with merged rejects and counts', () => {
    const { events, rejects: eventRejects } = transformEvents(V1_EVENTS, { seasonV2Id: SEASON_V2 })
    const { manifest, rejects } = buildManifest({
      v1SeasonId: 'o0kD2IJekMdGdiJeIg4O',
      seasonV2Id: SEASON_V2,
      v1Players,
      participants,
      v2Events: events,
      eventRejects,
    })
    assert.equal(manifest.counts.players, 2)
    assert.equal(manifest.counts.events, 3)
    assert.equal(manifest.counts.deplacements, 1)
    assert.equal(manifest.v1SeasonId, 'o0kD2IJekMdGdiJeIg4O')
    // event reject + 2 player rejects
    assert.equal(rejects.length, 3)
  })
})
