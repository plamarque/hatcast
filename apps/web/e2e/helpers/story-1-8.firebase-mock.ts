import type { Page, Route } from '@playwright/test'

import { story18IdpToken } from '../fixtures/story-1-8.constants'

export type Story18FirebasePersona = {
  uid: string
  email: string
  displayName?: string
}

/**
 * Mocks Identity Toolkit REST calls so signup/login work in CI without Firebase Admin credentials.
 * Id tokens use the `e2e-idp|…` format accepted by [E2eIdpIdTokenVerifier] (API profile `e2e`).
 */
export async function installStory18FirebaseAuthMock(
  page: Page,
  persona: Story18FirebasePersona,
): Promise<void> {
  const displayName = persona.displayName ?? 'E2E Story 18'
  const idToken = story18IdpToken(persona.uid, persona.email, displayName)

  const fulfillSignUp = async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'identitytoolkit#SignupNewUserResponse',
        idToken,
        email: persona.email,
        refreshToken: 'e2e-refresh-token',
        expiresIn: '3600',
        localId: persona.uid,
      }),
    })
  }

  const fulfillSignIn = async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'identitytoolkit#VerifyPasswordResponse',
        idToken,
        email: persona.email,
        refreshToken: 'e2e-refresh-token',
        expiresIn: '3600',
        localId: persona.uid,
        registered: true,
      }),
    })
  }

  await page.route('**/identitytoolkit.googleapis.com/**', async (route) => {
    const url = route.request().url()
    if (url.includes('accounts:signUp')) {
      await fulfillSignUp(route)
      return
    }
    if (url.includes('accounts:signInWithPassword')) {
      await fulfillSignIn(route)
      return
    }
    if (url.includes('accounts:lookup') || url.includes('getAccountInfo')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: persona.uid,
              email: persona.email,
              displayName,
              emailVerified: false,
            },
          ],
        }),
      })
      return
    }
    await route.continue()
  })
}
