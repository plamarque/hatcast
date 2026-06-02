/** Set by PwaUpdateService.applyUpdate() before reload; consumed once on next load. */
export const SHOW_CHANGELOG_AFTER_RELOAD_KEY = 'hatcast.showChangelogAfterReload';

/** Suppress repeat auto-open for a given app version. */
export function changelogSeenStorageKey(version: string): string {
  return `hatcast.changelogSeen:${version}`;
}
