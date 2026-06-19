import { expect, test } from '@playwright/test'

import { resetE1CutoverFixture, type E1CutoverFixture } from './helpers/e2e-api'
import { prepareE2ePage, runWeightedDraw } from './helpers/e1.ui'
import {
  chanceSignature,
  ensureChoicePolicyWithTwoFormulas,
  expectEquipePolicyLoaded,
  fetchPoolPreviewSegments,
  getEffectiveDrawPolicy,
  openDrawEventEquipeTab,
  openRolePoolPreview,
  resolveEventId,
  selectDrawFormulaFromOverflowMenu,
  setChoiceSingleFormulaPolicy,
  setMandatoryDrawPolicy,
  listDrawFormulas,
} from './helpers/story-19-21.ui'

test.describe.configure({ mode: 'serial' })

test.describe('Story 19.21 — draw formula choice (E2E-WD)', () => {
  let fx: E1CutoverFixture

  test.beforeEach(async ({ page, request }) => {
    fx = await resetE1CutoverFixture(request)
    await prepareE2ePage(page)
  })

  test('E2E-WD-01 — CHOICE ≥2: no chip, overflow ⋮ present', async ({ page }) => {
    await ensureChoicePolicyWithTwoFormulas(page)
    await openDrawEventEquipeTab(page, fx)
    await expectEquipePolicyLoaded(page)

    await expect(page.getByTestId('composition-draw-formula-chip')).toHaveCount(0)
    await expect(page.getByTestId('composition-actions-overflow')).toBeVisible()
  })

  test('E2E-WD-02 — MANDATORY: no formula menu, no ⋮ when overflow empty', async ({ page }) => {
    const system = (await listDrawFormulas(page)).find(
      (formula) => formula.isSystem && formula.status === 'PUBLISHED',
    )
    expect(system).toBeDefined()
    await setMandatoryDrawPolicy(page, system!.id)

    await openDrawEventEquipeTab(page, fx)
    await expectEquipePolicyLoaded(page)

    await expect(page.getByTestId('composition-draw-formula-menu')).toHaveCount(0)
    await expect(page.getByTestId('composition-actions-overflow')).toHaveCount(0)
  })

  test('E2E-WD-03 — CHOICE 1 formule: UI formule absente', async ({ page }) => {
    const system = (await listDrawFormulas(page)).find(
      (formula) => formula.isSystem && formula.status === 'PUBLISHED',
    )
    expect(system).toBeDefined()
    await setChoiceSingleFormulaPolicy(page, system!.id)

    await openDrawEventEquipeTab(page, fx)
    await expectEquipePolicyLoaded(page)

    await expect(page.getByTestId('composition-draw-formula-menu')).toHaveCount(0)
    await expect(page.getByTestId('composition-actions-overflow')).toHaveCount(0)
  })

  test('E2E-WD-04 — CHOICE ≥2 tirage direct avec effectiveFormulaId', async ({ page }) => {
    const formulas = await ensureChoicePolicyWithTwoFormulas(page)
    const eventId = await resolveEventId(page, fx.seasonId, fx.eventDrawSlug)
    const policyBeforeDraw = await getEffectiveDrawPolicy(page, fx.seasonId, eventId)
    expect(policyBeforeDraw.selectorVisible).toBe(true)
    expect(policyBeforeDraw.effectiveFormulaId).toBeTruthy()

    await openDrawEventEquipeTab(page, fx)
    await runWeightedDraw(page)

    await expect(page.getByRole('button', { name: 'Tirer au sort' })).toBeEnabled({
      timeout: 60_000,
    })
  })

  test('E2E-WD-05 — menu overflow: autre formule rafraîchit le pool preview', async ({ page }) => {
    const formulas = await ensureChoicePolicyWithTwoFormulas(page)
    const eventId = await resolveEventId(page, fx.seasonId, fx.eventDrawSlug)

    await openDrawEventEquipeTab(page, fx)
    await openRolePoolPreview(page)

    const previewB = page.waitForResponse(
      (response) =>
        response.url().includes('/composition/pool-preview') &&
        response.url().includes(`formulaId=${encodeURIComponent(formulas.formulaBId)}`) &&
        response.ok(),
    )
    await selectDrawFormulaFromOverflowMenu(page, formulas.formulaBId)
    await previewB

    await expect(page.getByTestId('composition-pool-preview')).toBeVisible()
    const segments = await fetchPoolPreviewSegments(
      page,
      fx.seasonId,
      eventId,
      'player',
      formulas.formulaBId,
    )
    expect(segments.length).toBeGreaterThan(0)
  })

  test('E2E-WD-06 — POST draw body contient formulaId', async ({ page }) => {
    const formulas = await ensureChoicePolicyWithTwoFormulas(page)
    await openDrawEventEquipeTab(page, fx)

    const drawRequest = page.waitForRequest(
      (request) =>
        request.url().includes('/composition/draw') && request.method() === 'POST',
    )
    await page.getByRole('button', { name: 'Tirer au sort' }).click()
    const request = await drawRequest
    const body = request.postDataJSON() as { formulaId?: string; mode?: string }

    expect(body.mode).toBe('full')
    expect(body.formulaId).toBe(formulas.formulaAId)
  })

  test('E2E-WD-07 — REF-R12: variation % pool preview si F1 ≠ F2', async ({ page }) => {
    const formulas = await ensureChoicePolicyWithTwoFormulas(page)
    const eventId = await resolveEventId(page, fx.seasonId, fx.eventDrawSlug)

    const segmentsA = await fetchPoolPreviewSegments(
      page,
      fx.seasonId,
      eventId,
      'player',
      formulas.formulaAId,
    )
    const segmentsB = await fetchPoolPreviewSegments(
      page,
      fx.seasonId,
      eventId,
      'player',
      formulas.formulaBId,
    )

    expect(segmentsA.length).toBeGreaterThan(0)
    expect(segmentsB.length).toBeGreaterThan(0)
    expect(chanceSignature(segmentsA)).not.toBe(chanceSignature(segmentsB))
  })

  test('E2E-WD-08 — prefers-reduced-motion: tirage se termine sans bloquer', async ({ page }) => {
    await ensureChoicePolicyWithTwoFormulas(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openDrawEventEquipeTab(page, fx)

    const draw = page.getByRole('button', { name: 'Tirer au sort' })
    await draw.click()
    await expect(draw).toBeEnabled({ timeout: 60_000 })
    await expect(page.locator('app-composition-draw-animation')).toHaveCount(0)
  })
})
