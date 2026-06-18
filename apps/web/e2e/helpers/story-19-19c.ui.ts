import { expect, type Page } from '@playwright/test'

import { E1_SEED } from '../fixtures/e1-cutover.constants'

/** E2E seed troupe id (Les Improbots) — stable across Flyway seeds. */
export const E2E_SEED_TROUPE_ID = 'a0000001-0000-4000-8000-000000000001'

export const E2E_TROUPE_SLUG = E1_SEED.troupeSlug

export type DrawFormulaDto = {
  id: string
  name: string
  status: string
  isSystem: boolean
  factorConfig: Array<{
    factorId: string
    enabled: boolean
    params?: Record<string, unknown>
  }>
}

export function troupeSettingsPath(troupeSlug: string, tab?: 'categories' | 'formulas'): string {
  const base = `/troupes/${troupeSlug}/admin/parametres`
  if (!tab) return base
  return `${base}?tab=${tab}`
}

export async function openTroupeSettings(page: Page, tab?: 'categories' | 'formulas'): Promise<void> {
  await page.goto(troupeSettingsPath(E2E_TROUPE_SLUG, tab))
  await expect(page.locator('app-troupe-settings')).toBeVisible({ timeout: 45_000 })
}

export async function expectFormulasTabReady(page: Page): Promise<void> {
  await expect(page.getByTestId('draw-formulas-tab')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.troupe-draw-formulas-tab__loading')).toHaveCount(0)
  await expect(page.locator('.troupe-draw-formulas-tab__error')).toHaveCount(0)
}

export async function expectCategoriesTabActive(page: Page): Promise<void> {
  await expect(page.locator('app-troupe-categories-tab')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('tab', { name: 'Catégories' })).toHaveAttribute('aria-selected', 'true')
}

export async function expectSystemFormulaReadOnly(page: Page): Promise<void> {
  const systemRow = page.locator('.troupe-draw-formulas-tab__row--system').first()
  await expect(systemRow).toBeVisible()
  await expect(systemRow.getByText('Système', { exact: true })).toBeVisible()
  await expect(systemRow.getByRole('button', { name: /^Modifier / })).toHaveCount(0)
  await expect(systemRow.getByRole('button', { name: /^Archiver / })).toHaveCount(0)
}

export async function openFormulaEditorCreate(page: Page): Promise<void> {
  await page.getByTestId('draw-formula-add').click()
  await expect(page.getByTestId('draw-formula-editor-dialog')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('draw-formula-profile-chart')).toBeVisible()
}

export async function fillFormulaName(page: Page, name: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Nom' }).fill(name)
}

export async function setPastParticipationStrength(page: Page, strength: number): Promise<void> {
  const input = page.getByTestId('draw-formula-param-past_participation-strength')
  await expect(input).toBeVisible()
  await input.evaluate((el, value) => {
    const node = el as HTMLInputElement
    node.value = String(value)
    node.dispatchEvent(new Event('input', { bubbles: true }))
    node.dispatchEvent(new Event('change', { bubbles: true }))
  }, strength)
}

export async function publishFormulaFromEditor(page: Page): Promise<void> {
  await page.getByTestId('draw-formula-publish').click()
  await expect(page.getByTestId('draw-formula-editor-dialog')).toHaveCount(0, { timeout: 30_000 })
  await expect(page.getByText('Formule publiée')).toBeVisible({ timeout: 15_000 })
}

export async function archiveFormulaByName(page: Page, name: string): Promise<void> {
  const row = page.locator('.troupe-draw-formulas-tab__row', { hasText: name })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: `Archiver ${name}` }).click()
  await expect(page.getByTestId('draw-formula-archive-dialog')).toBeVisible()
  await page
    .getByTestId('draw-formula-archive-dialog')
    .getByRole('button', { name: 'Archiver' })
    .click()
  await expect(page.getByTestId('draw-formula-archive-dialog')).toHaveCount(0, { timeout: 15_000 })
  await expect(page.getByText('Formule archivée')).toBeVisible({ timeout: 15_000 })
}

export async function findDrawFormulaByName(
  page: Page,
  troupeId: string,
  name: string,
): Promise<DrawFormulaDto | undefined> {
  const response = await page.request.get(`/v1/troupes/${troupeId}/draw-formulas`)
  if (!response.ok()) {
    throw new Error(`List draw formulas failed (${response.status()}): ${await response.text()}`)
  }
  const list = (await response.json()) as DrawFormulaDto[]
  return list.find((formula) => formula.name === name)
}
