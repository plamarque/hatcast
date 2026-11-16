import { Injectable, InjectionToken, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

import { SHOW_CHANGELOG_AFTER_RELOAD_KEY } from '../app/changelog-keys';
import { ProductAnalyticsService } from '../analytics/product-analytics.service';

declare const HATCAST_BUILD_ID: string | undefined;
export const PWA_BUILD_ID = new InjectionToken<string | null>('PWA_BUILD_ID', {
  providedIn: 'root', factory: () => typeof HATCAST_BUILD_ID === 'string' ? HATCAST_BUILD_ID : null,
});
const PENDING_UPDATE_KEY = 'hatcast.pwa.pending-update.v1';
const PENDING_MAX_AGE_MS = 10 * 60_000;
const CHECK_TIMEOUT_MS = 30_000;

type ReadyTarget = { hash: string; buildId: string | null };
type PendingUpdate = { previous: string | null; expected: string | null; expectedHash: string; requestedAt: number; uncertain?: boolean };
export type ManualUpdateCheckResult = 'available' | 'up-to-date' | 'error' | 'disabled' | 'busy';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);
  private readonly analytics = inject(ProductAnalyticsService);
  private readonly buildId = inject(PWA_BUILD_ID);
  private readyVersion: ReadyTarget | null = null;
  private dismissedHash: string | null = null;
  private checkPromise: Promise<boolean> | null = null;
  private checkedBuildId: string | null = null;
  private checkedHash: string | null = null;
  private reloadAttempt = 0;

  readonly showBanner = signal(false);
  readonly refreshing = signal(false);
  readonly checking = signal(false);
  readonly updateMessage = signal<string | null>(null);
  readonly canApply = signal(false);
  readonly unverifiedWarning = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.verifyPreviousUpdate();
    if (!this.swUpdate.isEnabled) return;
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') this.onUpdateReady(event);
      if (event.type === 'NO_NEW_VERSION_DETECTED' && this.checkPromise) {
        const data = event.version.appData as { hatcastBuildId?: unknown } | undefined;
        this.checkedBuildId = typeof data?.hatcastBuildId === 'string' ? data.hatcastBuildId : null;
        this.checkedHash = event.version.hash;
      }
    });
    void this.pollForAppUpdate();
  }

  async pollForAppUpdate(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate.isEnabled) return;
    try { await this.checkForUpdate(); await this.recoverCachedReady(); } catch { /* A later navigation can retry. */ }
  }

  async checkForUpdatesManually(): Promise<ManualUpdateCheckResult> {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate.isEnabled) return 'disabled';
    if (this.checking()) return 'busy';
    this.checking.set(true);
    try {
      if (this.readyVersion) {
        this.dismissedHash = null;
        this.showBanner.set(true);
        return 'available';
      }
      const found = await this.checkForUpdate();
      await this.recoverCachedReady();
      if (this.readyVersion) {
        this.dismissedHash = null;
        this.showBanner.set(true);
        return 'available';
      }
      // Angular can return false when offline or when a different version is already cached.
      if (!found && this.buildId && this.checkedBuildId === this.buildId) {
        // Worker notifications are broadcast to all tabs; independently confirm the server manifest.
        const hash = this.checkedHash;
        const matches = hash && await this.networkManifestMatches(hash, this.buildId);
        if (this.readyVersion) return 'available';
        return matches && this.checkedHash === hash && this.checkedBuildId === this.buildId
          ? 'up-to-date' : 'error';
      }
      return 'error';
    } catch {
      return 'error';
    } finally {
      this.checking.set(false);
    }
  }

  get isManualCheckAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && this.swUpdate.isEnabled;
  }

  private checkForUpdate(): Promise<boolean> {
    if (!this.checkPromise) {
      this.checkedBuildId = null;
      this.checkedHash = null;
      this.checkPromise = this.withTimeout(this.swUpdate.checkForUpdate()).finally(() => { this.checkPromise = null; });
    }
    return this.checkPromise;
  }

  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), CHECK_TIMEOUT_MS); }),
      ]);
    } finally { if (timer) clearTimeout(timer); }
  }

  private onUpdateReady(event: VersionReadyEvent): void {
    const data = event.latestVersion.appData as { hatcastBuildId?: unknown } | undefined;
    this.offerReady({ hash: event.latestVersion.hash, buildId: typeof data?.hatcastBuildId === 'string' ? data.hatcastBuildId : null }, 'version_ready');
  }

  private offerReady(target: ReadyTarget, source: 'version_ready' | 'cached_ready'): void {
    this.readyVersion = target;
    this.canApply.set(true);
    if (this.dismissedHash === target.hash) return;
    this.updateMessage.set(null);
    this.unverifiedWarning.set(false);
    if (!this.showBanner()) {
      this.captureAnalytics(() => this.analytics.capturePwaUpdateAvailable(source));
      this.showBanner.set(true);
    }
  }

  private async recoverCachedReady(): Promise<void> {
    if (this.readyVersion || !this.buildId || !this.checkedBuildId || !this.checkedHash ||
        this.checkedBuildId === this.buildId) return;
    try {
      const hash = this.checkedHash;
      const buildId = this.checkedBuildId;
      const matches = await this.networkManifestMatches(hash, buildId);
      if (!this.readyVersion && this.checkedHash === hash && this.checkedBuildId === buildId &&
          matches) {
        this.offerReady({ hash, buildId }, 'cached_ready');
      }
    } catch { /* Without both cache and network proof, do not announce a ready version. */ }
  }

  private async networkManifestMatches(hash: string, buildId: string): Promise<boolean> {
    const response = await fetch(new URL('/ngsw.json', window.location.origin), {
      cache: 'no-store', headers: { 'ngsw-bypass': 'true' }, signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const manifest = await response.json() as { appData?: { hatcastBuildId?: unknown } };
    if (manifest.appData?.hatcastBuildId !== buildId) return false;
    const serialized = JSON.stringify(manifest);
    // Angular hashes the low byte of each UTF-16 code unit, including non-ASCII.
    const bytes = new Uint8Array(serialized.length);
    for (let i = 0; i < serialized.length; i++) bytes[i] = serialized.charCodeAt(i) & 0xff;
    const digest = await crypto.subtle.digest('SHA-1', bytes);
    const manifestHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    return manifestHash === hash;
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled || this.refreshing()) return;
    if (!this.readyVersion) {
      this.refreshing.set(true);
      try { await this.checkForUpdate(); await this.recoverCachedReady(); } catch { /* show retry message */ }
      this.refreshing.set(false);
      if (!this.readyVersion) {
        this.updateMessage.set('La mise à jour n’est pas encore prête. Réessaie plus tard.');
        return;
      }
    }
    // Dialogs can hold drafts outside Angular forms (for example, a selected logo).
    if (document.querySelector?.('mat-dialog-container, form.ng-dirty, form .ng-dirty, [contenteditable="true"].ng-dirty') &&
        !window.confirm('Des modifications sont peut-être en cours. Recharger risque de les effacer. Continuer ?')) {
      return;
    }
    const expected = this.readyVersion.buildId;
    const pending: PendingUpdate = {
      previous: this.buildId, expected: typeof expected === 'string' && expected.length > 0 && expected !== this.buildId ? expected : null,
      expectedHash: this.readyVersion.hash,
      requestedAt: Date.now(),
    };
    let canVerify = Boolean(pending.previous && pending.expected);
    try {
      sessionStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify(pending));
      canVerify &&= sessionStorage.getItem(PENDING_UPDATE_KEY) === JSON.stringify(pending);
    } catch { canVerify = false; }
    if (!canVerify && !this.unverifiedWarning()) {
      try { sessionStorage.removeItem(PENDING_UPDATE_KEY); } catch { /* unavailable */ }
      this.unverifiedWarning.set(true);
      this.updateMessage.set('La mise à jour ne pourra pas être vérifiée sur cet appareil. Tu peux recharger quand même.');
      return;
    }
    this.captureAnalytics(() => this.analytics.capturePwaUpdateApplyRequested());
    this.refreshing.set(true);
    const attempt = ++this.reloadAttempt;
    try {
      document.location.reload();
      // A beforeunload prompt may cancel navigation; do not leave the banner spinning forever.
      setTimeout(() => {
        if (!this.refreshing() || attempt !== this.reloadAttempt) return;
        this.refreshing.set(false);
        this.updateMessage.set('Le rechargement n’a pas été terminé. Réessaie quand tu es prêt.');
        try {
          const saved = JSON.parse(sessionStorage.getItem(PENDING_UPDATE_KEY) ?? 'null') as PendingUpdate | null;
          if (saved?.requestedAt === pending.requestedAt) {
            sessionStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify({ ...saved, uncertain: true }));
          }
        } catch { /* Cannot establish the outcome without session state. */ }
      }, 15_000);
    } catch {
      this.refreshing.set(false);
      this.updateMessage.set('La mise à jour n’a pas pu démarrer. Réessaie.');
      try { sessionStorage.removeItem(PENDING_UPDATE_KEY); } catch { /* unavailable */ }
    }
  }

  dismissBanner(): void {
    if (this.showBanner()) this.captureAnalytics(() => this.analytics.capturePwaUpdateDismissed());
    this.dismissedHash = this.readyVersion?.hash ?? null;
    this.showBanner.set(false);
  }

  private verifyPreviousUpdate(): void {
    try {
      const raw = sessionStorage.getItem(PENDING_UPDATE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_UPDATE_KEY);
      const pending = JSON.parse(raw) as PendingUpdate;
      if (!Number.isFinite(pending.requestedAt) ||
          Date.now() - pending.requestedAt > PENDING_MAX_AGE_MS || pending.requestedAt > Date.now()) {
        this.updateMessage.set('Impossible de confirmer la mise à jour. Vérifie ta version dans Mon compte.');
        this.showBanner.set(true);
        return;
      }
      if (!pending.uncertain && pending.expected && this.buildId === pending.expected) {
        sessionStorage.setItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY, '1');
      } else {
        const unchanged = Boolean(this.buildId && pending.previous && this.buildId === pending.previous);
        if (unchanged && pending.expected && pending.expectedHash) {
          this.readyVersion = { hash: pending.expectedHash, buildId: pending.expected };
          this.canApply.set(true);
        }
        this.updateMessage.set(unchanged
          ? 'La mise à jour n’a pas pu être appliquée. Réessaie.'
          : 'Impossible de confirmer la mise à jour. Vérifie ta version dans Mon compte.');
        this.showBanner.set(true);
      }
    } catch { /* No confirmation is claimed when storage is unavailable. */ }
  }

  private captureAnalytics(action: () => void): void {
    try { action(); } catch { /* Analytics must not block updates. */ }
  }
}
