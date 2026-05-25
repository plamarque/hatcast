import { Component, computed, input, model, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
  type ScopeAdminMenuScope,
} from '../../shared/scope-admin-menu/scope-admin-menu'
import type { EventFilterOption, ParticipantFilterOption, SeasonView } from './season-view.types'
import {
  PRINCIPAL_COMPARTMENT,
  allCompartmentSlugs,
  isSlugSelected,
  statsGroupsFilterLabel,
  toggleAllCompartments,
  toggleCompartmentSlug,
  type StatsEquityCompartments,
} from './stats-equity-compartments'

@Component({
  selector: 'app-season-view-toolbar',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    ScopeAdminMenu,
  ],
  templateUrl: './season-view-toolbar.html',
  styleUrl: './season-view-toolbar.scss',
})
export class SeasonViewToolbar {
  readonly seasonView = model.required<SeasonView>()
  readonly showAgendaFilters = input(true)
  readonly showHistoryFilters = input(false)
  readonly showStatsFilters = input(false)
  readonly detailsExpanded = model(false)

  /** Participant filter — MVP: only Tous until player/availability data exists. */
  readonly participantOptions = input<ParticipantFilterOption[]>([
    { id: null, label: 'Tous' },
  ])
  readonly selectedParticipantId = model<string | null>(null)

  readonly eventOptions = input<EventFilterOption[]>([])
  readonly selectedEventId = model<string | null>(null)

  readonly historyEventOptions = input<EventFilterOption[]>([])
  readonly selectedHistoryEventId = model<string | null>(null)

  readonly statsEventOptions = input<EventFilterOption[]>([])
  readonly selectedStatsEventId = model<string | null>(null)

  readonly equityGlossarySlugs = input<string[]>([])
  readonly equityTagLabels = input<Record<string, string>>({})
  readonly statsEquityCompartments = input<StatsEquityCompartments>({ kind: 'all' })
  readonly statsEquityCompartmentsChange = output<StatsEquityCompartments>()

  readonly exportClick = output<void>()

  readonly adminScope = input<ScopeAdminMenuScope>('saison')
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  protected readonly allCompartmentSlugs = computed(() =>
    allCompartmentSlugs(this.equityGlossarySlugs()),
  )

  protected readonly statsGroupsLabel = computed(() =>
    statsGroupsFilterLabel(this.statsEquityCompartments(), this.equityTagLabels()),
  )

  protected readonly statsGroupsNoneSelected = computed(
    () => this.statsEquityCompartments().kind === 'none',
  )

  protected participantLabel(): string {
    const id = this.selectedParticipantId()
    const opt = this.participantOptions().find((o) => o.id === id)
    return opt?.label ?? 'Tous'
  }

  protected eventLabel(): string {
    const id = this.selectedEventId()
    if (!id) {
      return 'Tous'
    }
    return this.eventOptions().find((o) => o.id === id)?.title ?? 'Tous'
  }

  protected historyEventLabel(): string {
    const id = this.selectedHistoryEventId()
    if (!id) {
      return 'Tous'
    }
    return this.historyEventOptions().find((o) => o.id === id)?.title ?? 'Tous'
  }

  protected statsEventLabel(): string {
    const id = this.selectedStatsEventId()
    if (!id) {
      return 'Tous'
    }
    return this.statsEventOptions().find((o) => o.id === id)?.title ?? 'Tous'
  }

  protected isAllCompartmentsSelected(): boolean {
    return this.statsEquityCompartments().kind === 'all'
  }

  protected isCompartmentChecked(slug: string): boolean {
    return isSlugSelected(this.statsEquityCompartments(), slug)
  }

  protected principalLabel(): string {
    return 'Spectacles ordinaires'
  }

  protected glossaryLabel(slug: string): string {
    return this.equityTagLabels()[slug] ?? slug
  }

  protected toggleAllGroups(checked: boolean): void {
    this.emitCompartments(
      toggleAllCompartments(this.statsEquityCompartments(), this.allCompartmentSlugs(), checked),
    )
  }

  protected togglePrincipal(checked: boolean): void {
    this.toggleCompartment(PRINCIPAL_COMPARTMENT, checked)
  }

  protected toggleGlossarySlug(slug: string, checked: boolean): void {
    this.toggleCompartment(slug, checked)
  }

  private toggleCompartment(slug: string, checked: boolean): void {
    this.emitCompartments(
      toggleCompartmentSlug(
        this.statsEquityCompartments(),
        this.allCompartmentSlugs(),
        slug,
        checked,
      ),
    )
  }

  private emitCompartments(next: StatsEquityCompartments): void {
    this.statsEquityCompartmentsChange.emit(next)
  }

  protected selectParticipant(id: string | null): void {
    this.selectedParticipantId.set(id)
  }

  protected selectEvent(id: string | null): void {
    this.selectedEventId.set(id)
  }

  protected selectHistoryEvent(id: string | null): void {
    this.selectedHistoryEventId.set(id)
  }

  protected selectStatsEvent(id: string | null): void {
    this.selectedStatsEventId.set(id)
  }

  protected toggleDetails(): void {
    this.detailsExpanded.update((v) => !v)
  }
}
