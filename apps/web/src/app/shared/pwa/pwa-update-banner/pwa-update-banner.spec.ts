import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';

import { PwaUpdateService } from '../../../core/pwa/pwa-update.service';
import { PwaUpdateBannerComponent } from './pwa-update-banner';

describe('PwaUpdateBannerComponent', () => {
  const applyUpdate = vi.fn();
  const dismissBanner = vi.fn();
  const showBanner = signal(true);
  const refreshing = signal(false);

  async function createFixture(): Promise<ComponentFixture<PwaUpdateBannerComponent>> {
    await TestBed.configureTestingModule({
      imports: [PwaUpdateBannerComponent, NoopAnimationsModule],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: PwaUpdateService,
          useValue: {
            showBanner,
            refreshing,
            applyUpdate,
            dismissBanner,
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PwaUpdateBannerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders banner when showBanner is true', async () => {
    showBanner.set(true);
    refreshing.set(false);
    const fixture = await createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pwa-system-banner')).toBeTruthy();
    expect(el.textContent).toContain('Mettre à jour');
    expect(el.textContent).toContain('nouvelle version');
  });

  it('hides banner when showBanner is false', async () => {
    showBanner.set(false);
    const fixture = await createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pwa-system-banner')).toBeNull();
  });

  it('shows spinner when refreshing', async () => {
    showBanner.set(true);
    refreshing.set(true);
    const fixture = await createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mise à jour en cours');
    expect(el.querySelector('[data-testid="pwa-update-banner-apply"]')).toBeNull();
  });

  it('update button calls applyUpdate', async () => {
    showBanner.set(true);
    refreshing.set(false);
    applyUpdate.mockClear();
    const fixture = await createFixture();
    const updateBtn = fixture.nativeElement.querySelector(
      '[data-testid="pwa-update-banner-apply"]',
    ) as HTMLButtonElement;
    updateBtn.click();
    expect(applyUpdate).toHaveBeenCalled();
  });

  it('dismiss button calls dismissBanner', async () => {
    showBanner.set(true);
    refreshing.set(false);
    dismissBanner.mockClear();
    const fixture = await createFixture();
    const dismiss = fixture.nativeElement.querySelector(
      '[data-testid="pwa-update-banner-dismiss"]',
    ) as HTMLButtonElement;
    dismiss.click();
    expect(dismissBanner).toHaveBeenCalled();
  });
});
