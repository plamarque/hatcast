/**
 * Utilitaires d'obfuscation pour masquer les informations sensibles
 */

/**
 * Obfusque un email en masquant une partie du nom d'utilisateur et du domaine
 * @param {string} email - L'email à obfusquer
 * @returns {string|null} - L'email obfusqué ou null si invalide
 */
export function obfuscateEmail(email) {
  try {
    if (!email || typeof email !== 'string') return null
    const parts = email.split('@')
    if (parts.length !== 2) return email
    
    const [localPart, domain] = parts
    let obfuscatedLocal = localPart
    if (localPart.length <= 3) {
      obfuscatedLocal = localPart.charAt(0) + '••'
    } else {
      obfuscatedLocal = localPart.substring(0, 3) + '••'
    }
    
    const domainParts = domain.split('.')
    let obfuscatedDomain = domain
    if (domainParts.length >= 2) {
      const mainDomain = domainParts[0]
      const extension = domainParts.slice(1).join('.')
      if (mainDomain.length <= 2) {
        obfuscatedDomain = '••' + '.' + extension
      } else {
        obfuscatedDomain = mainDomain.substring(0, 2) + '••' + '.' + extension
      }
    }
    
    return `${obfuscatedLocal}@${obfuscatedDomain}`
  } catch (error) {
    console.error('❌ Erreur dans obfuscateEmail:', error)
    return email // Retourner l'email original en cas d'erreur
  }
}

/**
 * Obfusque un mot de passe ou token en affichant seulement les premiers et derniers caractères
 * @param {string} secret - Le secret à obfusquer
 * @returns {string} - Le secret obfusqué
 */
export function obfuscateSecret(secret) {
  if (!secret || typeof secret !== 'string') return '••••••'
  if (secret.length <= 4) return '••••'
  return secret.substring(0, 2) + '••••' + secret.substring(secret.length - 2)
}
