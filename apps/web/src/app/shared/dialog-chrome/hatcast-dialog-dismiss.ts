import { Component, computed, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogClose } from '@angular/material/dialog'

import { HATCAST_DISMISS_LABELS, type HatcastDismissKey } from './dialog-chrome.types'

/**
 * Bouton dismiss normalisé pour modales HatCast (mat-button + libellé UX-DR23).
 */
@Component({
  selector: 'app-hatcast-dialog-dismiss',
  imports: [MatButtonModule, MatDialogClose],
  template: `
    @if (hasDialogClose()) {
      <button
        type="button"
        mat-button
        [attr.data-testid]="testId()"
        [mat-dialog-close]="dialogClose()"
        [disabled]="disabled()"
        (click)="onClick()"
      >
        {{ labelText() }}
      </button>
    } @else {
      <button
        type="button"
        mat-button
        [attr.data-testid]="testId()"
        [disabled]="disabled()"
        (click)="onClick()"
      >
        {{ labelText() }}
      </button>
    }
  `,
})
export class HatcastDialogDismiss {
  readonly label = input.required<HatcastDismissKey>()
  /** Valeur passée à mat-dialog-close quand défini (y compris `true`). */
  readonly dialogClose = input<unknown | undefined>(undefined)
  readonly disabled = input(false)
  readonly testId = input<string | undefined>(undefined)

  readonly clicked = output<void>()

  protected readonly labelText = computed(() => HATCAST_DISMISS_LABELS[this.label()])

  protected hasDialogClose(): boolean {
    return this.dialogClose() !== undefined
  }

  protected onClick(): void {
    this.clicked.emit()
  }
}
