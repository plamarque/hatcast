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

import { UserAvatarComponent } from '../user-avatar/user-avatar'
import type { ParticipantPickerData, ParticipantPickerResult } from './filter.types'

@Component({
  selector: 'app-filter-participant-picker',
  imports: [
    A11yModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    UserAvatarComponent,
  ],
  templateUrl: './filter-participant-picker.html',
  styleUrl: './filter-picker-shell.scss',
})
export class FilterParticipantPicker {
  private readonly sheetRef = inject(
    MatBottomSheetRef<FilterParticipantPicker, ParticipantPickerResult>,
    { optional: true },
  )
  private readonly dialogRef = inject(
    MatDialogRef<FilterParticipantPicker, ParticipantPickerResult>,
    { optional: true },
  )
  private readonly sheetData = inject<ParticipantPickerData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })
  private readonly dialogData = inject<ParticipantPickerData | null>(MAT_DIALOG_DATA, {
    optional: true,
  })

  protected readonly data = this.sheetData ?? this.dialogData!
  protected readonly isBottomSheet = this.sheetRef != null
  protected readonly searchQuery = signal('')
  protected readonly draftIds = signal<Set<string>>(new Set(this.data.selectedIds))

  protected readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase()
    if (!q) {
      return this.data.options
    }
    return this.data.options.filter((o) => o.label.toLowerCase().includes(q))
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

  protected close(): void {
    this.finish(undefined)
  }

  protected isSelected(id: string): boolean {
    return this.draftIds().has(id)
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

  protected toggleParticipant(id: string): void {
    const next = new Set(this.draftIds())
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    this.draftIds.set(next)
  }

  protected onReset(): void {
    this.finish({ action: 'reset', selectedIds: [] })
  }

  protected onApply(): void {
    this.finish({ action: 'apply', selectedIds: [...this.draftIds()] })
  }

  private finish(result: ParticipantPickerResult | undefined): void {
    if (this.sheetRef) {
      this.sheetRef.dismiss(result)
      return
    }
    this.dialogRef?.close(result)
  }
}
