import { expect, type Page } from '@playwright/test'

import { signInWithEmailPassword } from './staging-auth'

type TroupeListItem = { id: string; slug: string }
type TroupeMember = {
  id: string
  email: string | null
  status: 'ACTIVE' | 'INACTIVE'
}
type PagedMembers = {
  content: TroupeMember[]
  totalPages: number
}
type SeasonRef = { id: string; slug: string }
type SeasonParticipant = {
  id: string
  email: string | null
  status: 'ACTIVE' | 'REMOVED'
}

function troupeSlug(): string {
  return process.env.HATCAST_E2E_TROUPE_SLUG?.trim() || 'la-malice'
}

function seasonSlug(): string {
  const slug = process.env.HATCAST_E2E_SEASON_SLUG?.trim()
  if (!slug) {
    throw new Error('Missing HATCAST_E2E_SEASON_SLUG for staging member bootstrap')
  }
  return slug
}

function memberEmail(): string {
  const email = process.env.HATCAST_E2E_MEMBER_EMAIL?.trim()
  if (!email) {
    throw new Error('Missing HATCAST_E2E_MEMBER_EMAIL for staging member bootstrap')
  }
  return email
}

/** Same as apps/web/src/app/core/http/hatcast-csrf.ts */
async function readBrowserCsrfToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const prefix = 'XSRF-TOKEN='
    const row = document.cookie.split('; ').find((c) => c.startsWith(prefix))
    return row ? decodeURIComponent(row.slice(prefix.length)) : null
  })
}

async function readContextCsrfToken(page: Page): Promise<string | null> {
  const cookies = await page.context().cookies()
  const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN')?.value
  return xsrf ? decodeURIComponent(xsrf) : null
}

/** Wait until Angular has primed Spring CSRF (first /v1/* after agenda load). */
async function waitForCsrfToken(page: Page, timeoutMs = 30_000): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const token = (await readBrowserCsrfToken(page)) ?? (await readContextCsrfToken(page))
    if (token) {
      return token
    }
    await page.waitForTimeout(250)
  }
  throw new Error('Timed out waiting for XSRF-TOKEN after agenda load (staging CSRF bootstrap)')
}

/** Load agenda so the SPA issues authenticated GET /v1/* and sets XSRF-TOKEN. */
async function primeOrgaApiSession(page: Page): Promise<string> {
  const agendaResponse = page.waitForResponse(
    (res) => res.request().method() === 'GET' && /\/v1\//.test(res.url()) && res.ok(),
    { timeout: 30_000 },
  )
  await page.goto('/agenda')
  await agendaResponse.catch(() => null)
  await expect(page.getByRole('tab', { name: 'Agenda' })).toBeVisible({ timeout: 30_000 })
  return waitForCsrfToken(page)
}

async function apiJson<T>(
  page: Page,
  csrfToken: string,
  method: string,
  path: string,
  data?: unknown,
): Promise<T> {
  const response = await page.request.fetch(path, {
    method,
    headers: {
      'X-XSRF-TOKEN': csrfToken,
      ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    data,
  })
  if (!response.ok()) {
    throw new Error(`${method} ${path} → ${response.status()}: ${await response.text()}`)
  }
  if (response.status() === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

async function resolveTroupeId(page: Page, csrfToken: string): Promise<string> {
  const slug = troupeSlug()
  const troupes = await apiJson<TroupeListItem[]>(page, csrfToken, 'GET', '/v1/troupes')
  const troupe = troupes.find((t) => t.slug === slug)
  if (!troupe) {
    throw new Error(`Troupe "${slug}" not found in orga /v1/troupes`)
  }
  return troupe.id
}

async function findTroupeMember(
  page: Page,
  csrfToken: string,
  troupeId: string,
  email: string,
): Promise<TroupeMember> {
  const target = email.toLowerCase()
  for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
    const paged = await apiJson<PagedMembers>(
      page,
      csrfToken,
      'GET',
      `/v1/troupes/${troupeId}/members?page=${pageIndex}&size=100`,
    )
    const hit = paged.content.find((m) => m.email?.toLowerCase() === target)
    if (hit) {
      return hit
    }
    if (pageIndex + 1 >= paged.totalPages) {
      break
    }
  }
  throw new Error(`Troupe member not found for ${email} (troupe ${troupeId})`)
}

async function ensureTroupeMembershipActive(
  page: Page,
  csrfToken: string,
  troupeId: string,
  membership: TroupeMember,
): Promise<void> {
  if (membership.status === 'ACTIVE') {
    return
  }
  await apiJson<TroupeMember>(
    page,
    csrfToken,
    'PATCH',
    `/v1/troupes/${troupeId}/members/${membership.id}`,
    { status: 'ACTIVE' },
  )
}

async function ensureSeasonParticipantActive(
  page: Page,
  csrfToken: string,
  troupeId: string,
  email: string,
): Promise<void> {
  const season = await apiJson<SeasonRef>(
    page,
    csrfToken,
    'GET',
    `/v1/troupes/${troupeId}/seasons/by-slug/${encodeURIComponent(seasonSlug())}`,
  )
  const participants = await apiJson<SeasonParticipant[]>(
    page,
    csrfToken,
    'GET',
    `/v1/seasons/${season.id}/participants`,
  )
  const target = email.toLowerCase()
  const row = participants.find((p) => p.email?.toLowerCase() === target)
  if (!row) {
    throw new Error(
      `Season participant not found for ${email} on ${seasonSlug()} — check migration/import`,
    )
  }
  if (row.status === 'ACTIVE') {
    return
  }
  await apiJson<void>(
    page,
    csrfToken,
    'POST',
    `/v1/seasons/${season.id}/participants/${row.id}/reinclude`,
  )
}

/**
 * Staging T2 : réactive adhésion troupe + roster saison (session orga déjà authentifiée).
 * Idempotent si le membre est déjà ACTIVE.
 */
export async function reactivateStagingE2eMemberAsOrga(orgaPage: Page): Promise<void> {
  if (process.env.HATCAST_E2E_SKIP_MEMBER_REACTIVATE === '1') {
    return
  }

  const email = memberEmail()
  const csrfToken = await primeOrgaApiSession(orgaPage)
  const troupeId = await resolveTroupeId(orgaPage, csrfToken)
  const membership = await findTroupeMember(orgaPage, csrfToken, troupeId, email)
  await ensureTroupeMembershipActive(orgaPage, csrfToken, troupeId, membership)
  await ensureSeasonParticipantActive(orgaPage, csrfToken, troupeId, email)
}

/** Login membre E2E sur staging (après réactivation orga). */
export async function signInStagingE2eMember(page: Page): Promise<void> {
  const email = memberEmail()
  const password = process.env.HATCAST_E2E_MEMBER_PASSWORD
  if (!password) {
    throw new Error('Missing HATCAST_E2E_MEMBER_PASSWORD for staging member bootstrap')
  }
  await signInWithEmailPassword(page, email, password)
  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)
}

/**
 * Staging T2 : orga réactive puis login membre sur la même page (fallback local / manuel).
 * Préférer admin.json + reactivateStagingE2eMemberAsOrga en CI staging.
 */
export async function ensureStagingE2eMemberReady(page: Page): Promise<void> {
  if (process.env.HATCAST_E2E_SKIP_MEMBER_REACTIVATE === '1') {
    await signInStagingE2eMember(page)
    return
  }

  const orgaEmail = process.env.HATCAST_E2E_ORGA_EMAIL
  const orgaPassword = process.env.HATCAST_E2E_ORGA_PASSWORD
  if (!orgaEmail || !orgaPassword) {
    throw new Error('Missing orga credentials for staging member bootstrap')
  }

  await signInWithEmailPassword(page, orgaEmail, orgaPassword)
  await reactivateStagingE2eMemberAsOrga(page)
  await apiJson<void>(page, await waitForCsrfToken(page), 'POST', '/v1/auth/logout')
  await signInStagingE2eMember(page)
}
