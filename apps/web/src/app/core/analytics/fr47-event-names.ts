/** FR47 workflow analytics event names (PostHog capture). */
export const FR47_AVAILABILITY_FIRST_SUBMISSION = 'availability_first_submission' as const
export const FR47_COMPOSITION_VALIDATED = 'composition_validated' as const
export const FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED =
  'composition_all_confirmations_received' as const
export const FR47_NOTIFICATION_LINK_OPENED = 'notification_link_opened' as const
export const V2_MIGRATION_FIRST_SESSION = 'v2_migration_first_session' as const
export const V2_CUTOVER_REFERRAL_LANDING = 'v2_cutover_referral_landing' as const

/** Query param value for V1→V2 cutover funnel (story 11.3). */
export const V1_CUTOVER_SRC = 'v1_cutover' as const

export type Fr47NotificationLinkTab = 'dispos' | 'equipe' | 'confirm' | 'other'

export type Fr47EventContext = {
  event_id: string
  season_id: string
  troupe_id: string
  is_demo_troupe: boolean
}
