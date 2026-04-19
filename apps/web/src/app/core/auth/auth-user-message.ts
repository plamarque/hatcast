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

/** Erreurs Firebase Auth / Identity Platform — messages génériques (NFR-S1). */
export function userMessageForIdentityPlatformAuth(_code: string): string {
  return 'Impossible de finaliser la connexion. Vérifiez vos identifiants ou réessayez plus tard.'
}

export function userMessageForIdpApiFailure(status: number): string {
  if (status === 503) {
    return 'Connexion email indisponible sur ce serveur (Identity Platform / credentials API).'
  }
  return userMessageForGoogleSignInFailure(status)
}

/** Réinitialisation mot de passe (lien email / Identity Platform) — messages sûrs (NFR-S1, NFR-I1). */
export function userMessageForPasswordResetRequestFailure(): string {
  return 'Impossible d’envoyer l’email pour le moment. Réessayez plus tard ou vérifiez votre connexion.'
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
