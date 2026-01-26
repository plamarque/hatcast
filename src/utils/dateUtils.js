/**
 * Utilitaires pour le formatage des dates
 */

/**
 * Formate une date d'événement en français (format court)
 * @param {string} dateString - Date au format ISO string
 * @returns {string} Date formatée en français (ex: "Samedi 20 sep")
 */
export function formatEventDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Formate une date courte (jour/mois)
 * @param {string} dateString - Date au format ISO string
 * @returns {string} Date formatée courte
 */
export function formatShortDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Formate une date pour l'affichage dans les listes
 * @param {string} dateString - Date au format ISO string
 * @returns {string} Date formatée pour les listes
 */
export function formatListDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Formate une date en français (format long, ex. "samedi 20 septembre 2025")
 * @param {string|Date} dateValue - Date au format ISO string ou objet Date
 * @returns {string} Date formatée
 */
export function formatDateFull(dateValue) {
  if (!dateValue) return ''
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
