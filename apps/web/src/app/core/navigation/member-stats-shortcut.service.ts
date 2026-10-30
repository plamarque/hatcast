import { computed, inject, Injectable, signal } from '@angular/core'

import { AuthApiService } from '../auth/auth-api.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import { getLastVisitedSeasonSlug } from './last-visited-season-storage'

/** Nav « Stats » → clin d'œil membre (`/membre/:userSlug`). */
@Injectable({ providedIn: 'root' })
export class MemberStatsShortcutService {
  private readonly auth = inject(AuthApiService)
  private readonly resolver = inject(TroupeSeasonResolverService)

  private refreshGeneration = 0

  readonly userSlug = signal<string | null>(null)
  readonly troupeId = signal<string | null>(null)
  readonly seasonId = signal<string | null>(null)
  /** A stats link must not be activated before its scope fallback is decided. */
  readonly ready = signal(false)

  readonly link = computed(() => {
    const slug = this.userSlug()
    return slug ? `/membre/${slug}` : '/accueil'
  })

  readonly queryParams = computed(() => {
    const troupeId = this.troupeId()
    const seasonId = this.seasonId()
    return troupeId && seasonId ? { troupeId, seasonId } : null
  })

  async refresh(): Promise<void> {
    const generation = ++this.refreshGeneration
    this.ready.set(false)
    try {
      const session = await this.auth.ensureHatcastSession()
      if (generation !== this.refreshGeneration) {
        return
      }
      const slug = session.data?.user.slug?.trim()
      this.userSlug.set(slug || null)
      this.clearScope()

      const lastVisitedSeasonSlug = getLastVisitedSeasonSlug()
      if (slug && lastVisitedSeasonSlug) {
        const resolved = await this.resolver.resolveSeasonSlugReadOnly(lastVisitedSeasonSlug)
        if (generation !== this.refreshGeneration) {
          return
        }
        if (resolved.kind === 'resolved') {
          this.troupeId.set(resolved.troupe.id)
          this.seasonId.set(resolved.season.id)
        }
      }
    } catch {
      if (generation !== this.refreshGeneration) {
        return
      }
      this.userSlug.set(null)
      this.clearScope()
    } finally {
      if (generation === this.refreshGeneration) {
        this.ready.set(true)
      }
    }
  }

  private clearScope(): void {
    this.troupeId.set(null)
    this.seasonId.set(null)
  }
}
