import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PushNotificationsService } from '../../../core/push/push-notifications.service';
import {
  PUSH_OPT_IN_PROMPT_DISMISSED_KEY,
} from '../../../core/push/push-opt-in-prompt-keys';
import { PushOptInPromptService } from '../../../core/push/push-opt-in-prompt.service';
import { PushOptInDialog } from './push-opt-in-dialog';

describe('PushOptInDialog', () => {
  let storage: Record<string, string>;
  let pushEnable: ReturnType<typeof vi.fn>;
  let dialogClose: ReturnType<typeof vi.fn>;
  let dialogDisableClose: boolean;
  let markStandalone: ReturnType<typeof vi.fn>;

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
    });
    vi.stubGlobal('sessionStorage', {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });

    pushEnable = vi.fn().mockResolvedValue({ ok: true, state: 'enabled' });
    dialogClose = vi.fn();
    dialogDisableClose = false;
    markStandalone = vi.fn();
  });

  async function createFixture(): Promise<ComponentFixture<PushOptInDialog>> {
    await TestBed.configureTestingModule({
      imports: [PushOptInDialog],
      providers: [
        provideRouter([]),
        {
          provide: MatDialogRef,
          useValue: {
            close: dialogClose,
            get disableClose() {
              return dialogDisableClose;
            },
            set disableClose(value: boolean) {
              dialogDisableClose = value;
            },
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: PushNotificationsService,
          useValue: { enable: pushEnable },
        },
        {
          provide: PushOptInPromptService,
          useValue: {
            markStandaloneOffered: markStandalone,
            recordOptInSuccess: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PushOptInDialog);
    fixture.detectChanges();
    return fixture;
  }

  it('enable button calls PushNotificationsService.enable', async () => {
    const fixture = await createFixture();
    const btn = fixture.nativeElement.querySelector(
      '.push-opt-in-dialog__action--primary',
    ) as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    expect(pushEnable).toHaveBeenCalled();
    expect(dialogClose).toHaveBeenCalledWith('enabled');
  });

  it('shows inline error when enable fails', async () => {
    pushEnable.mockResolvedValue({ ok: false, message: 'Permission refusée' });
    const fixture = await createFixture();
    const btn = fixture.nativeElement.querySelector(
      '.push-opt-in-dialog__action--primary',
    ) as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.push-opt-in-dialog__error');
    expect(error?.textContent).toContain('Permission refusée');
    expect(dialogClose).not.toHaveBeenCalled();
    expect(dialogDisableClose).toBe(false);
  });

  it('blocks backdrop close while enable is in progress', async () => {
    let resolveEnable: (value: { ok: boolean }) => void = () => {};
    pushEnable.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEnable = resolve;
        }),
    );
    const fixture = await createFixture();
    const btn = fixture.nativeElement.querySelector(
      '.push-opt-in-dialog__action--primary',
    ) as HTMLButtonElement;
    btn.click();
    await fixture.whenStable();
    expect(dialogDisableClose).toBe(true);
    resolveEnable({ ok: true });
    await fixture.whenStable();
    expect(dialogDisableClose).toBe(false);
  });

  it('Plus tard records dismiss timestamp', async () => {
    const fixture = await createFixture();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const laterBtn = Array.from(buttons as NodeListOf<HTMLButtonElement>).find((b) =>
      b.textContent?.includes('Plus tard'),
    );
    expect(laterBtn).toBeTruthy();
    laterBtn!.click();
    expect(storage[PUSH_OPT_IN_PROMPT_DISMISSED_KEY]).toBeDefined();
    expect(markStandalone).toHaveBeenCalled();
    expect(dialogClose).toHaveBeenCalledWith('dismissed');
  });

  it('openAccountSettings navigates to /compte/notifications', async () => {
    const fixture = await createFixture();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentInstance['openAccountSettings']();
    expect(navigate).toHaveBeenCalledWith(['/compte/notifications']);
    expect(dialogClose).toHaveBeenCalledWith('account');
  });
});
