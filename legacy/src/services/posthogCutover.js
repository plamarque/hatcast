/** PostHog cutover funnel (story 11.3) — minimal init for V1 modal only. */

export const V1_CUTOVER_MODAL_DISMISSED_KEY = 'hatcast:v1-cutover-modal-dismissed'
export const V1_CUTOVER_MODAL_SHOWN = 'v1_cutover_modal_shown'
export const V1_CUTOVER_CTA_CLICKED = 'v1_cutover_cta_clicked'
export const V1_CUTOVER_MODAL_DISMISSED = 'v1_cutover_modal_dismissed'
export const V2_CUTOVER_BASE_URL = 'https://hatcast.app/'
export const V1_CUTOVER_SRC = 'v1_cutover'

const POSTHOG_API_HOST = 'https://e.hatcast.app'
const POSTHOG_UI_HOST = 'https://eu.posthog.com'

let posthogInstance = null
let initPromise = null

export function isCutoverModalEnabled() {
  return import.meta.env.VITE_V2_CUTOVER_MODAL_ENABLED === 'true'
}

export function isPostHogCutoverEnabled() {
  const key = import.meta.env.VITE_POSTHOG_PROJECT_API_KEY?.trim() ?? ''
  return key.length > 0
}

export function isModalDismissed() {
  try {
    return localStorage.getItem(V1_CUTOVER_MODAL_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissModal() {
  try {
    localStorage.setItem(V1_CUTOVER_MODAL_DISMISSED_KEY, '1')
  } catch {
    /* storage blocked — UX still closes modal */
  }
}

export function shouldShowCutoverModal() {
  return isCutoverModalEnabled() && !isModalDismissed()
}

export async function initPostHogCutover() {
  if (!isPostHogCutoverEnabled()) {
    return false
  }
  if (posthogInstance) {
    return true
  }
  if (initPromise) {
    return initPromise
  }
  const apiKey = import.meta.env.VITE_POSTHOG_PROJECT_API_KEY.trim()
  initPromise = import('posthog-js')
    .then((module) => {
      const posthog = module.default
      posthog.init(apiKey, {
        api_host: POSTHOG_API_HOST,
        ui_host: POSTHOG_UI_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false,
        persistence: 'localStorage+cookie',
      })
      posthogInstance = posthog
      return true
    })
    .catch(() => false)
  return initPromise
}

export function getPostHogDistinctId() {
  if (!posthogInstance || typeof posthogInstance.get_distinct_id !== 'function') {
    return null
  }
  return posthogInstance.get_distinct_id()
}

export function captureCutoverEvent(event, properties = {}, onComplete) {
  if (!posthogInstance) {
    if (typeof onComplete === 'function') {
      onComplete()
    }
    return
  }
  posthogInstance.capture(event, properties, {
    send_instantly: true,
    transport: 'sendBeacon',
  })
  if (typeof onComplete === 'function') {
    onComplete()
  }
}

export function buildV2CutoverUrl(phRef) {
  const params = new URLSearchParams({ src: V1_CUTOVER_SRC })
  if (phRef) {
    params.set('ph_ref', phRef)
  }
  return `${V2_CUTOVER_BASE_URL}?${params.toString()}`
}

/** Reset module state for unit tests. */
export function resetPostHogCutoverForTests() {
  posthogInstance = null
  initPromise = null
}
