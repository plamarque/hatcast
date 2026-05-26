import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import type {
  UserAgendaLeagueFilter,
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
  readonly selectedLeagueId = input<string | null>(null)

  readonly troupeChange = output<string | null>()
  readonly leagueChange = output<string | null>()
  readonly clearFilters = output<void>()

  protected readonly scopedLeagues = computed(() => {
    const troupeId = this.selectedTroupeId()
    const leagues = this.participationFilters().leagues
    if (!troupeId) {
      return leagues
    }
    return leagues.filter((league) => league.troupeId === troupeId)
  })

  protected readonly hasActiveFilters = computed(
    () => this.selectedTroupeId() != null || this.selectedLeagueId() != null,
  )

  protected troupeLabel(): string {
    const id = this.selectedTroupeId()
    if (!id) {
      return 'Toutes les troupes'
    }
    return this.participationFilters().troupes.find((t) => t.id === id)?.name ?? 'Troupe sélectionnée'
  }

  protected leagueLabel(): string {
    const id = this.selectedLeagueId()
    if (!id) {
      return 'Tous les groupes'
    }
    const inScope = this.scopedLeagues().find((l) => l.id === id)
    if (inScope) {
      return inScope.title
    }
    return this.participationFilters().leagues.find((l) => l.id === id)?.title ?? 'Groupe sélectionné'
  }

  protected selectTroupe(troupe: UserAgendaTroupeFilter | null): void {
    this.troupeChange.emit(troupe?.id ?? null)
  }

  protected selectLeague(league: UserAgendaLeagueFilter | null): void {
    this.leagueChange.emit(league?.id ?? null)
  }

  protected onClear(): void {
    this.clearFilters.emit()
  }
}
