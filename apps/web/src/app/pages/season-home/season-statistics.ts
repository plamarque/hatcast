import { Component, computed, inject, input, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import type {
  ParticipantStatisticsRow,
  SeasonStatisticsResponse,
  StatCounts,
} from '../../core/seasons/season-statistics-api.service'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import { StatRatioDisplay } from './stat-ratio-display'
import { monthLabel } from './season-statistics.utils'

export type StatisticsColumnVisibility = {
  showJeuDetails: boolean
  showDecorumDetails: boolean
  showBenevoleDetails: boolean
  expandedMonths: Set<string>
}

export type StatisticsEmptyReason = 'none-selected' | 'no-data' | null

@Component({
  selector: 'app-season-statistics',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, StatRatioDisplay, UserAvatarComponent],
  templateUrl: './season-statistics.html',
  styleUrl: './season-statistics.scss',
})
export class SeasonStatistics {
  readonly data = input<SeasonStatisticsResponse | null>(null)
  readonly loading = input(false)
  readonly detailsExpanded = input(false)
  readonly emptyReason = input<StatisticsEmptyReason>(null)
  readonly troupeId = input<string | null>(null)
  readonly leagueId = input<string | null>(null)

  private readonly memberProfile = inject(MemberProfileService)

  protected readonly jeuExpanded = signal(false)
  protected readonly decorumExpanded = signal(false)
  protected readonly benevoleExpanded = signal(false)
  protected readonly expandedMonths = signal<Set<string>>(new Set())

  protected readonly rows = computed(() => this.data()?.rows ?? [])
  protected readonly monthKeys = computed(() => this.data()?.monthKeys ?? [])
  protected readonly events = computed(() => this.data()?.events ?? [])

  protected readonly emptyMessage = computed(() => {
    const reason = this.emptyReason()
    if (reason === 'none-selected') {
      return 'Sélectionnez au moins un groupe de spectacles pour afficher les statistiques.'
    }
    if (reason === 'no-data') {
      return 'Aucune donnée pour les groupes sélectionnés sur cette saison.'
    }
    if (!this.data() || this.rows().length === 0) {
      return 'Pas encore de données pour cette saison.'
    }
    return null
  })

  protected toggleJeu(): void {
    this.jeuExpanded.update((v) => !v)
  }

  protected toggleDecorum(): void {
    this.decorumExpanded.update((v) => !v)
  }

  protected toggleBenevole(): void {
    this.benevoleExpanded.update((v) => !v)
  }

  protected toggleMonth(monthKey: string): void {
    this.expandedMonths.update((set) => {
      const next = new Set(set)
      if (next.has(monthKey)) {
        next.delete(monthKey)
      } else {
        next.add(monthKey)
      }
      return next
    })
  }

  protected isMonthExpanded(monthKey: string): boolean {
    return this.detailsExpanded() || this.expandedMonths().has(monthKey)
  }

  protected monthEvents(monthKey: string) {
    return this.events().filter((e) => e.monthKey === monthKey)
  }

  protected monthLabel(key: string): string {
    return monthLabel(key)
  }

  protected annualCounts(
    row: ParticipantStatisticsRow,
    key: string,
  ): StatCounts | undefined {
    return row.annual[key]
  }

  protected monthSummary(
    row: ParticipantStatisticsRow,
    monthKey: string,
  ): StatCounts | undefined {
    return row.monthSummary[monthKey]
  }

  protected eventCell(row: ParticipantStatisticsRow, eventId: string): string {
    return row.eventCells[eventId] ?? '—'
  }

  protected canOpenMemberProfile(row: ParticipantStatisticsRow): boolean {
    return !!row.userSlug?.trim()
  }

  protected memberProfileAriaLabel(row: ParticipantStatisticsRow): string {
    return `Voir la saison en un clin d'œil de ${row.displayName}`
  }

  protected readonly profileUnavailableTooltip =
    'Profil indisponible — aucun compte lié'

  protected openMemberProfile(row: ParticipantStatisticsRow): void {
    const userSlug = row.userSlug?.trim()
    if (!userSlug) {
      return
    }
    this.memberProfile.navigateToMemberGlance({
      userSlug,
      troupeId: this.troupeId() ?? undefined,
      leagueId: this.leagueId() ?? undefined,
    })
  }

  protected jeuDetailsVisible(): boolean {
    return this.detailsExpanded() || this.jeuExpanded()
  }

  protected decorumDetailsVisible(): boolean {
    return this.detailsExpanded() || this.decorumExpanded()
  }

  protected benevoleDetailsVisible(): boolean {
    return this.detailsExpanded() || this.benevoleExpanded()
  }

  protected anyBandDetailsVisible(): boolean {
    return (
      this.jeuDetailsVisible() ||
      this.decorumDetailsVisible() ||
      this.benevoleDetailsVisible()
    )
  }

  /** Exposed for parent export. */
  columnVisibility(): StatisticsColumnVisibility {
    return {
      showJeuDetails: this.jeuDetailsVisible(),
      showDecorumDetails: this.decorumDetailsVisible(),
      showBenevoleDetails: this.benevoleDetailsVisible(),
      expandedMonths: this.expandedMonthKeys(),
    }
  }

  expandedMonthKeys(): Set<string> {
    if (this.detailsExpanded()) {
      return new Set(this.monthKeys())
    }
    return this.expandedMonths()
  }
}
