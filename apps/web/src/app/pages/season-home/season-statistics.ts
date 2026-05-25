import { Component, computed, input, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import type {
  ParticipantStatisticsRow,
  SeasonStatisticsResponse,
  StatCounts,
} from '../../core/seasons/season-statistics-api.service'
import { StatRatioDisplay } from './stat-ratio-display'
import { monthLabel } from './season-statistics.utils'

export type StatisticsColumnVisibility = {
  showJeuDetails: boolean
  showDecorumDetails: boolean
  showDeplacementDetails: boolean
  showBenevoleDetails: boolean
  expandedMonths: Set<string>
}

@Component({
  selector: 'app-season-statistics',
  imports: [MatButtonModule, MatIconModule, StatRatioDisplay],
  templateUrl: './season-statistics.html',
  styleUrl: './season-statistics.scss',
})
export class SeasonStatistics {
  readonly data = input<SeasonStatisticsResponse | null>(null)
  readonly loading = input(false)
  readonly detailsExpanded = input(false)

  protected readonly jeuExpanded = signal(false)
  protected readonly decorumExpanded = signal(false)
  protected readonly deplacementExpanded = signal(false)
  protected readonly benevoleExpanded = signal(false)
  protected readonly expandedMonths = signal<Set<string>>(new Set())

  protected readonly rows = computed(() => this.data()?.rows ?? [])
  protected readonly monthKeys = computed(() => this.data()?.monthKeys ?? [])
  protected readonly events = computed(() => this.data()?.events ?? [])

  protected toggleJeu(): void {
    this.jeuExpanded.update((v) => !v)
  }

  protected toggleDecorum(): void {
    this.decorumExpanded.update((v) => !v)
  }

  protected toggleDeplacement(): void {
    this.deplacementExpanded.update((v) => !v)
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

  protected jeuDetailsVisible(): boolean {
    return this.detailsExpanded() || this.jeuExpanded()
  }

  protected decorumDetailsVisible(): boolean {
    return this.detailsExpanded() || this.decorumExpanded()
  }

  protected deplacementDetailsVisible(): boolean {
    return this.detailsExpanded() || this.deplacementExpanded()
  }

  protected benevoleDetailsVisible(): boolean {
    return this.detailsExpanded() || this.benevoleExpanded()
  }

  protected anyBandDetailsVisible(): boolean {
    return (
      this.jeuDetailsVisible() ||
      this.decorumDetailsVisible() ||
      this.deplacementDetailsVisible() ||
      this.benevoleDetailsVisible()
    )
  }

  /** Exposed for parent export. */
  columnVisibility(): StatisticsColumnVisibility {
    return {
      showJeuDetails: this.jeuDetailsVisible(),
      showDecorumDetails: this.decorumDetailsVisible(),
      showDeplacementDetails: this.deplacementDetailsVisible(),
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
