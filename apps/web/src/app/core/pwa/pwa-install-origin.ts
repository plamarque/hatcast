/** Dev origins where Chrome may show « Not Secure » (self-signed TLS) and block PWA install. */
export function isDevUntrustedInstallOrigin(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const hostname = window.location.hostname;
  return hostname.endsWith('.ts.net') || hostname.endsWith('.local');
}

export const PWA_INSTALL_PROMPT_TIMEOUT_MS = 4000;
