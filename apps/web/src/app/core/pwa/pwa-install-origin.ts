/** Dev origins where Chrome may show « Not Secure » (self-signed TLS) and block PWA install. */
export function isDevUntrustedInstallOrigin(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const hostname = window.location.hostname;
  return hostname.endsWith('.ts.net') || hostname.endsWith('.local');
}

export const PWA_INSTALL_PROMPT_TIMEOUT_MS = 4000;

export const DEV_CERT_INSTALL_WARNING =
  'Chrome affiche « Non sécurisé » car le certificat HTTPS de développement (Tailscale ou auto-signé) n\'est pas reconnu par le navigateur. L\'installation PWA native est alors bloquée sur cette URL — y compris l\'icône ⊕ dans la barre d\'adresse. Pour tester l\'install sur Mac : ouvrez https://localhost:4200 (même stack `--with-push`) ou installez depuis un appareil mobile sur le tailnet.';
