/** FR47 workflow analytics event names (PostHog capture). */
export const FR47_AVAILABILITY_FIRST_SUBMISSION = 'availability_first_submission' as const
export const FR47_COMPOSITION_VALIDATED = 'composition_validated' as const
export const FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED =
  'composition_all_confirmations_received' as const
export const FR47_NOTIFICATION_LINK_OPENED = 'notification_link_opened' as const
export const COMPOSITION_WORKSPACE_OPENED = 'composition_workspace_opened' as const
export const COMPOSITION_MUTATION_COMPLETED = 'composition_mutation_completed' as const
export const AVAILABILITY_REMINDER_SENT = 'availability_reminder_sent' as const
export const V2_MIGRATION_FIRST_SESSION = 'v2_migration_first_session' as const
export const V2_CUTOVER_REFERRAL_LANDING = 'v2_cutover_referral_landing' as const
export const PWA_INSTALL_INSTRUCTIONS_VIEWED = 'pwa_install_instructions_viewed' as const
export const PWA_INSTALL_NATIVE_PROMPT_RESOLVED = 'pwa_install_native_prompt_resolved' as const
export const PWA_INSTALL_COMPLETED = 'pwa_install_completed' as const
export const PWA_UPDATE_AVAILABLE = 'pwa_update_available' as const
export const PWA_UPDATE_DISMISSED = 'pwa_update_dismissed' as const
export const PWA_UPDATE_APPLY_REQUESTED = 'pwa_update_apply_requested' as const
export const PWA_ACCESS_MODE_OBSERVED = 'pwa_access_mode_observed' as const
export const CHANCE_BREAKDOWN_OPENED = 'chance_breakdown_opened' as const
export const CHANCE_BREAKDOWN_HELP_OPENED = 'chance_breakdown_help_opened' as const

/** Query param value for V1→V2 cutover funnel (story 11.3). */
export const V1_CUTOVER_SRC = 'v1_cutover' as const

export type Fr47NotificationLinkTab = 'dispos' | 'equipe' | 'confirm' | 'other'

/** Bounded PWA support dimensions. Never derive these values from a raw UA in analytics. */
export type PwaInstallEntryPoint = 'banner' | 'account_menu' | 'manual_instructions_retry'
export type PwaInstallFallbackReason =
  | 'native_prompt_unavailable'
  | 'untrusted_development_origin'
  | 'native_prompt_failure'
export type PwaInstallInstructionVariant =
  | 'ios'
  | 'android'
  | 'desktop_chromium'
  | 'desktop_safari'
  | 'firefox'
  | 'other'
export type PwaNativePromptOutcome = 'accepted' | 'dismissed'
export type PwaUpdateAvailabilitySource = 'version_ready' | 'fallback'

/** Closed surfaces which can successfully open the chance-breakdown overlay. */
export type ChanceBreakdownEntryPoint =
  | 'dispos_poll'
  | 'equipe_slot_picker'
  | 'equipe_pool_preview'
  | 'equipe_draw_step'
  | 'equipe_slot_chance'
export type ChanceBreakdownPresentation = 'bottom_sheet' | 'dialog'

export type Fr47EventContext = {
  event_id: string
  season_id: string
  troupe_id: string
  is_demo_troupe: boolean
  actor_scope?: import('./organizer-analytics').ActorScope
}
