import type { APIRequestContext } from '@playwright/test'

import { E2E_API_KEY } from '../fixtures/story-1-8.constants'

const apiBase = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://127.0.0.1:8080'

export async function cleanupStory18User(
  request: APIRequestContext,
  email: string,
): Promise<void> {
  const response = await request.post(`${apiBase}/v1/e2e/fixtures/story-1-8/cleanup`, {
    headers: {
      'X-Hatcast-E2E-Key': E2E_API_KEY,
      'Content-Type': 'application/json',
    },
    data: { email },
  })
  if (!response.ok()) {
    throw new Error(`Story 1.8 cleanup failed (${response.status()}): ${await response.text()}`)
  }
}
