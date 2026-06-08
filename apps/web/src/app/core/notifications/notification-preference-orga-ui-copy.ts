import type { OrgaNotificationPreferenceKey } from './me-notification-preferences-api.service'

export interface OrgaNotificationPreferenceUiCopy {
  title: string
  /** One short line, starts with « Me prévenir quand ». */
  description: string
  /** Optional grouping subtitle (Signaux immédiats / Rappels planifiés). */
  groupSubtitle?: string
}

/** Shipped organizer intents only (rule A1 — no teaser rows). */
export const DISPATCHED_ORGA_NOTIFICATION_PREFERENCE_KEYS: readonly OrgaNotificationPreferenceKey[] = [
  'ORG_ASSIGNEE_DECLINED',
  'ORG_TEAM_COMPLETE',
  'ORG_DRAFT_COMPOSITION',
  'ORG_EVENT_DRAFT_CREATED',
  'ORG_COMPOSITION_INCOMPLETE',
  'ORG_SLA_OPEN_AVAILABILITY',
]

export const ORGA_IMMEDIATE_SIGNAL_KEYS: readonly OrgaNotificationPreferenceKey[] = [
  'ORG_ASSIGNEE_DECLINED',
  'ORG_TEAM_COMPLETE',
  'ORG_DRAFT_COMPOSITION',
  'ORG_EVENT_DRAFT_CREATED',
]

export const ORGA_SCHEDULED_REMINDER_KEYS: readonly OrgaNotificationPreferenceKey[] = [
  'ORG_COMPOSITION_INCOMPLETE',
  'ORG_SLA_OPEN_AVAILABILITY',
]

export const ORGANIZER_NOTIFICATION_PREFERENCE_UI_COPY: Record<
  OrgaNotificationPreferenceKey,
  OrgaNotificationPreferenceUiCopy
> = {
  ORG_ASSIGNEE_DECLINED: {
    title: 'Déclin immédiat',
    description: "Me prévenir quand quelqu'un décline après validation de la compo.",
    groupSubtitle: 'Signaux immédiats',
  },
  ORG_TEAM_COMPLETE: {
    title: 'Équipe bouclée',
    description: 'Me prévenir quand toutes les confirmations sont reçues.',
    groupSubtitle: 'Signaux immédiats',
  },
  ORG_COMPOSITION_INCOMPLETE: {
    title: 'Compo incomplète',
    description: 'Me prévenir si des places manquent (rappels hebdo et à J-7).',
    groupSubtitle: 'Rappels planifiés',
  },
  ORG_SLA_OPEN_AVAILABILITY: {
    title: 'Ouvrir les dispos',
    description: 'Me prévenir quand un spectacle approche (~1 mois) sans dispos ouvertes.',
    groupSubtitle: 'Rappels planifiés',
  },
  ORG_DRAFT_COMPOSITION: {
    title: 'Brouillon partagé',
    description: 'Me prévenir quand un brouillon de compo est partagé dans le cercle orga.',
    groupSubtitle: 'Signaux immédiats',
  },
  ORG_EVENT_DRAFT_CREATED: {
    title: 'Nouveau brouillon',
    description: 'Me prévenir quand un spectacle brouillon est créé.',
    groupSubtitle: 'Signaux immédiats',
  },
}

export function organizerNotificationPreferenceUiCopy(
  key: OrgaNotificationPreferenceKey,
): OrgaNotificationPreferenceUiCopy {
  return ORGANIZER_NOTIFICATION_PREFERENCE_UI_COPY[key]
}
