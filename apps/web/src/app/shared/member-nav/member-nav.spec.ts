import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import { MemberStatsShortcutService } from '../../core/navigation/member-stats-shortcut.service'
import { LastVisitedTroupeShortcutService } from '../../core/navigation/last-visited-troupe-shortcut.service'
import { PwaInstallService } from '../../core/pwa/pwa-install.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { MemberNav } from './member-nav'

describe('MemberNav', () => {
  let fixture: ComponentFixture<MemberNav>
  let pendingCount: ReturnType<typeof signal<number>>
  let inboxBadge: { pendingActionCount: ReturnType<typeof signal<number>>; refresh: ReturnType<typeof vi.fn> }
  let statsShortcut: {
    userSlug: ReturnType<typeof signal<string | null>>
    link: ReturnType<typeof signal<string>>
    refresh: ReturnType<typeof vi.fn>
  }
  let troupeShortcut: {
    troupeSlug: ReturnType<typeof signal<string | null>>
    link: ReturnType<typeof signal<string>>
    refresh: ReturnType<typeof vi.fn>
    isTroupeTabActive: ReturnType<typeof vi.fn>
  }
  let router: Router

  beforeEach(async () => {
    pendingCount = signal(0)
    inboxBadge = {
      pendingActionCount: pendingCount,
      refresh: vi.fn().mockResolvedValue(undefined),
    }
    statsShortcut = {
      userSlug: signal('patrice'),
      link: signal('/membre/patrice'),
      refresh: vi.fn().mockResolvedValue(undefined),
    }
    troupeShortcut = {
      troupeSlug: signal('malice'),
      link: signal('/troupes/malice'),
      refresh: vi.fn(),
      isTroupeTabActive: vi.fn((path: string) => path.startsWith('/troupes/malice')),
    }

    await TestBed.configureTestingModule({
      imports: [MemberNav, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'accueil', component: MemberNav },
          { path: 'agenda', component: MemberNav },
          { path: 'compte', component: MemberNav },
          { path: 'membre/:userSlug', component: MemberNav },
          { path: 'troupes/:slug', component: MemberNav },
          { path: 'troupes', component: MemberNav },
        ]),
        { provide: MemberInboxBadgeService, useValue: inboxBadge },
        { provide: MemberStatsShortcutService, useValue: statsShortcut },
        { provide: LastVisitedTroupeShortcutService, useValue: troupeShortcut },
        {
          provide: AuthApiService,
          useValue: {
            sessionUser: signal({
              slug: 'patrice',
              email: 'patrice@example.com',
              displayName: 'Patrice',
              avatarUrl: null,
            }),
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: {
                user: {
                  slug: 'patrice',
                  email: 'patrice@example.com',
                  displayName: 'Patrice',
                  avatarUrl: null,
                },
              },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            currentUserDisplayLabel: (u: { displayName?: string | null; email?: string | null }) =>
              u?.displayName ?? u?.email ?? 'Compte',
          },
        },
        {
          provide: PwaInstallService,
          useValue: { isPwaInstalled: () => true, installFromUserMenu: vi.fn() },
        },
      ],
    }).compileComponents()

    router = TestBed.inject(Router)

  })

  afterEach(() => {
    TestBed.resetTestingModule()
  })

  async function renderAt(url: string): Promise<void> {
    await router.navigateByUrl(url)
    fixture = TestBed.createComponent(MemberNav)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  }

  async function waitForRailAccountTrigger(): Promise<void> {
    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(
        fixture.nativeElement.querySelector('.member-account-menu-trigger--rail'),
      ).not.toBeNull()
    })
  }

  it('shows badge on Accueil when count is 3', async () => {
    pendingCount.set(3)
    await renderAt('/accueil')

    const badges = fixture.nativeElement.querySelectorAll('.member-nav__badge')
    expect(badges.length).toBeGreaterThan(0)
    expect(fixture.nativeElement.textContent).toContain('3')
  })

  it('shows 9+ badge when count is 10', async () => {
    pendingCount.set(10)
    await renderAt('/accueil')

    expect(fixture.nativeElement.textContent).toContain('9+')
  })

  it('hides badge when count is 0', async () => {
    pendingCount.set(0)
    await renderAt('/accueil')

    expect(fixture.nativeElement.querySelector('.member-nav__badge')).toBeNull()
  })

  it('marks agenda tab active on /agenda', async () => {
    pendingCount.set(0)
    await renderAt('/agenda')

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom?.textContent).toContain('Mon agenda')
  })

  it('renders four bottom tabs including Ma troupe', async () => {
    await renderAt('/accueil')

    const bottomTabs = fixture.nativeElement.querySelectorAll('.member-nav__bottom a.mat-mdc-tab-link')
    expect(bottomTabs.length).toBe(4)
    expect(fixture.nativeElement.textContent).toContain('Ma troupe')
    expect(fixture.nativeElement.textContent).toContain('Mon agenda')
  })

  it('orders bottom tabs Accueil, Mon agenda, Mes stats, Ma troupe', async () => {
    await renderAt('/accueil')

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.member-nav__bottom a.mat-mdc-tab-link',
      ) as NodeListOf<HTMLElement>,
    ).map((tab) =>
      tab.querySelector('.member-nav__bottom-label')?.textContent?.trim(),
    )

    expect(labels).toEqual(['Accueil', 'Mon agenda', 'Mes stats', 'Ma troupe'])
  })

  it('orders rail tabs Accueil, Mon agenda, Mes stats, Ma troupe', async () => {
    await renderAt('/accueil')

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.member-nav__rail-link',
      ) as NodeListOf<HTMLElement>,
    ).map((link) =>
      link.querySelector('.member-nav__rail-label')?.textContent?.trim(),
    )

    expect(labels).toEqual(['Accueil', 'Mon agenda', 'Mes stats', 'Ma troupe'])
  })

  it('links Ma troupe tab to stored troupe hub', async () => {
    await renderAt('/accueil')

    const troupeLinks = fixture.nativeElement.querySelectorAll('a[href="/troupes/malice"]')
    expect(troupeLinks.length).toBeGreaterThan(0)
  })

  it('falls back Ma troupe link to troupes list when no slug stored', async () => {
    troupeShortcut.link = signal('/troupes')
    await renderAt('/accueil')

    const troupeLinks = fixture.nativeElement.querySelectorAll('a[href="/troupes"]')
    expect(troupeLinks.length).toBeGreaterThan(0)
  })

  it('does not mark Ma troupe tab active on troupes list', async () => {
    troupeShortcut.isTroupeTabActive = vi.fn((path: string) => path !== '/troupes' && path.startsWith('/troupes/'))
    await renderAt('/troupes')

    const maTroupeRail = Array.from(
      fixture.nativeElement.querySelectorAll('.member-nav__rail-link') as NodeListOf<HTMLElement>,
    ).find((link) => link.textContent?.includes('Ma troupe'))
    expect(maTroupeRail?.classList.contains('member-nav__link--active')).toBe(false)

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom).toBeNull()
  })

  it('marks Ma troupe tab active on troupe hub route', async () => {
    troupeShortcut.isTroupeTabActive = vi.fn((path: string) => path === '/troupes/malice')
    await renderAt('/troupes/malice')

    const activeRail = fixture.nativeElement.querySelector(
      '.member-nav__rail a.member-nav__link--active',
    )
    expect(activeRail?.textContent).toContain('Ma troupe')

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom?.textContent).toContain('Ma troupe')
  })

  it('links stats tab to member glance', async () => {
    await renderAt('/accueil')

    const statsLinks = fixture.nativeElement.querySelectorAll('a[href="/membre/patrice"]')
    expect(statsLinks.length).toBeGreaterThan(0)
  })

  it('marks stats tab active on own member glance route', async () => {
    pendingCount.set(0)
    await renderAt('/membre/patrice')

    const activeRail = fixture.nativeElement.querySelector(
      '.member-nav__rail a.member-nav__link--active',
    )
    expect(activeRail?.textContent).toContain('Mes stats')

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom?.textContent).toContain('Mes stats')
  })

  it('does not mark stats active when viewing another member glance', async () => {
    pendingCount.set(0)
    await renderAt('/membre/other-member')

    expect(fixture.nativeElement.querySelector('.member-nav__rail a.member-nav__link--active')).toBeNull()
  })

  it('uses 9+ in accueil aria-label when count exceeds 9', async () => {
    pendingCount.set(12)
    await renderAt('/accueil')

    const accueilLink = fixture.nativeElement.querySelector(
      '.member-nav__bottom a[aria-label*="9+"]',
    )
    expect(accueilLink).not.toBeNull()
  })

  it('renders rail account footer on shell routes', async () => {
    await renderAt('/agenda')
    expect(fixture.nativeElement.querySelector('.member-nav__account-footer')).not.toBeNull()
    await waitForRailAccountTrigger()
  })

  it('hides rail account footer on /compte', async () => {
    await renderAt('/compte')
    expect(fixture.nativeElement.querySelector('.member-account-menu-trigger--rail')).toBeNull()
  })

  it('refreshes troupe shortcut on init', async () => {
    await renderAt('/accueil')
    expect(troupeShortcut.refresh).toHaveBeenCalled()
  })

  it('refreshes troupe shortcut when route changes', async () => {
    await renderAt('/accueil')
    troupeShortcut.refresh.mockClear()
    await router.navigateByUrl('/agenda')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(troupeShortcut.refresh).toHaveBeenCalled()
  })
})
