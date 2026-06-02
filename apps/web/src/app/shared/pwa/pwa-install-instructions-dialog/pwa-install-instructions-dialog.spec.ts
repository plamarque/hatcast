import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MEMBER_SHELL_MOBILE_MEDIA_QUERY } from '../../../layout/member-shell/member-shell-viewport';
import { getPwaBrowserInfo } from '../../../core/pwa/pwa-browser-info';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';
import {
  PwaInstallInstructionsDialog,
  type PwaInstallInstructionsDialogData,
} from './pwa-install-instructions-dialog';

const safariIosUa =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const chromeDesktopUa =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function configureDialog(
  data: PwaInstallInstructionsDialogData,
  pwaInstall: { promptInstall: ReturnType<typeof vi.fn> },
): Promise<ComponentFixture<PwaInstallInstructionsDialog>> {
  await TestBed.configureTestingModule({
    imports: [PwaInstallInstructionsDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: PwaInstallService, useValue: pwaInstall },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(PwaInstallInstructionsDialog);
  fixture.detectChanges();
  return fixture;
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === MEMBER_SHELL_MOBILE_MEDIA_QUERY ? matches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

describe('PwaInstallInstructionsDialog', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Safari iOS steps and title', async () => {
    stubMatchMedia(true);
    const fixture = await configureDialog(
      { browserInfo: getPwaBrowserInfo(safariIosUa) },
      { promptInstall: vi.fn() },
    );
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Safari sur iPhone/iPad');
    expect(text).toContain('écran d\'accueil');
    expect(text).toContain('HatCast');
    const logoImg = fixture.nativeElement.querySelector(
      '.pwa-install-dialog__alert--success img',
    ) as HTMLImageElement | null;
    expect(logoImg?.getAttribute('src')).toBe('/icons/logo-hatcast-2.svg');
  });

  it('reminder placement follows member shell viewport (mobile)', async () => {
    stubMatchMedia(true);
    const fixture = await configureDialog(
      { browserInfo: getPwaBrowserInfo(safariIosUa) },
      { promptInstall: vi.fn() },
    );
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('en haut à droite');
    expect(text).not.toContain('en bas à gauche');
  });

  it('reminder placement follows member shell viewport (desktop)', async () => {
    stubMatchMedia(false);
    const fixture = await configureDialog(
      { browserInfo: getPwaBrowserInfo(chromeDesktopUa) },
      { promptInstall: vi.fn() },
    );
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('en bas à gauche');
    expect(text).not.toContain('en haut à droite');
  });

  it('renders cast/save menu icon in Chrome desktop tip', async () => {
    stubMatchMedia(false);
    const fixture = await configureDialog(
      { browserInfo: getPwaBrowserInfo(chromeDesktopUa) },
      { promptInstall: vi.fn() },
    );
    const tipImg = fixture.nativeElement.querySelector(
      '.pwa-install-dialog__alert--tip img[src="/icons/chrome-cast-save-share-menu.png"]',
    );
    expect(tipImg).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Caster, enregistrer et partager');
  });

  it('hides retry when manual-only flow (no native prompt)', async () => {
    stubMatchMedia(false);
    const fixture = await configureDialog(
      {
        browserInfo: getPwaBrowserInfo(chromeDesktopUa),
        allowNativeRetry: false,
      },
      { promptInstall: vi.fn() },
    );
    expect(fixture.nativeElement.textContent).not.toContain('Réessayer l\'installation');
  });

  it('shows retry only when allowNativeRetry is true', async () => {
    stubMatchMedia(false);
    const fixture = await configureDialog(
      {
        browserInfo: getPwaBrowserInfo(chromeDesktopUa),
        allowNativeRetry: true,
      },
      { promptInstall: vi.fn() },
    );
    expect(fixture.nativeElement.textContent).toContain('Réessayer l\'installation');
  });

  it('retry calls promptInstall and closes dialog', async () => {
    stubMatchMedia(false);
    const promptInstall = vi.fn();
    const close = vi.fn();
    await TestBed.configureTestingModule({
      imports: [PwaInstallInstructionsDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            browserInfo: getPwaBrowserInfo(chromeDesktopUa),
            allowNativeRetry: true,
          } satisfies PwaInstallInstructionsDialogData,
        },
        { provide: PwaInstallService, useValue: { promptInstall } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PwaInstallInstructionsDialog);
    fixture.detectChanges();
    const retryBtn = Array.from(fixture.nativeElement.querySelectorAll('button')).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes('Réessayer'),
    ) as HTMLButtonElement;
    retryBtn.click();
    expect(promptInstall).toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
});
