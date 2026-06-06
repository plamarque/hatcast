import { Injectable, inject } from '@angular/core'

import { AuthApiService } from '../auth/auth-api.service'
import { getLastVisitedSeasonSlugForTroupe } from '../navigation/last-visited-season-storage'
import { SeasonApiService, type SeasonResponse } from '../seasons/season-api.service'
import {
  troupeListItemFromAdminSummary,
  troupeListItemFromGuestInvitation,
} from './platform-admin-troupe-context'
import type { TroupeListItem } from './troupe-api.service'
import { TroupeContextService } from './troupe-context.service'

export type TroupeSeasonResolution =
  | { kind: 'resolved'; troupe: TroupeListItem; season: SeasonResponse }
  | { kind: 'ambiguous'; matches: Array<{ troupe: TroupeListItem; season: SeasonResponse }> }
  | { kind: 'no-membership' }
  | { kind: 'not-found' }
  | { kind: 'error' }

@Injectable({ providedIn: 'root' })
export class TroupeSeasonResolverService {
  private readonly context = inject(TroupeContextService)
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly auth = inject(AuthApiService)

  async resolveSeasonInTroupe(
    troupeSlug: string,
    seasonSlug: string,
  ): Promise<TroupeSeasonResolution> {
    const normalizedTroupe = troupeSlug.trim()
    const normalizedSeason = seasonSlug.trim()
    if (!normalizedTroupe || !normalizedSeason) {
      return { kind: 'not-found' }
    }

    const loaded = await this.context.load()
    if (!loaded) {
      return { kind: 'error' }
    }

    const troupe = await this.context.resolveTroupeBySlug(normalizedTroupe)
    if (troupe) {
      const result = await this.tryResolve(troupe, normalizedSeason)
      if (result.kind === 'resolved') {
        this.context.selectTroupe(troupe.id)
        return result
      }
      if (result.kind === 'error') {
        return { kind: 'error' }
      }
    }

    const guestScoped = await this.resolveGuestScopedSeason(normalizedTroupe, normalizedSeason)
    if (guestScoped) {
      return guestScoped
    }
    return { kind: 'not-found' }
  }

  async resolveSeasonSlug(slug: string): Promise<TroupeSeasonResolution> {
    const loaded = await this.context.load()
    if (!loaded) {
      return { kind: 'error' }
    }

    const troupes = this.context.activeTroupes()
    if (troupes.length > 0) {
      const membershipResult = await this.resolveAmongMemberships(troupes, slug)
      if (membershipResult.kind !== 'not-found') {
        return membershipResult
      }
    }

    const platformAdmin = await this.isPlatformAdmin()
    if (!platformAdmin) {
      return troupes.length === 0 ? { kind: 'no-membership' } : { kind: 'not-found' }
    }

    return this.resolveAsPlatformAdmin(slug)
  }

  private async resolveAmongMemberships(
    troupes: TroupeListItem[],
    slug: string,
  ): Promise<TroupeSeasonResolution> {
    const selected = this.context.selectedTroupe() ?? troupes[0]
    const selectedResult = await this.tryResolve(selected, slug)
    if (selectedResult.kind === 'resolved') {
      return selectedResult
    }
    if (selectedResult.kind === 'error') {
      return { kind: 'error' }
    }

    const matches: Array<{ troupe: TroupeListItem; season: SeasonResponse }> = []
    for (const troupe of troupes) {
      if (troupe.id === selected.id) {
        continue
      }
      const result = await this.tryResolve(troupe, slug)
      if (result.kind === 'error') {
        return { kind: 'error' }
      }
      if (result.kind === 'resolved') {
        matches.push({ troupe: result.troupe, season: result.season })
      }
    }

    if (matches.length === 1) {
      this.context.selectTroupe(matches[0].troupe.id)
      return { kind: 'resolved', troupe: matches[0].troupe, season: matches[0].season }
    }

    if (matches.length > 1) {
      const disambiguated = this.disambiguateByLastVisited(matches, slug)
      if (disambiguated) {
        this.context.selectTroupe(disambiguated.troupe.id)
        return disambiguated
      }
      return { kind: 'ambiguous', matches }
    }

    return { kind: 'not-found' }
  }

  private async resolveAsPlatformAdmin(slug: string): Promise<TroupeSeasonResolution> {
    const result = await this.seasonsApi.resolveAdminSeasonBySlug(slug)
    if (!result.ok) {
      if (result.status === 404) {
        return { kind: 'not-found' }
      }
      if (result.status === 403) {
        return { kind: 'no-membership' }
      }
      return { kind: 'error' }
    }

    const matches = (result.data ?? []).map(({ troupe, season }) => ({
      troupe: troupeListItemFromAdminSummary(troupe),
      season,
    }))
    if (matches.length === 0) {
      return { kind: 'not-found' }
    }

    for (const match of matches) {
      this.context.registerSupplementalTroupe(match.troupe)
    }

    if (matches.length === 1) {
      this.context.selectTroupe(matches[0].troupe.id)
      return { kind: 'resolved', troupe: matches[0].troupe, season: matches[0].season }
    }

    const disambiguated = this.disambiguateByLastVisited(matches, slug)
    if (disambiguated) {
      this.context.selectTroupe(disambiguated.troupe.id)
      return disambiguated
    }

    return { kind: 'ambiguous', matches }
  }

  private async isPlatformAdmin(): Promise<boolean> {
    const session = await this.auth.ensureHatcastSession()
    return session.ok && session.data?.platformAdmin === true
  }

  private disambiguateByLastVisited(
    matches: Array<{ troupe: TroupeListItem; season: SeasonResponse }>,
    slug: string,
  ): { kind: 'resolved'; troupe: TroupeListItem; season: SeasonResponse } | null {
    const normalized = slug.trim()
    if (!normalized) {
      return null
    }
    const candidates = matches.filter(
      (match) => getLastVisitedSeasonSlugForTroupe(match.troupe.id) === normalized,
    )
    if (candidates.length !== 1) {
      return null
    }
    return { kind: 'resolved', troupe: candidates[0].troupe, season: candidates[0].season }
  }

  private async resolveGuestScopedSeason(
    troupeSlug: string,
    seasonSlug: string,
  ): Promise<{ kind: 'resolved'; troupe: TroupeListItem; season: SeasonResponse } | null> {
    const result = await this.seasonsApi.resolveSeasonByTroupeAndSeasonSlug(troupeSlug, seasonSlug)
    if (!result.ok || !result.data) {
      return null
    }
    const item = troupeListItemFromGuestInvitation(result.data.troupe)
    this.context.registerSupplementalTroupe(item)
    this.context.selectTroupe(item.id)
    return { kind: 'resolved', troupe: item, season: result.data.season }
  }

  private async tryResolve(
    troupe: TroupeListItem,
    slug: string,
  ): Promise<
    | { kind: 'resolved'; troupe: TroupeListItem; season: SeasonResponse }
    | { kind: 'absent' }
    | { kind: 'error' }
  > {
    const result = await this.seasonsApi.getSeasonBySlug(troupe.id, slug)
    if (result.ok && result.data) {
      return { kind: 'resolved', troupe, season: result.data }
    }
    if (result.status === 404 || result.status === 403) {
      return { kind: 'absent' }
    }
    return { kind: 'error' }
  }
}
