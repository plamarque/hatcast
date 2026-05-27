import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { PwaInstallService } from '../../core/pwa/pwa-install.service';
import { UserAccountMenuItemsComponent } from './user-account-menu-items';

describe('UserAccountMenuItemsComponent', () => {
  async function setup(options?: { pwaInstalled?: boolean; showLogout?: boolean }) {
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
});
