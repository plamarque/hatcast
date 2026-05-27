import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { PwaInstallService } from '../../core/pwa/pwa-install.service';
import { UserAccountMenuItemsComponent } from './user-account-menu-items';

describe('UserAccountMenuItemsComponent', () => {
  it('renders season glance link when userSlug is provided', async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccountMenuItemsComponent],
      providers: [
        provideRouter([]),
        {
          provide: PwaInstallService,
          useValue: {
            isPwaInstalled: () => true,
            installFromUserMenu: vi.fn(),
          },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true, data: { user: {} } }),
            logout: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserAccountMenuItemsComponent);
    fixture.componentRef.setInput('userSlug', 'angie-dupont');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[href="/membre/angie-dupont"]',
    ) as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("Ma saison en un clin d'œil");
  });

  it('hides season glance link when showSeasonGlanceLink is false', async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccountMenuItemsComponent],
      providers: [
        provideRouter([]),
        {
          provide: PwaInstallService,
          useValue: {
            isPwaInstalled: () => true,
            installFromUserMenu: vi.fn(),
          },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: true, data: { user: {} } }),
            logout: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserAccountMenuItemsComponent);
    fixture.componentRef.setInput('userSlug', 'angie-dupont');
    fixture.componentRef.setInput('showSeasonGlanceLink', false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('a[href="/membre/angie-dupont"]'),
    ).toBeNull();
  });
});
