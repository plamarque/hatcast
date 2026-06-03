import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import {
  AppVersionService,
  DEFAULT_APP_VERSION,
} from '../../core/app/app-version.service';
import {
  SHOW_CHANGELOG_AFTER_RELOAD_KEY,
  changelogSeenStorageKey,
} from '../../core/app/changelog-keys';
import { ChangelogDialog } from './changelog-dialog/changelog-dialog';

@Injectable({ providedIn: 'root' })
export class ChangelogDialogService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dialog = inject(MatDialog);
  private readonly appVersion = inject(AppVersionService);

  open(): void {
    this.openDialog();
  }

  /** Opens changelog once after a PWA update reload (Story 10.2 → 10.3). Resolves when skipped or closed (10.6). */
  async maybeAutoOpenAfterPwaUpdate(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const shouldShow = sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY);
    if (!shouldShow) {
      return;
    }

    await this.appVersion.ensureLoaded();

    const version = this.appVersion.version();
    if (version === DEFAULT_APP_VERSION) {
      return;
    }

    if (localStorage.getItem(changelogSeenStorageKey(version))) {
      sessionStorage.removeItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY);
      return;
    }

    sessionStorage.removeItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY);
    await this.openDialogAndWait({ markSeenOnCloseForVersion: version });
  }

  private openDialogAndWait(options?: { markSeenOnCloseForVersion?: string }): Promise<void> {
    return new Promise((resolve) => {
      const ref = this.openDialog(options);
      if (!ref) {
        resolve();
        return;
      }
      ref.afterClosed().subscribe(() => resolve());
    });
  }

  private openDialog(options?: { markSeenOnCloseForVersion?: string }): ReturnType<MatDialog['open']> | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const ref = this.dialog.open(ChangelogDialog, {
      width: '95vw',
      maxWidth: '42rem',
      maxHeight: '85vh',
      panelClass: 'changelog-dialog-panel',
    });

    const versionToMark = options?.markSeenOnCloseForVersion;
    if (versionToMark) {
      ref.afterClosed().subscribe(() => {
        localStorage.setItem(changelogSeenStorageKey(versionToMark), '1');
      });
    }

    return ref;
  }
}
