import { A11yModule } from '@angular/cdk/a11y'
import { Component, computed, inject, signal } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import { HatcastDialogDismiss } from '../dialog-chrome/hatcast-dialog-dismiss'
import { HatcastPickerHeader } from '../dialog-chrome/hatcast-picker-header'
import { buildAgendaFilterDimensions, resolveAgendaPanelSeason } from './filter-builders'
import { FilterDimensionSingle } from './filter-dimension-single'
import type { SinglePickerData, SinglePickerResult } from './filter.types'

@Component({
  selector: 'app-filter-single-picker',
  imports: [
    HatcastDialogDismiss,
    HatcastPickerHeader,
    A11yModule,
    MatButtonModule,
    MatIconModule,
    FilterDimensionSingle,
  ],
  templateUrl: './filter-single-picker.html',
  styleUrl: './filter-picker-shell.scss',
})
export class FilterSinglePicker {
  private readonly sheetRef = inject(MatBottomSheetRef<FilterSinglePicker, SinglePickerResult>, {
    optional: true,
  })
  private readonly dialogRef = inject(MatDialogRef<FilterSinglePicker, SinglePickerResult>, {
    optional: true,
  })
  private readonly sheetData = inject<SinglePickerData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<SinglePickerData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly isBottomSheet = this.sheetRef != null
  protected readonly draftId = signal<string | null>(this.data.selectedId)

  protected readonly effectiveDimension = computed(() => {
    const dim = this.data.dimension
    if (!this.data.participationFilters || dim.key !== 'season') {
      return dim
    }
    const built = buildAgendaFilterDimensions(
      this.data.participationFilters,
      this.data.draftTroupeId ?? null,
    )
    return built.find((d) => d.key === 'season') ?? dim
  })

  protected close(): void {
    this.finish(undefined)
  }

  protected onSelect(id: string | null): void {
    let next = id
    if (
      this.data.dimension.key === 'season' &&
      this.data.participationFilters
    ) {
      next = resolveAgendaPanelSeason(
        this.data.participationFilters,
        this.data.draftTroupeId ?? null,
        id,
      )
    }
    this.draftId.set(next)
    if (!this.data.isMobile) {
      this.finish({ action: 'apply', selectedId: next })
    }
  }

  protected onReset(): void {
    this.finish({ action: 'reset', selectedId: null })
  }

  protected onApply(): void {
    this.finish({ action: 'apply', selectedId: this.draftId() })
  }

  private finish(result: SinglePickerResult | undefined): void {
    if (this.sheetRef) {
      this.sheetRef.dismiss(result)
      return
    }
    this.dialogRef?.close(result)
  }
}
