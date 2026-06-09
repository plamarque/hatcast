import { Component, input, output } from '@angular/core'
import { MatChipsModule } from '@angular/material/chips'

import type { EventCategoryOption } from './event-category.constants'

@Component({
  selector: 'app-event-category-select-chip-set',
  imports: [MatChipsModule],
  template: `
    <mat-chip-set
      class="event-category-select-chip-set"
      [attr.aria-label]="ariaLabel()"
    >
      @for (option of options(); track option.slug ?? 'ordinaire') {
        <mat-chip
          class="event-category-select-chip-set__chip"
          [highlighted]="isSelected(option.slug)"
          [disabled]="disabled()"
          [attr.aria-pressed]="isSelected(option.slug)"
          (click)="onChipClick(option.slug)"
        >
          {{ option.label }}
        </mat-chip>
      }
    </mat-chip-set>
  `,
  styles: [
    `
      .event-category-select-chip-set {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .event-category-select-chip-set__chip {
        min-height: 2.75rem;
        cursor: pointer;
      }

      .event-category-select-chip-set__chip[disabled] {
        cursor: default;
      }
    `,
  ],
})
export class EventCategorySelectChipSet {
  readonly options = input.required<readonly EventCategoryOption[]>()
  readonly selectedSlug = input.required<string | null>()
  readonly disabled = input(false)
  readonly ariaLabel = input('Catégorie du spectacle')

  readonly categorySelect = output<string | null>()

  protected isSelected(slug: string | null): boolean {
    return this.selectedSlug() === slug
  }

  protected onChipClick(slug: string | null): void {
    if (this.disabled() || this.isSelected(slug)) {
      return
    }
    this.categorySelect.emit(slug)
  }
}
