import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { getPwaBrowserInfo } from './pwa-browser-info';
import {
  isDevUntrustedInstallOrigin,
  PWA_INSTALL_PROMPT_TIMEOUT_MS,
} from './pwa-install-origin';
import {
  PwaInstallInstructionsDialog,
  type PwaInstallInstructionsDialogData,
} from '../../shared/pwa/pwa-install-instructions-dialog/pwa-install-instructions-dialog';

export const PWA_BANNER_DISMISSED_KEY = 'hatcast-pwa-banner-dismissed';
export const PWA_INSTALLED_KEY = 'hatcast-pwa-installed';
const BANNER_DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

/** Non-standard `beforeinstallprompt` event (Chromium). */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly showBanner = signal(false);
  readonly bannerDismissedSession = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.refreshBannerVisibility();
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.refreshBannerVisibility();
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.bannerDismissedSession.set(true);
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      this.showBanner.set(false);
    });
    if (typeof window.matchMedia === 'function') {
      const standaloneMq = window.matchMedia('(display-mode: standalone)');
      standaloneMq.addEventListener('change', () => this.refreshBannerVisibility());
    }
  }

  /** Menu utilisateur → « Installer l'app » (V1 `showInstallBannerManually` / install flow). */
  async installFromUserMenu(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.isPwaInstalled()) {
      this.snack.open("L'application est déjà installée", undefined, { duration: 4000 });
      return;
    }
    localStorage.removeItem(PWA_BANNER_DISMISSED_KEY);
    this.bannerDismissedSession.set(false);
    await this.promptInstall();
  }

  isPwaInstalled(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      return true;
    }
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone === true) {
      localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      return true;
    }
    localStorage.removeItem(PWA_INSTALLED_KEY);
    return false;
  }

  isBannerDismissedWithinTtl(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const raw = localStorage.getItem(PWA_BANNER_DISMISSED_KEY);
    if (!raw) {
      return false;
    }
    const dismissedAt = parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) {
      return false;
    }
    return Date.now() - dismissedAt < BANNER_DISMISS_TTL_MS;
  }

  shouldShowInstallBanner(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    if (this.isPwaInstalled()) {
      return false;
    }
    if (this.bannerDismissedSession()) {
      return false;
    }
    if (this.isBannerDismissedWithinTtl()) {
      return false;
    }
    return true;
  }

  refreshBannerVisibility(): void {
    this.showBanner.set(this.shouldShowInstallBanner());
  }

  dismissBanner(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(PWA_BANNER_DISMISSED_KEY, Date.now().toString());
    this.bannerDismissedSession.set(true);
    this.showBanner.set(false);
  }

  hasNativeInstallPrompt(): boolean {
    return this.deferredPrompt !== null;
  }

  async promptInstall(): Promise<void> {
    if (this.isPwaInstalled()) {
      return;
    }
    if (this.deferredPrompt) {
      if (isDevUntrustedInstallOrigin()) {
        this.openManualInstructions();
        return;
      }
      const prompt = this.deferredPrompt;
      try {
        await Promise.race([
          (async () => {
            await prompt.prompt();
            const { outcome } = await prompt.userChoice;
            this.deferredPrompt = null;
            if (outcome === 'accepted') {
              localStorage.setItem(PWA_INSTALLED_KEY, 'true');
              this.showBanner.set(false);
            } else {
              this.refreshBannerVisibility();
            }
          })(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('install-prompt-timeout')), PWA_INSTALL_PROMPT_TIMEOUT_MS);
          }),
        ]);
      } catch {
        this.deferredPrompt = null;
        this.openManualInstructions({ nativePromptFailed: true });
      }
      return;
    }
    this.openManualInstructions();
  }

  openManualInstructions(options?: {
    nativePromptFailed?: boolean;
  }): void {
    const browserInfo = getPwaBrowserInfo(navigator.userAgent);
    const devCertBlocked = isDevUntrustedInstallOrigin();
    this.showBanner.set(false);
    this.dialog.open(PwaInstallInstructionsDialog, {
      data: {
        browserInfo,
        devCertBlocked,
        nativePromptFailed: options?.nativePromptFailed ?? false,
      } satisfies PwaInstallInstructionsDialogData,
      width: '28rem',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }
}
