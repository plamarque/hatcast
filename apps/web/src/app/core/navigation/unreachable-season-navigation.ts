import type { Router } from '@angular/router'

import type { TroupeSeasonResolution } from '../troupes/troupe-season-resolver.service'
import type { TroupeContextService } from '../troupes/troupe-context.service'
import {
  clearLastMemberEntryPath,
  getLastMemberEntryPath,
  saisonMemberEntryPath,
} from './last-member-entry-path-storage'
import { clearLastVisitedSeasonSlug, getLastVisitedSeasonSlug } from './last-visited-season-storage'
import { troupeHubPath, troupesListPath } from './troupe-routes'

export type UnreachableSeasonKind = Extract<
  TroupeSeasonResolution['kind'],
  'no-membership' | 'not-found' | 'ambiguous'
>

/** Clears persisted navigation hints for a season slug that cannot be opened. */
export function clearStaleSeasonNavigation(slug: string): void {
  const normalized = slug.trim()
  if (!normalized) {
    return
  }
  if (getLastVisitedSeasonSlug() === normalized) {
    clearLastVisitedSeasonSlug()
  }
  if (getLastMemberEntryPath() === saisonMemberEntryPath(normalized)) {
    clearLastMemberEntryPath()
  }
}

/** Member onboarding when a season route cannot be resolved (demo troupe CTA on /agenda). */
export function memberOnboardingPath(): string[] {
  return ['/agenda']
}

export function onboardingPathForUnreachableSeason(
  kind: UnreachableSeasonKind,
  troupeContext: TroupeContextService,
): string[] {
  if (kind === 'no-membership') {
    return memberOnboardingPath()
  }
  if (kind === 'ambiguous') {
    return troupesListPath()
  }
  const troupe = troupeContext.selectedTroupe() ?? troupeContext.activeTroupes()[0]
  if (troupe?.slug) {
    return troupeHubPath(troupe.slug)
  }
  return memberOnboardingPath()
}

export async function navigateAwayFromUnreachableSeason(
  router: Router,
  kind: UnreachableSeasonKind,
  slug: string,
  troupeContext: TroupeContextService,
): Promise<void> {
  clearStaleSeasonNavigation(slug)
  const target = onboardingPathForUnreachableSeason(kind, troupeContext)
  await router.navigate(target, { replaceUrl: true })
}

export function seasonSlugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] === 'saison' && segments[1]) {
    return segments[1]
  }
  return null
}
