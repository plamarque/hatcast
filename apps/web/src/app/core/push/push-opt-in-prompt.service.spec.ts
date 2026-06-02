import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { AuthApiService } from '../auth/auth-api.service';
import { PwaInstallService } from '../pwa/pwa-install.service';
import { PwaUpdateService } from '../pwa/pwa-update.service';
import { ChangelogDialogService } from '../../shared/changelog/changelog-dialog.service';
import { PushNotificationsService } from './push-notifications.service';
import { PushOptInPromptService } from './push-opt-in-prompt.service';
import {
  PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY,
  PUSH_OPT_IN_PROMPT_DISMISS_TTL_MS,
  PUSH_OPT_IN_PROMPT_DISMISSED_KEY,
  PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY,
} from './push-opt-in-prompt-keys';

describe('PushOptInPromptService', () => {
  let storage: Record<string, string>;
  let session: Record<string, string>;
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> };
  let push: {
    canUsePush: ReturnType<typeof vi.fn>;
    loadStatus: ReturnType<typeof vi.fn>;
  };
  let pwaInstall: {
    isPwaInstalled: ReturnType<typeof vi.fn>;
    showBanner: ReturnType<typeof vi.fn>;
    onAppInstalled: ReturnType<typeof vi.fn>;
  };
  let pwaUpdate: { showBanner: ReturnType<typeof vi.fn> };
  let changelog: { maybeAutoOpenAfterPwaUpdate: ReturnType<typeof vi.fn> };
  let dialogOpen: ReturnType<typeof vi.fn>;
  let appInstalledHandler: (() => void) | null;

  beforeEach(() => {
    storage = {};
    session = {};
    appInstalledHandler = null;

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => session[key] ?? null,
      setItem: (key: string, value: string) => {
        session[key] = value;
      },
      removeItem: (key: string) => {
        delete session[key];
      },
    });

    auth = {
      ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    };
    push = {
      canUsePush: vi.fn().mockReturnValue(true),
      loadStatus: vi.fn().mockResolvedValue({ state: 'disabled' }),
    };
    pwaInstall = {
      isPwaInstalled: vi.fn().mockReturnValue(true),
      showBanner: vi.fn().mockReturnValue(false),
      onAppInstalled: vi.fn((listener: () => void) => {
        appInstalledHandler = listener;
        return () => {
          appInstalledHandler = null;
        };
      }),
    };
    pwaUpdate = { showBanner: vi.fn().mockReturnValue(false) };
    changelog = {
      maybeAutoOpenAfterPwaUpdate: vi.fn().mockResolvedValue(undefined),
    };
    dialogOpen = vi.fn().mockReturnValue({
      afterClosed: () => ({ subscribe: (fn: () => void) => fn() }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createService(): PushOptInPromptService {
    TestBed.configureTestingModule({
      providers: [
        PushOptInPromptService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthApiService, useValue: auth },
        { provide: PushNotificationsService, useValue: push },
        { provide: PwaInstallService, useValue: pwaInstall },
        { provide: PwaUpdateService, useValue: pwaUpdate },
        { provide: ChangelogDialogService, useValue: changelog },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        provideRouter([]),
      ],
    });
    return TestBed.inject(PushOptInPromptService);
  }

  it('isEligible is false when push unsupported', async () => {
    push.canUsePush.mockReturnValue(false);
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(false);
  });

  it('isEligible is false when not authenticated', async () => {
    auth.ensureHatcastSession.mockResolvedValue({ ok: false, status: 401 });
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(false);
  });

  it('isEligible is false when push already enabled', async () => {
    push.loadStatus.mockResolvedValue({ state: 'enabled' });
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(false);
  });

  it('isEligible is true for standalone first visit with push disabled', async () => {
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(true);
  });

  it('isEligible is false within dismiss TTL without after-install flag', async () => {
    storage[PUSH_OPT_IN_PROMPT_DISMISSED_KEY] = Date.now().toString();
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(false);
  });

  it('isEligible is true within dismiss TTL when after-install flag is set', async () => {
    storage[PUSH_OPT_IN_PROMPT_DISMISSED_KEY] = Date.now().toString();
    session[PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY] = '1';
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(true);
  });

  it('isEligible is false when standalone already offered', async () => {
    storage[PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY] = '1';
    const service = createService();
    await expect(service.isEligible()).resolves.toBe(false);
  });

  it('isDismissedWithinTtl respects TTL window', () => {
    const service = createService();
    storage[PUSH_OPT_IN_PROMPT_DISMISSED_KEY] = (Date.now() - PUSH_OPT_IN_PROMPT_DISMISS_TTL_MS - 1).toString();
    expect(service.isDismissedWithinTtl()).toBe(false);

    storage[PUSH_OPT_IN_PROMPT_DISMISSED_KEY] = Date.now().toString();
    expect(service.isDismissedWithinTtl()).toBe(true);
  });

  it('maybePromptWhenIdle opens changelog before push prompt', async () => {
    const callOrder: string[] = [];
    changelog.maybeAutoOpenAfterPwaUpdate.mockImplementation(async () => {
      callOrder.push('changelog');
    });
    dialogOpen.mockImplementation(() => {
      callOrder.push('dialog');
      return {
        afterClosed: () => ({ subscribe: (fn: () => void) => fn() }),
      };
    });
    const service = createService();
    await service.maybePromptWhenIdle();
    expect(callOrder).toEqual(['changelog', 'dialog']);
  });

  it('maybePromptWhenIdle does not open dialog when ineligible', async () => {
    push.loadStatus.mockResolvedValue({ state: 'enabled' });
    const service = createService();
    await service.maybePromptWhenIdle();
    expect(dialogOpen).not.toHaveBeenCalled();
  });

  it('maybePromptWhenIdle does not open dialog when banners stay visible', async () => {
    vi.useFakeTimers();
    pwaInstall.showBanner.mockReturnValue(true);
    const service = createService();
    const pending = service.maybePromptWhenIdle();
    await vi.advanceTimersByTimeAsync(30_000);
    await pending;
    expect(dialogOpen).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('registers appinstalled listener via PwaInstallService', () => {
    createService();
    expect(pwaInstall.onAppInstalled).toHaveBeenCalled();
    expect(appInstalledHandler).toBeTypeOf('function');
  });

  it('appinstalled handler sets session flag and can open dialog', async () => {
    pwaInstall.isPwaInstalled.mockReturnValue(false);
    storage[PUSH_OPT_IN_PROMPT_STANDALONE_SEEN_KEY] = '1';
    const service = createService();
    appInstalledHandler?.();
    session[PUSH_OPT_IN_PROMPT_AFTER_INSTALL_KEY] = '1';
    pwaInstall.isPwaInstalled.mockReturnValue(true);
    await service.maybePromptWhenIdle({ skipChangelog: true });
    expect(dialogOpen).toHaveBeenCalled();
  });
});
