import { computed, inject, Injectable, signal } from '@angular/core'
import { SeasonApiService, type SeasonResponse } from '../seasons/season-api.service'
import { TroupeApiService, type TroupeListItem } from '../troupes/troupe-api.service'
import { getLastVisitedTroupeSlug } from './last-visited-troupe-storage'
import { getLastVisitedSeasonSlugForTroupe } from './last-visited-season-storage'
import { canOpenSeason, canOpenSeasonStatistics, orderedActiveSeasons, orderedMemberTroupes } from './member-troupe-selection'
import { saisonWorkspacePath } from './troupe-routes'

class ResolutionError extends Error {}
const definitive = (status: number): boolean => status === 403 || status === 404

/** Read-only snapshot: opening navigation never selects business context or writes visit memory. */
@Injectable({ providedIn: 'root' })
export class MemberTroupeMenuService {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly seasonApi = inject(SeasonApiService)
  private generation = 0
  readonly troupe = signal<TroupeListItem | null>(null)
  readonly season = signal<SeasonResponse | null>(null)
  readonly loading = signal(false)
  readonly error = signal<string | null>(null)
  readonly troupeReady = signal(false)
  readonly seasonReady = signal(false)
  readonly troupeLabel = computed(() => this.troupe()?.name ?? (this.loading() ? 'Chargement…' : 'Mes troupes'))
  readonly seasonLabel = computed(() => this.season()?.title ?? (this.loading() ? 'Chargement…' : 'Aucune saison'))
  readonly troupeLink = computed(() => this.troupe() ? ['/troupes', this.troupe()!.slug] : ['/troupes'])
  readonly seasonLink = computed(() => {
    const troupe = this.troupe()
    const season = this.season()
    return troupe && season ? saisonWorkspacePath(troupe.slug, season.slug) : null
  })
  readonly statisticsReady = computed(() => this.seasonReady() && !!this.season() && canOpenSeasonStatistics(this.season()!))

  async refresh(): Promise<void> {
    const generation = ++this.generation
    this.loading.set(true)
    this.error.set(null)
    this.troupeReady.set(false)
    this.seasonReady.set(false)
    try {
      const troupe = await this.resolveTroupe()
      if (generation !== this.generation) return
      if (troupe?.id !== this.troupe()?.id) this.season.set(null)
      this.troupe.set(troupe)
      this.troupeReady.set(true)
      if (!troupe) {
        this.season.set(null)
        return
      }
      const season = await this.resolveSeason(troupe)
      if (generation !== this.generation) return
      this.season.set(season)
      this.seasonReady.set(!!season)
    } catch {
      if (generation === this.generation) this.error.set('Navigation indisponible. Réessaie en rouvrant Ma troupe.')
    } finally {
      if (generation === this.generation) this.loading.set(false)
    }
  }

  private async resolveTroupe(): Promise<TroupeListItem | null> {
    const remembered = getLastVisitedTroupeSlug()
    if (remembered) {
      const result = await this.troupeApi.resolveTroupeContextBySlug(remembered)
      if (result.ok && result.data && result.data.membership.status === 'ACTIVE') return result.data
      if (!result.ok && !definitive(result.status)) throw new ResolutionError()
    }
    const result = await this.troupeApi.listMyTroupes({ force: true })
    if (!result.ok || !result.data) throw new ResolutionError()
    return orderedMemberTroupes(result.data)[0] ?? null
  }

  private async resolveSeason(troupe: TroupeListItem): Promise<SeasonResponse | null> {
    const remembered = getLastVisitedSeasonSlugForTroupe(troupe.id)
    if (remembered) {
      const result = await this.seasonApi.getSeasonBySlug(troupe.id, remembered)
      if (result.ok && result.data?.troupeId === troupe.id && canOpenSeason(result.data)) return result.data
      if (!result.ok && !definitive(result.status)) throw new ResolutionError()
    }
    const seasons: SeasonResponse[] = []
    for (let page = 0, pages = 1; page < pages; page++) {
      const result = await this.seasonApi.listSeasons(troupe.id, page, 50)
      if (!result.ok || !result.data) throw new ResolutionError()
      seasons.push(...result.data.content.filter((season) => season.troupeId === troupe.id))
      pages = result.data.totalPages
    }
    for (const season of orderedActiveSeasons(seasons)) {
      const result = await this.seasonApi.getSeasonBySlug(troupe.id, season.slug)
      if (result.ok && result.data?.troupeId === troupe.id && canOpenSeason(result.data)) return result.data
      if (!result.ok && !definitive(result.status)) throw new ResolutionError()
    }
    return null
  }
}
