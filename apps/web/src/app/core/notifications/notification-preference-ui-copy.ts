import type { NotificationPreferenceKey } from './me-notification-preferences-api.service'

export const MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS: ReadonlySet<NotificationPreferenceKey> =
  new Set(['COMPOSITION_SHARED', 'TEAM_CONFIRMED'])

export type VisibleNotificationPreferenceKey = Exclude<
  NotificationPreferenceKey,
  'COMPOSITION_SHARED' | 'TEAM_CONFIRMED'
>

export interface NotificationPreferenceUiCopy {
  title: string
  /** One short line, starts with « Me prévenir quand ». */
  description: string
}

export const NOTIFICATION_PREFERENCE_UI_COPY: Record<
  VisibleNotificationPreferenceKey,
  NotificationPreferenceUiCopy
> = {
  AVAILABILITY_REQUEST: {
    title: 'Disponibilités',
    description: 'Me prévenir quand on attend ma dispo ou qu’une dispo est enregistrée pour moi.',
  },
  CONFIRMATION_REQUEST: {
    title: 'Participation',
    description: 'Me prévenir quand je dois confirmer ou qu’un·e orga modifie ma participation.',
  },
  AVAILABILITY_WEEKLY_REMINDER: {
    title: 'Dispos attendues',
    description: 'Me prévenir tous les 5 jours quand ma dispo manque encore sur un spectacle.',
  },
  REMINDER_7_DAYS: {
    title: 'Semaine avant le spectacle',
    description: 'Me prévenir 7 jours avant un spectacle où je joue.',
  },
  REMINDER_1_DAY: {
    title: 'Veille du spectacle',
    description: 'Me prévenir la veille d’un spectacle où je joue.',
  },
}

export function notificationPreferenceUiCopy(
  key: NotificationPreferenceKey,
  fallbackLabel: string,
): NotificationPreferenceUiCopy {
  if (key in NOTIFICATION_PREFERENCE_UI_COPY) {
    return NOTIFICATION_PREFERENCE_UI_COPY[key as VisibleNotificationPreferenceKey]
  }
  return { title: fallbackLabel, description: '' }
}
