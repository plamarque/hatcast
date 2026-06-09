#!/usr/bin/env node
/**
 * Profilage perf front V2 — réutilise API + front déjà lancés (start-dev / --with-push).
 *
 * Usage:
 *   node scripts/v2/profile-web-performance.mjs
 *   node scripts/v2/profile-web-performance.mjs --in-app
 *   HATCAST_PERF_EMAIL=… HATCAST_PERF_PASSWORD=… node scripts/v2/profile-web-performance.mjs
 *
 * `--in-app` : login une fois, puis navigation SPA (clics nav / onglets) — rapport `web-perf-inapp-*.json`.
 * Mode par défaut : `page.goto` par route — rapport `web-perf-*.json`.
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = process.env.HATCAST_PERF_BASE_URL ?? 'https://localhost:4200'
const EMAIL = process.env.HATCAST_PERF_EMAIL ?? 'patrice@seed.improbots.test'
const PASSWORD = process.env.HATCAST_PERF_PASSWORD ?? 'patricep'

export const DEFAULT_OUT_DIR = path.join(process.cwd(), '.local', 'perf-profile')

export function parseCliArgs(argv = process.argv.slice(2)) {
  return { inApp: argv.includes('--in-app') }
}

export function buildReportFilename(mode, now = new Date()) {
  const prefix = mode === 'in-app' ? 'web-perf-inapp' : 'web-perf'
  return `${prefix}-${now.toISOString().replace(/[:.]/g, '-')}.json`
}

function apiPath(url) {
  try {
    const u = new URL(url)
    return u.pathname + (u.search || '')
  } catch {
    return url
  }
}

function attachApiListeners(page) {
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

  return {
    detach() {
      page.off('request', onRequest)
      page.off('response', onResponse)
    },
    summarize() {
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
        apiCallCount: apiSummary.reduce((n, e) => n + e.count, 0),
        apiEndpoints: apiSummary.length,
        apiTotalMs: apiSummary.reduce((n, e) => n + e.totalMs, 0),
        apiCalls: apiSummary,
      }
    },
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
  const agendaRes = await page.request.get(
    `${BASE_URL}/v1/me/agenda?page=0&size=10&scope=upcoming`,
  )
  if (agendaRes.ok()) {
    const agenda = await agendaRes.json()
    const first = agenda.content?.[0]
    if (first) {
      return {
        troupeSlug: first.troupeSlug,
        troupeName: first.troupeName,
        seasonSlug: first.seasonSlug,
        seasonTitle: first.seasonTitle,
        eventSlug: first.eventSlug,
        eventTitle: first.title,
      }
    }
  }

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

  return {
    troupeSlug: troupe.slug,
    troupeName: troupe.name,
    seasonSlug: season.slug,
    seasonTitle: season.title,
    eventSlug: null,
    eventTitle: null,
  }
}

async function waitForReady(page, readySelector, readyTimeout = 45_000) {
  if (readySelector) {
    await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: readyTimeout })
  }
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
}

async function profileRoute(page, { label, url, readySelector, readyTimeout = 45_000 }) {
  const tracker = attachApiListeners(page)
  const startedAt = Date.now()

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await waitForReady(page, readySelector, readyTimeout)
  } finally {
    tracker.detach()
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

  const api = tracker.summarize()

  return {
    label,
    url,
    navigation: 'goto',
    wallMs,
    navTiming,
    ...api,
    longTasks,
    longTaskMs: longTasks.reduce((n, t) => n + t.durationMs, 0),
  }
}

async function profileInAppStep(
  page,
  { label, url, readySelector, navigate, readyTimeout = 45_000 },
) {
  const tracker = attachApiListeners(page)
  const stepMark = `hatcast-perf-step-${Date.now()}`
  await page.evaluate((mark) => performance.mark(mark), stepMark)
  const startedAt = Date.now()

  try {
    await navigate(page)
    await waitForReady(page, readySelector, readyTimeout)
  } finally {
    tracker.detach()
  }

  const wallMs = Date.now() - startedAt
  const longTasks = await page.evaluate(
    ({ mark, startedAtMs }) => {
      const markEntry = performance.getEntriesByName(mark, 'mark')[0]
      const since = markEntry?.startTime ?? startedAtMs
      return performance
        .getEntriesByType('longtask')
        .filter((t) => t.startTime >= since)
        .map((t) => ({ durationMs: Math.round(t.duration), startMs: Math.round(t.startTime) }))
    },
    { mark: stepMark, startedAtMs: startedAt },
  )
  const api = tracker.summarize()

  return {
    label,
    url: url ?? page.url(),
    navigation: 'in-app',
    wallMs,
    navTiming: null,
    ...api,
    longTasks,
    longTaskMs: longTasks.reduce((n, t) => n + t.durationMs, 0),
  }
}

async function clickMemberNav(page, href) {
  await page
    .locator(`app-member-nav a[href="${href}"]`)
    .filter({ visible: true })
    .first()
    .click()
  await page.waitForURL((url) => url.pathname === href, { timeout: 30_000 })
}

async function clickAgendaEventCard(page, { eventSlug, eventTitle }) {
  await page
    .locator('.agenda-card__clickable')
    .filter({ has: page.getByRole('heading', { level: 2, name: eventTitle }) })
    .first()
    .click()
  await page.waitForURL(
    (url) =>
      url.pathname.includes(`/event/${eventSlug}`) &&
      (url.searchParams.get('tab') ?? 'infos') === 'infos',
    { timeout: 30_000 },
  )
}

async function clickEventTab(page, tabParam) {
  const tabLabels = {
    infos: 'Infos',
    dispos: 'Dispos',
    equipe: 'Équipe',
  }
  const label = tabLabels[tabParam] ?? tabParam
  await page.getByRole('tab', { name: label }).click()
  await page.waitForURL((url) => url.searchParams.get('tab') === tabParam, { timeout: 30_000 })
}

const IN_APP_EVENT_STEP_LABELS = ['Event Infos', 'Event Dispos', 'Event Équipe']

export function buildInAppSkippedSteps(ctx) {
  if (ctx.eventSlug) return []
  return [
    {
      reason: 'No upcoming event in GET /v1/me/agenda',
      labels: IN_APP_EVENT_STEP_LABELS,
    },
  ]
}

export function buildInAppSteps(ctx) {
  const steps = [
    {
      label: 'Accueil todo',
      url: `${BASE_URL}/accueil`,
      readySelector: 'app-member-home-todo',
      navigate: async (page) => clickMemberNav(page, '/accueil'),
    },
    {
      label: 'Agenda membre',
      url: `${BASE_URL}/agenda`,
      readySelector: 'app-user-agenda, app-agenda',
      navigate: async (page) => clickMemberNav(page, '/agenda'),
    },
  ]

  if (ctx.eventSlug) {
    const eventBase = `${BASE_URL}/saison/${ctx.troupeSlug}/${ctx.seasonSlug}/event/${ctx.eventSlug}`
    steps.push(
      {
        label: 'Event Infos',
        url: `${eventBase}?tab=infos`,
        readySelector: 'app-event-detail',
        navigate: async (page) =>
          clickAgendaEventCard(page, { eventSlug: ctx.eventSlug, eventTitle: ctx.eventTitle }),
      },
      {
        label: 'Event Dispos',
        url: `${eventBase}?tab=dispos`,
        readySelector: 'app-event-dispos-tab',
        navigate: async (page) => clickEventTab(page, 'dispos'),
      },
      {
        label: 'Event Équipe',
        url: `${eventBase}?tab=equipe`,
        readySelector: 'app-event-equipe-tab',
        navigate: async (page) => clickEventTab(page, 'equipe'),
      },
    )
  }

  return steps
}

async function mainGoto() {
  const outJson = path.join(DEFAULT_OUT_DIR, buildReportFilename('goto'))
  fs.mkdirSync(DEFAULT_OUT_DIR, { recursive: true })

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
    mode: 'goto',
    baseURL: BASE_URL,
    loginEmail: EMAIL,
    context: ctx,
    routes: results,
  }

  fs.writeFileSync(outJson, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.stderr.write(`\nWritten: ${outJson}\n`)

  await browser.close()
}

async function mainInApp() {
  const outJson = path.join(DEFAULT_OUT_DIR, buildReportFilename('in-app'))
  fs.mkdirSync(DEFAULT_OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()

  await signIn(page)
  await page.locator('app-member-nav a[href="/accueil"], app-member-nav a[href="/agenda"]').first().waitFor({
    state: 'visible',
    timeout: 45_000,
  })

  const ctx = await discoverContext(page)
  const steps = buildInAppSteps(ctx)
  const skippedSteps = buildInAppSkippedSteps(ctx)
  if (skippedSteps.length > 0) {
    for (const skip of skippedSteps) {
      process.stderr.write(
        `Warning: skipping in-app steps (${skip.labels.join(', ')}) — ${skip.reason}\n`,
      )
    }
  }

  const results = []
  for (const step of steps) {
    process.stderr.write(`Profiling (in-app): ${step.label}…\n`)
    results.push(await profileInAppStep(page, step))
  }

  const report = {
    capturedAt: new Date().toISOString(),
    mode: 'in-app',
    baseURL: BASE_URL,
    loginEmail: EMAIL,
    context: ctx,
    skippedSteps,
    routes: results,
  }

  fs.writeFileSync(outJson, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.stderr.write(`\nWritten: ${outJson}\n`)

  await browser.close()
}

async function main() {
  const { inApp } = parseCliArgs()
  if (inApp) {
    await mainInApp()
    return
  }
  await mainGoto()
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)

if (isMain) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
