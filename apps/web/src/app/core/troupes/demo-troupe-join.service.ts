import { Injectable, inject, signal } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

import { rememberLastVisitedSeasonSlug } from '../navigation/last-visited-league-storage'
import { saisonWorkspacePath, troupeHubPath } from '../navigation/troupe-routes'
import { environment } from '../../../environments/environment'
import {
  DEMO_ACTIVE_SEASON_SLUG,
  DEMO_TROUPE_SLUG,
} from './demo-troupe.constants'
import { TroupeApiService } from './troupe-api.service'
import { TroupeContextService } from './troupe-context.service'
import { TroupeSeasonResolverService } from './troupe-season-resolver.service'

export type DemoJoinResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'join-failed' | 'reload-failed' }

@Injectable({ providedIn: 'root' })
export class DemoTroupeJoinService {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly resolver = inject(TroupeSeasonResolverService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  readonly joining = signal(false)

  async join(): Promise<DemoJoinResult> {
    const demoId = environment.demoTroupeId?.trim()
    if (!demoId) {
      this.snack.open('Troupe de démonstration indisponible.', 'OK', { duration: 6000 })
      return { ok: false, reason: 'unavailable' }
    }

    this.joining.set(true)
    try {
      const jr = await this.troupeApi.joinTroupe(demoId)
      if (!jr.ok) {
        this.snack.open('Impossible de rejoindre la troupe de démonstration.', 'OK', {
          duration: 6000,
        })
        return { ok: false, reason: 'join-failed' }
      }

      const refreshed = await this.troupeContext.reloadAndSelect(demoId)
      if (!refreshed) {
        this.snack.open(
          'Adhésion enregistrée, mais le rechargement des troupes a échoué.',
          'OK',
          { duration: 6000 },
        )
        return { ok: false, reason: 'reload-failed' }
      }

      this.snack.open('Tu as rejoint la troupe de démonstration.', 'OK', { duration: 4000 })

      rememberLastVisitedSeasonSlug(DEMO_ACTIVE_SEASON_SLUG, demoId)

      const resolution = await this.resolver.resolveSeasonSlug(DEMO_ACTIVE_SEASON_SLUG)
      if (resolution.kind === 'resolved') {
        await this.router.navigate(saisonWorkspacePath(DEMO_ACTIVE_SEASON_SLUG))
      } else {
        await this.router.navigate(troupeHubPath(DEMO_TROUPE_SLUG))
      }

      return { ok: true }
    } finally {
      this.joining.set(false)
    }
  }
}
