/** Canonical V2 event URLs (SPEC) — `/saison/:troupeSlug/:seasonSlug/event/:eventSlug`. */
export function buildEventUrls(
  origin: string,
  troupeSlug: string,
  seasonSlug: string,
  eventSlug: string,
): { eventUrl: string; confirmUrl: string } {
  const base = origin.replace(/\/$/, '')
  const eventUrl = `${base}/saison/${troupeSlug}/${seasonSlug}/event/${eventSlug}`
  const confirmUrl = `${eventUrl}?showConfirm=true`
  return { eventUrl, confirmUrl }
}
