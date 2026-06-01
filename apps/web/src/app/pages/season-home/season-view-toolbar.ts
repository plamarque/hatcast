import { Component, computed, inject, input, model, output, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'

import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import {
  buildSeasonFilterChips,
  buildSeasonHubDimensions,
  defaultEventPickerScope,
  eventFilterOptionFromResponse,
  eventOptionsForPicker,
  participantOptionsForPicker,
  resetSeasonFilterDimension,
} from '../../shared/filters/filter-builders'
import { ActiveFilterChips } from '../../shared/filters/active-filter-chips'
import { FilterCriteriaBar } from '../../shared/filters/filter-criteria-bar'
import { FilterPanelService } from '../../shared/filters/filter-panel.service'
import { FilterTrigger } from '../../shared/filters/filter-trigger'
import type { FilterDimensionKey } from '../../shared/filters/filter.types'
import type { EventFilterOption, ParticipantFilterOption, SeasonView } from './season-view.types'
import {
  defaultStatsCategoryFilter,
  type StatsCategoryFilter,
} from './stats-categories'

const EVENT_PICKER_PAGE_SIZE = 50
const EVENT_PICKER_MAX = 250

@Component({
  selector: 'app-season-view-toolbar',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    ActiveFilterChips,
    FilterCriteriaBar,
    FilterTrigger,
  ],
  templateUrl: './season-view-toolbar.html',
  styleUrl: './season-view-toolbar.scss',
})
export class SeasonViewToolbar {
  private readonly filterPanel = inject(FilterPanelService)
  private readonly eventsApi = inject(EventApiService)

  readonly seasonView = model.required<SeasonView>()
  readonly seasonId = input<string | null>(null)
  readonly filterTriggerVisible = input(false)
  readonly detailsExpanded = model(false)

  readonly participantOptions = input<ParticipantFilterOption[]>([
    { id: null, label: 'Tous' },
  ])
  readonly selectedParticipantIds = model<string[]>([])

  readonly eventOptions = input<EventFilterOption[]>([])
  readonly selectedEventIds = model<string[]>([])

  readonly historyEventOptions = input<EventFilterOption[]>([])
  readonly selectedHistoryEventIds = model<string[]>([])

  readonly statsEventOptions = input<EventFilterOption[]>([])
  readonly selectedStatsEventIds = model<string[]>([])

  readonly categoryGlossarySlugs = input<string[]>([])
  readonly categoryLabels = input<Record<string, string>>({})
  readonly statsCategoryFilter = input<StatsCategoryFilter>({ kind: 'all' })
  readonly statsCategoryFilterChange = output<StatsCategoryFilter>()

  protected readonly filterPanelOpen = signal(false)
  private readonly eventPickerShowPast = signal(false)
  private readonly eventPickerShowArchived = signal(false)
  private readonly eventPickerShowDraft = signal(false)

  protected readonly statsCategoriesNoneSelected = computed(
    () => this.statsCategoryFilter().kind === 'none',
  )

  protected readonly hubDimensions = computed(() =>
    buildSeasonHubDimensions({
      view: this.seasonView(),
      participantOptions: this.participantOptions(),
      selectedParticipantIds: this.selectedParticipantIds(),
      eventOptions: this.currentEventOptions(),
      selectedEventIds: this.currentEventIds(),
      statsCategoryFilter:
        this.seasonView() === 'stats' ? this.statsCategoryFilter() : { kind: 'all' },
      categoryLabels: this.categoryLabels(),
      categoryGlossarySlugs: this.categoryGlossarySlugs(),
    }),
  )

  protected readonly activeFilterChips = computed(() =>
    buildSeasonFilterChips({
      participantOptions: this.participantOptions(),
      selectedParticipantIds: this.selectedParticipantIds(),
      eventOptions: this.currentEventOptions(),
      selectedEventIds: this.currentEventIds(),
      statsCategoryFilter:
        this.seasonView() === 'stats' ? this.statsCategoryFilter() : { kind: 'all' },
      categoryLabels: this.categoryLabels(),
    }),
  )

  protected showDetailsToggle(): boolean {
    return this.seasonView() === 'stats'
  }

  protected toggleCriteriaPanel(): void {
    if (!this.filterTriggerVisible()) {
      return
    }
    this.filterPanelOpen.update((open) => !open)
  }

  protected async onOpenFilterDimension(key: FilterDimensionKey): Promise<void> {
    await this.openPickerForDimension(key)
  }

  protected onRemoveFilterDimension(key: FilterDimensionKey): void {
    const reset = resetSeasonFilterDimension(key, {
      statsCategoryFilter: this.statsCategoryFilter(),
    })
    if (reset.participant) {
      this.selectedParticipantIds.set([])
    }
    if (reset.spectacle) {
      this.setCurrentEventIds([])
    }
    if (reset.categories && this.seasonView() === 'stats') {
      this.statsCategoryFilterChange.emit(reset.categories)
    }
  }

  protected onClearAllFilters(): void {
    this.selectedParticipantIds.set([])
    this.setCurrentEventIds([])
    if (this.seasonView() === 'stats') {
      this.statsCategoryFilterChange.emit(defaultStatsCategoryFilter())
    }
  }

  protected toggleDetails(): void {
    this.detailsExpanded.update((v) => !v)
  }

  private async openPickerForDimension(key: FilterDimensionKey): Promise<void> {
    if (key === 'participant') {
      await this.openParticipantPicker()
      return
    }
    if (key === 'spectacle') {
      await this.openEventPicker()
      return
    }
    if (key === 'categories') {
      await this.openCategoriesPicker()
    }
  }

  private async openParticipantPicker(): Promise<void> {
    const result = await this.filterPanel.openParticipantPicker({
      options: participantOptionsForPicker(this.participantOptions()),
      selectedIds: [...this.selectedParticipantIds()],
    })
    if (!result) {
      return
    }
    if (result.action === 'reset') {
      this.selectedParticipantIds.set([])
      return
    }
    this.selectedParticipantIds.set([...result.selectedIds])
  }

  private async openEventPicker(): Promise<void> {
    const view = this.seasonView()
    const defaults = defaultEventPickerScope(view)
    const pickerOptions = await this.loadEventPickerOptions()
    const result = await this.filterPanel.openEventPicker({
      options: pickerOptions,
      selectedIds: [...this.currentEventIds()],
      showPast: this.eventPickerShowPast() || defaults.showPast,
      showArchived: this.eventPickerShowArchived() || defaults.showArchived,
      showDraft: this.eventPickerShowDraft() || defaults.showDraft,
    })
    if (!result) {
      return
    }
    this.eventPickerShowPast.set(result.showPast)
    this.eventPickerShowArchived.set(result.showArchived)
    this.eventPickerShowDraft.set(result.showDraft)
    if (result.action === 'reset') {
      this.setCurrentEventIds([])
      return
    }
    this.setCurrentEventIds([...result.selectedIds])
  }

  private async openCategoriesPicker(): Promise<void> {
    const result = await this.filterPanel.openCategoriesPicker({
      value: this.statsCategoryFilter(),
      glossarySlugs: this.categoryGlossarySlugs(),
      labels: this.categoryLabels(),
    })
    if (!result) {
      return
    }
    if (result.action === 'reset') {
      this.statsCategoryFilterChange.emit(defaultStatsCategoryFilter())
      return
    }
    this.statsCategoryFilterChange.emit(result.value)
  }

  private currentEventOptions(): EventFilterOption[] {
    const view = this.seasonView()
    if (view === 'history') {
      return this.historyEventOptions()
    }
    if (view === 'stats') {
      return this.statsEventOptions()
    }
    return this.eventOptions()
  }

  private currentEventIds(): string[] {
    const view = this.seasonView()
    if (view === 'history') {
      return this.selectedHistoryEventIds()
    }
    if (view === 'stats') {
      return this.selectedStatsEventIds()
    }
    return this.selectedEventIds()
  }

  private setCurrentEventIds(ids: string[]): void {
    const view = this.seasonView()
    if (view === 'history') {
      this.selectedHistoryEventIds.set(ids)
      return
    }
    if (view === 'stats') {
      this.selectedStatsEventIds.set(ids)
      return
    }
    this.selectedEventIds.set(ids)
  }

  private async loadEventPickerOptions(): Promise<
    ReturnType<typeof eventOptionsForPicker>
  > {
    const seasonId = this.seasonId()
    if (!seasonId) {
      return eventOptionsForPicker(this.currentEventOptions())
    }

    const collected: EventResponse[] = []
    let page = 0
    while (collected.length < EVENT_PICKER_MAX) {
      const r = await this.eventsApi.listEvents(
        seasonId,
        page,
        EVENT_PICKER_PAGE_SIZE,
        'all',
      )
      if (!r.ok || !r.data) {
        break
      }
      collected.push(...r.data.content)
      if (
        r.data.content.length === 0 ||
        page >= r.data.totalPages - 1 ||
        collected.length >= r.data.totalElements
      ) {
        break
      }
      page += 1
    }

    if (collected.length === 0) {
      return eventOptionsForPicker(this.currentEventOptions())
    }

    const now = new Date()
    return eventOptionsForPicker(
      collected.slice(0, EVENT_PICKER_MAX).map((e) => eventFilterOptionFromResponse(e, now)),
    )
  }
}
