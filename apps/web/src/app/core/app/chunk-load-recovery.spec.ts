import { NavigationError } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CHUNK_RELOAD_AT_KEY,
  CHUNK_RELOAD_GUARD_MS,
  isChunkLoadError,
  reloadOnChunkLoadError,
} from './chunk-load-recovery';

describe('isChunkLoadError', () => {
  it.each([
    "'text/html' is not a valid JavaScript MIME type for module script 'https://hatcast.app/chunk-ABC.js'.",
    'Failed to fetch dynamically imported module: https://hatcast.app/chunk-ABC.js',
    'error loading dynamically imported module: https://hatcast.app/chunk-ABC.js',
    'Importing a module script failed.',
  ])('detects %s', (message) => {
    expect(isChunkLoadError(new TypeError(message))).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isChunkLoadError(new Error('Http failure response for /v1/me: 500'))).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });
});

describe('reloadOnChunkLoadError', () => {
  const now = 1_000_000;
  let storage: Storage;
  let location: { assign: ReturnType<typeof vi.fn<(url: string) => void>> };

  const chunkError = () =>
    new NavigationError(1, '/accueil', new TypeError('Importing a module script failed.'));

  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => void values.set(key, value),
    } as Storage;
    location = { assign: vi.fn<(url: string) => void>() };
  });

  it('loads the target URL once on a chunk failure', () => {
    expect(reloadOnChunkLoadError(chunkError(), storage, location, now)).toBe(true);
    expect(location.assign).toHaveBeenCalledWith('/accueil');
    expect(storage.getItem(CHUNK_RELOAD_AT_KEY)).toBe(String(now));
  });

  it('does not reload again inside the guard window', () => {
    storage.setItem(CHUNK_RELOAD_AT_KEY, String(now - 1_000));
    expect(reloadOnChunkLoadError(chunkError(), storage, location, now)).toBe(false);
    expect(location.assign).not.toHaveBeenCalled();
  });

  it('reloads again after the guard window (later deploy, same tab)', () => {
    storage.setItem(CHUNK_RELOAD_AT_KEY, String(now - CHUNK_RELOAD_GUARD_MS));
    expect(reloadOnChunkLoadError(chunkError(), storage, location, now)).toBe(true);
  });

  it('does not reload for other navigation errors', () => {
    const error = new NavigationError(1, '/accueil', new Error('guard failed'));
    expect(reloadOnChunkLoadError(error, storage, location, now)).toBe(false);
    expect(location.assign).not.toHaveBeenCalled();
  });

  it('does not reload when sessionStorage is unavailable', () => {
    storage.getItem = () => {
      throw new Error('SecurityError');
    };
    expect(reloadOnChunkLoadError(chunkError(), storage, location, now)).toBe(false);
    expect(location.assign).not.toHaveBeenCalled();
  });
});
