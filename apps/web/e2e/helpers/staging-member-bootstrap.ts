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

async function csrfHeaders(page: Page): Promise<Record<string, string>> {
  const cookies = await page.context().cookies()
  const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN')?.value
  return xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}
}

/** Prime Spring CSRF cookie (GET is exempt; PATCH/POST require X-XSRF-TOKEN). */
async function ensureCsrfToken(page: Page): Promise<void> {
  const me = await page.request.get('/v1/auth/me')
  if (!me.ok()) {
    throw new Error(`CSRF bootstrap GET /v1/auth/me → ${me.status()}: ${await me.text()}`)
  }
  const cookies = await page.context().cookies()
  if (!cookies.some((c) => c.name === 'XSRF-TOKEN')) {
    throw new Error('Missing XSRF-TOKEN cookie after /v1/auth/me (staging CSRF bootstrap)')
  }
}

async function apiJson<T>(page: Page, method: string, path: string, data?: unknown): Promise<T> {
  const headers = await csrfHeaders(page)
  const response = await page.request.fetch(path, {
    method,
    headers: {
      ...headers,
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

async function resolveTroupeId(page: Page): Promise<string> {
  const slug = troupeSlug()
  const troupes = await apiJson<TroupeListItem[]>(page, 'GET', '/v1/troupes')
  const troupe = troupes.find((t) => t.slug === slug)
  if (!troupe) {
    throw new Error(`Troupe "${slug}" not found in orga /v1/troupes`)
  }
  return troupe.id
}

async function findTroupeMember(page: Page, troupeId: string, email: string): Promise<TroupeMember> {
  const target = email.toLowerCase()
  for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
    const paged = await apiJson<PagedMembers>(
      page,
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
  troupeId: string,
  membership: TroupeMember,
): Promise<void> {
  if (membership.status === 'ACTIVE') {
    return
  }
  await apiJson<TroupeMember>(
    page,
    'PATCH',
    `/v1/troupes/${troupeId}/members/${membership.id}`,
    { status: 'ACTIVE' },
  )
}

async function ensureSeasonParticipantActive(
  page: Page,
  troupeId: string,
  email: string,
): Promise<void> {
  const season = await apiJson<SeasonRef>(
    page,
    'GET',
    `/v1/troupes/${troupeId}/seasons/by-slug/${encodeURIComponent(seasonSlug())}`,
  )
  const participants = await apiJson<SeasonParticipant[]>(
    page,
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
    'POST',
    `/v1/seasons/${season.id}/participants/${row.id}/reinclude`,
  )
}

/**
 * Staging T2 : orga réactive adhésion troupe + roster saison du compte membre E2E, puis login membre.
 * Idempotent si le membre est déjà ACTIVE.
 */
export async function ensureStagingE2eMemberReady(page: Page): Promise<void> {
  if (process.env.HATCAST_E2E_SKIP_MEMBER_REACTIVATE === '1') {
    const email = memberEmail()
    const password = process.env.HATCAST_E2E_MEMBER_PASSWORD
    if (!password) {
      throw new Error('Missing HATCAST_E2E_MEMBER_PASSWORD')
    }
    await signInWithEmailPassword(page, email, password)
    return
  }

  const orgaEmail = process.env.HATCAST_E2E_ORGA_EMAIL
  const orgaPassword = process.env.HATCAST_E2E_ORGA_PASSWORD
  const email = memberEmail()
  const memberPassword = process.env.HATCAST_E2E_MEMBER_PASSWORD
  if (!orgaEmail || !orgaPassword || !memberPassword) {
    throw new Error('Missing orga/member credentials for staging member bootstrap')
  }

  await signInWithEmailPassword(page, orgaEmail, orgaPassword)
  await page.goto('/agenda')
  await ensureCsrfToken(page)

  const troupeId = await resolveTroupeId(page)
  const membership = await findTroupeMember(page, troupeId, email)
  await ensureTroupeMembershipActive(page, troupeId, membership)
  await ensureSeasonParticipantActive(page, troupeId, email)

  await apiJson<void>(page, 'POST', '/v1/auth/logout')
  await signInWithEmailPassword(page, email, memberPassword)
  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)
}
