import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Fallback when `/version.txt` is missing or unreadable. */
export const DEFAULT_APP_VERSION = '0.0.0';

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly version = signal(DEFAULT_APP_VERSION);

  private loadPromise: Promise<void> | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      void this.ensureLoaded();
    }
  }

  /** Resolves when `/version.txt` has been fetched (or failed with fallback). */
  ensureLoaded(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    if (!this.loadPromise) {
      this.loadPromise = this.loadVersion();
    }
    return this.loadPromise;
  }

  private async loadVersion(): Promise<void> {
    try {
      const response = await fetch('/version.txt', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }
      const text = await response.text();
      const firstLine = text.split('\n')[0]?.trim();
      if (firstLine) {
        this.version.set(firstLine);
      }
    } catch {
      /* keep DEFAULT_APP_VERSION */
    }
  }
}

/** Parses the first line of version.txt (exported for tests). */
export function parseVersionTxtFirstLine(text: string): string {
  const firstLine = text.split('\n')[0]?.trim();
  return firstLine || DEFAULT_APP_VERSION;
}
