import { Injectable } from '@angular/core'

import { environment } from '../../../environments/environment'
import type { Fr47EventContext, Fr47NotificationLinkTab } from './fr47-event-names'
import {
  FR47_AVAILABILITY_FIRST_SUBMISSION,
  FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED,
  FR47_COMPOSITION_VALIDATED,
  FR47_NOTIFICATION_LINK_OPENED,
  V1_CUTOVER_SRC,
  V2_CUTOVER_REFERRAL_LANDING,
  V2_MIGRATION_FIRST_SESSION,
} from './fr47-event-names'
import {
  getPostHogBrowserFacade,
  initPostHogBrowser,
  type PostHogPersonProperties,
} from './posthog-browser.client'

const ALL_CONFIRMATIONS_DEDUPE_PREFIX = 'hatcast:fr47:all-confirmations:'
const V2_MIGRATION_FIRST_SESSION_PREFIX = 'hatcast:v2-migration-first-session:'
const V1_CUTOVER_PH_REF_KEY = 'hatcast:v1-cutover-ph-ref'
const V1_CUTOVER_REFERRAL_CAPTURED_KEY = 'hatcast:v1-cutover-referral-captured'
const V1_CUTOVER_ALIAS_APPLIED_PREFIX = 'hatcast:v1-cutover-alias-applied:'
const V1_CUTOVER_PH_REF_IDENTIFIED_PREFIX = 'hatcast:v1-cutover-ph-ref-identified:'

export type IdentifyUserInput = {
  email?: string | null
  displayName?: string | null
}

@Injectable({ providedIn: 'root' })
export class ProductAnalyticsService {
  private initPromise: Promise<boolean> | null = null
  private enabled = false

  /** Called once at app bootstrap (provideAppInitializer). */
  bootstrap(): Promise<void> {
    return this.ensureInitialized().then(() => {
      this.captureV1CutoverReferralFromUrl()
      return undefined
    })
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  identifyUser(userId: string | null | undefined, input?: IdentifyUserInput): void {
    const id = userId?.trim()
    if (!id || !this.enabled) {
      return
    }
    const personProperties = buildPersonProperties(input, readV1CutoverPhRef())
    this.facade()?.identify(id, personProperties)
    this.applyV1CutoverAlias(id)
    this.captureV2MigrationFirstSession(id)
  }

  captureV2MigrationFirstSession(userId: string): void {
    const id = userId.trim()
    if (!id || !this.enabled) {
      return
    }
    if (typeof localStorage !== 'undefined') {
      const key = `${V2_MIGRATION_FIRST_SESSION_PREFIX}${id}`
      try {
        if (localStorage.getItem(key) === '1') {
          return
        }
        localStorage.setItem(key, '1')
      } catch {
        /* storage blocked — still capture; dedupe best-effort only */
      }
    }
    const phRef = readV1CutoverPhRef()
    const props: Record<string, unknown> = {
      user_id: id,
      first_seen_at: new Date().toISOString(),
    }
    if (phRef) {
      props['ph_ref'] = phRef
      props['src'] = V1_CUTOVER_SRC
    }
    this.capture(V2_MIGRATION_FIRST_SESSION, props)
  }

  /** Parse cutover query params, persist ph_ref, capture landing once per session, clean URL. */
  captureV1CutoverReferralFromUrl(): void {
    if (typeof window === 'undefined') {
      return
    }
    const url = new URL(window.location.href)
    const src = url.searchParams.get('src')?.trim()
    if (src !== V1_CUTOVER_SRC) {
      return
    }
    const phRef = url.searchParams.get('ph_ref')?.trim()

    if (phRef && this.enabled) {
      try {
        sessionStorage.setItem(V1_CUTOVER_PH_REF_KEY, phRef)
      } catch {
        /* storage blocked — capture still attempted */
      }
      this.identifyV1CutoverPhRefAtLanding(phRef)
      this.captureV1CutoverReferralLanding(phRef)
    }

    url.searchParams.delete('src')
    url.searchParams.delete('ph_ref')
    const cleanPath = url.pathname + url.search + url.hash
    window.history.replaceState({}, '', cleanPath || url.pathname)
  }

  applyV1CutoverAlias(userId: string): void {
    const id = userId.trim()
    const phRef = readV1CutoverPhRef()
    if (!id || !phRef || !this.enabled) {
      return
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        const dedupeKey = `${V1_CUTOVER_ALIAS_APPLIED_PREFIX}${id}:${phRef}`
        if (sessionStorage.getItem(dedupeKey) === '1') {
          return
        }
        sessionStorage.setItem(dedupeKey, '1')
      } catch {
        /* dedupe best-effort only */
      }
    }
    this.facade()?.alias(id, phRef)
  }

  resetSession(): void {
    if (!this.enabled) {
      return
    }
    this.facade()?.reset()
  }

  captureAvailabilityFirstSubmission(
    ctx: Fr47EventContext,
    props: {
      is_proxy: boolean
      opened_at: string
      submitted_at: string
    },
  ): void {
    this.capture(FR47_AVAILABILITY_FIRST_SUBMISSION, {
      ...ctx,
      ...props,
    })
  }

  captureCompositionValidated(
    ctx: Fr47EventContext,
    props: { validated_at: string },
  ): void {
    this.capture(FR47_COMPOSITION_VALIDATED, {
      ...ctx,
      ...props,
    })
  }

  captureCompositionAllConfirmationsReceived(
    ctx: Fr47EventContext,
    props: { validated_at: string | null; completed_at: string },
  ): void {
    if (typeof sessionStorage !== 'undefined') {
      const key = `${ALL_CONFIRMATIONS_DEDUPE_PREFIX}${ctx.event_id}`
      if (sessionStorage.getItem(key) === '1') {
        return
      }
      sessionStorage.setItem(key, '1')
    }
    this.capture(FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED, {
      ...ctx,
      ...props,
    })
  }

  captureNotificationLinkOpened(
    ctx: Fr47EventContext,
    props: { link_tab: Fr47NotificationLinkTab },
  ): void {
    this.capture(FR47_NOTIFICATION_LINK_OPENED, {
      ...ctx,
      ...props,
    })
  }

  eventContext(eventId: string, seasonId: string, troupeId: string): Fr47EventContext {
    return {
      event_id: eventId,
      season_id: seasonId,
      troupe_id: troupeId,
      is_demo_troupe: troupeId === environment.demoTroupeId,
    }
  }

  private identifyV1CutoverPhRefAtLanding(phRef: string): void {
    if (!this.enabled) {
      return
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        const dedupeKey = `${V1_CUTOVER_PH_REF_IDENTIFIED_PREFIX}${phRef}`
        if (sessionStorage.getItem(dedupeKey) === '1') {
          return
        }
        sessionStorage.setItem(dedupeKey, '1')
      } catch {
        /* dedupe best-effort only */
      }
    }
    this.facade()?.identify(phRef)
  }

  private captureV1CutoverReferralLanding(phRef: string): void {
    if (!this.enabled) {
      return
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        if (sessionStorage.getItem(V1_CUTOVER_REFERRAL_CAPTURED_KEY) === '1') {
          return
        }
        sessionStorage.setItem(V1_CUTOVER_REFERRAL_CAPTURED_KEY, '1')
      } catch {
        /* dedupe best-effort only */
      }
    }
    this.capture(V2_CUTOVER_REFERRAL_LANDING, {
      src: V1_CUTOVER_SRC,
      ph_ref: phRef,
    })
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.initPromise) {
      return this.initPromise
    }
    const apiKey = environment.posthogApiKey?.trim() ?? ''
    if (!apiKey) {
      this.enabled = false
      this.initPromise = Promise.resolve(false)
      return false
    }
    this.initPromise = initPostHogBrowser({
      apiKey,
      apiHost: environment.posthogApiHost?.trim() ?? '',
      uiHost: environment.posthogUiHost?.trim() ?? 'https://eu.posthog.com',
    }).then((ok) => {
      this.enabled = ok
      return ok
    })
    return this.initPromise
  }

  private capture(event: string, properties: Record<string, unknown>): void {
    if (!this.enabled) {
      return
    }
    this.facade()?.capture(event, properties)
  }

  private facade() {
    return getPostHogBrowserFacade()
  }
}

function readV1CutoverPhRef(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  try {
    return sessionStorage.getItem(V1_CUTOVER_PH_REF_KEY)?.trim() || null
  } catch {
    return null
  }
}

function buildPersonProperties(
  input?: IdentifyUserInput,
  v1CutoverPhRef?: string | null,
): PostHogPersonProperties | undefined {
  const props: PostHogPersonProperties = {}
  const email = input?.email?.trim()
  const name = input?.displayName?.trim()
  if (email) {
    props.email = email
  }
  if (name) {
    props.name = name
  }
  const phRef = v1CutoverPhRef?.trim()
  if (phRef) {
    props.v1_cutover_ph_ref = phRef
  }
  return Object.keys(props).length > 0 ? props : undefined
}
