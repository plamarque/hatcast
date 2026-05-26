import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';

import { PwaInstallService } from '../../../core/pwa/pwa-install.service';
import { PwaInstallBannerComponent } from './pwa-install-banner';

describe('PwaInstallBannerComponent', () => {
  const promptInstall = vi.fn();
  const dismissBanner = vi.fn();
  const showBanner = signal(true);

  async function createFixture(): Promise<ComponentFixture<PwaInstallBannerComponent>> {
    await TestBed.configureTestingModule({
      imports: [PwaInstallBannerComponent, NoopAnimationsModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: PwaInstallService,
          useValue: {
            showBanner,
            promptInstall,
            dismissBanner,
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PwaInstallBannerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders banner when showBanner is true', async () => {
    showBanner.set(true);
    const fixture = await createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pwa-install-banner')).toBeTruthy();
    expect(el.textContent).toContain("Installez l'app");
  });

  it('hides banner when showBanner is false', async () => {
    showBanner.set(false);
    const fixture = await createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pwa-install-banner')).toBeNull();
  });

  it('dismiss button calls dismissBanner', async () => {
    showBanner.set(true);
    dismissBanner.mockClear();
    const fixture = await createFixture();
    const dismiss = fixture.nativeElement.querySelector(
      '[data-testid="pwa-install-banner-dismiss"]',
    ) as HTMLButtonElement;
    dismiss.click();
    expect(dismissBanner).toHaveBeenCalled();
  });

  it('install button calls promptInstall', async () => {
    showBanner.set(true);
    promptInstall.mockClear();
    const fixture = await createFixture();
    const installBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((btn) => btn.textContent?.includes('Installer'))!;
    installBtn.click();
    expect(promptInstall).toHaveBeenCalled();
  });
});
