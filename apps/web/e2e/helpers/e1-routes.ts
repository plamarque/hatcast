export function saisonWorkspacePath(troupeSlug: string, seasonSlug: string): string {
  return `/saison/${troupeSlug}/${seasonSlug}`
}

/** Season workspace URL (optional query, e.g. `?view=agenda` from SeasonHome). */
export function seasonWorkspaceUrlPattern(troupeSlug: string, seasonSlug: string): RegExp {
  const path = saisonWorkspacePath(troupeSlug, seasonSlug).replace(/\//g, '\\/')
  return new RegExp(`${path}(?:\\?.*)?$`)
}

export function saisonEventPath(
  troupeSlug: string,
  seasonSlug: string,
  eventSlug: string,
  query?: Record<string, string>,
): string {
  const base = `/saison/${troupeSlug}/${seasonSlug}/event/${eventSlug}`
  if (!query || Object.keys(query).length === 0) {
    return base
  }
  const params = new URLSearchParams(query)
  return `${base}?${params.toString()}`
}

export function memberStatsPath(userSlug: string): string {
  return `/membre/${userSlug}`
}

/** Member glance URL (optional query from hub avatar navigation). */
export function memberProfileUrlPattern(userSlug: string): RegExp {
  const slug = userSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`/membre/${slug}(?:\\?.*)?$`)
}

export function anyMemberProfileUrlPattern(): RegExp {
  return /\/membre\/[^/?#]+(?:\?.*)?$/
}

export function saisonAdminAuditPath(troupeSlug: string, seasonSlug: string): string {
  return `/saison/${troupeSlug}/${seasonSlug}/admin/audit`
}

export function troupeAdminAuditPath(troupeSlug: string): string {
  return `/troupes/${troupeSlug}/admin/audit`
}

export function troupeHubPath(troupeSlug: string): string {
  return `/troupes/${troupeSlug}`
}
