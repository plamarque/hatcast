/** Spectacle en brouillon (dispos non ouvertes) — visible orgas uniquement côté API. */
export function isEventDraft(event: {
  availabilityOpenedAt?: string | null
  teamStatusBadge?: { key?: string } | null
}): boolean {
  // Champ absent (ex. Mon agenda) : ne pas traiter undefined comme brouillon (undefined == null).
  if (event.availabilityOpenedAt !== undefined) {
    return event.availabilityOpenedAt == null
  }
  return event.teamStatusBadge?.key === 'draft'
}
