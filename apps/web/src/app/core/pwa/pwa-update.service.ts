import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

type UpdateReadySource = 'VERSION_READY' | 'fallback';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly swUpdate = inject(SwUpdate);

  readonly showBanner = signal(false);
  readonly refreshing = signal(false);

  /** Session dismiss — only a new VERSION_READY may show the banner again (AC4). */
  private bannerDismissed = false;

  /** ngsw.json timestamp when this tab session started (baseline for recette / prod). */
  private knownNgswTimestamp: number | null = null;
  private updateListenerAttached = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        this.onUpdateReady('VERSION_READY');
      });

    void this.setupRegistrationListener();
    void this.pollForAppUpdate();
  }

  /**
   * Checks ngsw.json + triggers reg.update when the manifest changed (recette / prod).
   * Banner display still follows VERSION_READY or fallback paths unless dismissed (AC4).
   */
  async pollForAppUpdate(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate.isEnabled) {
      return;
    }

    const serverTimestamp = await this.fetchNgswTimestamp();
    if (serverTimestamp === null) {
      return;
    }

    const reg = await this.getServiceWorkerRegistration();
    if (!reg) {
      return;
    }
    this.attachUpdateFoundListener(reg);

    const manifestChanged =
      this.knownNgswTimestamp !== null && serverTimestamp !== this.knownNgswTimestamp;

    if (this.knownNgswTimestamp === null) {
      this.knownNgswTimestamp = serverTimestamp;
      return;
    }

    if (manifestChanged) {
      try {
        await reg.update();
      } catch {
        /* reg.update may fail offline — SwUpdate still emits when ready */
      }
    }

    if (reg.waiting && navigator.serviceWorker.controller) {
      this.onUpdateReady('fallback');
    }
  }

  private async setupRegistrationListener(): Promise<void> {
    const reg = await this.getServiceWorkerRegistration();
    if (reg) {
      this.attachUpdateFoundListener(reg);
    }
  }

  private attachUpdateFoundListener(reg: ServiceWorkerRegistration): void {
    if (this.updateListenerAttached) {
      return;
    }
    this.updateListenerAttached = true;

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) {
        return;
      }

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          this.onUpdateReady('fallback');
        }
      });
    });
  }

  private onUpdateReady(source: UpdateReadySource): void {
    if (source === 'VERSION_READY') {
      this.bannerDismissed = false;
    } else if (this.bannerDismissed) {
      return;
    }

    this.refreshing.set(false);
    this.showBanner.set(true);
  }

  private async fetchNgswTimestamp(): Promise<number | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const res = await fetch(new URL('/ngsw.json', window.location.origin).href, {
        cache: 'no-store',
      });
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as { timestamp?: number };
      return json.timestamp ?? null;
    } catch {
      return null;
    }
  }

  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | undefined> {
    if (!isPlatformBrowser(this.platformId) || !('serviceWorker' in navigator)) {
      return undefined;
    }
    return navigator.serviceWorker.getRegistration();
  }

  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled || this.refreshing()) {
      return;
    }

    this.refreshing.set(true);
    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch {
      this.refreshing.set(false);
    }
  }

  dismissBanner(): void {
    this.bannerDismissed = true;
    this.showBanner.set(false);
  }
}
