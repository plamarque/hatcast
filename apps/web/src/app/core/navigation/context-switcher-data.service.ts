import { Injectable, computed, inject, signal } from '@angular/core'

import { SeasonApiService, type SeasonResponse } from '../seasons/season-api.service'
import { TroupeApiService, type TroupeListItem } from '../troupes/troupe-api.service'

const SEASONS_PAGE_SIZE = 50
const LAZY_TROUPE_THRESHOLD = 3

@Injectable({ providedIn: 'root' })
export class ContextSwitcherDataService {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly seasonApi = inject(SeasonApiService)

  private readonly troupesState = signal<TroupeListItem[]>([])
  private readonly seasonsByTroupeId = signal<Record<string, SeasonResponse[]>>({})

  readonly loading = signal(false)
  readonly loadError = signal(false)
  readonly initialized = signal(false)
  readonly currentTroupeId = signal<string | null>(null)

  readonly troupes = this.troupesState.asReadonly()

  readonly showSwitcher = computed(() => {
    if (!this.initialized() || this.loadError()) {
      return false
    }
    if (this.troupesState().length > 1) {
      return true
    }
    const troupeId = this.currentTroupeId()
    if (!troupeId) {
      return false
    }
    return this.seasonsForTroupe(troupeId).length > 1
  })

  private loadPromise: Promise<void> | null = null

  seasonsForTroupe(troupeId: string): SeasonResponse[] {
    return this.seasonsByTroupeId()[troupeId] ?? []
  }

  troupeName(troupeId: string): string {
    return this.troupesState().find((troupe) => troupe.id === troupeId)?.name ?? ''
  }

  async ensureReady(currentTroupeId: string): Promise<void> {
    const trimmed = currentTroupeId.trim()
    if (!trimmed) {
      return
    }
    this.currentTroupeId.set(trimmed)
    if (this.initialized() && !this.loadError()) {
      return
    }
    if (!this.loadPromise) {
      this.loadPromise = this.loadBase(trimmed)
    }
    await this.loadPromise
  }

  async prepareMenuOpen(): Promise<void> {
    if (this.loadError()) {
      return
    }
    const troupes = this.troupesState()
    if (troupes.length <= LAZY_TROUPE_THRESHOLD) {
      return
    }
    await Promise.all(
      troupes.map((troupe) => this.loadSeasonsForTroupe(troupe.id)),
    )
  }

  resetForTests(): void {
    this.troupesState.set([])
    this.seasonsByTroupeId.set({})
    this.loading.set(false)
    this.loadError.set(false)
    this.initialized.set(false)
    this.currentTroupeId.set(null)
    this.loadPromise = null
  }

  private async loadBase(currentTroupeId: string): Promise<void> {
    this.loading.set(true)
    this.loadError.set(false)

    const result = await this.troupeApi.listMyTroupes()
    if (!result.ok) {
      this.loading.set(false)
      this.loadError.set(true)
      this.initialized.set(true)
      return
    }

    const active = (result.data ?? []).filter(
      (troupe) => troupe.membership.status === 'ACTIVE',
    )
    this.troupesState.set(active)
    await this.loadSeasonsForTroupe(currentTroupeId)

    if (active.length <= LAZY_TROUPE_THRESHOLD) {
      await Promise.all(
        active
          .filter((troupe) => troupe.id !== currentTroupeId)
          .map((troupe) => this.loadSeasonsForTroupe(troupe.id)),
      )
    }

    this.loading.set(false)
    this.initialized.set(true)
  }

  private async loadSeasonsForTroupe(troupeId: string): Promise<void> {
    if (this.seasonsByTroupeId()[troupeId]) {
      return
    }

    const result = await this.seasonApi.listSeasons(troupeId, 0, SEASONS_PAGE_SIZE)
    if (!result.ok || !result.data) {
      return
    }

    const listable = result.data.content.filter((season) => !season.archived)
    this.seasonsByTroupeId.update((current) => ({
      ...current,
      [troupeId]: listable,
    }))
  }
}
