import { Injectable } from '@angular/core'

import { environment } from '../../../environments/environment'
import type { Fr47EventContext, Fr47NotificationLinkTab } from './fr47-event-names'
import {
  AVAILABILITY_REMINDER_SENT,
  COMPOSITION_MUTATION_COMPLETED,
  COMPOSITION_WORKSPACE_OPENED,
  FR47_AVAILABILITY_FIRST_SUBMISSION,
  FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED,
  FR47_COMPOSITION_VALIDATED,
  FR47_NOTIFICATION_LINK_OPENED,
  V1_CUTOVER_SRC,
  V2_CUTOVER_REFERRAL_LANDING,
  V2_MIGRATION_FIRST_SESSION,
  PWA_ACCESS_MODE_OBSERVED,
} from './fr47-event-names'
import type { AnnouncementChannel, BoundedOutcome, RecipientCountBucket, SlotOperation } from './organizer-analytics'
import type { ActorScope } from './organizer-analytics'
import {
  getPostHogBrowserFacade,
  initPostHogBrowser,
  type PostHogPersonProperties,
} from './posthog-browser.client'
import { resolvePwaAccessMode } from '../pwa/pwa-access-mode'

const ALL_CONFIRMATIONS_DEDUPE_PREFIX = 'hatcast:fr47:all-confirmations:'
const WORKSPACE_OPENED_DEDUPE_PREFIX = 'hatcast:fr47:composition-workspace:'
const V2_MIGRATION_FIRST_SESSION_PREFIX = 'hatcast:v2-migration-first-session:'
const V1_CUTOVER_PH_REF_KEY = 'hatcast:v1-cutover-ph-ref'
const V1_CUTOVER_REFERRAL_CAPTURED_KEY = 'hatcast:v1-cutover-referral-captured'
const V1_CUTOVER_ALIAS_APPLIED_PREFIX = 'hatcast:v1-cutover-alias-applied:'
const V1_CUTOVER_PH_REF_IDENTIFIED_PREFIX = 'hatcast:v1-cutover-ph-ref-identified:'
const PWA_ACCESS_MODE_OBSERVED_PREFIX = 'hatcast:pwa-access-mode-observed:'

export type IdentifyUserInput = {
  email?: string | null
  displayName?: string | null
}

@Injectable({ providedIn: 'root' })
export class ProductAnalyticsService {
  private initPromise: Promise<boolean> | null = null
  private enabled = false
  private identifiedUserId: string | null = null
  private readonly workspaceOpenedEvents = new Set<string>()

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
    this.identifiedUserId = id
    this.applyV1CutoverAlias(id)
    this.captureV2MigrationFirstSession(id)
    this.capturePwaAccessModeObserved(id)
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

  /** Records the browser's current access mode once per identified user/session. */
  capturePwaAccessModeObserved(userId: string): void {
    const id = userId.trim()
    if (!id || !this.enabled) {
      return
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        const key = `${PWA_ACCESS_MODE_OBSERVED_PREFIX}${id}`
        if (sessionStorage.getItem(key) === '1') {
          return
        }
        sessionStorage.setItem(key, '1')
      } catch {
        /* storage blocked — capture remains best-effort */
      }
    }
    this.capture(PWA_ACCESS_MODE_OBSERVED, { access_mode: resolvePwaAccessMode() })
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
    this.identifiedUserId = null
    this.workspaceOpenedEvents.clear()
    try {
      if (typeof sessionStorage !== 'undefined') {
        const keys = Array.from({ length: sessionStorage.length }, (_, index) => sessionStorage.key(index))
        for (const key of keys) {
          if (key?.startsWith(WORKSPACE_OPENED_DEDUPE_PREFIX)) sessionStorage.removeItem(key)
        }
      }
    } catch { /* in-memory dedupe has already been reset */ }
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
      ...safeEventContext(ctx),
      is_proxy: props.is_proxy,
      opened_at: props.opened_at,
      submitted_at: props.submitted_at,
    })
  }

  captureCompositionValidated(
    ctx: Fr47EventContext,
    props: { validated_at: string },
  ): void {
    this.capture(FR47_COMPOSITION_VALIDATED, {
      ...safeEventContext(ctx),
      validated_at: props.validated_at,
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
      ...safeEventContext(ctx),
      validated_at: props.validated_at,
      completed_at: props.completed_at,
    })
  }

  captureNotificationLinkOpened(
    ctx: Fr47EventContext,
    props: { link_tab: Fr47NotificationLinkTab },
  ): void {
    this.capture(FR47_NOTIFICATION_LINK_OPENED, {
      ...safeEventContext(ctx),
      link_tab: props.link_tab,
    })
  }

  captureCompositionWorkspaceOpened(
    ctx: Fr47EventContext,
    lifecycle: 'draft' | 'validated' | 'published',
  ): void {
    if (!this.enabled || !isCompositionLifecycle(lifecycle) || this.workspaceOpenedEvents.has(ctx.event_id)) return
    try {
      if (typeof sessionStorage !== 'undefined') {
        const key = `${WORKSPACE_OPENED_DEDUPE_PREFIX}${ctx.event_id}`
        if (sessionStorage.getItem(key) === '1') return
        sessionStorage.setItem(key, '1')
      }
    } catch { /* storage blocked — retain in-memory dedupe */ }
    this.workspaceOpenedEvents.add(ctx.event_id)
    this.captureOrganizerEvent(COMPOSITION_WORKSPACE_OPENED, ctx, { lifecycle })
  }

  captureCompositionMutation(
    ctx: Fr47EventContext,
    props: {
      action: 'slot' | 'draw_preview' | 'draw_execute' | 'validate' | 'publish' | 'announce'
      outcome: BoundedOutcome
      operation?: SlotOperation
      announcement_channel?: AnnouncementChannel
    },
  ): void {
    if (!isOrganizerAction(props.action) || !isBoundedOutcome(props.outcome)) return
    const operation = props.action === 'slot' && isSlotOperation(props.operation)
      ? { operation: props.operation }
      : {}
    const announcementChannel = props.action === 'announce' && isAnnouncementChannel(props.announcement_channel)
      ? { announcement_channel: props.announcement_channel }
      : {}
    this.captureOrganizerEvent(COMPOSITION_MUTATION_COMPLETED, ctx, {
      action: props.action,
      outcome: props.outcome,
      ...operation,
      ...announcementChannel,
    })
  }

  captureAvailabilityReminder(
    ctx: Fr47EventContext,
    props: { outcome: BoundedOutcome; recipient_count_bucket?: RecipientCountBucket },
  ): void {
    if (!isBoundedOutcome(props.outcome)) return
    const bucket = props.outcome === 'succeeded' && isRecipientCountBucket(props.recipient_count_bucket)
      ? { recipient_count_bucket: props.recipient_count_bucket }
      : {}
    this.captureOrganizerEvent(AVAILABILITY_REMINDER_SENT, ctx, { outcome: props.outcome, ...bucket })
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
    if (isActorScope(properties['actor_scope']) && properties['actor_scope'] !== 'member' && this.identifiedUserId) {
      this.facade()?.identify(this.identifiedUserId, { has_ever_organized: true })
    }
    this.facade()?.capture(event, properties)
  }

  private captureOrganizerEvent(
    event: string,
    ctx: Fr47EventContext,
    properties: Record<string, unknown>,
  ): void {
    const safeContext = safeEventContext(ctx)
    this.capture(event, { ...safeContext, ...properties })
  }

  private facade() {
    return getPostHogBrowserFacade()
  }
}

/**
 * The event context is shared with older FR47 captures. Rebuild it instead of
 * spreading caller input so a future caller cannot accidentally add personal
 * or business content to a PostHog event.
 */
function safeEventContext(ctx: Fr47EventContext): Record<string, unknown> {
  const safeContext: Record<string, unknown> = {
    event_id: ctx.event_id,
    season_id: ctx.season_id,
    troupe_id: ctx.troupe_id,
    is_demo_troupe: ctx.is_demo_troupe,
  }
  if (isActorScope(ctx.actor_scope)) {
    safeContext['actor_scope'] = ctx.actor_scope
  }
  return safeContext
}

function isActorScope(value: unknown): value is ActorScope {
  return value === 'member' || value === 'event_organizer' || value === 'season_organizer' || value === 'troupe_admin' || value === 'platform_admin'
}

function isSlotOperation(value: unknown): value is SlotOperation {
  return value === 'assign' || value === 'unassign' || value === 'remove_slot' || value === 'restore_slot'
}

function isRecipientCountBucket(value: unknown): value is RecipientCountBucket {
  return value === '0' || value === '1' || value === '2_5' || value === '6_20' || value === '21_plus'
}

function isBoundedOutcome(value: unknown): value is BoundedOutcome {
  return value === 'succeeded' || value === 'failed' || value === 'refused'
}

function isOrganizerAction(value: unknown): value is 'slot' | 'draw_preview' | 'draw_execute' | 'validate' | 'publish' | 'announce' {
  return value === 'slot' || value === 'draw_preview' || value === 'draw_execute' || value === 'validate' || value === 'publish' || value === 'announce'
}

function isCompositionLifecycle(value: unknown): value is 'draft' | 'validated' | 'published' {
  return value === 'draft' || value === 'validated' || value === 'published'
}

function isAnnouncementChannel(value: unknown): value is AnnouncementChannel {
  return value === 'copy' || value === 'whatsapp'
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
