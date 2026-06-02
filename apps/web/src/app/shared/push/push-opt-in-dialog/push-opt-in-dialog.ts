import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { PushNotificationsService } from '../../../core/push/push-notifications.service';
import {
  PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY,
  PUSH_OPT_IN_PROMPT_DISMISSED_KEY,
  PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY,
} from '../../../core/push/push-opt-in-prompt-keys';
import { PushOptInPromptService } from '../../../core/push/push-opt-in-prompt.service';

@Component({
  selector: 'app-push-opt-in-dialog',
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './push-opt-in-dialog.html',
  styleUrl: './push-opt-in-dialog.scss',
})
export class PushOptInDialog {
  private readonly dialogRef = inject(MatDialogRef<PushOptInDialog>);
  private readonly push = inject(PushNotificationsService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly promptService = inject(PushOptInPromptService);

  protected readonly busy = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async enableNotifications(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.errorMessage.set(null);
    this.busy.set(true);
    this.dialogRef.disableClose = true;
    try {
      const result = await this.push.enable();
      if (result.ok) {
        this.promptService.recordOptInSuccess();
        this.snack.open('Notifications activées sur cet appareil', undefined, { duration: 4000 });
        this.dialogRef.close('enabled');
        return;
      }
      if (result.message) {
        this.errorMessage.set(result.message);
      } else {
        this.errorMessage.set('Activation des notifications impossible.');
      }
    } finally {
      this.busy.set(false);
      this.dialogRef.disableClose = false;
    }
  }

  protected dismissLater(): void {
    this.recordDismiss();
    this.dialogRef.close('dismissed');
  }

  protected openAccountSettings(): void {
    this.promptService.markStandaloneOffered();
    sessionStorage.removeItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY);
    this.dialogRef.close('account');
    void this.router.navigate(['/compte'], { fragment: 'notifications' });
  }

  private recordDismiss(): void {
    localStorage.setItem(PUSH_OPT_IN_PROMPT_DISMISSED_KEY, Date.now().toString());
    sessionStorage.removeItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY);
    this.promptService.markStandaloneOffered();
  }
}
