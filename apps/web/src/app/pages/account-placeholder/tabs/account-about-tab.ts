import { Component, inject, ViewEncapsulation } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { AppVersionService } from '../../../core/app/app-version.service'
import {
  ManualUpdateCheckResult,
  PwaUpdateService,
} from '../../../core/pwa/pwa-update.service'
import { ChangelogDialogService } from '../../../shared/changelog/changelog-dialog.service'

const CHECK_RESULT_MESSAGES: Record<Exclude<ManualUpdateCheckResult, 'busy'>, string> = {
  available: 'Une mise à jour est disponible.',
  'up-to-date': 'HatCast est à jour.',
  error: 'Impossible de vérifier les mises à jour. Réessayez plus tard.',
  disabled: 'Les mises à jour automatiques ne sont pas actives en local.',
}

@Component({
  selector: 'app-account-about-tab',
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './account-about-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountAboutTab {
  private readonly appVersion = inject(AppVersionService)
  private readonly changelogDialog = inject(ChangelogDialogService)
  private readonly pwaUpdate = inject(PwaUpdateService)
  private readonly snack = inject(MatSnackBar)

  protected readonly version = this.appVersion.version
  protected readonly checkingUpdates = this.pwaUpdate.checking
  protected readonly manualCheckAvailable = () => this.pwaUpdate.isManualCheckAvailable

  protected versionTooltip(): string {
    return `Voir les nouveautés de la version ${this.version()}`
  }

  protected openChangelog(): void {
    this.changelogDialog.open()
  }

  protected async checkForUpdates(): Promise<void> {
    const result = await this.pwaUpdate.checkForUpdatesManually()
    if (result === 'busy') {
      return
    }
    this.snack.open(CHECK_RESULT_MESSAGES[result], undefined, { duration: 4_000 })
  }
}
