import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import { MemberStatsShortcutService } from '../../core/navigation/member-stats-shortcut.service'
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

    await TestBed.configureTestingModule({
      imports: [MemberNav, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'accueil', component: MemberNav },
          { path: 'agenda', component: MemberNav },
          { path: 'compte', component: MemberNav },
          { path: 'membre/:userSlug', component: MemberNav },
        ]),
        { provide: MemberInboxBadgeService, useValue: inboxBadge },
        { provide: MemberStatsShortcutService, useValue: statsShortcut },
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
    expect(activeBottom?.textContent).toContain('Agenda')
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
    expect(activeRail?.textContent).toContain('Stats')

    const activeBottom = fixture.nativeElement.querySelector('.member-nav__bottom .mdc-tab--active')
    expect(activeBottom?.textContent).toContain('Stats')
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
})
