import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SHOW_CHANGELOG_AFTER_RELOAD_KEY } from '../app/changelog-keys';
import { ProductAnalyticsService } from '../analytics/product-analytics.service';
import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  let versionUpdates: Subject<VersionReadyEvent | { type: string }>;
  let activateUpdate: ReturnType<typeof vi.fn>;
  let isEnabled: boolean;
  let getRegistration: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;
  let analytics: {
    capturePwaUpdateAvailable: ReturnType<typeof vi.fn>;
    capturePwaUpdateDismissed: ReturnType<typeof vi.fn>;
    capturePwaUpdateApplyRequested: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    versionUpdates = new Subject();
    activateUpdate = vi.fn().mockResolvedValue(undefined);
    isEnabled = true;
    getRegistration = vi.fn().mockResolvedValue(undefined);
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ timestamp: 1 }),
    });
    analytics = {
      capturePwaUpdateAvailable: vi.fn(),
      capturePwaUpdateDismissed: vi.fn(),
      capturePwaUpdateApplyRequested: vi.fn(),
    };
    sessionStorage.clear();

    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistration },
    });
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [
        PwaUpdateService,
        { provide: ProductAnalyticsService, useValue: analytics },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: SwUpdate,
          useValue: {
            get isEnabled() {
              return isEnabled;
            },
            versionUpdates: versionUpdates.asObservable(),
            activateUpdate,
          },
        },
      ],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  function createService(): PwaUpdateService {
    return TestBed.inject(PwaUpdateService);
  }

  it('shows banner on VERSION_READY', () => {
    const service = createService();
    expect(service.showBanner()).toBe(false);

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);

    expect(service.showBanner()).toBe(true);
    expect(service.refreshing()).toBe(false);
    expect(analytics.capturePwaUpdateAvailable).toHaveBeenCalledWith('version_ready');
  });

  it('does not show banner when service worker is disabled', () => {
    isEnabled = false;
    const service = createService();

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);

    expect(service.showBanner()).toBe(false);
  });

  it('applyUpdate calls activateUpdate when update is pending', async () => {
    const service = createService();
    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);

    await service.applyUpdate();

    expect(analytics.capturePwaUpdateApplyRequested).toHaveBeenCalledOnce();
    expect(activateUpdate).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBe('1');
    expect(service.refreshing()).toBe(true);
  });

  it('reloads after activation even when optional storage is denied', async () => {
    const reload = vi.fn();
    vi.stubGlobal('document', { location: { reload } });
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
    try {
      await createService().applyUpdate();
      expect(activateUpdate).toHaveBeenCalledOnce();
      expect(reload).toHaveBeenCalledOnce();
    } finally { storage.mockRestore(); }
  });

  it('dismissBanner hides banner until next VERSION_READY', () => {
    const service = createService();
    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);
    expect(service.showBanner()).toBe(true);

    service.dismissBanner();
    expect(service.showBanner()).toBe(false);
    expect(analytics.capturePwaUpdateDismissed).toHaveBeenCalledOnce();

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'b' },
      latestVersion: { hash: 'c' },
    } as VersionReadyEvent);
    expect(service.showBanner()).toBe(true);
  });

  it('dismissBanner blocks fallback re-show until VERSION_READY', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ timestamp: 1 }) });
    const service = createService();
    await Promise.resolve();

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);
    expect(service.showBanner()).toBe(true);

    service.dismissBanner();
    expect(service.showBanner()).toBe(false);

    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ timestamp: 2 }) });
    getRegistration.mockResolvedValue({
      waiting: { state: 'installed' },
      addEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration,
        controller: {},
      },
    });

    await service.pollForAppUpdate();
    expect(service.showBanner()).toBe(false);

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'b' },
      latestVersion: { hash: 'c' },
    } as VersionReadyEvent);
    expect(service.showBanner()).toBe(true);
  });

  it('applyUpdate is no-op while already refreshing', async () => {
    const service = createService();
    service.refreshing.set(true);

    await service.applyUpdate();

    expect(activateUpdate).not.toHaveBeenCalled();
  });

  it('applyUpdate resets refreshing on activateUpdate failure', async () => {
    activateUpdate.mockRejectedValueOnce(new Error('SW not ready'));
    const service = createService();
    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);

    await service.applyUpdate();

    expect(service.refreshing()).toBe(false);
  });

  it('checkForUpdatesManually returns disabled when service worker is disabled', async () => {
    isEnabled = false;
    const service = createService();

    await expect(service.checkForUpdatesManually()).resolves.toBe('disabled');
  });

  it('checkForUpdatesManually returns up-to-date when no pending update', async () => {
    vi.useFakeTimers();
    getRegistration.mockResolvedValue({
      waiting: null,
      addEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    });
    const service = createService();
    await Promise.resolve();

    const resultPromise = service.checkForUpdatesManually();
    await vi.runAllTimersAsync();
    await expect(resultPromise).resolves.toBe('up-to-date');
    expect(service.showBanner()).toBe(false);
    expect(service.checking()).toBe(false);
    vi.useRealTimers();
  });

  it('checkForUpdatesManually shows banner when VERSION_READY during check', async () => {
    getRegistration.mockResolvedValue({
      waiting: null,
      addEventListener: vi.fn(),
      update: vi.fn().mockImplementation(async () => {
        versionUpdates.next({
          type: 'VERSION_READY',
          currentVersion: { hash: 'a' },
          latestVersion: { hash: 'b' },
        } as VersionReadyEvent);
      }),
    });
    const service = createService();
    await Promise.resolve();

    await expect(service.checkForUpdatesManually()).resolves.toBe('available');
    expect(service.showBanner()).toBe(true);
  });

  it('checkForUpdatesManually shows banner when waiting worker exists', async () => {
    getRegistration.mockResolvedValue({
      waiting: { state: 'installed' },
      addEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration,
        controller: {},
      },
    });
    const service = createService();
    await Promise.resolve();

    await expect(service.checkForUpdatesManually()).resolves.toBe('available');
    expect(service.showBanner()).toBe(true);
    expect(analytics.capturePwaUpdateAvailable).toHaveBeenCalledWith('fallback');
  });

  it('captures update availability once while the banner remains visible', () => {
    const service = createService();

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);
    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);

    expect(analytics.capturePwaUpdateAvailable).toHaveBeenCalledTimes(1);
  });

  it('continues the update flow when analytics fails', () => {
    analytics.capturePwaUpdateAvailable.mockImplementation(() => {
      throw new Error('analytics unavailable');
    });
    const service = createService();

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as VersionReadyEvent);

    expect(service.showBanner()).toBe(true);
  });

  it('checkForUpdatesManually returns error when ngsw.json fetch fails', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const service = createService();

    await expect(service.checkForUpdatesManually()).resolves.toBe('error');
  });
});
