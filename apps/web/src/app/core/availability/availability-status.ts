export type AvailabilityStatus = 'available' | 'unavailable' | 'unknown'

export function availabilityBadgeLabel(status: AvailabilityStatus): string {
  switch (status) {
    case 'available':
      return 'Dispo'
    case 'unavailable':
      return 'Pas dispo'
    default:
      return 'Non renseigné'
  }
}

export function availabilityBadgeModifier(status: AvailabilityStatus): string {
  switch (status) {
    case 'available':
      return '--available'
    case 'unavailable':
      return '--unavailable'
    default:
      return '--unknown'
  }
}
