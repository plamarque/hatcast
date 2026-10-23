import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  provideRouter,
  Router,
  withNavigationErrorHandler,
} from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ChunkRecoveryService,
  isRouteImportFailure,
  navigateRecoveryDocument,
  RECOVERY_NAVIGATE,
  safeRecoveryPath,
} from './chunk-recovery.service';
import type { ChunkRecoveryDialogData } from '../../shared/pwa/chunk-recovery-dialog/chunk-recovery-dialog';
const importError = () => new TypeError('Failed to fetch dynamically imported module: /old.js');
describe('import classification and destinations', () => {
  it.each([
    'Failed to fetch dynamically imported module: /x.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
    'Failed to load module script: Expected JavaScript but received MIME text/html',
    'Loading chunk abc failed',
    "'text/html' is not a valid JavaScript MIME type for module script 'https://hatcast.app/chunk-ABC.js'.",
  ])('recognizes %s', (m) => expect(isRouteImportFailure(new Error(m))).toBe(true));
  it.each([new Error('Failed to fetch'), new Error('business'), null, {}])('ignores %s', (e) =>
    expect(isRouteImportFailure(e)).toBe(false),
  );
  it.each(['https://evil.test/x', '//evil.test', '/\\evil.test', 'javascript:alert(1)', '/x\n/y'])(
    'rejects %s',
    (p) => expect(safeRecoveryPath(p, 'https://hat.test')).toBeNull(),
  );
  it('assigns a different document address', () => {
    const assign = vi.fn();
    navigateRecoveryDocument(
      {
        location: { origin: 'https://hat.test', pathname: '/', search: '', assign },
      } as unknown as Document,
      '/agenda?q=1#next',
    );
    expect(assign).toHaveBeenCalledWith('https://hat.test/agenda?q=1#next');
  });
  it('retains query and hash', () =>
    expect(safeRecoveryPath('/agenda?q=1%202#next', 'https://hat.test')).toBe(
      '/agenda?q=1%202#next',
    ));
  it.each(['/agenda?a=1#same', '/agenda?a=1#other'])('fully reloads %s', (path) => {
    const reload = vi.fn(),
      replaceState = vi.fn(),
      assign = vi.fn();
    navigateRecoveryDocument(
      {
        location: {
          origin: 'https://hat.test',
          pathname: '/agenda',
          search: '?a=1',
          reload,
          assign,
        },
        defaultView: { history: { replaceState } },
      } as unknown as Document,
      path,
    );
    expect(replaceState).toHaveBeenCalledWith(null, '', 'https://hat.test' + path);
    expect(reload).toHaveBeenCalledOnce();
    expect(assign).not.toHaveBeenCalled();
  });
});
describe('ChunkRecoveryService', () => {
  let events: Subject<any>, versions: Subject<any>, closed: Subject<void>, closing: Subject<void>;
  let data: ChunkRecoveryDialogData, ref: any, service: ChunkRecoveryService;
  let check: ReturnType<typeof vi.fn>,
    navigate: ReturnType<typeof vi.fn>,
    open: ReturnType<typeof vi.fn>;
  let nav: { onLine: boolean; serviceWorker: { controller: object | null } };
  beforeEach(() => {
    events = new Subject();
    versions = new Subject();
    closed = new Subject();
    closing = new Subject();
    check = vi.fn().mockResolvedValue(true);
    navigate = vi.fn();
    nav = { onLine: true, serviceWorker: { controller: null } };
    ref = {
      disableClose: false,
      beforeClosed: () => closing,
      afterClosed: () => closed,
      close: vi.fn(() => {
        closing.next();
        closed.next();
      }),
    };
    open = vi.fn((_c, config) => {
      data = config.data;
      ref.disableClose = config.disableClose;
      return ref;
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigated: false, events, navigateByUrl: vi.fn() } },
        { provide: MatDialog, useValue: { open } },
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates: versions,
            checkForUpdate: check,
            activateUpdate: vi.fn(),
          },
        },
        {
          provide: DOCUMENT,
          useValue: { location: { origin: 'https://hat.test' }, defaultView: { navigator: nav } },
        },
        { provide: RECOVERY_NAVIGATE, useValue: navigate },
      ],
    });
    service = TestBed.inject(ChunkRecoveryService);
  });
  afterEach(() => vi.useRealTimers());
  function fail() {
    service.handle(new NavigationError(1, '/agenda?q=1#next', importError()));
  }
  async function confirm() {
    data.confirm();
    for (let n = 0; n < 8; n++) await Promise.resolve();
  }
  it('owns one dialog for recognized failures only', () => {
    service.handle(new NavigationError(1, '/x', new Error('ordinary')));
    expect(open).not.toHaveBeenCalled();
    fail();
    fail();
    expect(open).toHaveBeenCalledOnce();
    expect(check).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('rejects unsafe addresses', () => {
    service.handle(new NavigationError(1, '//evil.test', importError()));
    expect(open).not.toHaveBeenCalled();
  });
  it('keeps an existing screen on dismissal', () => {
    events.next(new NavigationEnd(1, '/old', '/old'));
    fail();
    expect(data.canDismiss).toBe(true);
    data.exit();
    expect(service.active()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('keeps an initial failure update-only without root navigation', () => {
    fail();
    expect(data.canDismiss).toBe(false);
    expect(ref.disableClose).toBe(true);
    data.exit();
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    expect(ref.close).not.toHaveBeenCalled();
    expect(service.active()).toBe(true);
  });
  it('does not count the root AuthRedirect placeholder as a usable screen', () => {
    events.next(new NavigationEnd(1, '/?from=link#top', '/?from=link#top'));
    fail();
    expect(data.canDismiss).toBe(false);
    expect(ref.disableClose).toBe(true);
  });
  it('keeps recovery usable through cancelled navigation and invalidates its pending check', async () => {
    events.next(new NavigationEnd(1, '/old', '/old'));
    nav.serviceWorker.controller = {};
    let resolve!: (v: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((r) => (resolve = r)));
    fail();
    data.confirm();
    expect(data.busy()).toBe(true);
    events.next(new NavigationStart(2, '/other'));
    events.next(
      new NavigationCancel(2, '/other', 'guard', NavigationCancellationCode.GuardRejected),
    );
    expect(ref.close).not.toHaveBeenCalled();
    expect(service.active()).toBe(true);
    expect(data.busy()).toBe(false);
    expect(ref.disableClose).toBe(false);
    resolve(true);
    for (let n = 0; n < 8; n++) await Promise.resolve();
    expect(navigate).not.toHaveBeenCalled();
    data.exit();
    expect(ref.close).toHaveBeenCalledOnce();
  });
  it('keeps recovery after replacement failure and closes only after successful navigation', () => {
    events.next(new NavigationEnd(1, '/old', '/old'));
    fail();
    events.next(new NavigationStart(2, '/other'));
    events.next(new NavigationError(2, '/other', new Error('ordinary')));
    expect(ref.close).not.toHaveBeenCalled();
    events.next(new NavigationEnd(3, '/ready', '/ready'));
    expect(ref.close).toHaveBeenCalledOnce();
    expect(service.active()).toBe(false);
  });
  it('releases ownership before animation ends and ignores old closing notifications', () => {
    fail();
    const oldClosing = closing,
      oldClosed = closed;
    ref.close.mockImplementation(() => oldClosing.next());
    ref.close();
    expect(service.active()).toBe(false);
    const nextClosing = new Subject<void>();
    ref = {
      disableClose: false,
      beforeClosed: () => nextClosing,
      afterClosed: () => new Subject<void>(),
      close: vi.fn(() => nextClosing.next()),
    };
    fail();
    expect(open).toHaveBeenCalledTimes(2);
    expect(service.active()).toBe(true);
    oldClosed.next();
    oldClosing.next();
    fail();
    expect(open).toHaveBeenCalledTimes(2);
    expect(service.active()).toBe(true);
    data.confirm();
    expect(navigate).toHaveBeenCalledOnce();
  });
  it('navigates directly once without controller', async () => {
    fail();
    await confirm();
    await confirm();
    expect(check).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/agenda?q=1#next');
  });
  it('checks actual controller on consent and never activates', async () => {
    fail();
    nav.serviceWorker.controller = {};
    await confirm();
    expect(check).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledOnce();
    expect(TestBed.inject(SwUpdate).activateUpdate).not.toHaveBeenCalled();
    expect(versions.observed).toBe(false);
  });
  it('accepts false with a known-manifest event', async () => {
    nav.serviceWorker.controller = {};
    check.mockImplementation(async () => {
      versions.next({ type: 'NO_NEW_VERSION_DETECTED' });
      return false;
    });
    fail();
    await confirm();
    expect(navigate).toHaveBeenCalledOnce();
  });
  it.each(['false', 'reject', 'offline'])('offers retry and escape after %s', async (mode) => {
    nav.serviceWorker.controller = {};
    if (mode === 'false') check.mockResolvedValue(false);
    if (mode === 'reject') check.mockRejectedValue(new Error('network'));
    if (mode === 'offline') nav.onLine = false;
    events.next(new NavigationEnd(1, '/old', '/old'));
    fail();
    await confirm();
    expect(navigate).not.toHaveBeenCalled();
    expect(data.feedback()).toContain('connexion');
    expect(data.busy()).toBe(false);
    expect(ref.disableClose).toBe(false);
    data.exit();
    expect(service.active()).toBe(false);
  });
  it('allows a second explicit retry after an inconclusive check', async () => {
    nav.serviceWorker.controller = {};
    check.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    fail();
    await confirm();
    expect(navigate).not.toHaveBeenCalled();
    await confirm();
    expect(check).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledOnce();
  });
  it('does not interrupt a working tab for worker events', () => {
    versions.next({ type: 'VERSION_READY' });
    versions.next({ type: 'NO_NEW_VERSION_DETECTED' });
    expect(open).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
  it('recovery does not access denied browser storage', async () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    try {
      fail();
      await confirm();
      expect(navigate).toHaveBeenCalledOnce();
      expect(storage).not.toHaveBeenCalled();
    } finally {
      storage.mockRestore();
    }
  });
  it('times out, unsubscribes and discards late results', async () => {
    vi.useFakeTimers();
    nav.serviceWorker.controller = {};
    let resolve!: (v: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((r) => (resolve = r)));
    events.next(new NavigationEnd(1, '/old', '/old'));
    fail();
    data.confirm();
    data.confirm();
    expect(check).toHaveBeenCalledOnce();
    expect(ref.disableClose).toBe(true);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(data.busy()).toBe(false);
    expect(versions.observed).toBe(false);
    resolve(true);
    await Promise.resolve();
    expect(navigate).not.toHaveBeenCalled();
  });
  it.each(['close', 'navigation'])('discards pending completion after %s', async (mode) => {
    nav.serviceWorker.controller = {};
    let resolve!: (v: boolean) => void;
    check.mockImplementation(() => new Promise<boolean>((r) => (resolve = r)));
    fail();
    data.confirm();
    if (mode === 'close') ref.close();
    else events.next(new NavigationStart(2, '/other'));
    resolve(true);
    for (let n = 0; n < 8; n++) await Promise.resolve();
    expect(navigate).not.toHaveBeenCalled();
  });
});
@Component({ template: 'ready' })
class Ready {}
describe('real router integration', () => {
  it('preserves failed navigation rejection and the previous screen', async () => {
    const recover = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'ready', component: Ready },
            { path: 'broken', loadComponent: () => Promise.reject(importError()) },
            { path: 'ordinary', loadComponent: () => Promise.reject(new Error('ordinary')) },
          ],
          withNavigationErrorHandler((e) => {
            inject(ChunkRecoveryService).handle(e);
          }),
        ),
        { provide: ChunkRecoveryService, useValue: { handle: recover } },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ready');
    await expect(router.navigateByUrl('/broken?q=1#next')).rejects.toThrow('dynamically imported');
    await expect(router.navigateByUrl('/ordinary')).rejects.toThrow('ordinary');
    expect(recover).toHaveBeenCalledTimes(2);
    expect(recover.mock.calls[0][0].url).toBe('/broken?q=1#next');
    expect(router.url).toBe('/ready');
  });
});
