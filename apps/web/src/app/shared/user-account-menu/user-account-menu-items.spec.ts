import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';
import { PwaInstallService } from '../../core/pwa/pwa-install.service';
import { UserAccountMenuItemsComponent } from './user-account-menu-items';

describe('UserAccountMenuItemsComponent', () => {
  const sessionUser = signal<{ id: string } | null>(null);
  const sessionIdentityVersion = signal(0);
  afterEach(() => { sessionUser.set(null); sessionIdentityVersion.set(0); vi.unstubAllGlobals(); });
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
            sessionUser, sessionIdentityVersion,
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
    fixture.componentInstance.refreshPreviewCapability();
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
          useValue: { logout: vi.fn().mockResolvedValue(true), sessionUser, sessionIdentityVersion },
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

  it('shows the authorized preview link with router query parameters', async () => {
    sessionUser.set({ id: 'one' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ productionPreview: true }) }));
    const fixture = await setup();
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Avent-première'); });
    expect(fixture.nativeElement.querySelector('a[href="/avent?preview=1"]')).not.toBeNull();
  });

  it.each([
    { ok: true, json: async () => ({ productionPreview: false }) },
    { ok: false },
    new Error('offline'),
  ])('hides the entry when authorization is denied or unavailable', async (result) => {
    sessionUser.set({ id: 'one' });
    vi.stubGlobal('fetch', result instanceof Error ? vi.fn().mockRejectedValue(result) : vi.fn().mockResolvedValue(result));
    const fixture = await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
  });

  it('clears authorization on account changes and ignores late responses including a return to the same identity', async () => {
    let resolveFirst!: (value: unknown) => void;
    sessionUser.set({ id: 'one' });
    vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValue({ ok: true, json: async () => ({ productionPreview: false }) }));
    const fixture = await setup();
    sessionIdentityVersion.update((n) => n + 1); sessionUser.set({ id: 'two' });
    sessionIdentityVersion.update((n) => n + 1); sessionUser.set({ id: 'one' });
    resolveFirst({ ok: true, json: async () => ({ productionPreview: true }) });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
    sessionIdentityVersion.update((n) => n + 1); sessionUser.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
  });

  it('immediately hides a granted capability on logout or account switch', async () => {
    sessionUser.set({ id: 'one' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ productionPreview: true }) }));
    const fixture = await setup();
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Avent-première'); });
    sessionIdentityVersion.update((n) => n + 1); sessionUser.set({ id: 'two' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
    sessionIdentityVersion.update((n) => n + 1); sessionUser.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
  });

  it('revalidates on every opening and rejects an older overlapping success', async () => {
    let resolveFirst!: (value: unknown) => void;
    sessionUser.set({ id: 'one' });
    vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValue({ ok: true, json: async () => ({ productionPreview: false }) }));
    const fixture = await setup();
    fixture.componentInstance.refreshPreviewCapability();
    resolveFirst({ ok: true, json: async () => ({ productionPreview: true }) });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects a delayed capability after real auth changes account', async () => {
    let resolveCapability!: (value: unknown) => void;
    let identity = 'one';
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url === '/v1/advent/preview-capability') return new Promise((resolve) => { resolveCapability = resolve; });
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ user: { id: identity, slug: identity, email: null, displayName: null } }) });
    }));
    await TestBed.configureTestingModule({ imports: [UserAccountMenuItemsComponent], providers: [
      provideRouter([]), AuthApiService,
      { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => null } },
      { provide: PwaInstallService, useValue: { isPwaInstalled: () => true } },
    ] }).compileComponents();
    const auth = TestBed.inject(AuthApiService);
    await auth.signInWithGoogleIdToken('first');
    const fixture = TestBed.createComponent(UserAccountMenuItemsComponent);
    fixture.detectChanges(); fixture.componentInstance.refreshPreviewCapability();
    identity = 'two'; await auth.signInWithGoogleIdToken('second');
    resolveCapability({ ok: true, json: async () => ({ productionPreview: true }) });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Avent-première');
  });
});
