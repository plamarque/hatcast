/** Messages affichés à l’utilisateur (NFR-I1 / NFR-S1) — pas de détails techniques. */

export function userMessageForGoogleSignInFailure(status: number): string {
  if (status === 0) {
    return 'Connexion au serveur impossible. Vérifiez votre réseau et que l’API tourne en local.'
  }
  switch (status) {
    case 400:
      return 'Données de connexion invalides. Réessayez depuis le bouton Google.'
    case 401:
      return 'Connexion refusée. Réessayez ou choisissez un autre compte Google.'
    case 403:
      return 'Ce compte n’est pas autorisé à accéder à HatCast.'
    case 500:
      return 'Service temporairement indisponible. Réessayez dans quelques instants.'
    default:
      return 'La connexion a échoué. Réessayez.'
  }
}

export function userMessageForLogoutFailure(): string {
  return 'La déconnexion n’a pas abouti. Réessayez ou rechargez la page.'
}

/** Erreurs Firebase Auth / Identity Platform — messages sûrs (NFR-S1). */
export function userMessageForIdentityPlatformAuth(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email. Connectez-vous ou utilisez « Mot de passe oublié ».'
    case 'auth/invalid-email':
      return 'Adresse email invalide.'
    case 'auth/weak-password':
      return 'Mot de passe trop faible. Utilisez au moins 8 caractères.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.'
    case 'auth/user-disabled':
      return 'Ce compte est désactivé. Contactez le support HatCast.'
    case 'auth/operation-not-allowed':
      return 'Connexion email indisponible (provider Email/Password désactivé dans Identity Platform).'
    case 'auth/network-request-failed':
      return 'Réseau indisponible. Réessayez.'
    default:
      return 'Impossible de finaliser la connexion. Vérifiez vos identifiants ou réessayez plus tard.'
  }
}

export function userMessageForIdpApiFailure(status: number): string {
  if (status === 503) {
    return 'Connexion email indisponible sur ce serveur (Identity Platform / credentials API).'
  }
  return userMessageForGoogleSignInFailure(status)
}

/** Signup recovery after transient IdP link failure (DW-104 / story 1.8). */
export function userMessageForSignupIdpRecovery(): string {
  return 'Votre compte a été créé ; connectez-vous pour finaliser l’accès à HatCast.'
}

/** Réinitialisation mot de passe (lien email / Identity Platform) — messages sûrs (NFR-S1, NFR-I1). */
export function userMessageForPasswordResetRequestFailure(code = ''): string {
  switch (code) {
    case 'auth/invalid-continue-uri':
    case 'auth/unauthorized-continue-uri':
      return 'Origine non autorisée dans Identity Platform. Ajoutez localhost (ou votre domaine) aux domaines autorisés.'
    case 'auth/network-request-failed':
      return 'Réseau indisponible. Réessayez.'
    case 'auth/invalid-email':
      return 'Adresse email invalide.'
    default:
      return 'Impossible d’envoyer l’email pour le moment. Réessayez plus tard ou vérifiez votre connexion.'
  }
}

export function userMessageForPasswordResetConfirm(code: string): string {
  switch (code) {
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return 'Ce lien de réinitialisation est invalide ou expiré. Demandez un nouvel email depuis la page « mot de passe oublié ».'
    case 'auth/weak-password':
      return 'Mot de passe trop faible. Utilisez au moins 8 caractères.'
    case 'auth/network-request-failed':
      return 'Réseau indisponible. Réessayez.'
    default:
      return 'Impossible de finaliser la réinitialisation. Réessayez ou demandez un nouvel email.'
  }
}

export function userMessageForRequiresRecentLogin(): string {
  return 'Veuillez vous reconnecter pour modifier votre email'
}

export function userMessageForMissingFirebaseConfig(): string {
  return 'Identity Platform n’est pas configuré sur cette instance (clés Firebase manquantes).'
}

export function userMessageForMissingFirebaseSession(): string {
  return 'Votre session Identity Platform a expiré. Reconnectez-vous pour modifier votre adresse e-mail.'
}

export function userMessageForGoogleReauthFailure(): string {
  return 'Connexion Google annulée ou bloquée. Autorisez les fenêtres contextuelles ou reconnectez-vous depuis Mon compte.'
}

/** Demande de changement d’e-mail (verifyBeforeUpdateEmail) — messages sûrs (NFR-S1). */
export function userMessageForEmailUpdateRequest(code = ''): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email. Utilisez une autre adresse ou connectez-vous.'
    case 'auth/invalid-email':
      return 'Adresse email invalide.'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Veuillez réessayer plus tard.'
    case 'auth/network-request-failed':
      return 'Réseau indisponible. Réessayez.'
    case 'auth/requires-recent-login':
      return userMessageForRequiresRecentLogin()
    default:
      return 'Impossible d’envoyer l’email de vérification pour le moment. Réessayez plus tard.'
  }
}

/** Finalisation changement d’e-mail (applyActionCode) — messages sûrs (NFR-S1). */
export function userMessageForEmailVerificationComplete(code = ''): string {
  switch (code) {
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return 'Ce lien de vérification est invalide ou expiré. Relancez le changement d’e-mail depuis Mon compte.'
    case 'auth/network-request-failed':
      return 'Réseau indisponible. Réessayez.'
    default:
      return 'Impossible de confirmer le changement d’e-mail. Relancez la procédure depuis Mon compte.'
  }
}

/** Ré-authentification avant suppression de compte (NFR-S1). */
export function userMessageForAccountDeletionReAuth(code = ''): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Mot de passe incorrect.'
    case 'auth/requires-recent-login':
      return userMessageForRequiresRecentLogin()
    case 'auth/network-request-failed':
      return 'Réseau indisponible. Réessayez.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Connexion Google annulée.'
    default:
      return 'Ré-authentification requise. Vérifiez votre mot de passe ou reconnectez-vous avec Google.'
  }
}

export function userMessageForAccountDeletionFailure(status: number, serverMessage?: string): string {
  if (status === 409 && serverMessage?.trim()) {
    return serverMessage.trim()
  }
  switch (status) {
    case 401:
      return 'Ré-authentification requise. Vérifiez votre mot de passe ou reconnectez-vous avec Google.'
    case 409:
      return 'La suppression du compte n’est pas possible dans l’état actuel.'
    case 0:
      return 'Suppression impossible. Vérifiez votre réseau et réessayez.'
    default:
      return 'La suppression du compte a échoué. Réessayez plus tard.'
  }
}
