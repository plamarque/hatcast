import { Component, inject, ViewEncapsulation } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'

import { AppVersionService } from '../../../core/app/app-version.service'
import { ChangelogDialogService } from '../../../shared/changelog/changelog-dialog.service'

@Component({
  selector: 'app-account-about-tab',
  imports: [MatButtonModule, MatTooltipModule],
  templateUrl: './account-about-tab.html',
  styleUrl: '../account-placeholder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountAboutTab {
  private readonly appVersion = inject(AppVersionService)
  private readonly changelogDialog = inject(ChangelogDialogService)

  protected readonly version = this.appVersion.version

  protected versionTooltip(): string {
    return `Voir les nouveautés de la version ${this.version()}`
  }

  protected openChangelog(): void {
    this.changelogDialog.open()
  }
}
