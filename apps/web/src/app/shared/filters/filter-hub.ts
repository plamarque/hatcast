import { A11yModule } from '@angular/cdk/a11y'
import { Component, inject } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'

import type { FilterDimensionKey, FilterHubData } from './filter.types'

@Component({
  selector: 'app-filter-hub',
  imports: [A11yModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './filter-hub.html',
  styleUrl: './filter-hub.scss',
})
export class FilterHub {
  private readonly sheetRef = inject(MatBottomSheetRef<FilterHub, FilterDimensionKey | undefined>, {
    optional: true,
  })
  private readonly dialogRef = inject(MatDialogRef<FilterHub, FilterDimensionKey | undefined>, {
    optional: true,
  })
  private readonly sheetData = inject<FilterHubData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<FilterHubData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })

  protected readonly data = this.sheetData ?? this.dialogData!

  protected close(): void {
    this.dismiss(undefined)
  }

  protected openDimension(key: FilterDimensionKey): void {
    this.dismiss(key)
  }

  private dismiss(key: FilterDimensionKey | undefined): void {
    if (this.sheetRef) {
      this.sheetRef.dismiss(key)
      return
    }
    this.dialogRef?.close(key)
  }
}
