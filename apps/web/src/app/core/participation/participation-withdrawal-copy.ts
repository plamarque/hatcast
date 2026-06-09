export type ParticipationLiveStatus = 'pending' | 'confirmed'
export type ParticipationDialogMode = 'self' | 'proxy'

export function participationDeclineButtonLabel(status: ParticipationLiveStatus): string {
  return status === 'confirmed' ? 'Se désister' : 'Décliner'
}

export function participationDeclineConfirmTitle(status: ParticipationLiveStatus): string {
  return status === 'confirmed' ? 'Confirmer le désistement' : 'Confirmer la déclinaison'
}

export function participationDeclineConfirmMessage(
  status: ParticipationLiveStatus,
  mode: ParticipationDialogMode,
  assigneeName?: string,
): string {
  if (status === 'confirmed') {
    return mode === 'proxy'
      ? `Confirmer le désistement de ${assigneeName ?? 'ce participant'} pour ce rôle ?`
      : 'Confirmer votre désistement pour ce rôle ?'
  }
  return mode === 'proxy'
    ? `Confirmer la déclinaison de ${assigneeName ?? 'ce participant'} pour ce rôle ?`
    : 'Confirmer votre déclinaison pour ce rôle ?'
}

export function participationDeclineConfirmLabel(status: ParticipationLiveStatus): string {
  return participationDeclineButtonLabel(status)
}

export function participationDeclineSuccessToast(status: ParticipationLiveStatus): string {
  return status === 'confirmed' ? 'Désistement enregistré.' : 'Déclinaison enregistrée.'
}

export function declineBadgeLabel(count: number): string {
  return count === 1 ? '1 retrait' : `${count} retraits`
}
