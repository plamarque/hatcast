import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'

import type { ActiveFilterChip, FilterDimensionKey, FilterHubDimension } from './filter.types'

@Component({
  selector: 'app-filter-criteria-bar',
  imports: [MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './filter-criteria-bar.html',
  styleUrl: './filter-criteria-bar.scss',
})
export class FilterCriteriaBar {
  readonly dimensions = input.required<FilterHubDimension[]>()
  readonly chips = input<ActiveFilterChip[]>([])

  readonly openDimension = output<FilterDimensionKey>()
  readonly removeDimension = output<FilterDimensionKey>()
  readonly clearAll = output<void>()

  protected readonly chipByKey = computed(() => {
    const map = new Map<FilterDimensionKey, ActiveFilterChip>()
    for (const chip of this.chips()) {
      map.set(chip.dimensionKey, chip)
    }
    return map
  })

  protected readonly hasActiveFilters = computed(() => this.chips().length > 0)

  protected chipFor(key: FilterDimensionKey): ActiveFilterChip | undefined {
    return this.chipByKey().get(key)
  }

  protected onOpen(key: FilterDimensionKey): void {
    this.openDimension.emit(key)
  }

  protected onRemove(key: FilterDimensionKey): void {
    this.removeDimension.emit(key)
  }

  protected onClearAll(): void {
    this.clearAll.emit()
  }
}
