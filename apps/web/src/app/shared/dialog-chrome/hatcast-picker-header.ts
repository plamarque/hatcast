import { A11yModule } from '@angular/cdk/a11y'
import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

import type { HatcastPickerSurface } from './dialog-chrome.types'

/**
 * En-tête réservé aux pickers filtre (exception UX-DR22.1).
 * Ne pas utiliser sur les dialogs standard (formulaire / consultation).
 */
@Component({
  selector: 'app-hatcast-picker-header',
  imports: [A11yModule, MatButtonModule, MatIconModule],
  template: `
    @if (showDragHandle()) {
      <div class="filter-picker-shell__drag-handle" aria-hidden="true"></div>
    }
    <div class="filter-picker-shell__header">
      <h2 class="filter-picker-shell__title" cdkFocusInitial>{{ title() }}</h2>
      @if (showClose()) {
        <button type="button" mat-icon-button aria-label="Fermer" (click)="close.emit()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  `,
})
export class HatcastPickerHeader {
  readonly title = input.required<string>()
  readonly surface = input.required<HatcastPickerSurface>()

  readonly close = output<void>()

  protected readonly showDragHandle = computed(() => this.surface() === 'sheet')
  protected readonly showClose = computed(() => this.surface() === 'sheet')
}
