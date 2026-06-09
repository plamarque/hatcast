import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { loadPreferences, simulateNotificationVolume } from './simulator.js'
import { summarizeDistribution } from './stats.js'
import { buildSeasonModel } from './season-model.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURE = join(__dirname, 'fixtures', 'minimal-raw.json')
const DEFAULT_PREFS = join(__dirname, 'default-preferences.json')

describe('notification-volume simulator', () => {
  it('builds season model with organizer flag from season.roles', () => {
    const raw = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const model = buildSeasonModel(raw)
    const orga = model.participants.find((p) => p.id === 'p3')
    assert.equal(orga?.isOrganizer, true)
    assert.equal(model.events.length, 3)
    assert.equal(model.events[0].lifecycle, 'AWAITING_CONFIRMATIONS')
  })

  it('simulates member email units with default prefs (push global OFF)', () => {
    const raw = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const preferences = loadPreferences(DEFAULT_PREFS)
    const result = simulateNotificationVolume(raw, { preferences })
    const delivered = result.deliveries.filter((d) => d.delivered)
    const participantEmail = delivered.filter(
      (d) => d.recipientRole === 'participant' && d.channel === 'email',
    )
    assert.ok(participantEmail.length > 0, 'expected participant email deliveries')
    const participantPush = delivered.filter(
      (d) => d.recipientRole === 'participant' && d.channel === 'push',
    )
    assert.equal(participantPush.length, 0, 'push global OFF → no push deliveries')
  })

  it('orga ops intents are blocked by default opt-in OFF', () => {
    const raw = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const preferences = loadPreferences(DEFAULT_PREFS)
    const result = simulateNotificationVolume(raw, { preferences })
    const orgDelivered = result.deliveries.filter((d) => d.recipientRole === 'organizer' && d.delivered)
    assert.equal(orgDelivered.length, 0)
  })

  it('produces per-event and per-week distribution stats', () => {
    const raw = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const preferences = loadPreferences(DEFAULT_PREFS)
    preferences.pushGlobalEnabled = true
    const result = simulateNotificationVolume(raw, { preferences })
    assert.ok(result.report.participant.perEvent.count > 0)
    assert.ok(result.report.participant.perWeek.count > 0)
    assert.equal(typeof result.report.participant.perEvent.median, 'number')
  })

  it('summarizeDistribution handles empty input', () => {
    assert.deepEqual(summarizeDistribution([]), {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      p90: 0,
      p95: 0,
    })
  })

  it('simulates AVAILABILITY_PENDING_REMINDER for unknown roster on open events (8.7)', () => {
    const raw = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const preferences = loadPreferences(DEFAULT_PREFS)
    const result = simulateNotificationVolume(raw, { preferences })
    const pending = result.deliveries.filter(
      (d) => d.intent === 'AVAILABILITY_PENDING_REMINDER' && d.delivered && d.channel === 'email',
    )
    assert.ok(pending.length > 0, 'expected pending availability reminders')
    assert.ok(
      pending.some((d) => d.recipientId === 'p2' && d.eventId === 'evt3'),
      'bob has no dispo row for evt3',
    )
    assert.ok(
      !pending.some((d) => d.recipientId === 'p1' && d.eventId === 'evt3'),
      'alice answered evt3 — excluded from unknown set',
    )
    assert.ok(
      !pending.some((d) => d.eventId === 'evt1'),
      'evt1 composition validated — not collecting',
    )
  })
})
