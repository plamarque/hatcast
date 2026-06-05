import { expect, type Page } from '@playwright/test'

import { ensureStagingCsrfToken, readContextCsrfToken } from './staging-csrf'
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

async function apiGet<T>(page: Page, path: string): Promise<T> {
  const response = await page.request.get(path)
  if (!response.ok()) {
    throw new Error(`GET ${path} → ${response.status()}: ${await response.text()}`)
  }
  return response.json() as Promise<T>
}

async function apiMutate<T>(
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

async function resolveTroupeId(page: Page): Promise<string> {
  const slug = troupeSlug()
  const troupes = await apiGet<TroupeListItem[]>(page, '/v1/troupes')
  const troupe = troupes.find((t) => t.slug === slug)
  if (!troupe) {
    throw new Error(`Troupe "${slug}" not found in orga /v1/troupes`)
  }
  return troupe.id
}

async function findTroupeMember(page: Page, troupeId: string, email: string): Promise<TroupeMember> {
  const target = email.toLowerCase()
  for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
    const paged = await apiGet<PagedMembers>(
      page,
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

async function findSeasonParticipant(
  page: Page,
  troupeId: string,
  email: string,
): Promise<{ season: SeasonRef; participant: SeasonParticipant }> {
  const season = await apiGet<SeasonRef>(
    page,
    `/v1/troupes/${troupeId}/seasons/by-slug/${encodeURIComponent(seasonSlug())}`,
  )
  const participants = await apiGet<SeasonParticipant[]>(
    page,
    `/v1/seasons/${season.id}/participants`,
  )
  const target = email.toLowerCase()
  const row = participants.find((p) => p.email?.toLowerCase() === target)
  if (!row) {
    throw new Error(
      `Season participant not found for ${email} on ${seasonSlug()} — check migration/import`,
    )
  }
  return { season, participant: row }
}

async function memberNeedsReactivation(page: Page, troupeId: string, email: string): Promise<boolean> {
  const membership = await findTroupeMember(page, troupeId, email)
  if (membership.status !== 'ACTIVE') {
    return true
  }
  const { participant } = await findSeasonParticipant(page, troupeId, email)
  return participant.status !== 'ACTIVE'
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
  const troupeId = await resolveTroupeId(orgaPage)
  if (!(await memberNeedsReactivation(orgaPage, troupeId, email))) {
    return
  }

  const csrfToken =
    (await readContextCsrfToken(orgaPage)) ?? (await ensureStagingCsrfToken(orgaPage))
  const membership = await findTroupeMember(orgaPage, troupeId, email)
  if (membership.status !== 'ACTIVE') {
    await apiMutate<TroupeMember>(
      orgaPage,
      csrfToken,
      'PATCH',
      `/v1/troupes/${troupeId}/members/${membership.id}`,
      { status: 'ACTIVE' },
    )
  }

  const { season, participant } = await findSeasonParticipant(orgaPage, troupeId, email)
  if (participant.status !== 'ACTIVE') {
    await apiMutate<void>(
      orgaPage,
      csrfToken,
      'POST',
      `/v1/seasons/${season.id}/participants/${participant.id}/reinclude`,
    )
  }
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
  const csrfToken = await ensureStagingCsrfToken(page)
  await apiMutate<void>(page, csrfToken, 'POST', '/v1/auth/logout')
  await signInStagingE2eMember(page)
}
