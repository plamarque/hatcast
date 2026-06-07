import { Component, computed, inject, signal } from '@angular/core'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import {
  DRAW_CHANCES_HELP_SLIDE_COUNT,
  DRAW_CHANCES_HELP_SLIDES,
} from './draw-chances-help-slides'

export interface DrawChancesHelpData {
  isMobile?: boolean
}

@Component({
  selector: 'app-draw-chances-help-dialog',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './draw-chances-help-dialog.html',
  styleUrl: './draw-chances-help-dialog.scss',
})
export class DrawChancesHelpDialog {
  private readonly sheetRef = inject(MatBottomSheetRef<DrawChancesHelpDialog>, { optional: true })
  private readonly dialogRef = inject(MatDialogRef<DrawChancesHelpDialog>, { optional: true })
  private readonly sheetData = inject<DrawChancesHelpData | null>(MAT_BOTTOM_SHEET_DATA, {
    optional: true,
  })

  protected readonly slides = DRAW_CHANCES_HELP_SLIDES
  protected readonly slideCount = DRAW_CHANCES_HELP_SLIDE_COUNT
  protected readonly currentSlide = signal(0)

  protected readonly current = computed(() => this.slides[this.currentSlide()]!)
  protected readonly progressLabel = computed(
    () => `${this.currentSlide() + 1} / ${this.slideCount}`,
  )

  protected prevSlide(): void {
    this.currentSlide.update((index) => Math.max(0, index - 1))
  }

  protected nextSlide(): void {
    this.currentSlide.update((index) => Math.min(this.slideCount - 1, index + 1))
  }

  protected goToSlide(index: number): void {
    if (index >= 0 && index < this.slideCount) {
      this.currentSlide.set(index)
    }
  }

  protected close(): void {
    this.sheetRef?.dismiss()
    this.dialogRef?.close()
  }

  protected isSheet(): boolean {
    return !!this.sheetData
  }
}
