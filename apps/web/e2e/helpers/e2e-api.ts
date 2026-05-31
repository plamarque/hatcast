import type { APIRequestContext } from '@playwright/test'

import { E2E_API_KEY } from '../fixtures/story-3-19.constants'

const apiBase = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://127.0.0.1:8080'

export async function resetStory319Fixture(request: APIRequestContext) {
  const response = await request.post(`${apiBase}/v1/e2e/fixtures/story-3-19/reset`, {
    headers: {
      'X-Hatcast-E2E-Key': E2E_API_KEY,
    },
  })
  if (!response.ok()) {
    throw new Error(`Fixture reset failed (${response.status()}): ${await response.text()}`)
  }
  return response.json() as Promise<{
    seasonASlug: string
    seasonBSlug: string
    targetMemberDisplayName: string
    targetMemberEmail: string
    eventExclusionSlug: string | null
  }>
}

export async function signInWithE2eToken(
  request: APIRequestContext,
  idToken: string,
  baseURL: string,
) {
  const response = await request.post(`${baseURL}/v1/auth/google`, {
    data: { idToken, rememberMe: true },
  })
  if (!response.ok()) {
    throw new Error(`E2E sign-in failed (${response.status()}): ${await response.text()}`)
  }
}
