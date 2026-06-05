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

/** Same as apps/web/src/app/core/http/hatcast-csrf.ts — document.cookie, not Playwright cookie jar. */
async function readBrowserCsrfToken(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const prefix = 'XSRF-TOKEN='
    const row = document.cookie.split('; ').find((c) => c.startsWith(prefix))
    return row ? decodeURIComponent(row.slice(prefix.length)) : null
  })
}

/** Prime Spring CSRF via in-page fetch (sets document.cookie like Angular HttpClient). */
async function ensureBrowserCsrfToken(page: Page): Promise<string> {
  let token = await readBrowserCsrfToken(page)
  if (token) {
    return token
  }

  const primed = await page.evaluate(async () => {
    const res = await fetch('/v1/auth/me', { credentials: 'include' })
    if (!res.ok) {
      return { ok: false as const, status: res.status, body: await res.text() }
    }
    const prefix = 'XSRF-TOKEN='
    const row = document.cookie.split('; ').find((c) => c.startsWith(prefix))
    return {
      ok: true as const,
      token: row ? decodeURIComponent(row.slice(prefix.length)) : null,
    }
  })

  if (!primed.ok) {
    throw new Error(`CSRF bootstrap GET /v1/auth/me → ${primed.status}: ${primed.body}`)
  }
  if (!primed.token) {
    throw new Error('Missing XSRF-TOKEN in document.cookie after /v1/auth/me (staging CSRF bootstrap)')
  }
  return primed.token
}

async function browserApiJson<T>(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  await ensureBrowserCsrfToken(page)
  const result = await page.evaluate(
    async ({ method, path, body }) => {
      const prefix = 'XSRF-TOKEN='
      const row = document.cookie.split('; ').find((c) => c.startsWith(prefix))
      const xsrf = row ? decodeURIComponent(row.slice(prefix.length)) : ''
      const headers: Record<string, string> = {}
      if (xsrf) {
        headers['X-XSRF-TOKEN'] = xsrf
      }
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
      }
      const res = await fetch(path, {
        method,
        credentials: 'include',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
      const text = await res.text()
      if (!res.ok) {
        return { ok: false as const, status: res.status, text }
      }
      if (res.status === 204 || text.length === 0) {
        return { ok: true as const, data: null }
      }
      return { ok: true as const, data: JSON.parse(text) as unknown }
    },
    { method, path, body },
  )

  if (!result.ok) {
    throw new Error(`${method} ${path} → ${result.status}: ${result.text}`)
  }
  return result.data as T
}

async function resolveTroupeId(page: Page): Promise<string> {
  const slug = troupeSlug()
  const troupes = await browserApiJson<TroupeListItem[]>(page, 'GET', '/v1/troupes')
  const troupe = troupes.find((t) => t.slug === slug)
  if (!troupe) {
    throw new Error(`Troupe "${slug}" not found in orga /v1/troupes`)
  }
  return troupe.id
}

async function findTroupeMember(page: Page, troupeId: string, email: string): Promise<TroupeMember> {
  const target = email.toLowerCase()
  for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
    const paged = await browserApiJson<PagedMembers>(
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
  await browserApiJson<TroupeMember>(
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
  const season = await browserApiJson<SeasonRef>(
    page,
    'GET',
    `/v1/troupes/${troupeId}/seasons/by-slug/${encodeURIComponent(seasonSlug())}`,
  )
  const participants = await browserApiJson<SeasonParticipant[]>(
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
  await browserApiJson<void>(
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

  const troupeId = await resolveTroupeId(page)
  const membership = await findTroupeMember(page, troupeId, email)
  await ensureTroupeMembershipActive(page, troupeId, membership)
  await ensureSeasonParticipantActive(page, troupeId, email)

  await browserApiJson<void>(page, 'POST', '/v1/auth/logout')
  await signInWithEmailPassword(page, email, memberPassword)
  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)
}
