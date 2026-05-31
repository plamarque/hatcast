import { computed, inject, Injectable, signal } from '@angular/core'

import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { getLastVisitedSeasonSlug } from './last-visited-season-storage'
import { saisonWorkspacePath, troupesListPath } from './troupe-routes'

export type LastVisitedSeasonLinkTarget = 'season' | 'troupes'

@Injectable({ providedIn: 'root' })
export class LastVisitedSeasonShortcutService {
  private readonly resolver = inject(TroupeSeasonResolverService)

  private refreshGeneration = 0
  private hasLoaded = false

  readonly loading = signal(false)
  readonly seasonSlug = signal<string | null>(null)
  readonly seasonTitle = signal<string | null>(null)

  readonly linkTarget = computed<LastVisitedSeasonLinkTarget>(() =>
    this.seasonSlug() ? 'season' : 'troupes',
  )

  readonly link = computed(() => {
    const slug = this.seasonSlug()
    return slug ? saisonWorkspacePath(slug) : troupesListPath()
  })

  /** Visible button text (season title only when known). */
  readonly label = computed(() => {
    const title = this.seasonTitle()?.trim()
    return title || 'Choisir une saison'
  })

  /** Screen reader label — clarifies destination when visible text is title-only. */
  readonly ariaLabel = computed(() => {
    const title = this.seasonTitle()?.trim()
    return title ? `Ma saison : ${title}` : 'Choisir une saison'
  })

  async refresh(): Promise<void> {
    const generation = ++this.refreshGeneration
    const showLoadingIndicator = !this.hasLoaded
    if (showLoadingIndicator) {
      this.loading.set(true)
    }

    const storedSlug = getLastVisitedSeasonSlug()
    if (!storedSlug) {
      if (generation !== this.refreshGeneration) {
        return
      }
      this.clearSeasonState()
      this.completeRefresh(generation, showLoadingIndicator)
      return
    }

    try {
      const resolved = await this.resolver.resolveSeasonSlug(storedSlug)
      if (generation !== this.refreshGeneration) {
        return
      }
      if (resolved.kind === 'resolved') {
        this.seasonSlug.set(storedSlug)
        this.seasonTitle.set(resolved.season.title)
      } else {
        this.clearSeasonState()
      }
    } catch {
      if (generation !== this.refreshGeneration) {
        return
      }
      this.clearSeasonState()
    } finally {
      this.completeRefresh(generation, showLoadingIndicator)
    }
  }

  private clearSeasonState(): void {
    this.seasonSlug.set(null)
    this.seasonTitle.set(null)
  }

  private completeRefresh(generation: number, showLoadingIndicator: boolean): void {
    if (generation !== this.refreshGeneration) {
      return
    }
    if (showLoadingIndicator) {
      this.loading.set(false)
    }
    this.hasLoaded = true
  }
}
