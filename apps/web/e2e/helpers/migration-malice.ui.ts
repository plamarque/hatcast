import { expect, type Page } from '@playwright/test'

import { MIGRATION_MALICE_GOLDEN } from '../fixtures/migration-malice.constants'

function parseStatCount(raw: string | null): number {
  const match = raw?.trim().match(/^(\d+)/)
  if (!match) {
    throw new Error(`Could not parse stat count from "${raw ?? ''}"`)
  }
  return Number(match[1])
}

export async function expectMemberMigrationStats(page: Page): Promise<void> {
  const { availabilities, selections, declines } = MIGRATION_MALICE_GOLDEN.memberStats

  await expect(page.locator('.member-profile__stats')).toBeVisible({ timeout: 30_000 })

  const availText = await page.locator('.member-profile__stat--avail .member-profile__stat-value').textContent()
  const selText = await page.locator('.member-profile__stat--selection .member-profile__stat-value').textContent()
  const decText = await page.locator('.member-profile__stat--decline .member-profile__stat-value').textContent()

  expect(parseStatCount(availText)).toBe(availabilities)
  expect(parseStatCount(selText)).toBe(selections)
  expect(parseStatCount(decText)).toBe(declines)
}

export async function expectSeasonAgendaLoaded(page: Page, minCards = 1): Promise<void> {
  await expect(page.locator('app-season-header')).toBeVisible({ timeout: 45_000 })
  await expect(page.locator('.agenda-card').first()).toBeVisible({ timeout: 45_000 })
  const count = await page.locator('.agenda-card').count()
  expect(count).toBeGreaterThanOrEqual(minCards)
}

export async function openSeasonHistoryView(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Historique' }).click()
  await expect(page.locator('.season-agenda')).toBeVisible({ timeout: 30_000 })
}
