import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { PwaInstallService } from '../../core/pwa/pwa-install.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { MeInboxApiService } from '../../core/inbox/me-inbox-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import { getLastMemberEntryPath } from '../../core/navigation/last-member-entry-path-storage'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { MemberShell } from './member-shell'

@Component({ standalone: true, template: '<p>child</p>' })
class ShellChildStub {}

describe('MemberShell', () => {
  let fixture: ComponentFixture<MemberShell>
  let router: Router
  let inboxApi: { getInbox: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    localStorage.clear()
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('max-width: 839px'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    inboxApi = {
      getInbox: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          actions: [],
          nextEvent: null,
          shortcuts: { lastSeasonSlug: null, seasonGlanceQuery: {} },
          noParticipation: false,
        },
      }),
    }

    await TestBed.configureTestingModule({
      imports: [MemberShell, NoopAnimationsModule],
      providers: [
        provideRouter([
          {
            path: '',
            component: MemberShell,
            children: [
              { path: 'accueil', component: ShellChildStub },
              { path: 'agenda', component: ShellChildStub },
              { path: 'membre/:userSlug', component: ShellChildStub },
              { path: 'saison/:slug', component: ShellChildStub },
              { path: 'saison/:slug/event/:eventSlug', component: ShellChildStub },
              { path: 'compte', component: ShellChildStub },
              { path: 'saison/:slug/admin/membres', component: ShellChildStub },
            ],
          },
        ]),
        MemberInboxBadgeService,
        { provide: MeInboxApiService, useValue: inboxApi },
        {
          provide: TroupeSeasonResolverService,
          useValue: { resolveSeasonSlug: vi.fn().mockResolvedValue({ kind: 'not-found' }) },
        },
        {
          provide: AuthApiService,
          useValue: {
            sessionUser: signal({
              slug: 'alice',
              email: 'alice@example.com',
              displayName: 'Alice',
              avatarUrl: null,
            }),
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: {
                user: {
                  slug: 'alice',
                  email: 'alice@example.com',
                  displayName: 'Alice',
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
    fixture = TestBed.createComponent(MemberShell)
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  async function renderAt(url: string): Promise<void> {
    await router.navigateByUrl(url)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  }

  it('shows member nav on shell routes', async () => {
    await renderAt('/agenda')
    expect(fixture.nativeElement.querySelector('app-member-nav')).not.toBeNull()
  })

  it('shows member nav on event detail inside shell', async () => {
    await renderAt('/saison/ligue-2026/event/ev-1')
    expect(fixture.nativeElement.querySelector('app-member-nav')).not.toBeNull()
  })

  it('shows member nav on compte', async () => {
    await renderAt('/compte')
    expect(fixture.nativeElement.querySelector('app-member-nav')).not.toBeNull()
  })

  it('shows shell account trigger on agenda but not on compte', async () => {
    await renderAt('/agenda')
    const shellTrigger = fixture.nativeElement.querySelector(
      '.member-shell__account-trigger app-member-account-menu-trigger',
    )
    expect(shellTrigger).not.toBeNull()

    await renderAt('/compte')
    expect(
      fixture.nativeElement.querySelector('.member-account-menu-trigger--shell-icon'),
    ).toBeNull()
  })

  it('shows a single shell mobile account trigger on agenda', async () => {
    await renderAt('/agenda')
    const shellTriggers = fixture.nativeElement.querySelectorAll(
      '.member-account-menu-trigger--shell-icon',
    )
    expect(shellTriggers.length).toBe(1)
  })

  it('shows shell mobile account trigger on event detail', async () => {
    await renderAt('/saison/ligue-2026/event/ev-1')
    expect(
      fixture.nativeElement.querySelector('.member-shell__account-trigger'),
    ).not.toBeNull()
  })

  it('shows member nav on season admin', async () => {
    await renderAt('/saison/ligue-2026/admin/membres')
    expect(fixture.nativeElement.querySelector('app-member-nav')).not.toBeNull()
  })

  it('loads inbox badge on init', async () => {
    await renderAt('/accueil')
    expect(inboxApi.getInbox).toHaveBeenCalled()
  })

  it('refreshes inbox badge when navigating back to accueil', async () => {
    await renderAt('/agenda')
    inboxApi.getInbox.mockClear()
    await renderAt('/accueil')
    expect(inboxApi.getInbox).toHaveBeenCalled()
  })

  it('persists last member entry path on shell NavigationEnd', async () => {
    fixture.detectChanges()
    await router.navigateByUrl('/agenda')
    fixture.detectChanges()
    await fixture.whenStable()

    expect(getLastMemberEntryPath()).toBe('/agenda')
  })

  it('does not persist another member stats path', async () => {
    await renderAt('/membre/bob')

    expect(getLastMemberEntryPath()).toBeNull()
  })

  it('does not persist season workspace on NavigationEnd (SeasonHome owns AC2)', async () => {
    fixture.detectChanges()
    await router.navigateByUrl('/saison/ligue-2026')
    fixture.detectChanges()
    await fixture.whenStable()

    expect(getLastMemberEntryPath()).toBeNull()
  })

  it('does not persist event detail path', async () => {
    fixture.detectChanges()
    await router.navigateByUrl('/saison/ligue-2026/event/ev-1')
    fixture.detectChanges()
    await fixture.whenStable()

    expect(getLastMemberEntryPath()).toBeNull()
  })

  it('persists own member stats path', async () => {
    fixture.detectChanges()
    await router.navigateByUrl('/membre/alice')
    fixture.detectChanges()
    await fixture.whenStable()

    expect(getLastMemberEntryPath()).toBe('/membre/alice')
  })
})
