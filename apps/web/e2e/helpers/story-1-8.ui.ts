import { expect, type Page } from '@playwright/test'

import { STORY_18_PASSWORD } from '../fixtures/story-1-8.constants'

export async function fillSignupForm(
  page: Page,
  email: string,
  password: string = STORY_18_PASSWORD,
): Promise<void> {
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(password)
  await page.getByLabel('Confirmer le mot de passe', { exact: true }).fill(password)
}

export async function submitSignup(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Créer mon compte' }).click()
}

export async function fillLoginForm(
  page: Page,
  email: string,
  password: string = STORY_18_PASSWORD,
): Promise<void> {
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(password)
}

export async function submitLogin(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Se connecter' }).click()
}

/** Blocks all HatCast IdP session exchanges (simulates API down after Firebase signup). */
export async function blockIdpApi(page: Page): Promise<void> {
  await page.route('**/v1/auth/idp', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'SERVICE_UNAVAILABLE' }),
    })
  })
}

/**
 * Fails the first `failCount` POST /v1/auth/idp calls with 503, then passes through to the API.
 * Story 1.8 retries transient failures up to 3 attempts (initial + 2 retries).
 */
export async function failIdpThenPass(page: Page, failCount: number): Promise<void> {
  let attempts = 0
  await page.route('**/v1/auth/idp', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    attempts += 1
    if (attempts <= failCount) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'SERVICE_UNAVAILABLE' }),
      })
      return
    }
    const response = await route.fetch()
    await route.fulfill({ response })
  })
}

export async function expectAuthenticatedSession(page: Page): Promise<void> {
  await expect(page).not.toHaveURL(/\/(inscription|connexion)/, { timeout: 30_000 })
  const me = await page.request.get('/v1/auth/me')
  expect(me.ok()).toBeTruthy()
  const body = (await me.json()) as { user?: { email?: string } }
  expect(body.user?.email).toBeTruthy()
}
