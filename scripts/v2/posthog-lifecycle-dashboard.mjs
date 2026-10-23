/** CI-owned lifecycle dashboard. Network requires --apply or --validate. */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseRelease } from '../../apps/web/scripts/build-with-release.mjs'

const events = ['pwa_install_instructions_viewed', 'pwa_install_native_prompt_resolved', 'pwa_install_completed',
  'pwa_update_available', 'pwa_update_dismissed', 'pwa_update_apply_requested', 'pwa_update_applied',
  'release_notes_opened', 'release_notes_closed']
const sql = (query) => ({ kind: 'DataVisualizationNode', source: { kind: 'HogQLQuery', query }, display: 'ActionsTable' })
export const dashboardName = 'HatCast — Installation, mises à jour et nouveautés'
export const marker = 'hatcast-managed:lifecycle-v1'
export const insights = [
  { key: 'events', name: 'Parcours installation et mise à jour', query: sql(`SELECT event, count() AS occurrences FROM events WHERE event IN (${events.map(e => `'${e}'`).join(',')}) AND {filters} GROUP BY event ORDER BY occurrences DESC`) },
  { key: 'guidance', name: 'Aide installation : raisons et variantes', query: sql("SELECT properties.fallback_reason, properties.instruction_variant, count() FROM events WHERE event = 'pwa_install_instructions_viewed' AND {filters} GROUP BY 1, 2 ORDER BY 3 DESC") },
  { key: 'versions', name: 'Dernière release observée par personne active', query: sql("SELECT release_id, count() AS persons FROM (SELECT person_id, argMax(properties.release_id, timestamp) AS release_id FROM events WHERE event = 'app_release_observed' AND {filters} GROUP BY person_id) GROUP BY release_id ORDER BY persons DESC") },
  { key: 'lag', name: 'Personnes en retard — jours depuis la dernière release', query: sql(`WITH latest AS (
    SELECT properties.release_id AS release_id, min(timestamp) AS released_at
    FROM events WHERE event = 'hatcast_release_promoted' GROUP BY properties.release_id
    ORDER BY released_at DESC LIMIT 1
  ), observed AS (
    SELECT person_id, argMax(person.properties.name, timestamp) AS name,
      argMax(person.properties.email, timestamp) AS email,
      argMax(properties.release_id, timestamp) AS release_id, max(timestamp) AS last_seen
    FROM events WHERE event = 'app_release_observed' AND {filters} GROUP BY person_id
  ) SELECT observed.name, observed.email, observed.release_id, observed.last_seen,
    latest.release_id AS latest_release, greatest(0, floor(dateDiff('second', latest.released_at, now()) / 86400)) AS days_since_latest_release
    FROM observed CROSS JOIN latest WHERE observed.release_id != latest.release_id
    ORDER BY days_since_latest_release DESC, last_seen DESC`) },
  { key: 'notes', name: 'Nouveautés — snapshot technique à l’ouverture', query: sql(`SELECT timestamp, person.properties.name, person.properties.email,
    properties.release_id, properties.source, properties.viewport_width, properties.viewport_height,
    multiIf(properties.$device_type = 'Mobile', 'phone', properties.$device_type = 'Tablet', 'tablet', properties.$device_type = 'Desktop', 'desktop', 'unknown') AS device_type,
    properties.$os, properties.$os_version, properties.$browser, properties.$browser_version
    FROM events WHERE event = 'release_notes_opened' AND {filters} ORDER BY timestamp DESC LIMIT 500`) },
  { key: 'engagement', name: 'Nouveautés — temps visible et défilement', query: sql("SELECT properties.source, properties.visible_time_bucket, properties.scroll_bucket, count() FROM events WHERE event = 'release_notes_closed' AND {filters} GROUP BY 1, 2, 3 ORDER BY 4 DESC") },
]

export function promotionPayload(token, release, date) {
  if (!release || !Number.isFinite(Date.parse(date))) throw new Error('Invalid release or promotion date')
  const hash = createHash('sha256').update(`hatcast-release:${release.release_id}`).digest('hex').slice(0, 32)
  return { api_key: token, uuid: `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-8${hash.slice(17,20)}-${hash.slice(20)}`,
    event: 'hatcast_release_promoted', timestamp: date,
    properties: { ...release, distinct_id: randomUUID(), $process_person_profile: false } }
}

export async function capturePromotion(payload, { request = fetch, report = () => {} } = {}) {
  let response
  try {
    response = await request('https://eu.i.posthog.com/i/v0/e/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000),
    })
  } catch {
    // Transport errors can contain URLs or request details. Never print them.
    throw new Error('PostHog promotion capture transport failed')
  }
  const http = response.status
  if (!response.ok) throw new Error(`PostHog promotion capture failed (http=${http})`)
  let result
  try { result = await response.json() } catch {
    throw new Error(`PostHog promotion capture returned invalid JSON (http=${http})`)
  }
  // EU capture serializes the Rust enum as "Ok"; retain legacy numeric success.
  // https://posthog.com/docs/api#responses
  const status = result?.status === 'Ok' ? 'ok' : result?.status === 1 ? 'legacy_ok' : 'unexpected'
  const quota = result?.quota_limited
  const quotaState = quota === undefined ? 'absent' : Array.isArray(quota) ? `count:${quota.length}` : 'invalid'
  // Only fixed classifications/counts: never echo body, status text, quota values or tokens.
  const diagnostic = `http=${http}, status=${status}, quota_limited=${quotaState}`
  report(`PostHog promotion capture: ${diagnostic}`)
  if (quotaState === 'invalid') throw new Error(`PostHog promotion capture returned invalid quota metadata (${diagnostic})`)
  if (Array.isArray(quota) && quota.length) throw new Error(`PostHog promotion capture quota limited (${diagnostic})`)
  if (status === 'unexpected') throw new Error(`PostHog promotion capture returned unexpected status (${diagnostic})`)
}

export async function provision({ projectId, key, request = fetch, validate = false, report = () => {} }) {
  if (!/^\d+$/.test(projectId ?? '') || !key) throw new Error('Missing PostHog project ID or private API key')
  const root = `https://eu.posthog.com/api/projects/${projectId}/`
  async function api(path, method = 'GET', body) {
    const url = new URL(path, root)
    if (url.origin !== 'https://eu.posthog.com' || !url.pathname.startsWith(new URL(root).pathname)) throw new Error('Unexpected pagination URL')
    const response = await request(url, { method, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60_000) })
    if (!response.ok) throw new Error(`PostHog ${method} ${url.pathname} failed (${response.status})`)
    return response.json()
  }
  async function list(path) {
    const items = []
    while (path) {
      const page = await api(path)
      items.push(...page.results)
      path = page.next
    }
    return items
  }
  const dashboards = (await list('dashboards/?limit=100')).filter(d => d.description === marker && !d.deleted)
  if (dashboards.length > 1) throw new Error('Multiple CI-owned dashboards: reconcile before writing')
  const dashboard = dashboards[0] ?? await api('dashboards/', 'POST', { name: dashboardName, description: marker, filters: { date_from: '-30d' } })
  const existing = await list(`insights/?dashboards=${encodeURIComponent(JSON.stringify([dashboard.id]))}&limit=100`)
  for (const insight of insights) {
    const description = `${marker}:${insight.key}`
    const matches = existing.filter(i => i.description === description && !i.deleted)
    if (matches.length > 1) throw new Error(`Duplicate CI-owned insight ${insight.key}`)
    const body = { name: insight.name, description, query: insight.query, dashboards: [dashboard.id] }
    const saved = matches[0]
      ? await api(`insights/${matches[0].id}/`, 'PATCH', body)
      : await api('insights/', 'POST', body)
    if (validate) {
      const computed = await api(`insights/${saved.id}/?refresh=force_blocking&from_dashboard=${dashboard.id}`)
      if (computed.result === null || computed.result === undefined || computed.error) {
        throw new Error(`PostHog insight ${insight.key} did not return a computed result`)
      }
      // No rows, person data, or raw event properties are written to CI logs.
      report(`Validated insight: ${insight.key}`)
    }
  }
  return dashboard.id
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--validate')) {
    if (args.includes('--apply')) throw new Error('Choose validation or promotion, not both')
    const id = await provision({ projectId: process.env.HATCAST_POSTHOG_PROJECT_ID,
      key: process.env.HATCAST_POSTHOG_PERSONAL_API_KEY, validate: true, report: console.log })
    console.log(`Validated lifecycle dashboard_id=${id}; no promotion event sent`)
    return
  }
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({ name: dashboardName, description: marker, insights }, null, 2))
    return
  }
  const release = parseRelease(readFileSync(new URL('../../apps/web/public/version.txt', import.meta.url), 'utf8'))
  const token = process.env.HATCAST_POSTHOG_PROJECT_API_KEY
  if (!token) throw new Error('Missing PostHog project token')
  // CI records the release only after successful Cloud Run deployment. Stable UUID dedupes reruns.
  const payload = promotionPayload(token, release, process.env.HATCAST_PROMOTED_AT ?? new Date().toISOString())
  await capturePromotion(payload, { report: console.log })
  const id = await provision({ projectId: process.env.HATCAST_POSTHOG_PROJECT_ID, key: process.env.HATCAST_POSTHOG_PERSONAL_API_KEY })
  console.log(`PostHog lifecycle dashboard: https://eu.posthog.com/project/${process.env.HATCAST_POSTHOG_PROJECT_ID}/dashboard/${id}`)
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((error) => {
  // Never log HTTP bodies, headers, or tokens; our errors contain only operation/status.
  console.error(error.message)
  console.error('PostHog lifecycle synchronization failed; deployment unchanged. Check credentials and API access, then rerun the observability job.')
  process.exitCode = 1
})
