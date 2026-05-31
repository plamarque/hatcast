import { Component, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'

import type { ActiveFilterChip, FilterDimensionKey } from './filter.types'

@Component({
  selector: 'app-active-filter-chips',
  imports: [MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './active-filter-chips.html',
  styleUrl: './active-filter-chips.scss',
})
export class ActiveFilterChips {
  readonly chips = input<ActiveFilterChip[]>([])

  readonly removeDimension = output<FilterDimensionKey>()
  readonly openDimension = output<FilterDimensionKey>()
  readonly clearAll = output<void>()

  protected onRemove(key: FilterDimensionKey): void {
    this.removeDimension.emit(key)
  }

  protected onChipClick(key: FilterDimensionKey): void {
    this.openDimension.emit(key)
  }

  protected onClearAll(): void {
    this.clearAll.emit()
  }
}
