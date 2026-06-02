import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  let versionUpdates: Subject<VersionReadyEvent | { type: string }>;
  let activateUpdate: ReturnType<typeof vi.fn>;
  let isEnabled: boolean;
  let getRegistration: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    versionUpdates = new Subject();
    activateUpdate = vi.fn().mockResolvedValue(undefined);
    isEnabled = true;
    getRegistration = vi.fn().mockResolvedValue(undefined);
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ timestamp: 1 }),
    });

    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistration },
    });
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [
        PwaUpdateService,
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

    expect(activateUpdate).toHaveBeenCalledOnce();
    expect(service.refreshing()).toBe(true);
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
});
