import { expect, test } from '@playwright/test'

/**
 * Recette 1.8 — signup recovery after IdP API failure (DW-104).
 * Story: _bmad-output/implementation-artifacts/1-8-recuperation-inscription-apres-echec-api-idp.md
 */

import {
  STORY_18_PASSWORD,
  STORY_18_RECOVERY_SNACKBAR,
  story18TestEmail,
} from './fixtures/story-1-8.constants'
import { prepareE2ePage } from './helpers/e1.ui'
import { cleanupStory18User } from './helpers/story-1-8.api'
import { installStory18FirebaseAuthMock } from './helpers/story-1-8.firebase-mock'
import {
  blockIdpApi,
  expectAuthenticatedSession,
  failIdpThenPass,
  fillLoginForm,
  fillSignupForm,
  submitLogin,
  submitSignup,
} from './helpers/story-1-8.ui'

test.describe.configure({ mode: 'serial' })

test.describe('Recette 1.8 — signup IdP recovery (DW-104)', () => {
  let uid = ''
  let email = ''
  let persona: { uid: string; email: string; displayName: string }

  test.beforeEach(async ({ page }, testInfo) => {
    uid = `story-18-${testInfo.testId.replace(/\W/g, '')}-${Date.now()}`
    email = story18TestEmail(uid)
    persona = { uid, email, displayName: 'E2E Story 18' }
    await prepareE2ePage(page)
    await installStory18FirebaseAuthMock(page, persona)
  })

  test.afterEach(async ({ request }) => {
    if (email) {
      await cleanupStory18User(request, email)
    }
  })

  test('1.8-E2E-01 — persistent IdP failure redirects to login with recovery copy', async ({
    page,
  }) => {
    await blockIdpApi(page)
    await page.goto('/inscription')
    await fillSignupForm(page, email, STORY_18_PASSWORD)
    await submitSignup(page)

    await expect(page.getByText(STORY_18_RECOVERY_SNACKBAR)).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/connexion/, { timeout: 15_000 })
  })

  test('1.8-E2E-02 — transient IdP failures retry then signup succeeds', async ({ page }) => {
    await failIdpThenPass(page, 2)
    await page.goto('/inscription')
    await fillSignupForm(page, email, STORY_18_PASSWORD)
    await submitSignup(page)

    await expectAuthenticatedSession(page)
  })

  test('1.8-E2E-03 — login after failed signup links orphan account idempotently', async ({
    page,
  }) => {
    await blockIdpApi(page)
    await page.goto('/inscription')
    await fillSignupForm(page, email, STORY_18_PASSWORD)
    await submitSignup(page)
    await expect(page).toHaveURL(/\/connexion/, { timeout: 20_000 })

    await page.unroute('**/v1/auth/idp')
    await fillLoginForm(page, email, STORY_18_PASSWORD)
    await submitLogin(page)

    await expectAuthenticatedSession(page)

    const me = await page.request.get('/v1/auth/me')
    const first = (await me.json()) as { user: { id: string; email: string } }

    await page.goto('/connexion')
    await fillLoginForm(page, email, STORY_18_PASSWORD)
    await submitLogin(page)
    await expectAuthenticatedSession(page)

    const meAgain = await page.request.get('/v1/auth/me')
    const second = (await meAgain.json()) as { user: { id: string; email: string } }
    expect(second.user.id).toBe(first.user.id)
    expect(second.user.email).toBe(email)
  })
})
