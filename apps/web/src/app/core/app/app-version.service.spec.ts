import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AppVersionService,
  formatBuildMetaLine,
  parseBuildChannelFromLine2,
  parseBuildStampFromLine4,
  parseGitHashFromLine3,
  isVersionTxtResponseUsable,
  parseVersionTxtBuildMeta,
  parseVersionTxtFirstLine,
} from './app-version.service';

const FULL_VERSION_TXT = `2.3.0
Staging RC build - 2026-06-13
Git: a0db03f7
Build: 2026-06-13T12:49:32+0200`;

describe('parseVersionTxtFirstLine', () => {
  it('returns first non-empty line', () => {
    expect(parseVersionTxtFirstLine('1.2.3\nBuild info')).toBe('1.2.3');
  });

  it('falls back to 0.0.0 when empty', () => {
    expect(parseVersionTxtFirstLine('\n\n')).toBe('0.0.0');
  });
});

describe('parseBuildChannelFromLine2', () => {
  it('detects production', () => {
    expect(parseBuildChannelFromLine2('Production build - 2026-06-02')).toBe('production');
  });

  it('detects staging', () => {
    expect(parseBuildChannelFromLine2('Staging RC build - 2026-06-13')).toBe('staging');
  });

  it('detects development', () => {
    expect(parseBuildChannelFromLine2('Development build - 2026-06-01')).toBe('development');
  });

  it('detects local', () => {
    expect(parseBuildChannelFromLine2('Local build - 2026-06-14')).toBe('local');
  });

  it('returns undefined for unknown line', () => {
    expect(parseBuildChannelFromLine2('Unknown')).toBeUndefined();
  });
});

describe('parseGitHashFromLine3', () => {
  it('extracts hash', () => {
    expect(parseGitHashFromLine3('Git: a0db03f7')).toBe('a0db03f7');
  });

  it('returns undefined when missing', () => {
    expect(parseGitHashFromLine3('Build: 2026-06-13')).toBeUndefined();
  });
});

describe('parseBuildStampFromLine4', () => {
  it('formats compact stamp', () => {
    expect(parseBuildStampFromLine4('Build: 2026-06-14T09:59:00+0200')).toBe('202606140959');
  });

  it('formats stamp from staging build line', () => {
    expect(parseBuildStampFromLine4('Build: 2026-06-13T12:49:32+0200')).toBe('202606131249');
  });

  it('returns undefined when missing', () => {
    expect(parseBuildStampFromLine4('Git: abc1234')).toBeUndefined();
  });
});

describe('parseVersionTxtBuildMeta', () => {
  it('parses full version.txt', () => {
    expect(parseVersionTxtBuildMeta(FULL_VERSION_TXT)).toEqual({
      channel: 'staging',
      gitHash: 'a0db03f7',
      buildStamp: '202606131249',
    });
  });

  it('returns null when no metadata', () => {
    expect(parseVersionTxtBuildMeta('2.0.0\n')).toBeNull();
  });

  it('returns channel only when git line missing', () => {
    expect(parseVersionTxtBuildMeta('2.0.0\nProduction build - 2026-06-02')).toEqual({
      channel: 'production',
    });
  });

  it('parses hash and stamp without channel when line 2 is unknown', () => {
    expect(
      parseVersionTxtBuildMeta(`2.0.0
Unknown channel line
Git: abc1234
Build: 2026-06-13T12:49:32+0200`),
    ).toEqual({
      gitHash: 'abc1234',
      buildStamp: '202606131249',
    });
  });
});

describe('isVersionTxtResponseUsable', () => {
  it('rejects empty bodies', () => {
    expect(isVersionTxtResponseUsable('  \n', '/version.txt')).toBe(false);
  });

  it('requires a recognizable channel for version.local.txt', () => {
    expect(isVersionTxtResponseUsable('2.3.0\n', '/version.local.txt')).toBe(false);
    expect(
      isVersionTxtResponseUsable(
        '2.3.0\nLocal build - 2026-06-14\nGit: abc\nBuild: 2026-06-14T09:59:00+0200',
        '/version.local.txt',
      ),
    ).toBe(true);
  });

  it('accepts version.txt with semver only', () => {
    expect(isVersionTxtResponseUsable('2.4.1\n', '/version.txt')).toBe(true);
  });
});

describe('formatBuildMetaLine', () => {
  it('formats hash, stamp and channel', () => {
    expect(
      formatBuildMetaLine({ gitHash: 'a0db03f7', buildStamp: '202606131249', channel: 'staging' }),
    ).toBe('a0db03f7 · 202606131249 · canal staging');
  });

  it('formats hash and channel without stamp', () => {
    expect(formatBuildMetaLine({ gitHash: 'a0db03f7', channel: 'staging' })).toBe(
      'a0db03f7 · canal staging',
    );
  });

  it('formats channel only', () => {
    expect(formatBuildMetaLine({ channel: 'production' })).toBe('canal production');
  });

  it('uses développement label', () => {
    expect(
      formatBuildMetaLine({ gitHash: 'abc1234', buildStamp: '202606140959', channel: 'development' }),
    ).toBe('abc1234 · 202606140959 · canal développement');
  });

  it('returns null without channel', () => {
    expect(formatBuildMetaLine({ gitHash: 'abc1234' })).toBeNull();
    expect(formatBuildMetaLine(null)).toBeNull();
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

  it('loads version and build meta from version.local.txt first', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: async () => `2.3.0
Local build - 2026-06-14
Git: 94f3eb67
Build: 2026-06-14T09:59:00+0200`,
      });

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('2.3.0');
    expect(service.buildMeta()).toEqual({
      channel: 'local',
      gitHash: '94f3eb67',
      buildStamp: '202606140959',
    });
    expect(fetchMock).toHaveBeenCalledWith('/version.local.txt', { cache: 'no-store' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to version.txt when version.local.txt is missing', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, text: async () => '' })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => FULL_VERSION_TXT,
      });

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('2.3.0');
    expect(service.buildMeta()?.channel).toBe('staging');
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/version.local.txt', { cache: 'no-store' });
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/version.txt', { cache: 'no-store' });
  });

  it('falls back to version.txt when version.local.txt is empty or lacks channel', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, text: async () => '2.3.0\n' })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => FULL_VERSION_TXT,
      });

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('2.3.0');
    expect(service.buildMeta()?.channel).toBe('staging');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('loads version from version.txt with partial metadata', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, text: async () => '' })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '2.4.1\nProduction build',
      });

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('2.4.1');
    expect(service.buildMeta()).toEqual({ channel: 'production' });
  });

  it('keeps default on fetch failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    const service = createService();
    await service.ensureLoaded();

    expect(service.version()).toBe('0.0.0');
    expect(service.buildMeta()).toBeNull();
  });

  it('does not fetch on server platform', async () => {
    const service = createService('server');
    await service.ensureLoaded();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(service.version()).toBe('0.0.0');
    expect(service.buildMeta()).toBeNull();
  });
});
