#!/usr/bin/env node
/**
 * Profilage perf front V2 — réutilise API + front déjà lancés (start-dev / --with-push).
 *
 * Usage:
 *   node scripts/v2/profile-web-performance.mjs
 *   HATCAST_PERF_EMAIL=… HATCAST_PERF_PASSWORD=… node scripts/v2/profile-web-performance.mjs
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = process.env.HATCAST_PERF_BASE_URL ?? 'https://localhost:4200'
const EMAIL = process.env.HATCAST_PERF_EMAIL ?? 'patrice@seed.improbots.test'
const PASSWORD = process.env.HATCAST_PERF_PASSWORD ?? 'patricep'

const OUT_DIR = path.join(process.cwd(), '.local', 'perf-profile')
const OUT_JSON = path.join(OUT_DIR, `web-perf-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)

function apiPath(url) {
  try {
    const u = new URL(url)
    return u.pathname + (u.search || '')
  } catch {
    return url
  }
}

async function signIn(page) {
  await page.addInitScript(() => {
    localStorage.setItem('hatcast-pwa-banner-dismissed', String(Date.now()))
    localStorage.setItem('hatcast-pwa-installed', '1')
  })
  await page.goto(`${BASE_URL}/connexion`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Email', { exact: true }).fill(EMAIL)
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL((url) => !url.pathname.includes('/connexion'), { timeout: 90_000 })
}

async function discoverContext(page) {
  const troupesRes = await page.request.get(`${BASE_URL}/v1/troupes`)
  if (!troupesRes.ok()) {
    throw new Error(`GET /v1/troupes failed (${troupesRes.status()})`)
  }
  const troupes = await troupesRes.json()
  const troupe = troupes.find((t) => t.slug) ?? troupes[0]
  if (!troupe) throw new Error('No troupe found for perf profile')

  const seasonsRes = await page.request.get(
    `${BASE_URL}/v1/troupes/${encodeURIComponent(troupe.id)}/seasons?page=0&size=10`,
  )
  if (!seasonsRes.ok()) {
    throw new Error(`GET seasons failed (${seasonsRes.status()})`)
  }
  const seasonsPage = await seasonsRes.json()
  const season = (seasonsPage.content ?? []).find((s) => !s.archived) ?? seasonsPage.content?.[0]
  if (!season) throw new Error('No season found for perf profile')

  const eventsRes = await page.request.get(
    `${BASE_URL}/v1/seasons/${encodeURIComponent(season.id)}/events?page=0&size=10&scope=upcoming`,
  )
  if (!eventsRes.ok()) {
    throw new Error(`GET events failed (${eventsRes.status()})`)
  }
  const eventsPage = await eventsRes.json()
  const event = eventsPage.content?.[0] ?? null

  return {
    troupeSlug: troupe.slug,
    troupeName: troupe.name,
    seasonSlug: season.slug,
    seasonTitle: season.title,
    eventSlug: event?.slug ?? null,
    eventTitle: event?.title ?? null,
  }
}

async function profileRoute(page, { label, url, readySelector, readyTimeout = 45_000 }) {
  const apiCalls = new Map()
  const pending = new Map()

  const onRequest = (request) => {
    if (!request.url().includes('/v1/')) return
    pending.set(request, Date.now())
  }

  const onResponse = (response) => {
    const req = response.request()
    if (!req.url().includes('/v1/')) return
    const started = pending.get(req) ?? Date.now()
    pending.delete(req)
    const durationMs = Date.now() - started
    const key = `${req.method()} ${apiPath(req.url())}`
    const entry = apiCalls.get(key) ?? { count: 0, totalMs: 0, maxMs: 0, statuses: [] }
    entry.count += 1
    entry.totalMs += durationMs
    entry.maxMs = Math.max(entry.maxMs, durationMs)
    entry.statuses.push(response.status())
    apiCalls.set(key, entry)
  }

  page.on('request', onRequest)
  page.on('response', onResponse)
  const startedAt = Date.now()

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    if (readySelector) {
      await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: readyTimeout })
    }
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
  } finally {
    page.off('request', onRequest)
    page.off('response', onResponse)
  }

  const wallMs = Date.now() - startedAt
  const navTiming = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    if (!nav) return null
    return {
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
      loadEventMs: Math.round(nav.loadEventEnd),
      transferSize: nav.transferSize ?? null,
      encodedBodySize: nav.encodedBodySize ?? null,
    }
  })

  const longTasks = await page.evaluate(() =>
    performance
      .getEntriesByType('longtask')
      .map((t) => ({ durationMs: Math.round(t.duration), startMs: Math.round(t.startTime) })),
  )

  const apiSummary = [...apiCalls.entries()]
    .map(([key, v]) => ({
      endpoint: key,
      count: v.count,
      totalMs: Math.round(v.totalMs),
      maxMs: Math.round(v.maxMs),
      statuses: v.statuses,
    }))
    .sort((a, b) => b.totalMs - a.totalMs)

  return {
    label,
    url,
    wallMs,
    navTiming,
    apiCallCount: apiSummary.reduce((n, e) => n + e.count, 0),
    apiEndpoints: apiSummary.length,
    apiTotalMs: apiSummary.reduce((n, e) => n + e.totalMs, 0),
    apiCalls: apiSummary,
    longTasks,
    longTaskMs: longTasks.reduce((n, t) => n + t.durationMs, 0),
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()

  await signIn(page)
  const ctx = await discoverContext(page)

  const routes = [
    { label: 'Accueil todo', url: `${BASE_URL}/accueil`, readySelector: 'app-member-home-todo' },
    { label: 'Agenda membre', url: `${BASE_URL}/agenda`, readySelector: 'app-user-agenda, app-agenda' },
    { label: 'Liste troupes', url: `${BASE_URL}/troupes`, readySelector: 'app-troupes-list' },
    {
      label: 'Hub troupe',
      url: `${BASE_URL}/troupes/${ctx.troupeSlug}`,
      readySelector: 'app-troupe-hub',
    },
    {
      label: 'Saison agenda',
      url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}`,
      readySelector: 'app-season-header',
    },
    {
      label: 'Saison historique',
      url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}?view=history`,
      readySelector: 'app-season-header',
    },
    {
      label: 'Saison stats',
      url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}?view=stats`,
      readySelector: 'app-season-statistics, .season-statistics__status, .season-statistics__empty',
    },
    { label: 'Compte profil', url: `${BASE_URL}/compte`, readySelector: 'app-account-profile-tab' },
  ]

  if (ctx.eventSlug) {
    routes.push(
      {
        label: 'Event Infos',
        url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}/event/${ctx.eventSlug}?tab=infos`,
        readySelector: 'app-event-detail',
      },
      {
        label: 'Event Dispos',
        url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}/event/${ctx.eventSlug}?tab=dispos`,
        readySelector: 'app-event-dispos-tab',
      },
      {
        label: 'Event Équipe',
        url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}/event/${ctx.eventSlug}?tab=equipe`,
        readySelector: 'app-event-equipe-tab',
      },
      {
        label: 'Event Activité',
        url: `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}/event/${ctx.eventSlug}?tab=activite`,
        readySelector: 'app-event-activite-tab',
      },
    )
  }

  const results = []
  for (const route of routes) {
    process.stderr.write(`Profiling: ${route.label}…\n`)
    results.push(await profileRoute(page, route))
  }

  const report = {
    capturedAt: new Date().toISOString(),
    baseURL: BASE_URL,
    loginEmail: EMAIL,
    context: ctx,
    routes: results,
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.stderr.write(`\nWritten: ${OUT_JSON}\n`)

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
