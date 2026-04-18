/**
 * Utility functions for location/address handling
 */

/**
 * Truncates a location string to show only the first part before the comma
 * This is useful for displaying a short version of an address
 * 
 * @param {string} location - The full location/address string
 * @returns {string} The truncated location (first part before comma) or full location if no comma
 * 
 * @example
 * getTruncatedLocation('Le Bateau Ivre, 169 Quai de Valmy, 75010 Paris')
 * // Returns: 'Le Bateau Ivre'
 * 
 * getTruncatedLocation('Paris')
 * // Returns: 'Paris'
 */
export function getTruncatedLocation(location) {
  if (!location) return ''
  
  // If there's a comma, cut after the first comma
  const commaIndex = location.indexOf(',')
  if (commaIndex > 0) {
    return location.substring(0, commaIndex).trim()
  }
  
  // Otherwise, return the complete address
  return location
}


