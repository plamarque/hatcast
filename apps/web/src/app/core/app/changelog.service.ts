import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ChangelogChange {
  id: string;
  emoji: string;
  description: string;
}

export interface ChangelogVersion {
  version: string;
  date: string;
  changes: ChangelogChange[];
}

export interface ChangelogVersionRaw {
  version: string;
  date: string;
  changes: string[];
}

@Injectable({ providedIn: 'root' })
export class ChangelogService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(false);
  readonly error = signal(false);
  readonly versions = signal<ChangelogVersion[]>([]);

  async loadChangelog(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    try {
      const raw = await fetchChangelogRaw();
      this.versions.set(transformChangelogVersions(raw));
    } catch {
      this.error.set(true);
      this.versions.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Whether a semver entry in changelog.json has at least one user-facing line.
   * Returns `null` when the changelog cannot be loaded (distinct from empty notes).
   */
  async currentVersionHasUserFacingNotes(version: string): Promise<boolean | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      const raw = await fetchChangelogRaw();
      return versionHasUserFacingChanges(raw, version);
    } catch {
      return null;
    }
  }
}

async function fetchChangelogRaw(): Promise<ChangelogVersionRaw[]> {
  const response = await fetch('/changelog.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as ChangelogVersionRaw[];
}

/** True when the version exists in raw changelog data with a non-empty changes list. */
export function versionHasUserFacingChanges(
  raw: ChangelogVersionRaw[],
  version: string,
): boolean {
  const entry = raw.find((item) => item.version === version);
  return (entry?.changes?.length ?? 0) > 0;
}

/** Maps a raw change line to emoji + description (V1 parity). */
export function parseChangelogChange(
  change: string,
  version: string,
  index: number,
): ChangelogChange {
  const match = change.match(/^([^\s]+)\s(.+)$/);
  if (match) {
    return {
      id: `${version}-${index}`,
      emoji: match[1],
      description: match[2],
    };
  }
  return {
    id: `${version}-${index}`,
    emoji: '📝',
    description: change,
  };
}

/** Semver descending sort (newest first) — same algorithm as V1 ChangelogModal. */
export function compareSemverDescending(a: string, b: string): number {
  const versionA = a.split('.').map(Number);
  const versionB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
    const numA = versionA[i] || 0;
    const numB = versionB[i] || 0;
    if (numA !== numB) {
      return numB - numA;
    }
  }
  return 0;
}

export function transformChangelogVersions(raw: ChangelogVersionRaw[]): ChangelogVersion[] {
  const transformed = raw
    .map((entry) => ({
      version: entry.version,
      date: entry.date,
      changes: entry.changes.map((change, index) =>
        parseChangelogChange(change, entry.version, index),
      ),
    }))
    .filter((entry) => entry.changes.length > 0);

  return transformed.sort((a, b) => compareSemverDescending(a.version, b.version));
}
