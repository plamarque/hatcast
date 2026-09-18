import { expect, test as setup } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

import { E2E_REMINDER_ORGANIZER_ID_TOKEN } from './fixtures/e1-cutover.constants'
import { isStagingE2e } from './helpers/e1-staging'
import { prepareE2ePage } from './helpers/e1.ui'
import { signInWithE2eToken } from './helpers/e2e-api'
import { signInWithEmailPassword } from './helpers/staging-auth'

const authFile = path.join(__dirname, '.auth', 'reminder-organizer.json')

type Troupe = { id: string; slug: string }
type Season = { id: string }
type Permissions = { isTroupeAdmin: boolean; isSeasonOrganizer: boolean }
type Session = { platformAdmin: boolean }

function required(value: string | undefined, name: string): string {
  if (!value?.trim()) {
    throw new Error(`Missing ${name} for availability-reminder organizer staging E2E`)
  }
  return value
}

setup('authenticate non-admin availability reminder organizer', async ({ page, baseURL }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await prepareE2ePage(page)

  if (isStagingE2e()) {
    await signInWithEmailPassword(
      page,
      required(process.env.HATCAST_E2E_REMINDER_ORGANIZER_EMAIL, 'HATCAST_E2E_REMINDER_ORGANIZER_EMAIL'),
      required(process.env.HATCAST_E2E_REMINDER_ORGANIZER_PASSWORD, 'HATCAST_E2E_REMINDER_ORGANIZER_PASSWORD'),
    )
  } else {
    await page.goto('/connexion')
    await signInWithE2eToken(page.request, E2E_REMINDER_ORGANIZER_ID_TOKEN, baseURL!)
  }

  const troupeSlug = process.env.HATCAST_E2E_TROUPE_SLUG?.trim() || (isStagingE2e() ? 'la-malice' : 'les-improbots')
  const seasonSlug = isStagingE2e()
    ? required(process.env.HATCAST_E2E_SEASON_SLUG, 'HATCAST_E2E_SEASON_SLUG')
    : 'les-improbots-2026-2027'
  const troupesResponse = await page.request.get('/v1/troupes')
  if (!troupesResponse.ok()) throw new Error('Cannot resolve availability-reminder organizer troupe')
  const troupes = (await troupesResponse.json()) as Troupe[]
  const troupe = troupes.find((candidate) => candidate.slug === troupeSlug)
  if (!troupe) throw new Error(`Reminder organizer troupe "${troupeSlug}" not found`)
  const seasonResponse = await page.request.get(`/v1/troupes/${troupe.id}/seasons/by-slug/${encodeURIComponent(seasonSlug)}`)
  if (!seasonResponse.ok()) throw new Error(`Reminder organizer season "${seasonSlug}" not found`)
  const season = (await seasonResponse.json()) as Season
  const permissionsResponse = await page.request.get(`/v1/seasons/${season.id}/permissions/me`)
  if (!permissionsResponse.ok()) throw new Error('Cannot verify availability-reminder organizer permissions')
  const permissions = (await permissionsResponse.json()) as Permissions
  const sessionResponse = await page.request.get('/v1/auth/me')
  if (!sessionResponse.ok()) throw new Error('Cannot verify availability-reminder organizer session')
  const session = (await sessionResponse.json()) as Session
  if (!permissions.isSeasonOrganizer || permissions.isTroupeAdmin || session.platformAdmin) {
    throw new Error('Availability-reminder organizer must be a season organizer without troupe admin privileges')
  }

  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)
  await page.context().storageState({ path: authFile })
})
