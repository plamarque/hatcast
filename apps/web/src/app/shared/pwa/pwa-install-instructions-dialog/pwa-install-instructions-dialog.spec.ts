import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';

import { getPwaBrowserInfo } from '../../../core/pwa/pwa-browser-info';
import { PwaInstallService } from '../../../core/pwa/pwa-install.service';
import {
  PwaInstallInstructionsDialog,
  type PwaInstallInstructionsDialogData,
} from './pwa-install-instructions-dialog';

const safariIosUa =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

async function configureDialog(
  data: PwaInstallInstructionsDialogData,
): Promise<ComponentFixture<PwaInstallInstructionsDialog>> {
  await TestBed.configureTestingModule({
    imports: [PwaInstallInstructionsDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: MAT_DIALOG_DATA, useValue: data },
      {
        provide: PwaInstallService,
        useValue: { promptInstall: vi.fn() },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(PwaInstallInstructionsDialog);
  fixture.detectChanges();
  return fixture;
}

describe('PwaInstallInstructionsDialog', () => {
  it('renders Safari iOS steps and title', async () => {
    const fixture = await configureDialog({
      browserInfo: getPwaBrowserInfo(safariIosUa),
    });
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Safari sur iPhone/iPad');
    expect(text).toContain('écran d\'accueil');
    expect(text).toContain('HatCast');
    const logoImg = fixture.nativeElement.querySelector(
      '.pwa-install-dialog__alert--success img',
    ) as HTMLImageElement | null;
    expect(logoImg?.getAttribute('src')).toBe('/icons/logo-hatcast-2.svg');
  });

  it('reminder mentions user menu Installer l\'app without stale copy', async () => {
    const fixture = await configureDialog({
      browserInfo: getPwaBrowserInfo(safariIosUa),
    });
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('menu utilisateur');
    expect(text).toContain("Installer l'app");
    expect(text).not.toContain('lorsque cette option sera disponible');
  });

  it('shows retry button for Chrome desktop', async () => {
    const fixture = await configureDialog({
      browserInfo: getPwaBrowserInfo(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ),
    });
    expect(fixture.nativeElement.textContent).toContain('Réessayer l\'installation');
  });

  it('retry calls promptInstall and closes dialog', async () => {
    const promptInstall = vi.fn();
    const close = vi.fn();
    await TestBed.configureTestingModule({
      imports: [PwaInstallInstructionsDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            browserInfo: getPwaBrowserInfo(
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ),
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
