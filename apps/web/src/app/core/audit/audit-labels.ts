import type { AuditActionType } from './audit-api.service'

/** French action labels — mirror server `AuditActionLabels`. */
export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  AVAILABILITY_CREATED: 'Disponibilité créée',
  AVAILABILITY_UPDATED: 'Disponibilité modifiée',
  AVAILABILITY_DELETED: 'Disponibilité supprimée',
  EVENT_CREATED: 'Spectacle créé',
  EVENT_UPDATED: 'Spectacle modifié',
  EVENT_ARCHIVED: 'Spectacle archivé',
  EVENT_UNARCHIVED: 'Spectacle réactivé',
  EVENT_AVAILABILITY_OPENED: 'Disponibilités ouvertes',
  EVENT_AVAILABILITY_CLOSED: 'Disponibilités fermées (brouillon)',
  SEASON_PARTICIPANT_ADDED: 'Participant ajouté',
  SEASON_PARTICIPANT_REACTIVATED: 'Participant réactivé',
  SEASON_PARTICIPANT_UPDATED: 'Participant modifié',
  SEASON_PARTICIPANT_REMOVED: 'Participant retiré',
  EVENT_PARTICIPANT_ADDED: 'Participant spectacle ajouté',
  EVENT_PARTICIPANT_UPDATED: 'Participant spectacle modifié',
  EVENT_PARTICIPANT_REMOVED: 'Participant spectacle retiré',
  EVENT_ROSTER_EXCLUDED: 'Participant exclu du roster',
  EVENT_ROSTER_INCLUDED: 'Participant réintégré au roster',
  TROUPE_MEMBER_ADDED: 'Membre ajouté',
  TROUPE_MEMBER_UPDATED: 'Membre modifié',
  TROUPE_MEMBER_DEACTIVATED: 'Membre désactivé',
  SEASON_ORGANIZER_GRANTED: 'Organisateur saison accordé',
  SEASON_ORGANIZER_REVOKED: 'Organisateur saison révoqué',
  EVENT_ORGANIZER_GRANTED: 'Organisateur spectacle accordé',
  EVENT_ORGANIZER_REVOKED: 'Organisateur spectacle révoqué',
  COMPOSITION_PUBLISHED: 'Composition publiée',
  COMPOSITION_VALIDATED: 'Compo validée',
  COMPOSITION_UNLOCKED: 'Composition déverrouillée',
  COMPOSITION_DRAW_COMPLETED: 'Tirage',
  COMPOSITION_LIFECYCLE_CHANGED: 'Statut équipe',
  SLOT_ASSIGNED: 'Créneau assigné',
  SLOT_CLEARED: 'Créneau libéré',
  PARTICIPATION_CONFIRMED: 'Participation confirmée',
  PARTICIPATION_DECLINED: 'Retrait de la compo',
  PARTICIPATION_RESET: 'Participation réinitialisée',
  DECLINE_RESTORED: 'Réintégration après retrait',
}

export const AUDIT_ACTION_FILTER_OPTIONS: Array<{ value: AuditActionType; label: string }> =
  Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({
    value: value as AuditActionType,
    label,
  }))

export function auditActionLabel(actionType: AuditActionType): string {
  return AUDIT_ACTION_LABELS[actionType] ?? actionType
}
