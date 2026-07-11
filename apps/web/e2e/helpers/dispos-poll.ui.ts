import { expect, type Locator, type Page } from '@playwright/test'

import type { E1CutoverFixture } from './e2e-api'
import { stagingMutateRequestHeaders } from './staging-csrf'

function isStagingE2eEnv(): boolean {
  return process.env.PLAYWRIGHT_STAGING_E2E === '1'
}

/** Story 5.8 — unified availability poll (replaces availability-form on Dispos tab). */

export async function expectDisposPollReady(page: Page): Promise<void> {
  await expect(page.locator('app-availability-poll')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('Sélectionnez une ou plusieurs options')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Pas disponible' })).toBeVisible()
}

export function pollCheckbox(page: Page, label: RegExp | string): Locator {
  return page.getByRole('checkbox', { name: label })
}

export function pollRow(page: Page, label: RegExp | string): Locator {
  return page.locator('.poll-row').filter({
    has: page.getByRole('checkbox', { name: label }),
  })
}

export function pollRowCounter(page: Page, label: RegExp | string): Locator {
  return pollRow(page, label).locator('.poll-row__counter')
}

/** Reset member vote on an event (local e2e profile, authenticated page.request). */
export async function seedMemberDisposRoles(
  page: Page,
  fx: E1CutoverFixture,
  eventSlug: string,
  roleKeys: string[],
  status: 'available' | 'unavailable' | 'unknown' = 'available',
): Promise<void> {
  const eventResponse = await page.request.get(
    `/v1/seasons/${fx.seasonId}/events/by-slug/${encodeURIComponent(eventSlug)}`,
  )
  if (!eventResponse.ok()) {
    throw new Error(`Event lookup failed (${eventResponse.status()}): ${await eventResponse.text()}`)
  }
  const event = (await eventResponse.json()) as { id: string }
  const headers = isStagingE2eEnv() ? await stagingMutateRequestHeaders(page) : undefined
  const putResponse = await page.request.put(
    `/v1/seasons/${fx.seasonId}/events/${event.id}/availability/me`,
    {
      headers,
      data: {
        status,
        roleKeys: status === 'available' ? roleKeys : [],
        applyVolunteerRule: true,
        comment: null,
      },
    },
  )
  if (!putResponse.ok()) {
    throw new Error(`Availability reset failed (${putResponse.status()}): ${await putResponse.text()}`)
  }
}

function availabilityPutResponse(page: Page) {
  return page.waitForResponse(
    (resp) =>
      resp.url().includes('/availability/') &&
      resp.request().method() === 'PUT' &&
      resp.status() >= 200 &&
      resp.status() < 300,
    { timeout: 30_000 },
  )
}

/** Set poll checkbox and wait for availability PUT to succeed. */
export async function setPollCheckboxAndWait(
  page: Page,
  label: RegExp | string,
  checked: boolean,
): Promise<void> {
  const box = pollCheckbox(page, label)
  const row = pollRow(page, label)
  await expect(row.locator('.poll-row__spinner')).toHaveCount(0)
  if ((await box.isChecked()) === checked) {
    return
  }
  const putPromise = availabilityPutResponse(page)
  if (checked) {
    await box.check()
  } else {
    await box.uncheck()
  }
  await putPromise
  await expect(box).toBeChecked({ checked })
}

/** Toggle a poll row and wait for availability PUT to succeed. */
export async function togglePollCheckboxAndWait(
  page: Page,
  label: RegExp | string,
): Promise<void> {
  const box = pollCheckbox(page, label)
  await setPollCheckboxAndWait(page, label, !(await box.isChecked()))
}

export function pollRowGaugeTrigger(page: Page, label: RegExp | string): Locator {
  return pollRow(page, label).locator('.poll-row__gauge-trigger').first()
}

export function pollRowPoolSegments(page: Page, label: RegExp | string): Locator {
  return pollRow(page, label).locator('[data-testid^="composition-draw-segment-"]')
}

/** Expand a poll row pool (gauge tap). */
export async function expandPollRowPool(page: Page, label: RegExp | string): Promise<void> {
  await pollRowGaugeTrigger(page, label).click()
  await expect(pollRow(page, label)).toHaveClass(/poll-row--expanded/)
}

export async function waitForPollChancesLoaded(
  page: Page,
  label: RegExp | string,
): Promise<void> {
  await page.waitForResponse(
    (resp) =>
      resp.url().includes('/availability/summary') &&
      resp.url().includes('includeChances=true') &&
      resp.request().method() === 'GET' &&
      resp.status() >= 200 &&
      resp.status() < 300,
    { timeout: 30_000 },
  )
  await expect(pollRow(page, label).locator('app-composition-pool-preview')).toBeVisible({
    timeout: 15_000,
  })
}

/** Expand pool and wait for lazy chance percents (story 5.9). */
export async function expandPollRowPoolWithChances(
  page: Page,
  label: RegExp | string,
): Promise<void> {
  const chancesPromise = waitForPollChancesLoaded(page, label)
  await expandPollRowPool(page, label)
  await chancesPromise
}

export async function tapFirstPoolSegmentAndOpenBreakdown(
  page: Page,
  label: RegExp | string,
): Promise<void> {
  const breakdownPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('/composition/chance-breakdown') &&
      resp.request().method() === 'GET' &&
      resp.status() >= 200 &&
      resp.status() < 300,
    { timeout: 30_000 },
  )
  await pollRowPoolSegments(page, label).first().click()
  await breakdownPromise
  await expect(page.locator('[data-testid="chance-breakdown-sheet"]')).toBeVisible({
    timeout: 15_000,
  })
}

/** Category scope is not a breakdown criterion — only past_participation (and optional toggles) appear. */
export async function expectNoEquityTagBreakdownLine(page: Page): Promise<void> {
  const sheet = page.locator('[data-testid="chance-breakdown-sheet"]')
  await expect(sheet.locator('[data-testid="chance-breakdown-adjustment-equity_tag"]')).toHaveCount(0)
  await expect(sheet.getByText('Compté dans un autre type de spectacle')).toHaveCount(0)
}

/** True when URL is GET …/composition (entity), not chance-breakdown or other subpaths. */
export function isCompositionEntityRequest(url: string, method: string): boolean {
  if (method !== 'GET') {
    return false
  }
  return /\/events\/[^/]+\/composition(\?|$)/.test(url) && !url.includes('chance-breakdown')
}

/** Seed a minimal availability vote for audit / Activité flows (E1-MEM-022). */
export async function seedMemberDisposVote(page: Page): Promise<void> {
  await expectDisposPollReady(page)
  const mc = pollCheckbox(page, /^MC$/)
  if (await mc.isChecked()) {
    return
  }
  await togglePollCheckboxAndWait(page, /^MC$/)
  await expect(mc).toBeChecked()
}
