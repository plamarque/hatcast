import type { APIRequestContext, Page } from '@playwright/test'

import type { E1CutoverFixture, E1ReminderFixture } from './e2e-api'
import { resetE1CutoverFixture } from './e2e-api'
import { prepareE2ePage } from './e1.ui'
import { discoverStagingE1Context, discoverStagingReminderContext } from './staging-event-discovery'

export function isStagingE2e(): boolean {
  return process.env.PLAYWRIGHT_STAGING_E2E === '1'
}

function requiredMemberSlug(): string {
  const slug = process.env.HATCAST_E2E_MEMBER_SLUG?.trim()
  if (!slug) {
    throw new Error('Missing HATCAST_E2E_MEMBER_SLUG for staging E2E')
  }
  return slug
}

let cachedStagingContext: E1CutoverFixture | null = null
let cachedStagingReminderContext: E1ReminderFixture | null = null

export async function resolveE1Context(request: APIRequestContext): Promise<E1CutoverFixture> {
  if (!isStagingE2e()) {
    return resetE1CutoverFixture(request)
  }
  if (!cachedStagingContext) {
    cachedStagingContext = await discoverStagingE1Context(request, requiredMemberSlug())
  }
  return cachedStagingContext
}

export async function resolveReminderE1Context(
  request: APIRequestContext,
): Promise<E1ReminderFixture> {
  if (!isStagingE2e()) {
    const fixture = await resetE1CutoverFixture(request)
    return {
      troupeSlug: fixture.troupeSlug,
      seasonSlug: fixture.seasonSlug,
      seasonId: fixture.seasonId,
      eventReminderSlug: fixture.eventReminderSlug,
      eventReminderTitle: fixture.eventReminderTitle,
    }
  }
  if (!cachedStagingReminderContext) {
    cachedStagingReminderContext = await discoverStagingReminderContext(request)
  }
  return cachedStagingReminderContext
}

/** beforeEach: dismiss PWA noise; reset local fixture only (staging uses real Malice data). */
export async function prepareE1Run(page: Page, request: APIRequestContext): Promise<void> {
  await prepareE2ePage(page)
  if (!isStagingE2e()) {
    await resetE1CutoverFixture(request)
  }
}
