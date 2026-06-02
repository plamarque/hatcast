import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { AuthApiService } from '../auth/auth-api.service';
import { PwaInstallService } from '../pwa/pwa-install.service';
import { PwaUpdateService } from '../pwa/pwa-update.service';
import { ChangelogDialogService } from '../../shared/changelog/changelog-dialog.service';
import { PushOptInDialog } from '../../shared/push/push-opt-in-dialog/push-opt-in-dialog';
import { PushNotificationsService } from './push-notifications.service';
import {
  PUSH_OPT_IN_PROMPT_AFTER_INSTALL_DELAY_MS,
  PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY,
  PUSH_OPT_IN_PROMPT_DISMISS_TTL_MS,
  PUSH_OPT_IN_PROMPT_DISMISSED_KEY,
  PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY,
} from './push-opt-in-prompt-keys';

const BANNER_POLL_INTERVAL_MS = 200;
const BANNER_WAIT_MAX_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class PushOptInPromptService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthApiService);
  private readonly push = inject(PushNotificationsService);
  private readonly pwaInstall = inject(PwaInstallService);
  private readonly pwaUpdate = inject(PwaUpdateService);
  private readonly changelogDialog = inject(ChangelogDialogService);
  private readonly router = inject(Router);

  private dialogRef: MatDialogRef<PushOptInDialog> | null = null;
  private promptInFlight = false;
  private deferredForAuth = false;
  private authRetryUsed = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.pwaInstall.onAppInstalled(() => {
      sessionStorage.setItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY, '1');
      void this.scheduleAfterInstallPrompt();
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        void this.maybePromptAfterAuthNavigation();
      });
  }

  /** Called from `App` after changelog auto-open (Story 10.6 AC9). */
  async maybePromptWhenIdle(options?: { skipChangelog?: boolean }): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.promptInFlight) {
      return;
    }

    this.promptInFlight = true;
    try {
      if (!options?.skipChangelog) {
        await this.changelogDialog.maybeAutoOpenAfterPwaUpdate();
      }

      if (await this.waitUntilBannersHidden()) {
        await this.tryOpenDialog();
      }
    } finally {
      this.promptInFlight = false;
    }
  }

  markStandaloneOffered(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY, '1');
  }

  recordOptInSuccess(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY, '1');
    localStorage.removeItem(PUSH_OPT_IN_PROMPT_DISMISSED_KEY);
    sessionStorage.removeItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY);
  }

  openDialog(): MatDialogRef<PushOptInDialog> | null {
    if (!isPlatformBrowser(this.platformId) || this.dialogRef) {
      return null;
    }

    this.markStandaloneOffered();
    sessionStorage.removeItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY);

    this.dialogRef = this.dialog.open(PushOptInDialog, {
      width: '28rem',
      maxWidth: '95vw',
      disableClose: false,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      this.dialogRef = null;
      if (result === 'enabled' || result === 'account' || result === 'dismissed') {
        return;
      }
      localStorage.setItem(PUSH_OPT_IN_PROMPT_DISMISSED_KEY, Date.now().toString());
      this.markStandaloneOffered();
    });

    return this.dialogRef;
  }

  private async scheduleAfterInstallPrompt(): Promise<void> {
    if (this.promptInFlight) {
      return;
    }
    if (await this.waitUntilBannersHidden()) {
      await this.tryOpenDialog();
    }
  }

  private async maybePromptAfterAuthNavigation(): Promise<void> {
    if (!this.deferredForAuth || this.authRetryUsed) {
      return;
    }
    this.authRetryUsed = true;
    this.deferredForAuth = false;
    await this.maybePromptWhenIdle({ skipChangelog: true });
  }

  private async tryOpenDialog(): Promise<void> {
    if (!(await this.isEligible())) {
      return;
    }

    const afterInstall = sessionStorage.getItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY);
    if (afterInstall) {
      await delay(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_DELAY_MS);
      if (!(await this.isEligible())) {
        return;
      }
    }

    this.openDialog();
  }

  async isEligible(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    if (!this.push.canUsePush()) {
      return false;
    }

    if (this.isBannerBlocking()) {
      return false;
    }

    const session = await this.auth.ensureHatcastSession();
    if (!session.ok) {
      this.deferredForAuth = true;
      return false;
    }

    const status = await this.push.loadStatus();
    if (
      status.state === 'enabled' ||
      status.state === 'unsupported' ||
      status.state === 'denied' ||
      status.state === 'error'
    ) {
      return false;
    }

    const afterInstall = sessionStorage.getItem(PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY);
    const standaloneSeen = localStorage.getItem(PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY) === '1';
    const isInstalled = this.pwaInstall.isPwaInstalled();

    const hasTrigger = !!afterInstall || (isInstalled && !standaloneSeen);
    if (!hasTrigger) {
      return false;
    }

    // AC5 TTL: post-install re-trigger bypasses via `afterInstall`; standalone uses `standaloneSeen` (AC3).
    if (!afterInstall && this.isDismissedWithinTtl()) {
      return false;
    }

    return true;
  }

  isDismissedWithinTtl(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const raw = localStorage.getItem(PUSH_OPT_IN_PROMPT_DISMISSED_KEY);
    if (!raw) {
      return false;
    }
    const dismissedAt = parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) {
      return false;
    }
    return Date.now() - dismissedAt < PUSH_OPT_IN_PROMPT_DISMISS_TTL_MS;
  }

  private isBannerBlocking(): boolean {
    return this.pwaInstall.showBanner() || this.pwaUpdate.showBanner();
  }

  /** Resolves true when install/update banners are hidden (AC10); false if still blocking after timeout. */
  private async waitUntilBannersHidden(): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < BANNER_WAIT_MAX_MS) {
      if (!this.isBannerBlocking()) {
        return true;
      }
      await delay(BANNER_POLL_INTERVAL_MS);
    }
    return !this.isBannerBlocking();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
