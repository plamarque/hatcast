import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductAnalyticsService } from '../analytics/product-analytics.service';
import { SHOW_CHANGELOG_AFTER_RELOAD_KEY } from '../app/changelog-keys';
import { PWA_BUILD_ID, PwaUpdateService } from './pwa-update.service';

const PENDING = 'hatcast.pwa.pending-update.v1';
const ready = (id = 'build-b', hash = 'hash-b'): VersionReadyEvent => ({
  type: 'VERSION_READY', currentVersion: { hash: 'hash-a' },
  latestVersion: { hash, appData: { hatcastBuildId: id } },
});

describe('PwaUpdateService', () => {
  let events: Subject<VersionEvent>;
  let check: ReturnType<typeof vi.fn>;
  let analytics: { capturePwaUpdateAvailable: ReturnType<typeof vi.fn>; capturePwaUpdateDismissed: ReturnType<typeof vi.fn>; capturePwaUpdateApplyRequested: ReturnType<typeof vi.fn> };
  let reload: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('crypto', { subtle: { digest: async (_algorithm: string, bytes: Uint8Array) => {
      const valid = new TextDecoder().decode(bytes) === '{"appData":{"hatcastBuildId":"build-b"}}';
      const hex = valid ? '335fa8b89c1e2a3a471954bfd05f7f18e5b9d77c' : '0000000000000000000000000000000000000000';
      return Uint8Array.from(hex.match(/../g)!, (part) => parseInt(part, 16)).buffer;
    } } });
    events = new Subject();
    check = vi.fn().mockResolvedValue(false);
    reload = vi.fn();
    analytics = { capturePwaUpdateAvailable: vi.fn(), capturePwaUpdateDismissed: vi.fn(), capturePwaUpdateApplyRequested: vi.fn() };
    vi.stubGlobal('document', { location: { reload } });
    TestBed.configureTestingModule({ providers: [
      PwaUpdateService, { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: PWA_BUILD_ID, useValue: 'build-a' },
      { provide: ProductAnalyticsService, useValue: analytics },
      { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates: events.asObservable(), checkForUpdate: check } },
    ] });
  });
  afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); vi.restoreAllMocks(); });
  const service = () => TestBed.inject(PwaUpdateService);

  it('offers the banner only after Angular declares a version ready', () => {
    const update = service();
    events.next({ type: 'VERSION_DETECTED', version: { hash: 'hash-b' } });
    expect(update.showBanner()).toBe(false);
    events.next(ready());
    expect(update.showBanner()).toBe(true);
    expect(analytics.capturePwaUpdateAvailable).toHaveBeenCalledWith('version_ready');
  });
  it('preserves dismissal for the same version and offers a later one', () => {
    const update = service();
    events.next(ready()); update.dismissBanner(); events.next(ready());
    expect(update.showBanner()).toBe(false);
    events.next(ready('build-c', 'hash-c'));
    expect(update.showBanner()).toBe(true);
  });
  it('records the expected build and reloads once, without activating a running client', async () => {
    const update = service(); events.next(ready());
    await update.applyUpdate(); await update.applyUpdate();
    expect(JSON.parse(sessionStorage.getItem(PENDING)!)).toMatchObject({ previous: 'build-a', expected: 'build-b' });
    expect(reload).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
  });
  it('does not reload if a user cancels with an edited form', async () => {
    vi.stubGlobal('document', { location: { reload }, querySelector: () => ({}) });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const update = service(); events.next(ready());
    await update.applyUpdate();
    expect(confirm).toHaveBeenCalledOnce();
    expect(reload).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(PENDING)).toBeNull();
  });
  it('asks before reloading with an open dialog even without a dirty form', async () => {
    const querySelector = vi.fn((selector: string) => selector.includes('mat-dialog-container') ? {} : null);
    vi.stubGlobal('document', { location: { reload }, querySelector });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const update = service(); events.next(ready());
    await update.applyUpdate();
    expect(confirm).toHaveBeenCalledOnce();
    expect(reload).not.toHaveBeenCalled();
  });
  it('recovers if the reload is cancelled', async () => {
    vi.useFakeTimers();
    try {
      const update = service(); events.next(ready());
      await update.applyUpdate();
      await vi.advanceTimersByTimeAsync(15_000);
      expect(update.refreshing()).toBe(false);
      expect(update.updateMessage()).toContain('rechargement');
      expect(JSON.parse(sessionStorage.getItem(PENDING)!).uncertain).toBe(true);
    } finally { vi.useRealTimers(); }
  });
  it('shows changelog only after the expected build actually starts', () => {
    sessionStorage.setItem(PENDING, JSON.stringify({ previous: 'old', expected: 'build-a', requestedAt: Date.now() }));
    const update = service();
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBe('1');
    expect(update.showBanner()).toBe(false);
    expect(sessionStorage.getItem(PENDING)).toBeNull();
  });
  it('reports a same-build reload and does not claim success', () => {
    sessionStorage.setItem(PENDING, JSON.stringify({ previous: 'build-a', expected: 'build-b', requestedAt: Date.now() }));
    const update = service();
    expect(update.updateMessage()).toContain('pas pu être appliquée');
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
  });
  it('retains the verified ready target for a retry after a same-build reload', async () => {
    sessionStorage.setItem(PENDING, JSON.stringify({ previous: 'build-a', expected: 'build-b', currentHash: 'hash-a', expectedHash: 'hash-b', requestedAt: Date.now() }));
    const update = service();
    expect(update.canApply()).toBe(true);
    await update.applyUpdate();
    expect(reload).toHaveBeenCalledOnce();
  });
  it('treats a different unidentified build as unconfirmed', () => {
    sessionStorage.setItem(PENDING, JSON.stringify({ previous: 'old', expected: 'other', requestedAt: Date.now() }));
    expect(service().updateMessage()).toContain('Impossible de confirmer');
  });
  it('does not claim success after an expired or uncertain attempt', () => {
    sessionStorage.setItem(PENDING, JSON.stringify({ previous: 'old', expected: 'build-a', requestedAt: Date.now() - 700_000 }));
    expect(service().updateMessage()).toContain('Impossible de confirmer');
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
  });
  it('does not claim success when a reload was cancelled or delayed', () => {
    sessionStorage.setItem(PENDING, JSON.stringify({ previous: 'old', expected: 'build-a', requestedAt: Date.now(), uncertain: true }));
    expect(service().updateMessage()).toContain('Impossible de confirmer');
    expect(sessionStorage.getItem(SHOW_CHANGELOG_AFTER_RELOAD_KEY)).toBeNull();
  });
  it('warns before reloading without target metadata', async () => {
    const update = service(); events.next(ready(''));
    await update.applyUpdate(); expect(reload).not.toHaveBeenCalled();
    expect(update.unverifiedWarning()).toBe(true);
    await update.applyUpdate(); expect(reload).toHaveBeenCalledOnce();
    expect(JSON.parse(sessionStorage.getItem(PENDING)!).expected).toBeNull();
  });
  it('warns and allows reload if session storage is unavailable', async () => {
    const update = service(); events.next(ready());
    vi.stubGlobal('sessionStorage', { setItem: () => { throw new Error('denied'); } });
    await update.applyUpdate(); expect(reload).not.toHaveBeenCalled();
    expect(update.unverifiedWarning()).toBe(true);
    await update.applyUpdate(); expect(reload).toHaveBeenCalledOnce();
  });
  it('does not report up-to-date if the check fails', async () => {
    check.mockRejectedValue(new Error('offline'));
    const update = service();
    expect(await update.checkForUpdatesManually()).toBe('error');
    expect(update.showBanner()).toBe(false);
  });
  it('does not report up-to-date if Angular returns false without confirmation', async () => {
    expect(await service().checkForUpdatesManually()).toBe('error');
  });
  it('reports up-to-date only when Angular observes the running build', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ appData: { hatcastBuildId: 'build-a' } }) }));
    let complete!: (value: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((resolve) => { complete = resolve; }));
    const update = service();
    const result = update.checkForUpdatesManually();
    events.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: '0000000000000000000000000000000000000000', appData: { hatcastBuildId: 'build-a' } } });
    complete(false);
    expect(await result).toBe('up-to-date');
  });
  it('offers a cached version only after the worker and network manifest agree', async () => {
    let complete!: (value: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((resolve) => { complete = resolve; }));
    const manifest = { appData: { hatcastBuildId: 'build-b' } };
    const hash = '335fa8b89c1e2a3a471954bfd05f7f18e5b9d77c';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));
    const update = service();
    const result = update.checkForUpdatesManually();
    events.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash, appData: { hatcastBuildId: 'build-b' } } });
    complete(false);
    expect(await result).toBe('available');
    expect(update.showBanner()).toBe(true);
    expect(analytics.capturePwaUpdateAvailable).toHaveBeenCalledWith('cached_ready');
  });
  it('does not offer a cached version when the manifest changed', async () => {
    let complete!: (value: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((resolve) => { complete = resolve; }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ appData: { hatcastBuildId: 'build-b' }, changed: true }) }));
    const update = service();
    const result = update.checkForUpdatesManually();
    events.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash: 'different', appData: { hatcastBuildId: 'build-b' } } });
    complete(false);
    expect(await result).toBe('error');
    expect(update.showBanner()).toBe(false);
  });
  it('uses Angular byte encoding when the cached manifest contains Unicode', async () => {
    let complete!: (value: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((resolve) => { complete = resolve; }));
    const manifest = { appData: { hatcastBuildId: 'build-b' }, note: 'é🎭' };
    const serialized = JSON.stringify(manifest);
    const expected = Uint8Array.from({ length: serialized.length }, (_, i) => serialized.charCodeAt(i) & 0xff);
    const hash = 'ebf77ff254981daf79e9a7743d2899b9ffbe8ed9';
    vi.stubGlobal('crypto', { subtle: { digest: async (_algorithm: string, bytes: Uint8Array) => {
      expect(Array.from(bytes)).toEqual(Array.from(expected));
      return Uint8Array.from(hash.match(/../g)!, (part) => parseInt(part, 16)).buffer;
    } } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));
    const update = service();
    const result = update.checkForUpdatesManually();
    events.next({ type: 'NO_NEW_VERSION_DETECTED', version: { hash, appData: { hatcastBuildId: 'build-b' } } });
    complete(false);
    expect(await result).toBe('available');
  });
  it('manual check reopens a previously dismissed ready version', async () => {
    const update = service(); events.next(ready()); update.dismissBanner();
    expect(await update.checkForUpdatesManually()).toBe('available');
    expect(update.showBanner()).toBe(true);
  });
});
