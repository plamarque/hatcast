import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { PwaInstallService } from '../../core/pwa/pwa-install.service';
import { UserAccountMenuItemsComponent } from './user-account-menu-items';

describe('UserAccountMenuItemsComponent', () => {
  async function setup(options?: {
    pwaInstalled?: boolean;
    showLogout?: boolean;
    routerUrl?: string;
  }) {
    await TestBed.configureTestingModule({
      imports: [UserAccountMenuItemsComponent],
      providers: [
        provideRouter([]),
        {
          provide: PwaInstallService,
          useValue: {
            isPwaInstalled: () => options?.pwaInstalled ?? true,
            installFromUserMenu: vi.fn(),
          },
        },
        {
          provide: AuthApiService,
          useValue: {
            logout: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compileComponents();

    if (options?.routerUrl) {
      const router = TestBed.inject(Router);
      Object.defineProperty(router, 'url', {
        value: options.routerUrl,
        configurable: true,
      });
    }

    const fixture = TestBed.createComponent(UserAccountMenuItemsComponent);
    if (options?.showLogout === false) {
      fixture.componentRef.setInput('showLogout', false);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('renders Mon compte and logout by default', async () => {
    const fixture = await setup();
    expect(fixture.nativeElement.textContent).toContain('Mon compte');
    expect(fixture.nativeElement.textContent).toContain('Se déconnecter');
    expect(fixture.nativeElement.textContent).not.toContain("Ma saison en un clin d'œil");
    expect(fixture.nativeElement.textContent).not.toContain('Mon agenda');
  });

  it('hides logout when showLogout is false', async () => {
    const fixture = await setup({ showLogout: false });
    expect(fixture.nativeElement.textContent).not.toContain('Se déconnecter');
  });

  it('hides Mon compte when already on /compte', async () => {
    const fixture = await setup({ routerUrl: '/compte' });
    expect(fixture.nativeElement.textContent).not.toContain('Mon compte');
    expect(fixture.nativeElement.textContent).toContain('Se déconnecter');
  });

  it('hides Mon compte when on a child tab route', async () => {
    const fixture = await setup({ routerUrl: '/compte/preferences' });
    expect(fixture.nativeElement.textContent).not.toContain('Mon compte');
    expect(fixture.nativeElement.textContent).toContain('Se déconnecter');
  });

  it('shows Installer l\'app when PWA is not installed', async () => {
    const fixture = await setup({ pwaInstalled: false });
    expect(fixture.nativeElement.textContent).toContain("Installer l'app");
  });

  it('hides Installer l\'app when PWA is installed', async () => {
    const fixture = await setup({ pwaInstalled: true });
    expect(fixture.nativeElement.textContent).not.toContain("Installer l'app");
  });

  it('calls installFromUserMenu when install item is clicked', async () => {
    const installFromUserMenu = vi.fn();
    await TestBed.configureTestingModule({
      imports: [UserAccountMenuItemsComponent],
      providers: [
        provideRouter([]),
        {
          provide: PwaInstallService,
          useValue: {
            isPwaInstalled: () => false,
            installFromUserMenu,
          },
        },
        {
          provide: AuthApiService,
          useValue: { logout: vi.fn().mockResolvedValue(true) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserAccountMenuItemsComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const installBtn = Array.from(buttons).find((btn) =>
      (btn as HTMLButtonElement).textContent?.includes("Installer l'app"),
    ) as HTMLButtonElement | undefined;
    expect(installBtn).toBeTruthy();
    installBtn!.click();
    expect(installFromUserMenu).toHaveBeenCalled();
  });
});
