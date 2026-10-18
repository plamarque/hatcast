import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProductAnalyticsService } from '../analytics/product-analytics.service';
import type {
  PwaInstallEntryPoint,
  PwaInstallFallbackReason,
  PwaInstallInstructionVariant,
} from '../analytics/fr47-event-names';
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
  private readonly analytics = inject(ProductAnalyticsService);

  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private appInstalledCaptured = false;
  private readonly appInstalledListeners = new Set<() => void>();

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
      if (!this.appInstalledCaptured) {
        this.appInstalledCaptured = true;
        this.captureAnalytics(() => this.analytics.capturePwaInstallCompleted());
      }
      for (const listener of this.appInstalledListeners) {
        listener();
      }
    });
    if (typeof window.matchMedia === 'function') {
      const standaloneMq = window.matchMedia('(display-mode: standalone)');
      standaloneMq.addEventListener('change', () => this.refreshBannerVisibility());
    }
  }

  /** Subscribe to Chromium `appinstalled` (Story 10.6 — single listener in PushOptInPromptService). */
  onAppInstalled(listener: () => void): () => void {
    this.appInstalledListeners.add(listener);
    return () => this.appInstalledListeners.delete(listener);
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
    await this.promptInstall('account_menu');
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

  /** True only when Chromium can still show `beforeinstallprompt` (not on dev Tailscale/.local). */
  canRetryNativeInstall(): boolean {
    return this.hasNativeInstallPrompt() && !isDevUntrustedInstallOrigin();
  }

  async promptInstall(entryPoint: PwaInstallEntryPoint = 'banner'): Promise<void> {
    if (this.isPwaInstalled()) {
      return;
    }
    if (this.deferredPrompt) {
      if (isDevUntrustedInstallOrigin()) {
        this.openManualInstructions(entryPoint, 'untrusted_development_origin');
        return;
      }
      const prompt = this.deferredPrompt;
      try {
        await Promise.race([
          (async () => {
            await prompt.prompt();
            const { outcome } = await prompt.userChoice;
            this.deferredPrompt = null;
            this.captureAnalytics(() => this.analytics.capturePwaNativePromptResolved(outcome));
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
        this.openManualInstructions(entryPoint, 'native_prompt_failure');
      }
      return;
    }
    this.openManualInstructions(entryPoint, 'native_prompt_unavailable');
  }

  openManualInstructions(
    entryPoint: PwaInstallEntryPoint = 'banner',
    fallbackReason: PwaInstallFallbackReason = 'native_prompt_unavailable',
  ): void {
    const browserInfo = getPwaBrowserInfo(navigator.userAgent);
    this.showBanner.set(false);
    this.dialog.open(PwaInstallInstructionsDialog, {
      data: {
        browserInfo,
        allowNativeRetry: this.canRetryNativeInstall(),
      } satisfies PwaInstallInstructionsDialogData,
      width: '28rem',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    this.captureAnalytics(() =>
      this.analytics.capturePwaInstallInstructionsViewed({
        entry_point: entryPoint,
        fallback_reason: fallbackReason,
        instruction_variant: instructionVariant(browserInfo),
      }),
    );
  }

  private captureAnalytics(action: () => void): void {
    try {
      action();
    } catch {
      // Product analytics must never prevent PWA support or installation UX.
    }
  }
}

function instructionVariant(browserInfo: ReturnType<typeof getPwaBrowserInfo>): PwaInstallInstructionVariant {
  if (browserInfo.isIOS) {
    return 'ios';
  }
  if (browserInfo.isFirefox) {
    return 'firefox';
  }
  if (browserInfo.isAndroid) {
    return 'android';
  }
  if (browserInfo.isChromeDesktop || browserInfo.isEdge) {
    return 'desktop_chromium';
  }
  if (browserInfo.isSafariDesktop) {
    return 'desktop_safari';
  }
  return 'other';
}
