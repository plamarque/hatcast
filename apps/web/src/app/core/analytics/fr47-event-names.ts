/** FR47 workflow analytics event names (PostHog capture). */
export const FR47_AVAILABILITY_FIRST_SUBMISSION = 'availability_first_submission' as const
export const FR47_COMPOSITION_VALIDATED = 'composition_validated' as const
export const FR47_COMPOSITION_ALL_CONFIRMATIONS_RECEIVED =
  'composition_all_confirmations_received' as const
export const FR47_NOTIFICATION_LINK_OPENED = 'notification_link_opened' as const

export type Fr47NotificationLinkTab = 'dispos' | 'equipe' | 'confirm' | 'other'

export type Fr47EventContext = {
  event_id: string
  season_id: string
  troupe_id: string
  is_demo_troupe: boolean
}
