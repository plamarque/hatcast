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
  'ORG_TEAM_REGRESSED',
  'ORG_TEAM_COMPLETE',
  'ORG_DRAFT_COMPOSITION',
  'ORG_EVENT_DRAFT_CREATED',
  'ORG_COMPOSITION_INCOMPLETE',
  'ORG_SLA_OPEN_AVAILABILITY',
  'ORG_SCOPE_GRANTED',
]

export const ORGA_IMMEDIATE_SIGNAL_KEYS: readonly OrgaNotificationPreferenceKey[] = [
  'ORG_TEAM_REGRESSED',
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
  ORG_TEAM_REGRESSED: {
    title: 'Équipe plus complète',
    description:
      "Me prévenir quand une équipe confirmée n'est plus complète (déclin, statut à confirmer, déverrouillage, etc.).",
    groupSubtitle: 'Signaux immédiats',
  },
  ORG_TEAM_COMPLETE: {
    title: 'Compo bouclée',
    description: 'Me prévenir quand la composition est bouclée (toutes les confirmations reçues).',
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
    title: 'Compo proposée',
    description: 'Me prévenir quand une composition est partagée avec le cercle orga.',
    groupSubtitle: 'Signaux immédiats',
  },
  ORG_EVENT_DRAFT_CREATED: {
    title: 'Nouveau spectacle',
    description:
      "Me prévenir quand un spectacle en brouillon est créé (dispos pas encore ouvertes).",
    groupSubtitle: 'Signaux immédiats',
  },
  ORG_SCOPE_GRANTED: {
    title: 'Nouveau rôle orga',
    description:
      "Me prévenir par notification push quand on m'ajoute comme orga de spectacle, orga de saison ou admin de troupe.",
  },
}

export function organizerNotificationPreferenceUiCopy(
  key: OrgaNotificationPreferenceKey,
): OrgaNotificationPreferenceUiCopy {
  return ORGANIZER_NOTIFICATION_PREFERENCE_UI_COPY[key]
}
