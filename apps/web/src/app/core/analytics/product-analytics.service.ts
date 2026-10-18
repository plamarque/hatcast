import { inject, Injectable } from '@angular/core'
import { RELEASE_CONTEXT, type NotesSource, type NotesDwell, type NotesScroll } from './release-context'

import { environment } from '../../../environments/environment'
import type {
  Fr47EventContext,
  Fr47NotificationLinkTab,
  PwaInstallEntryPoint,
  PwaInstallFallbackReason,
  PwaInstallInstructionVariant,
  PwaNativePromptOutcome,
  PwaUpdateAvailabilitySource,
} from './fr47-event-names'
import {
  FR47_AVAILABILITY_FIRST_SUBMISSION,
  FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED,
  FR47_COMPOSITION_VALIDATED,
  FR47_NOTIFICATION_LINK_OPENED,
  PWA_INSTALL_COMPLETED,
  PWA_INSTALL_INSTRUCTIONS_VIEWED,
  PWA_INSTALL_NATIVE_PROMPT_RESOLVED,
  PWA_UPDATE_APPLY_REQUESTED,
  PWA_UPDATE_AVAILABLE,
  PWA_UPDATE_DISMISSED,
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
  private readonly release = inject(RELEASE_CONTEXT)
  private initPromise: Promise<boolean> | null = null
  private enabled = false
  private identifiedUser = false
  private userId: string | null = null
  private observedReleaseUsers = new Set<string>()

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
    this.identifiedUser = true
    this.userId = id
    const personProperties = buildPersonProperties(input, readV1CutoverPhRef())
    this.facade()?.identify(id, personProperties)
    this.applyV1CutoverAlias(id)
    this.captureV2MigrationFirstSession(id)
    this.observeRelease(id)
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
    this.identifiedUser = false
    this.userId = null
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

  /** Records an actual manual-install dialog opening with only bounded support dimensions. */
  capturePwaInstallInstructionsViewed(props: {
    entry_point: PwaInstallEntryPoint
    fallback_reason: PwaInstallFallbackReason
    instruction_variant: PwaInstallInstructionVariant
  }): void {
    this.captureForIdentifiedUser(PWA_INSTALL_INSTRUCTIONS_VIEWED, {
      entry_point: props.entry_point,
      fallback_reason: props.fallback_reason,
      instruction_variant: props.instruction_variant,
    })
  }

  /** Native prompt resolution is distinct from the browser's later appinstalled callback. */
  capturePwaNativePromptResolved(outcome: PwaNativePromptOutcome): void {
    this.captureForIdentifiedUser(PWA_INSTALL_NATIVE_PROMPT_RESOLVED, { outcome })
  }

  /** appinstalled is a partial platform signal, not proof of every manual installation. */
  capturePwaInstallCompleted(): void {
    this.captureForIdentifiedUser(PWA_INSTALL_COMPLETED, {})
  }

  /** A visible update prompt is distinct from the user's later choice to apply it. */
  capturePwaUpdateAvailable(source: PwaUpdateAvailabilitySource): void {
    this.captureForIdentifiedUser(PWA_UPDATE_AVAILABLE, { source })
  }

  capturePwaUpdateDismissed(): void {
    this.captureForIdentifiedUser(PWA_UPDATE_DISMISSED, {})
  }

  /** A click asks the service worker to activate; it is not post-reload confirmation. */
  capturePwaUpdateApplyRequested(): void {
    this.captureForIdentifiedUser(PWA_UPDATE_APPLY_REQUESTED, {})
    if (this.release && this.enabled && this.userId) {
      try {
        sessionStorage.setItem(`hatcast:update-request:${this.userId}`, JSON.stringify({
          release_id: this.release.release_id, requested_at: Date.now(),
        }))
      } catch { /* blocked storage: no confirmation after reload */ }
    }
  }

  captureReleaseNotesOpened(source: NotesSource): string | null {
    this.captureForIdentifiedUser('release_notes_opened', {
      source,
      viewport_width: viewportDimension(typeof window === 'undefined' ? 0 : window.innerWidth),
      viewport_height: viewportDimension(typeof window === 'undefined' ? 0 : window.innerHeight),
    })
    return this.userId
  }

  captureReleaseNotesClosed(source: NotesSource, dwell: NotesDwell, scroll: NotesScroll, ownerId?: string | null): void {
    if (ownerId !== undefined && ownerId !== this.userId) return
    this.captureForIdentifiedUser('release_notes_closed', { source, visible_time_bucket: dwell, scroll_bucket: scroll })
  }

  private observeRelease(id: string): void {
    if (!this.release) return
    try {
      const key = `hatcast:update-request:${id}`
      const raw = sessionStorage.getItem(key)
      if (raw) {
        const pending = JSON.parse(raw)
        const age = Date.now() - pending.requested_at
        if (typeof pending.release_id !== 'string' || !/^\d+\.\d+\.\d+(?:-rc\.\d+)?:[a-f0-9]{7,40}$/.test(pending.release_id)
          || !Number.isFinite(age) || age < 0 || age > 7 * 86_400_000) {
          sessionStorage.removeItem(key)
        } else if (pending.release_id !== this.release.release_id) {
          this.captureForIdentifiedUser('pwa_update_applied', {
            previous_release_id: pending.release_id,
            delay_bucket: age < 60_000 ? 'under_1m' : age < 3_600_000 ? 'under_1h' : age < 86_400_000 ? 'under_1d' : 'over_1d',
          })
          sessionStorage.removeItem(key)
        }
      }
    } catch { /* invalid/blocked session state cannot prove an update */ }
    const key = `${id}:${this.release.release_id}`
    if (!this.observedReleaseUsers.has(key)) {
      this.observedReleaseUsers.add(key)
      this.captureForIdentifiedUser('app_release_observed', {})
    }
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

  private captureForIdentifiedUser(event: string, properties: Record<string, unknown>): void {
    if (!this.identifiedUser) {
      return
    }
    this.capture(event, { ...properties, ...(this.release ?? {}) })
  }

  private facade() {
    return getPostHogBrowserFacade()
  }
}

function viewportDimension(value: number): number | null {
  return Number.isFinite(value) && value > 0 ? Math.min(32_768, Math.round(value)) : null
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
