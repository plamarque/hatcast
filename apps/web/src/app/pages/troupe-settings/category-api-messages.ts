export function categoryApiErrorMessage(status: number): string {
  if (status === 409) return 'Cette catégorie existe déjà.'
  if (status === 400) return 'Libellé invalide.'
  if (status === 403) return 'Accès non autorisé.'
  if (status === 404) return 'Catégorie introuvable.'
  if (status === 0) return 'Erreur réseau. Réessayez.'
  return 'Une erreur est survenue.'
}
