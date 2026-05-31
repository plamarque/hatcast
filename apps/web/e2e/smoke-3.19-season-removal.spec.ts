import { expect, test } from '@playwright/test'

import { STORY_319 } from './fixtures/story-3-19.constants'
import { resetStory319Fixture } from './helpers/e2e-api'

test.describe('Story 3.19 smoke — season-local removal (S2+S3+S4+S5)', () => {
  test.beforeEach(async ({ request }) => {
    await resetStory319Fixture(request)
  })

  test('retire un membre de la saison A sans toucher la saison B, puis ré-inclusion via Ajouter', async ({
    page,
  }) => {
    const { seasonA, seasonB, targetMemberName, targetMemberEmail } = STORY_319

    // S2 — retrait saison membre
    await page.goto(`/saison/${seasonA}/admin/participants`)
    await expect(page.locator('li.admin-participants__row', { hasText: targetMemberName })).toBeVisible({
      timeout: 30_000,
    })
    const memberRow = page.locator('li.admin-participants__row', { hasText: targetMemberName })
    await memberRow.getByRole('button', { name: 'Retirer ce membre de la saison' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Retirer de cette saison ?' })).toBeVisible()
    await expect(dialog.getByText('Son adhésion à la troupe est conservée.', { exact: false })).toBeVisible()
    await dialog.getByRole('button', { name: 'Retirer' }).click()
    await expect(page.getByText('Membre retiré de la saison.')).toBeVisible()
    await expect(memberRow).toHaveCount(0)

    // S3 — garde de synchronisation (reload)
    await page.reload()
    await expect(page.locator('li.admin-participants__row', { hasText: targetMemberName })).toHaveCount(
      0,
    )
    await page.goto('/troupes')
    await page.goto(`/saison/${seasonA}/admin/participants`)
    await expect(page.locator('li.admin-participants__row', { hasText: targetMemberName })).toHaveCount(
      0,
    )

    // S4 — portée saison-locale (saison B intacte)
    await page.goto(`/saison/${seasonB}/admin/participants`)
    await expect(page.locator('li.admin-participants__row', { hasText: targetMemberName })).toBeVisible()

    // S5 — ré-inclusion via « Ajouter » (même email)
    await page.goto(`/saison/${seasonA}/admin/participants`)
    await page.getByRole('button', { name: 'Ajouter' }).first().click()
    await expect(page.getByRole('heading', { name: 'Ajouter un participant' })).toBeVisible()
    await page.getByLabel('Nom affiché').fill('Nom ignoré pour membre')
    await page.getByLabel('Email (optionnel)').fill(targetMemberEmail)
    await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()

    await expect(page.locator('li.admin-participants__row', { hasText: targetMemberName })).toBeVisible()
    await page.reload()
    await expect(page.locator('li.admin-participants__row', { hasText: targetMemberName })).toBeVisible()
  })
})
