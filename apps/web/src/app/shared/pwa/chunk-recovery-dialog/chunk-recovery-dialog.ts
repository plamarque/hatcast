import { Component, inject, Signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HatcastDialogDismiss } from '../../dialog-chrome/hatcast-dialog-dismiss';

export interface ChunkRecoveryDialogData {
  busy: Signal<boolean>;
  feedback: Signal<string>;
  canDismiss: boolean;
  confirm: () => void;
  exit: () => void;
}

@Component({
  selector: 'app-chunk-recovery-dialog',
  imports: [MatDialogModule, MatButtonModule, HatcastDialogDismiss],
  template: `
    <h2 mat-dialog-title>Une mise à jour est nécessaire</h2>
    <mat-dialog-content [attr.aria-busy]="data.busy()">
      <img src="/icons/logo-hatcast-2.svg" width="44" height="44" alt="" />
      <p>Mets HatCast à jour pour continuer.</p>
      <p>Les modifications non enregistrées peuvent être perdues.</p>
      <p role="status" aria-live="polite">
        {{ data.busy() ? 'Vérification de la mise à jour…' : data.feedback() }}
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        class="recovery-primary"
        mat-flat-button
        [disabled]="data.busy()"
        (click)="data.confirm()"
      >
        Mettre à jour et continuer
      </button>
      @if (data.canDismiss) {
        <app-hatcast-dialog-dismiss
          label="plus_tard"
          [disabled]="data.busy()"
          (clicked)="data.exit()"
        />
      }
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      color: var(--mat-sys-on-surface);
    }
    mat-dialog-actions.mat-mdc-dialog-actions {
      gap: 8px;
      flex-wrap: nowrap;
    }
    .recovery-primary {
      flex: 1;
      min-width: 0;
      height: auto;
      white-space: normal;
      overflow-wrap: anywhere;
      padding-block: 8px;
    }
    app-hatcast-dialog-dismiss {
      flex: none;
    }
    button,
    app-hatcast-dialog-dismiss {
      min-height: 48px;
    }
  `,
})
export class ChunkRecoveryDialog {
  readonly data = inject<ChunkRecoveryDialogData>(MAT_DIALOG_DATA);
}
