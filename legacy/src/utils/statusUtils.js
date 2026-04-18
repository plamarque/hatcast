/**
 * Utilitaires pour la gestion des statuts et leurs styles
 */

/**
 * Retourne la classe CSS appropriée selon le statut de sélection/confirmation
 * @param {Object} options - Options de statut
 * @param {boolean} options.isSelected - Si le joueur est sélectionné
 * @param {string} options.playerSelectionStatus - Statut de confirmation ('pending', 'confirmed', 'declined')
 * @param {boolean} options.isAvailable - Disponibilité du joueur
 * @param {boolean} options.isUnavailable - Si le joueur est indisponible (déjà pris)
 * @param {boolean} options.isLoading - Si en cours de chargement
 * @param {boolean} options.isError - Si en erreur
 * @param {boolean} options.hideSelectionStatus - Si true, ignorer le statut de sélection et afficher uniquement la disponibilité
 * @returns {string} Classe CSS appropriée
 */
export function getStatusClass({
  isSelected = false,
  playerSelectionStatus = null,
  isAvailable = null,
  isUnavailable = false,
  isLoading = false,
  isError = false,
  hideSelectionStatus = false
}) {
  // Priorité 1: États spéciaux (chargement, erreur)
  if (isLoading) return 'status-loading'
  if (isError) return 'status-error'
  
  // Priorité 2: Statut de sélection/confirmation (ignoré si hideSelectionStatus est true)
  if (!hideSelectionStatus && isSelected && playerSelectionStatus) {
    switch (playerSelectionStatus) {
      case 'confirmed':
        return 'status-confirmed'
      case 'pending':
        return 'status-pending'
      case 'declined':
        return 'status-declined'
      default:
        return 'status-pending' // Par défaut pour les sélectionnés
    }
  }
  
  // Priorité 3: Disponibilité classique
  if (isUnavailable) return 'status-indisponible'
  if (isAvailable === false) return 'status-unavailable'
  if (isAvailable === true) return 'status-available'
  
  // Par défaut: non renseigné
  return 'status-undefined'
}

/**
 * Retourne le texte de statut approprié
 * @param {Object} options - Options de statut
 * @returns {string} Texte de statut
 */
export function getStatusText({
  isSelected = false,
  playerSelectionStatus = null,
  isAvailable = null,
  isUnavailable = false
}) {
  if (isSelected && playerSelectionStatus) {
    switch (playerSelectionStatus) {
      case 'confirmed':
        return 'Confirmé'
      case 'pending':
        return 'À confirmer'
      case 'declined':
        return 'Décliné'
      default:
        return 'À confirmer'
    }
  }
  
  if (isUnavailable) return 'Indisponible'
  if (isAvailable === false) return 'Pas dispo'
  if (isAvailable === true) return 'Dispo'
  
  return 'Non renseigné'
}
