import { expect, test } from '@playwright/test'

import { resetE1CutoverFixture } from './helpers/e2e-api'
import { prepareE2ePage } from './helpers/e1.ui'
import {
  archiveFormulaByName,
  E2E_SEED_TROUPE_ID,
  E2E_TROUPE_SLUG,
  expectCategoriesTabActive,
  expectFormulasTabReady,
  expectSystemFormulaReadOnly,
  fillFormulaName,
  findDrawFormulaByName,
  openFormulaEditorCreate,
  openTroupeSettings,
  publishFormulaFromEditor,
  setPastParticipationStrength,
  troupeSettingsPath,
} from './helpers/story-19-19c.ui'

test.describe.configure({ mode: 'serial' })

test.describe('Recette 19.19c — formules de tirage admin (E2E)', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetE1CutoverFixture(request)
    await prepareE2ePage(page)
  })

  test('19-19c-E2E-01 — deep link onglet Formules + ligne système read-only', async ({ page }) => {
    await openTroupeSettings(page, 'formulas')
    await expectFormulasTabReady(page)
    await expect(page).toHaveURL(new RegExp(`tab=formulas`))
    await expectSystemFormulaReadOnly(page)
    await expect(page.getByTestId('draw-formula-add')).toBeVisible()
  })

  test('19-19c-E2E-02 — onglet Catégories par défaut sans ?tab=', async ({ page }) => {
    await openTroupeSettings(page)
    await expectCategoriesTabActive(page)
    await expect(page).not.toHaveURL(/tab=formulas/)
  })

  test('19-19c-E2E-03 — créer, publier avec strength 1.5, persistance API', async ({ page }) => {
    const formulaName = `E2E formule ${Date.now()}`

    await openTroupeSettings(page, 'formulas')
    await expectFormulasTabReady(page)
    await openFormulaEditorCreate(page)
    await fillFormulaName(page, formulaName)
    await setPastParticipationStrength(page, 1.5)
    await publishFormulaFromEditor(page)

    const persisted = await findDrawFormulaByName(page, E2E_SEED_TROUPE_ID, formulaName)
    expect(persisted).toBeDefined()
    expect(persisted!.status).toBe('PUBLISHED')
    const pastParticipation = persisted!.factorConfig.find(
      (entry) => entry.factorId === 'past_participation',
    )
    expect(pastParticipation?.enabled).toBe(true)
    expect(pastParticipation?.params?.['strength']).toBe(1.5)

    await expect(page.locator('.troupe-draw-formulas-tab__row', { hasText: formulaName })).toBeVisible()
  })

  test('19-19c-E2E-04 — archiver une formule custom', async ({ page }) => {
    const formulaName = `E2E archive ${Date.now()}`

    await openTroupeSettings(page, 'formulas')
    await expectFormulasTabReady(page)
    await openFormulaEditorCreate(page)
    await fillFormulaName(page, formulaName)
    await publishFormulaFromEditor(page)
    await archiveFormulaByName(page, formulaName)

    const persisted = await findDrawFormulaByName(page, E2E_SEED_TROUPE_ID, formulaName)
    expect(persisted?.status).toBe('ARCHIVED')
  })
})

test.describe('Recette 19.19c — accès membre (E2E)', () => {
  test.use({ storageState: 'e2e/.auth/member.json' })

  test.beforeEach(async ({ page, request }) => {
    await resetE1CutoverFixture(request)
    await prepareE2ePage(page)
  })

  test('19-19c-E2E-05 — membre non admin redirigé + snackbar', async ({ page }) => {
    await page.goto(troupeSettingsPath(E2E_TROUPE_SLUG, 'formulas'))
    await expect(page).toHaveURL(new RegExp(`/troupes/${E2E_TROUPE_SLUG}(?:\\?.*)?$`), {
      timeout: 30_000,
    })
    await expect(page.getByText('Accès non autorisé')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('draw-formulas-tab')).toHaveCount(0)
  })
})
