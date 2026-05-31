import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import type {
  UserAgendaSeasonFilter,
  UserAgendaParticipationFilters,
  UserAgendaTroupeFilter,
} from '../../core/agenda/user-agenda-api.service'

@Component({
  selector: 'app-user-agenda-filter-bar',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './user-agenda-filter-bar.html',
  styleUrl: './user-agenda-filter-bar.scss',
})
export class UserAgendaFilterBar {
  readonly participationFilters = input.required<UserAgendaParticipationFilters>()
  readonly selectedTroupeId = input<string | null>(null)
  readonly selectedSeasonId = input<string | null>(null)

  readonly troupeChange = output<string | null>()
  readonly seasonChange = output<string | null>()
  readonly clearFilters = output<void>()

  protected readonly scopedSeasons = computed(() => {
    const troupeId = this.selectedTroupeId()
    const seasons = this.participationFilters().seasons
    if (!troupeId) {
      return seasons
    }
    return seasons.filter((season) => season.troupeId === troupeId)
  })

  protected readonly hasActiveFilters = computed(
    () => this.selectedTroupeId() != null || this.selectedSeasonId() != null,
  )

  protected troupeLabel(): string {
    const id = this.selectedTroupeId()
    if (!id) {
      return 'Toutes les troupes'
    }
    return this.participationFilters().troupes.find((t) => t.id === id)?.name ?? 'Troupe sélectionnée'
  }

  protected seasonLabel(): string {
    const id = this.selectedSeasonId()
    if (!id) {
      return 'Toutes les saisons'
    }
    const inScope = this.scopedSeasons().find((l) => l.id === id)
    if (inScope) {
      return inScope.title
    }
    return this.participationFilters().seasons.find((l) => l.id === id)?.title ?? 'Saison sélectionnée'
  }

  protected selectTroupe(troupe: UserAgendaTroupeFilter | null): void {
    this.troupeChange.emit(troupe?.id ?? null)
  }

  protected selectSeason(season: UserAgendaSeasonFilter | null): void {
    this.seasonChange.emit(season?.id ?? null)
  }

  protected onClear(): void {
    this.clearFilters.emit()
  }
}
