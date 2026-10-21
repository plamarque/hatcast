import type { NavigationError } from '@angular/router';

/** sessionStorage — epoch ms of the last reload done after a stale chunk failure. */
export const CHUNK_RELOAD_AT_KEY = 'hatcast.chunkReloadAt';

/** A second chunk failure inside this window does not reload again (no reload loop). */
export const CHUNK_RELOAD_GUARD_MS = 30_000;

const CHUNK_LOAD_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|is not a valid JavaScript MIME type|ChunkLoadError|Loading chunk [\w-]+ failed/i;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) {
    return false;
  }
  const text =
    error instanceof Error ? `${error.name}: ${error.message}` : typeof error === 'string' ? error : '';
  return CHUNK_LOAD_ERROR_PATTERN.test(text);
}

/**
 * A tab that runs an old bundle after a deploy asks for hashed chunks that no longer exist.
 * One full load of the target URL gets the new index.html and its chunks.
 */
export function reloadOnChunkLoadError(
  navigationError: NavigationError,
  storage: Storage = sessionStorage,
  location: Pick<Location, 'assign'> = window.location,
  now: number = Date.now(),
): boolean {
  if (!isChunkLoadError(navigationError.error)) {
    return false;
  }
  try {
    const lastReloadAt = Number(storage.getItem(CHUNK_RELOAD_AT_KEY));
    if (lastReloadAt && now - lastReloadAt < CHUNK_RELOAD_GUARD_MS) {
      return false;
    }
    storage.setItem(CHUNK_RELOAD_AT_KEY, String(now));
  } catch {
    // Without sessionStorage there is no loop guard, so do not reload.
    return false;
  }
  location.assign(navigationError.url);
  return true;
}
