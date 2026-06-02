import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi } from 'vitest';

import { PwaSystemBannerComponent } from './pwa-system-banner';

describe('PwaSystemBannerComponent', () => {
  async function createFixture(
    inputs: Partial<{
      stackLayer: 'install' | 'update';
      ariaLabel: string;
      title: string;
      subtitle: string;
      primaryLabel: string;
      loading: boolean;
      showDismiss: boolean;
    }> = {},
  ): Promise<ComponentFixture<PwaSystemBannerComponent>> {
    await TestBed.configureTestingModule({
      imports: [PwaSystemBannerComponent, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(PwaSystemBannerComponent);
    fixture.componentRef.setInput('stackLayer', inputs.stackLayer ?? 'install');
    fixture.componentRef.setInput('ariaLabel', inputs.ariaLabel ?? 'Test banner');
    if (inputs.title !== undefined) {
      fixture.componentRef.setInput('title', inputs.title);
    }
    if (inputs.subtitle !== undefined) {
      fixture.componentRef.setInput('subtitle', inputs.subtitle);
    }
    if (inputs.primaryLabel !== undefined) {
      fixture.componentRef.setInput('primaryLabel', inputs.primaryLabel);
    }
    if (inputs.loading !== undefined) {
      fixture.componentRef.setInput('loading', inputs.loading);
    }
    if (inputs.showDismiss !== undefined) {
      fixture.componentRef.setInput('showDismiss', inputs.showDismiss);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('renders install variant with title, subtitle and primary action', async () => {
    const fixture = await createFixture({
      stackLayer: 'install',
      title: 'HatCast',
      subtitle: "Installez l'app",
      primaryLabel: 'Installer',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pwa-system-banner--install')).toBeTruthy();
    expect(el.textContent).toContain('HatCast');
    expect(el.textContent).toContain("Installez l'app");
    expect(el.textContent).toContain('Installer');
  });

  it('renders update variant with icon and primary action only', async () => {
    const fixture = await createFixture({
      stackLayer: 'update',
      primaryLabel: 'Mettre à jour',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pwa-system-banner--update')).toBeTruthy();
    expect(el.querySelector('.pwa-system-banner__body--spacer')).toBeTruthy();
    expect(el.textContent).toContain('Mettre à jour');
  });

  it('shows spinner and hides dismiss while loading', async () => {
    const fixture = await createFixture({
      stackLayer: 'update',
      primaryLabel: 'Mettre à jour',
      loading: true,
      showDismiss: false,
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mise à jour');
    expect(el.querySelector('mat-spinner')).toBeTruthy();
    expect(el.querySelector('.pwa-system-banner__primary')).toBeNull();
  });

  it('emits primaryClick and dismissClick', async () => {
    const fixture = await createFixture({
      primaryLabel: 'Installer',
    });
    const primarySpy = vi.fn();
    const dismissSpy = vi.fn();
    fixture.componentInstance.primaryClick.subscribe(primarySpy);
    fixture.componentInstance.dismissClick.subscribe(dismissSpy);

    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('.pwa-system-banner__primary') as HTMLButtonElement).click();
    (el.querySelector('button[mat-icon-button]') as HTMLButtonElement).click();

    expect(primarySpy).toHaveBeenCalledOnce();
    expect(dismissSpy).toHaveBeenCalledOnce();
  });
});
