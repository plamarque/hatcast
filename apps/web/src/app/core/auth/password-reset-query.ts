/**
 * Paramètres de query renvoyés par Identity Platform / Firebase Auth sur l’URL de continuation
 * après clic sur le lien email (ex. ?mode=resetPassword&oobCode=...).
 */
export function parsePasswordResetQuery(search: string): {
  oobCode: string | null
  mode: string | null
} {
  const normalized = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(normalized)
  return {
    oobCode: params.get('oobCode'),
    mode: params.get('mode'),
  }
}
