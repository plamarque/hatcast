// Utilitaires pour les messages d'emails

/**
 * Génère un message de succès standard pour l'envoi d'email
 * @param {string} baseMessage - Le message de base (ex: "Email de réinitialisation envoyé")
 * @param {string} email - L'adresse email (optionnel)
 * @returns {string} Message complet avec instructions
 */
export function getEmailSuccessMessage(baseMessage, email = null) {
  let message = baseMessage
  
  if (email) {
    message += ` à ${email}`
  }
  
  message += '. Si vous ne recevez pas l\'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.'
  
  return message
}

/**
 * Messages standards pour différents types d'emails
 */
export const EMAIL_MESSAGES = {
  PASSWORD_RESET: 'Email de réinitialisation envoyé',
  VERIFICATION: 'Email de vérification envoyé',
  NOTIFICATION_ACTIVATION: 'Email d\'activation des notifications envoyé',
  ACCOUNT_VERIFICATION: 'Email de vérification de compte envoyé'
}
