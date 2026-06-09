import { A11yModule } from '@angular/cdk/a11y'
import { Component, inject, signal } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import { FilterDimensionCategories } from './filter-dimension-categories'
import { FilterDimensionSingle } from './filter-dimension-single'
import { buildAgendaFilterDimensions, resolveAgendaPanelSeason } from './filter-builders'
import type { FilterDimensionConfig, FilterPanelData, FilterPanelResult, FilterValues } from './filter.types'

@Component({
  selector: 'app-filter-panel-content',
  imports: [
    A11yModule,
    MatButtonModule,
    MatIconModule,
    FilterDimensionSingle,
    FilterDimensionCategories,
  ],
  templateUrl: './filter-panel-content.html',
  styleUrl: './filter-panel-content.scss',
})
export class FilterPanelContent {
  private readonly sheetRef = inject(MatBottomSheetRef<FilterPanelContent, FilterPanelResult>, {
    optional: true,
  })
  private readonly dialogRef = inject(MatDialogRef<FilterPanelContent, FilterPanelResult>, {
    optional: true,
  })
  private readonly sheetData = inject<FilterPanelData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<FilterPanelData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly isBottomSheet = this.sheetRef != null
  protected readonly draft = signal<FilterValues>({ ...this.data.values })

  protected readonly showFooter = this.data.isMobile || this.hasMultiSelect() || !this.isBottomSheet

  protected effectiveDimensions(): FilterDimensionConfig[] {
    if (this.data.participationFilters) {
      return buildAgendaFilterDimensions(
        this.data.participationFilters,
        this.draft().troupe ?? null,
      )
    }
    return this.data.dimensions
  }

  protected close(): void {
    this.sheetRef?.dismiss()
    this.dialogRef?.close()
  }

  protected onSingleSelect(key: FilterDimensionConfig['key'], id: string | null): void {
    let next: FilterValues = { ...this.draft(), [key]: id }
    if (key === 'troupe' && this.data.participationFilters) {
      next = {
        ...next,
        season: resolveAgendaPanelSeason(
          this.data.participationFilters,
          id,
          next.season ?? null,
        ),
      }
    }
    this.draft.set(next)
    if (!this.data.isMobile) {
      this.finish('apply', next)
    }
  }

  protected onCategoriesChange(value: FilterValues['categories']): void {
    this.draft.set({ ...this.draft(), categories: value })
  }

  protected onReset(): void {
    const resetValues = this.defaultValues()
    if (this.data.isMobile) {
      this.draft.set(resetValues)
      this.finish('reset', resetValues)
      return
    }
    this.finish('reset', resetValues)
  }

  protected onApply(): void {
    this.finish('apply', this.draft())
  }

  private finish(action: FilterPanelResult['action'], values: FilterValues): void {
    const result: FilterPanelResult = { action, values }
    if (this.sheetRef) {
      this.sheetRef.dismiss(result)
      return
    }
    this.dialogRef?.close(result)
  }

  protected hasMultiSelect(): boolean {
    return this.effectiveDimensions().some((d) => d.type === 'multi-select')
  }

  private defaultValues(): FilterValues {
    const defaults: FilterValues = {}
    for (const dim of this.effectiveDimensions()) {
      if (dim.type === 'multi-select') {
        defaults.categories = { kind: 'all' }
      } else if (dim.key === 'troupe') {
        defaults.troupe = null
      } else if (dim.key === 'season') {
        defaults.season = null
      } else if (dim.key === 'participant') {
        defaults.participant = []
      } else if (dim.key === 'spectacle') {
        defaults.spectacle = []
      }
    }
    return defaults
  }
}
