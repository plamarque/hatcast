import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { isMemberMobileShellViewport } from '../../../layout/member-shell/member-shell-viewport';
import type { PwaBrowserInfo } from '../../../core/pwa/pwa-browser-info';
import { buildPwaInstallInstructions } from '../../../core/pwa/pwa-install-instructions';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

export interface PwaInstallInstructionsDialogData {
  browserInfo: PwaBrowserInfo;
  /** Set by PwaInstallService when `beforeinstallprompt` can still be invoked. */
  allowNativeRetry?: boolean;
}

@Component({
  selector: 'app-pwa-install-instructions-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './pwa-install-instructions-dialog.html',
  styleUrl: './pwa-install-instructions-dialog.scss',
})
export class PwaInstallInstructionsDialog {
  protected readonly data = inject<PwaInstallInstructionsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PwaInstallInstructionsDialog>);
  private readonly pwaInstall = inject(PwaInstallService);

  protected readonly content = computed(() => buildPwaInstallInstructions(this.data.browserInfo));

  protected readonly allowNativeRetry = this.data.allowNativeRetry === true;

  /** Même logique que le shell membre : avatar fixe mobile, « Compte » en bas du rail desktop. */
  protected readonly accountMenuPlacementHint = computed(() =>
    isMemberMobileShellViewport()
      ? 'en haut à droite'
      : 'en bas à gauche (barre latérale)',
  );

  protected retryInstall(): void {
    void this.pwaInstall.promptInstall();
    this.dialogRef.close();
  }
}
