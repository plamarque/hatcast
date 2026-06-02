import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  PWA_BANNER_DISMISSED_KEY,
  PWA_INSTALLED_KEY,
  PwaInstallService,
} from './pwa-install.service';

describe('PwaInstallService', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    });
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('standalone') ? false : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createService(snackOpen = vi.fn()): PwaInstallService {
    TestBed.configureTestingModule({
      providers: [
        PwaInstallService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    });
    return TestBed.inject(PwaInstallService);
  }

  it('isPwaInstalled returns true in standalone display mode', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const service = createService();
    expect(service.isPwaInstalled()).toBe(true);
    expect(storage[PWA_INSTALLED_KEY]).toBe('true');
  });

  it('isPwaInstalled clears stale localStorage when not standalone', () => {
    storage[PWA_INSTALLED_KEY] = 'true';
    const service = createService();
    expect(service.isPwaInstalled()).toBe(false);
    expect(storage[PWA_INSTALLED_KEY]).toBeUndefined();
  });

  it('isPwaInstalled returns true for iOS navigator.standalone', () => {
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: true,
    });
    const service = createService();
    expect(service.isPwaInstalled()).toBe(true);
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: undefined,
    });
  });

  it('shouldShowInstallBanner is false when installed', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const service = createService();
    expect(service.shouldShowInstallBanner()).toBe(false);
  });

  it('shouldShowInstallBanner is false within 24h dismiss TTL', () => {
    storage[PWA_BANNER_DISMISSED_KEY] = Date.now().toString();
    const service = createService();
    expect(service.shouldShowInstallBanner()).toBe(false);
  });

  it('shouldShowInstallBanner is true after dismiss TTL elapsed', () => {
    const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
    storage[PWA_BANNER_DISMISSED_KEY] = twoDaysAgo.toString();
    const service = createService();
    expect(service.shouldShowInstallBanner()).toBe(true);
  });

  it('dismissBanner hides banner and stores timestamp', () => {
    const service = createService();
    service.refreshBannerVisibility();
    expect(service.showBanner()).toBe(true);
    service.dismissBanner();
    expect(service.showBanner()).toBe(false);
    expect(storage[PWA_BANNER_DISMISSED_KEY]).toBeDefined();
  });

  it('installFromUserMenu shows snackbar when already installed', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const snackOpen = vi.fn();
    const service = createService(snackOpen);
    const openManualInstructions = vi.spyOn(service, 'openManualInstructions');
    await service.installFromUserMenu();
    expect(snackOpen).toHaveBeenCalledWith(
      "L'application est déjà installée",
      undefined,
      expect.objectContaining({ duration: 4000 }),
    );
    expect(openManualInstructions).not.toHaveBeenCalled();
  });

  it('installFromUserMenu clears dismiss TTL and calls promptInstall path', async () => {
    storage[PWA_BANNER_DISMISSED_KEY] = Date.now().toString();
    const openManualInstructions = vi.fn();
    const service = createService();
    vi.spyOn(service, 'openManualInstructions').mockImplementation(openManualInstructions);
    await service.installFromUserMenu();
    expect(storage[PWA_BANNER_DISMISSED_KEY]).toBeUndefined();
    expect(openManualInstructions).toHaveBeenCalled();
  });

  it('skips native prompt on Tailscale dev origin and opens manual instructions', async () => {
    vi.stubGlobal('location', { hostname: 'patrices-macbook-pro.tail3f7249.ts.net' });
    const dialogOpen = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        PwaInstallService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
    const service = TestBed.inject(PwaInstallService);
    const promptFn = vi.fn().mockResolvedValue(undefined);
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      platforms: string[];
      userChoice: Promise<{ outcome: 'dismissed' }>;
      prompt: () => Promise<void>;
    };
    event.platforms = ['web'];
    event.userChoice = Promise.resolve({ outcome: 'dismissed' });
    event.prompt = promptFn;
    window.dispatchEvent(event);
    expect(service.hasNativeInstallPrompt()).toBe(true);

    await service.promptInstall();

    expect(promptFn).not.toHaveBeenCalled();
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({
          browserInfo: expect.anything(),
          allowNativeRetry: false,
        }),
      }),
    );
  });

  it('sets allowNativeRetry when native prompt is available on trusted origin', () => {
    vi.stubGlobal('location', { hostname: 'localhost' });
    const service = createService();
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      platforms: string[];
      userChoice: Promise<{ outcome: 'dismissed' }>;
      prompt: () => Promise<void>;
    };
    event.platforms = ['web'];
    event.userChoice = Promise.resolve({ outcome: 'dismissed' });
    event.prompt = vi.fn();
    window.dispatchEvent(event);
    expect(service.canRetryNativeInstall()).toBe(true);
  });
});
