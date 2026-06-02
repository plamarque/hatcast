import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppVersionService, parseVersionTxtFirstLine } from './app-version.service';

describe('parseVersionTxtFirstLine', () => {
  it('returns first non-empty line', () => {
    expect(parseVersionTxtFirstLine('1.2.3\nBuild info')).toBe('1.2.3');
  });

  it('falls back to 0.0.0 when empty', () => {
    expect(parseVersionTxtFirstLine('\n\n')).toBe('0.0.0');
  });
});

describe('AppVersionService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createService(platformId = 'browser'): AppVersionService {
    TestBed.configureTestingModule({
      providers: [
        AppVersionService,
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    return TestBed.inject(AppVersionService);
  }

  it('loads version from version.txt', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '2.4.1\nProduction build',
    });

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('2.4.1');
    expect(fetchMock).toHaveBeenCalledWith('/version.txt', { cache: 'no-store' });
  });

  it('keeps default on fetch failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('0.0.0');
  });

  it('does not fetch on server platform', async () => {
    const service = createService('server');
    await service.ensureLoaded();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(service.version()).toBe('0.0.0');
  });
});
