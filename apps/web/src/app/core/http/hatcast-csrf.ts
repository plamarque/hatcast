/**
 * Spring Security (CookieCsrfTokenRepository) : cookie lisible `XSRF-TOKEN`, en-tête `X-XSRF-TOKEN`.
 */
export function readXsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  const prefix = 'XSRF-TOKEN='
  const row = document.cookie.split('; ').find((c) => c.startsWith(prefix))
  if (!row) {
    return null
  }
  return decodeURIComponent(row.slice(prefix.length))
}

export function csrfHeaders(): Record<string, string> {
  const t = readXsrfTokenFromCookie()
  return t ? { 'X-XSRF-TOKEN': t } : {}
}
