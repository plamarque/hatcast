import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { ChunkRecoveryService } from './core/pwa/chunk-recovery.service';
import { App } from './app';
import { routes } from './app.routes';
import { PushOptInPromptService } from './core/push/push-opt-in-prompt.service';
import { PwaInstallService } from './core/pwa/pwa-install.service';
import { PwaUpdateService } from './core/pwa/pwa-update.service';
import { ChangelogDialogService } from './shared/changelog/changelog-dialog.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: ChunkRecoveryService, useValue: { active: signal(false) } },
        {
          provide: PwaInstallService,
          useValue: {
            showBanner: signal(false),
            promptInstall: vi.fn(),
            dismissBanner: vi.fn(),
          },
        },
        {
          provide: PwaUpdateService,
          useValue: {
            showBanner: signal(false),
            refreshing: signal(false),
            applyUpdate: vi.fn(),
            dismissBanner: vi.fn(),
          },
        },
        {
          provide: ChangelogDialogService,
          useValue: { maybeAutoOpenAfterPwaUpdate: vi.fn().mockResolvedValue(undefined) },
        },
        {
          provide: PushOptInPromptService,
          useValue: { maybePromptWhenIdle: vi.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('preserves banner components while hiding them during recovery', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('app-pwa-install-banner').parentElement;
    expect(wrapper.hidden).toBe(false);
    TestBed.inject(ChunkRecoveryService).active.set(true);
    fixture.detectChanges();
    expect(wrapper.hidden).toBe(true);
    expect(wrapper.querySelector('app-pwa-update-banner')).toBeTruthy();
  });

  it('should render a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
