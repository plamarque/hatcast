import type { PostHog } from 'posthog-js'

export type PostHogBrowserConfig = {
  apiKey: string
  apiHost: string
  uiHost: string
}

export type PostHogPersonProperties = {
  email?: string
  name?: string
}

export interface PostHogBrowserFacade {
  capture(event: string, properties?: Record<string, unknown>): void
  identify(distinctId: string, personProperties?: PostHogPersonProperties): void
  reset(): void
}

let posthogInstance: PostHog | null = null
let testFacadeOverride: PostHogBrowserFacade | null = null

export function isPostHogBrowserReady(): boolean {
  return getPostHogBrowserFacade() != null
}

/** Lazy-loads posthog-js and initializes once. Returns false when disabled (no key). */
export async function initPostHogBrowser(config: PostHogBrowserConfig): Promise<boolean> {
  const apiKey = config.apiKey.trim()
  if (!apiKey) {
    return false
  }
  if (getPostHogBrowserFacade()) {
    return true
  }
  const apiHost = config.apiHost.trim()
  if (!apiHost) {
    return false
  }
  const module = await import('posthog-js')
  const posthog = module.default
  posthog.init(apiKey, {
    api_host: apiHost,
    ui_host: config.uiHost.trim() || 'https://eu.posthog.com',
    person_profiles: 'identified_only',
    // SPA (Angular router) — required for PostHog web analytics $pageview health check.
    capture_pageview: 'history_change',
    persistence: 'localStorage+cookie',
  })
  posthogInstance = posthog
  return true
}

export function getPostHogBrowserFacade(): PostHogBrowserFacade | null {
  if (testFacadeOverride) {
    return testFacadeOverride
  }
  if (!posthogInstance) {
    return null
  }
  return {
    capture: (event, properties) => posthogInstance!.capture(event, properties),
    identify: (distinctId, personProperties) =>
      posthogInstance!.identify(distinctId, personProperties),
    reset: () => posthogInstance!.reset(),
  }
}

/** Test-only: inject a mock facade (pass null to clear). */
export function setPostHogBrowserFacadeForTests(facade: PostHogBrowserFacade | null): void {
  testFacadeOverride = facade
}
