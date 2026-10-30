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
import { MemberTroupeMenuService } from '../../core/navigation/member-troupe-menu.service'
import { MemberNav } from './member-nav'

describe('MemberNav', () => {
  let fixture: ComponentFixture<MemberNav>
  let pendingCount: ReturnType<typeof signal<number>>
  let inboxBadge: { pendingActionCount: ReturnType<typeof signal<number>>; refresh: ReturnType<typeof vi.fn> }
  let statsShortcut: {
    userSlug: ReturnType<typeof signal<string | null>>
    link: ReturnType<typeof signal<string>>
    queryParams: ReturnType<typeof signal<{ troupeId: string; seasonId: string } | null>>
    ready: ReturnType<typeof signal<boolean>>
    refresh: ReturnType<typeof vi.fn>
  }
  let troupeShortcut: {
    troupeSlug: ReturnType<typeof signal<string | null>>
    link: ReturnType<typeof signal<string>>
    refresh: ReturnType<typeof vi.fn>
    isTroupeTabActive: ReturnType<typeof vi.fn>
  }
  const menu = {
    troupeReady: signal(true), seasonReady: signal(true), statisticsReady: signal(true),
    troupeLabel: signal('La Malice'), seasonLabel: signal('2026–2027'),
    troupeLink: signal(['/troupes', 'malice']), seasonLink: signal(['/saison', 'malice', '2026-27']),
    error: signal<string | null>(null), refresh: vi.fn().mockResolvedValue(undefined),
  }
  let router: Router

  beforeEach(async () => {
    menu.troupeLabel.set('La Malice')
    menu.troupeLink.set(['/troupes', 'malice'])
    menu.seasonReady.set(true)
    menu.statisticsReady.set(true)
    menu.refresh.mockClear()
    pendingCount = signal(0)
    inboxBadge = {
      pendingActionCount: pendingCount,
      refresh: vi.fn().mockResolvedValue(undefined),
    }
    statsShortcut = {
      userSlug: signal('patrice'),
      link: signal('/membre/patrice'),
      queryParams: signal({ troupeId: 'malice', seasonId: 'season-malice' }),
      ready: signal(true),
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
          { path: 'saison/:troupeSlug/:seasonSlug', component: MemberNav },
          { path: 'troupes', component: MemberNav },
        ]),
        { provide: MemberTroupeMenuService, useValue: menu },
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

    const bottomTabs = fixture.nativeElement.querySelectorAll('.member-nav__bottom .mat-mdc-tab-link')
    expect(bottomTabs.length).toBe(4)
    expect(fixture.nativeElement.textContent).toContain('Ma troupe')
    expect(fixture.nativeElement.textContent).toContain('Mon agenda')
  })

  it('orders bottom tabs Accueil, Mon agenda, Mes stats, Ma troupe', async () => {
    await renderAt('/accueil')

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.member-nav__bottom .mat-mdc-tab-link',
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

  async function openMenu(selector = '.member-nav__bottom [aria-label="Ma troupe"]'): Promise<HTMLAnchorElement[]> {
    const trigger = fixture.nativeElement.querySelector(selector) as HTMLElement
    expect(trigger.getAttribute('href')).toBeNull()
    trigger.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return Array.from(document.querySelectorAll('a.mat-mdc-menu-item'))
  }

  it.each(['.member-nav__bottom', '.member-nav__rail'])('opens exactly three coherent destinations from %s', async (surface) => {
    await renderAt('/accueil')
    expect(menu.refresh).not.toHaveBeenCalled()
    const links = await openMenu(`${surface} [aria-label="Ma troupe"]`)
    expect(menu.refresh).toHaveBeenCalledOnce()
    expect(links.map((link) => link.textContent?.trim())).toEqual(['La Malice', '2026–2027', 'Statistiques'])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/troupes/malice', '/saison/malice/2026-27?view=agenda', '/saison/malice/2026-27?view=stats',
    ])
    expect(router.url).toBe('/accueil')
  })

  it.each(['.member-nav__bottom', '.member-nav__rail'])('restores keyboard focus after asynchronous menu resolution from %s', async (surface) => {
    let finishResolution!: () => void
    const resolution = new Promise<void>((resolve) => { finishResolution = resolve })
    menu.refresh.mockImplementationOnce(async () => {
      menu.troupeReady.set(false)
      menu.seasonReady.set(false)
      menu.statisticsReady.set(false)
      await resolution
      menu.troupeReady.set(true)
      menu.seasonReady.set(true)
      menu.statisticsReady.set(true)
    })
    await renderAt('/accueil')
    const trigger = fixture.nativeElement.querySelector(`${surface} button[aria-label="Ma troupe"]`) as HTMLButtonElement
    trigger.focus()
    expect(document.activeElement).toBe(trigger)
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }))
    // MatTabLink activates on keydown itself; the rail relies on the browser's native button activation.
    // jsdom does not synthesize that native click, so supply it only for the rail.
    if (surface === '.member-nav__rail') trigger.click()
    fixture.detectChanges()
    const panel = document.querySelector('.mat-mdc-menu-panel') as HTMLElement
    expect(panel).not.toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(Array.from(panel.querySelectorAll('[role="menuitem"]')).map((item) => item.getAttribute('aria-disabled'))).toEqual(['true', 'true', 'true'])

    finishResolution()
    await fixture.whenStable()
    fixture.detectChanges()
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }))
    const firstEntry = panel.querySelector('[role="menuitem"]') as HTMLElement
    expect(document.activeElement).toBe(firstEntry)
    firstEntry.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }))
    await fixture.whenStable()
    fixture.detectChanges()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('.mat-mdc-menu-panel')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it.each([
    ['/troupes/malice', 0],
    ['/saison/malice/2026-27?view=agenda', 1],
    ['/saison/malice/2026-27?view=stats', 2],
    ['/saison/malice/2026-27?view=history', -1],
    ['/troupes/malice?extra=1', -1],
  ] as const)('marks only the exact menu destination active at %s', async (url, activeIndex) => {
    await renderAt(url)
    const links = await openMenu()
    expect(links.map((link) => link.classList.contains('member-nav__menu-item--active'))).toEqual(
      [0, 1, 2].map((index) => index === activeIndex),
    )
    expect(links.map((link) => link.getAttribute('aria-current'))).toEqual(
      [0, 1, 2].map((index) => index === activeIndex ? 'page' : null),
    )
    expect(links.map((link) => link.textContent?.trim())).toEqual(['La Malice', '2026–2027', 'Statistiques'])
  })

  it('keeps the list reachable with exactly three empty-state entries', async () => {
    menu.troupeLabel.set('Mes troupes')
    menu.troupeLink.set(['/troupes'])
    menu.seasonReady.set(false)
    menu.statisticsReady.set(false)
    await renderAt('/accueil')
    const links = await openMenu()
    expect(links).toHaveLength(3)
    expect(links[0].getAttribute('href')).toBe('/troupes')
    expect(links.slice(1).map((link) => link.getAttribute('aria-disabled'))).toEqual(['true', 'true'])
    expect(links.slice(1).map((link) => link.getAttribute('href'))).toEqual([null, null])
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
      '.member-nav__rail .member-nav__link--active',
    )
    expect(activeRail?.textContent).toContain('Ma troupe')

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom?.textContent).toContain('Ma troupe')
  })

  it('renders the resolved stats scope on rail and bottom-nav links', async () => {
    await renderAt('/accueil')

    const statsLinks = Array.from(
      fixture.nativeElement.querySelectorAll('a[aria-label="Mes stats"]') as NodeListOf<HTMLAnchorElement>,
    )
    expect(statsLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/membre/patrice?troupeId=malice&seasonId=season-malice',
      '/membre/patrice?troupeId=malice&seasonId=season-malice',
    ])
  })

  it('keeps stats links inert while their scope is resolving', async () => {
    await renderAt('/accueil')
    statsShortcut.ready.set(false)
    fixture.detectChanges()

    const statsLinks = Array.from(
      fixture.nativeElement.querySelectorAll('a[aria-label="Mes stats"]') as NodeListOf<HTMLElement>,
    )
    expect(statsLinks).toHaveLength(2)
    expect(statsLinks.map((link) => link.getAttribute('aria-disabled'))).toEqual(['true', 'true'])
    expect(statsLinks.map((link) => link.getAttribute('href'))).toEqual([null, null])
  })

  it('marks stats tab active on own member glance route', async () => {
    pendingCount.set(0)
    await renderAt('/membre/patrice')

    const activeRail = fixture.nativeElement.querySelector(
      '.member-nav__rail .member-nav__link--active',
    )
    expect(activeRail?.textContent).toContain('Mes stats')

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom?.textContent).toContain('Mes stats')
  })

  it('does not mark stats active when viewing another member glance', async () => {
    pendingCount.set(0)
    await renderAt('/membre/other-member')

    expect(fixture.nativeElement.querySelector('.member-nav__rail .member-nav__link--active')).toBeNull()
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

  it('refreshes stats shortcut when route changes', async () => {
    await renderAt('/accueil')
    statsShortcut.refresh.mockClear()
    await router.navigateByUrl('/agenda')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(statsShortcut.refresh).toHaveBeenCalled()
  })
})
