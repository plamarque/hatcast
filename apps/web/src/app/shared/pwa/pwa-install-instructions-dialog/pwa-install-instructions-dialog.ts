import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import type { PwaBrowserInfo } from '../../../core/pwa/pwa-browser-info';
import { buildPwaInstallInstructions } from '../../../core/pwa/pwa-install-instructions';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';

export interface PwaInstallInstructionsDialogData {
  browserInfo: PwaBrowserInfo;
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

  protected retryInstall(): void {
    void this.pwaInstall.promptInstall();
    this.dialogRef.close();
  }
}
