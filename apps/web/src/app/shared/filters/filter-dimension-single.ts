import { Component, input, output } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'

import type { FilterDimensionConfig } from './filter.types'

@Component({
  selector: 'app-filter-dimension-single',
  imports: [MatIconModule, MatListModule],
  templateUrl: './filter-dimension-single.html',
  styleUrl: './filter-dimension-single.scss',
})
export class FilterDimensionSingle {
  readonly dimension = input.required<FilterDimensionConfig>()
  readonly selectedId = input<string | null>(null)
  readonly immediateApply = input(false)

  readonly selectionChange = output<string | null>()

  protected onSelect(id: string | null): void {
    this.selectionChange.emit(id)
  }
}
