import { expect, test } from '@playwright/test'

import { resetE1CutoverFixture } from './helpers/e2e-api'
import { prepareE2ePage } from './helpers/e1.ui'
import {
  createTroupeCategory,
  E2E_SEED_TROUPE_ID,
  expectFormulasTabReady,
  expectSystemFormulaReadOnly,
  fillFormulaName,
  findDrawFormulaByName,
  getTroupeDrawPolicy,
  openFormulaEditorCreate,
  openTroupeSettings,
  publishFormulaFromEditor,
} from './helpers/story-19-19c.ui'

test.describe.configure({ mode: 'serial' })

test.describe('Recette 19.20 — Appliquée à (E2E)', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetE1CutoverFixture(request)
    await prepareE2ePage(page)
  })

  test('19-20-E2E-01 — Formule standard, pas d’onglet Politiques', async ({ page }) => {
    await openTroupeSettings(page, 'formulas')
    await expectFormulasTabReady(page)
    await expectSystemFormulaReadOnly(page)
    await expect(page.getByRole('tab', { name: 'Politiques' })).toHaveCount(0)
    await expect(page.getByRole('tab')).toHaveCount(2)
    await expect(page.getByText('Comprendre les cotes')).toHaveCount(0)
    await expect(
      page.getByText(
        'Les formules définissent comment HatCast ajuste les cotes. Assigne une formule à une catégorie pour l’imposer à tous ses spectacles.',
      ),
    ).toHaveCount(0)
    await expect(page.getByText('Spectacles et catégories sans formule dédiée')).toBeVisible()
    await expect(page.getByText('politiques seront configurées ensuite')).toHaveCount(0)
  })

  test('19-20-E2E-02 — tap + Catégorie persiste une règle MANDATORY', async ({ page }) => {
    const formulaName = `E2E politique ${Date.now()}`
    const categoryLabel = `Cat ${Date.now()}`
    const category = await createTroupeCategory(page, categoryLabel)

    await openTroupeSettings(page, 'formulas')
    await expectFormulasTabReady(page)
    await openFormulaEditorCreate(page)
    await fillFormulaName(page, formulaName)
    await publishFormulaFromEditor(page)

    const formula = await findDrawFormulaByName(page, E2E_SEED_TROUPE_ID, formulaName)
    expect(formula).toBeDefined()

    const row = page.locator('.troupe-draw-formulas-tab__row', { hasText: formulaName })
    await expect(row.getByTestId(`draw-formula-add-category-${formula!.id}`)).toBeVisible()
    await row.getByTestId(`draw-formula-add-category-${formula!.id}`).click()
    await page.getByTestId(`draw-formula-assign-${category.slug}`).click()
    await expect(row.getByText(categoryLabel, { exact: true })).toBeVisible({ timeout: 15_000 })

    const policy = await getTroupeDrawPolicy(page)
    expect(policy.status).toBe(200)
    expect(policy.body?.categoryRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: category.slug,
          mode: 'MANDATORY',
          mandatoryFormulaId: formula!.id,
        }),
      ]),
    )
  })

  test('19-20-E2E-03 — unassign × retire la règle MANDATORY', async ({ page }) => {
    const formulaName = `E2E unassign ${Date.now()}`
    const categoryLabel = `Cat unassign ${Date.now()}`
    const category = await createTroupeCategory(page, categoryLabel)

    await openTroupeSettings(page, 'formulas')
    await expectFormulasTabReady(page)
    await openFormulaEditorCreate(page)
    await fillFormulaName(page, formulaName)
    await publishFormulaFromEditor(page)

    const formula = await findDrawFormulaByName(page, E2E_SEED_TROUPE_ID, formulaName)
    expect(formula).toBeDefined()

    const row = page.locator('.troupe-draw-formulas-tab__row', { hasText: formulaName })
    await row.getByTestId(`draw-formula-add-category-${formula!.id}`).click()
    await page.getByTestId(`draw-formula-assign-${category.slug}`).click()
    await expect(row.getByText(categoryLabel, { exact: true })).toBeVisible({ timeout: 15_000 })

    await row.getByTestId(`draw-formula-unassign-${category.slug}`).click()
    await expect(row.getByText(categoryLabel, { exact: true })).toHaveCount(0, { timeout: 15_000 })

    const policy = await getTroupeDrawPolicy(page)
    expect(policy.status).toBe(200)
    expect(policy.body?.categoryRules ?? []).toEqual([])
  })
})
