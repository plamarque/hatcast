import { A11yModule } from '@angular/cdk/a11y'
import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'

import { filterEventPickerVisibleOptions } from './filter-builders'
import type { EventPickerData, EventPickerResult } from './filter.types'

@Component({
  selector: 'app-filter-event-picker',
  imports: [
    A11yModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
  ],
  templateUrl: './filter-event-picker.html',
  styleUrls: ['./filter-picker-shell.scss', './filter-event-picker.scss'],
})
export class FilterEventPicker {
  private readonly sheetRef = inject(MatBottomSheetRef<FilterEventPicker, EventPickerResult>, {
    optional: true,
  })
  private readonly dialogRef = inject(MatDialogRef<FilterEventPicker, EventPickerResult>, {
    optional: true,
  })
  private readonly sheetData = inject<EventPickerData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<EventPickerData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly isBottomSheet = this.sheetRef != null
  protected readonly searchQuery = signal('')
  protected readonly showPast = signal(this.data.showPast)
  protected readonly showArchived = signal(this.data.showArchived)
  protected readonly draftIds = signal<Set<string>>(new Set(this.data.selectedIds))

  protected readonly scopedOptions = computed(() =>
    filterEventPickerVisibleOptions(
      this.data.options,
      this.showPast(),
      this.showArchived(),
    ),
  )

  protected readonly scopeFiltersActive = computed(
    () => this.showPast() || this.showArchived(),
  )

  protected readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase()
    const scoped = this.scopedOptions()
    if (!q) {
      return scoped
    }
    return scoped.filter((o) => o.title.toLowerCase().includes(q))
  })

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.filteredOptions()
    if (visible.length === 0) {
      return false
    }
    const draft = this.draftIds()
    return visible.every((o) => draft.has(o.id))
  })

  protected readonly someVisibleSelected = computed(() => {
    const visible = this.filteredOptions()
    const draft = this.draftIds()
    const selectedCount = visible.filter((o) => draft.has(o.id)).length
    return selectedCount > 0 && selectedCount < visible.length
  })

  protected readonly scopeActiveCount = computed(
    () => (this.showPast() ? 1 : 0) + (this.showArchived() ? 1 : 0),
  )

  protected close(): void {
    this.finish(undefined)
  }

  protected isSelected(id: string): boolean {
    return this.draftIds().has(id)
  }

  protected eventDateLabel(option: { startsAt?: string }): string | null {
    if (!option.startsAt) {
      return null
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Paris',
    }).format(new Date(option.startsAt))
  }

  protected toggleAllVisible(): void {
    const visible = this.filteredOptions()
    const next = new Set(this.draftIds())
    if (this.allVisibleSelected()) {
      for (const o of visible) {
        next.delete(o.id)
      }
    } else {
      for (const o of visible) {
        next.add(o.id)
      }
    }
    this.draftIds.set(next)
  }

  protected toggleEvent(id: string): void {
    const next = new Set(this.draftIds())
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    this.draftIds.set(next)
  }

  protected onReset(): void {
    this.finish({
      action: 'reset',
      selectedIds: [],
      showPast: this.data.showPast,
      showArchived: this.data.showArchived,
    })
  }

  protected onApply(): void {
    this.finish({
      action: 'apply',
      selectedIds: [...this.draftIds()],
      showPast: this.showPast(),
      showArchived: this.showArchived(),
    })
  }

  private finish(result: EventPickerResult | undefined): void {
    if (this.sheetRef) {
      this.sheetRef.dismiss(result)
      return
    }
    this.dialogRef?.close(result)
  }
}
