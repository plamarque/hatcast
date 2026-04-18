/**
 * Cartographie des erreurs Firebase Auth (popup Google) vers des messages utilisateur sûrs (FR).
 * Les codes stables servent à l’audit / analytics ; ne pas exposer error.message brut du SDK.
 */

/**
 * @param {{ code?: string, message?: string }} error
 * @returns {{ message: string, code: string, isAuthError: true } | null} null → traiter comme erreur générique
 */
export function mapGoogleSignInError(error) {
  if (!error?.code) return null
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return {
        message: 'Connexion annulée',
        code: 'AUTH_POPUP_CANCELLED',
        isAuthError: true,
      }
    case 'auth/popup-blocked':
      return {
        message: 'Popup bloquée par le navigateur. Autorisez les popups pour ce site.',
        code: 'AUTH_POPUP_BLOCKED',
        isAuthError: true,
      }
    case 'auth/cancelled-popup-request':
      return {
        message:
          'Connexion interrompue. Fermez les autres fenêtres de connexion et réessayez.',
        code: 'AUTH_POPUP_CONFLICT',
        isAuthError: true,
      }
    case 'auth/account-exists-with-different-credential':
      return {
        message:
          'Un compte existe déjà avec cette adresse email via une autre méthode de connexion',
        code: 'AUTH_ACCOUNT_EXISTS',
        isAuthError: true,
      }
    default:
      return null
  }
}

export function googleSignInGenericCleanError() {
  return {
    message: 'Erreur lors de la connexion avec Google. Réessayez.',
    code: 'AUTH_GOOGLE_ERROR',
    isAuthError: true,
  }
}
