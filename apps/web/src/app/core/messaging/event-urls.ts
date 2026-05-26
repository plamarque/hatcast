/** Canonical V2 event URLs (SPEC) — never `/season/`. */
export function buildEventUrls(
  origin: string,
  seasonSlug: string,
  eventSlug: string,
): { eventUrl: string; confirmUrl: string } {
  const base = origin.replace(/\/$/, '')
  const eventUrl = `${base}/saison/${seasonSlug}/event/${eventSlug}`
  const confirmUrl = `${eventUrl}?showConfirm=true`
  return { eventUrl, confirmUrl }
}
