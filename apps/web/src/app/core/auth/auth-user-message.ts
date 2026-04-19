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
