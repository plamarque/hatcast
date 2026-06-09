import { isoWeekKey, toDate } from './date-utils.js'

/**
 * Aggregate delivery counts into descriptive statistics.
 */

/**
 * @param {number[]} values
 */
export function summarizeDistribution(values) {
  if (!values.length) {
    return { count: 0, mean: 0, median: 0, min: 0, max: 0, p90: 0, p95: 0 }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const sum = sorted.reduce((acc, v) => acc + v, 0)
  return {
    count: sorted.length,
    mean: round(sum / sorted.length),
    median: round(percentile(sorted, 50)),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p90: round(percentile(sorted, 90)),
    p95: round(percentile(sorted, 95)),
  }
}

/**
 * @param {number[]} sorted
 * @param {number} p 0-100
 */
function percentile(sorted, p) {
  if (!sorted.length) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  const weight = idx - lo
  return sorted[lo] * (1 - weight) + sorted[hi] * weight
}

function round(n) {
  return Math.round(n * 100) / 100
}

/**
 * @typedef {object} SimulatedDelivery
 * @property {string} recipientId
 * @property {'participant'|'organizer'} recipientRole
 * @property {string|null} eventId
 * @property {string} intent
 * @property {'push'|'email'} channel
 * @property {string} timestamp ISO
 * @property {boolean} delivered
 */

/**
 * @param {SimulatedDelivery[]} deliveries
 * @param {object} [options]
 * @param {boolean} [options.deliveredOnly=true]
 */
export function buildVolumeReport(deliveries, options = {}) {
  const deliveredOnly = options.deliveredOnly !== false
  const rows = deliveredOnly ? deliveries.filter((d) => d.delivered) : deliveries

  const byRole = {
    participant: rows.filter((d) => d.recipientRole === 'participant'),
    organizer: rows.filter((d) => d.recipientRole === 'organizer'),
  }

  return {
    totals: {
      deliveryUnits: rows.length,
      intents: countUniqueIntentUnits(rows),
      participantUnits: byRole.participant.length,
      organizerUnits: byRole.organizer.length,
    },
    participant: {
      perEvent: summarizePerEvent(byRole.participant),
      perWeek: summarizePerWeek(byRole.participant),
      perRecipient: summarizePerRecipient(byRole.participant),
    },
    organizer: {
      perEvent: summarizePerEvent(byRole.organizer),
      perWeek: summarizePerWeek(byRole.organizer),
      perRecipient: summarizePerRecipient(byRole.organizer),
    },
    intentBreakdown: intentBreakdown(rows),
  }
}

/**
 * @param {SimulatedDelivery[]} rows
 */
function summarizePerEvent(rows) {
  /** @type {Map<string, number>} */
  const perRecipientEvent = new Map()
  for (const row of rows) {
    if (!row.eventId) continue
    const key = `${row.recipientId}::${row.eventId}`
    perRecipientEvent.set(key, (perRecipientEvent.get(key) ?? 0) + 1)
  }
  return summarizeDistribution([...perRecipientEvent.values()])
}

/**
 * @param {SimulatedDelivery[]} rows
 */
function summarizePerWeek(rows) {
  /** @type {Map<string, number>} */
  const perRecipientWeek = new Map()
  for (const row of rows) {
    const week = row.weekKey ?? isoWeekKey(toDate(row.timestamp))
    const key = `${row.recipientId}::${week}`
    perRecipientWeek.set(key, (perRecipientWeek.get(key) ?? 0) + 1)
  }
  return summarizeDistribution([...perRecipientWeek.values()])
}

/**
 * @param {SimulatedDelivery[]} rows
 */
function summarizePerRecipient(rows) {
  /** @type {Map<string, number>} */
  const totals = new Map()
  for (const row of rows) {
    totals.set(row.recipientId, (totals.get(row.recipientId) ?? 0) + 1)
  }
  return summarizeDistribution([...totals.values()])
}

/**
 * @param {SimulatedDelivery[]} rows
 */
function intentBreakdown(rows) {
  /** @type {Record<string, number>} */
  const counts = {}
  for (const row of rows) {
    const key = `${row.intent}:${row.channel}`
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
}

/**
 * Unique (recipient, event, intent) tuples — one logical notification regardless of channels.
 * @param {SimulatedDelivery[]} rows
 */
function countUniqueIntentUnits(rows) {
  const set = new Set(
    rows.map((r) => `${r.recipientId}::${r.eventId ?? '_'}::${r.intent}`),
  )
  return set.size
}

/**
 * @param {ReturnType<typeof buildVolumeReport>} report
 */
export function formatTextReport(report, meta = {}) {
  const lines = []
  lines.push('HatCast V2 — simulation volume notifications')
  if (meta.seasonName) lines.push(`Saison: ${meta.seasonName}`)
  if (meta.v1SeasonId) lines.push(`V1 season id: ${meta.v1SeasonId}`)
  if (meta.source) lines.push(`Source: ${meta.source}`)
  lines.push('')
  lines.push('Hypothèses (voir scripts/v2/notification-volume/README.md):')
  for (const note of meta.assumptions || []) lines.push(`  • ${note}`)
  lines.push('')
  lines.push(`Unités livrées (push + email séparés): ${report.totals.deliveryUnits}`)
  lines.push(`Intents uniques (dédoublonnés par canal): ${report.totals.intents}`)
  lines.push('')

  for (const role of ['participant', 'organizer']) {
    const label = role === 'participant' ? 'Participants' : 'Organisateurs'
    const section = report[role]
    lines.push(`=== ${label} ===`)
    lines.push(formatDist('Par événement (par personne×spectacle)', section.perEvent))
    lines.push(formatDist('Par semaine civile (par personne×semaine)', section.perWeek))
    lines.push(formatDist('Total saison (par personne)', section.perRecipient))
    lines.push('')
  }

  lines.push('=== Répartition par intent:canal ===')
  for (const [key, count] of Object.entries(report.intentBreakdown)) {
    lines.push(`  ${key}: ${count}`)
  }
  return lines.join('\n')
}

/**
 * @param {string} title
 * @param {ReturnType<summarizeDistribution>} dist
 */
function formatDist(title, dist) {
  return [
    title,
    `  n=${dist.count}  moy=${dist.mean}  médiane=${dist.median}  min=${dist.min}  max=${dist.max}  p90=${dist.p90}`,
  ].join('\n')
}
