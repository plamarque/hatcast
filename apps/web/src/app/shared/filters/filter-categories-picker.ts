import { A11yModule } from '@angular/cdk/a11y'
import { Component, inject, signal } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import { defaultStatsCategoryFilter, type StatsCategoryFilter } from '../../pages/season-home/stats-categories'
import { FilterDimensionCategories } from './filter-dimension-categories'
import type { CategoriesPickerData, CategoriesPickerResult } from './filter.types'

@Component({
  selector: 'app-filter-categories-picker',
  imports: [
    A11yModule,
    MatButtonModule,
    MatIconModule,
    FilterDimensionCategories,
  ],
  templateUrl: './filter-categories-picker.html',
  styleUrl: './filter-picker-shell.scss',
})
export class FilterCategoriesPicker {
  private readonly sheetRef = inject(
    MatBottomSheetRef<FilterCategoriesPicker, CategoriesPickerResult>,
    { optional: true },
  )
  private readonly dialogRef = inject(
    MatDialogRef<FilterCategoriesPicker, CategoriesPickerResult>,
    { optional: true },
  )
  private readonly sheetData = inject<CategoriesPickerData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<CategoriesPickerData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly isBottomSheet = this.sheetRef != null
  protected readonly draft = signal<StatsCategoryFilter>(this.data.value)

  protected close(): void {
    this.finish(undefined)
  }

  protected onCategoriesChange(value: StatsCategoryFilter): void {
    this.draft.set(value)
  }

  protected onReset(): void {
    this.finish({ action: 'reset', value: defaultStatsCategoryFilter() })
  }

  protected onApply(): void {
    this.finish({ action: 'apply', value: this.draft() })
  }

  private finish(result: CategoriesPickerResult | undefined): void {
    if (this.sheetRef) {
      this.sheetRef.dismiss(result)
      return
    }
    this.dialogRef?.close(result)
  }
}
