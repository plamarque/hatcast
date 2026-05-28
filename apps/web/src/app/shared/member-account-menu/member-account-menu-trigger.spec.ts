import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { PwaInstallService } from '../../core/pwa/pwa-install.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { MemberAccountMenuTrigger } from './member-account-menu-trigger'

describe('MemberAccountMenuTrigger', () => {
  let fixture: ComponentFixture<MemberAccountMenuTrigger>
  let router: Router
  let ensureSession: ReturnType<typeof vi.fn>
  const sessionUser = signal<{
    slug: string
    email: string
    displayName: string
    avatarUrl: null
  } | null>(null)

  beforeEach(async () => {
    sessionUser.set(null)
    ensureSession = vi.fn().mockImplementation(async () => {
      const user = {
        slug: 'alice',
        email: 'alice@example.com',
        displayName: 'Alice',
        avatarUrl: null,
      }
      sessionUser.set(user)
      return { ok: true, status: 200, data: { user } }
    })

    await TestBed.configureTestingModule({
      imports: [MemberAccountMenuTrigger, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'agenda', component: MemberAccountMenuTrigger },
          { path: 'compte', component: MemberAccountMenuTrigger },
        ]),
        {
          provide: AuthApiService,
          useValue: { ensureHatcastSession: ensureSession, sessionUser },
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
          useValue: {
            isPwaInstalled: () => true,
            installFromUserMenu: vi.fn(),
          },
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
    fixture = TestBed.createComponent(MemberAccountMenuTrigger)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    if (url !== '/compte') {
      await vi.waitFor(() => {
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelector('.member-account-menu-trigger')).not.toBeNull()
      })
    }
  }

  it('shows trigger on shell route after session loads', async () => {
    await renderAt('/agenda')
    expect(ensureSession).toHaveBeenCalled()
    expect(fixture.nativeElement.querySelector('.member-account-menu-trigger')).not.toBeNull()
  })

  it('hides trigger on /compte', async () => {
    await renderAt('/compte')
    expect(fixture.nativeElement.querySelector('.member-account-menu-trigger')).toBeNull()
  })

  it('hides Mon compte menu item when on /compte', async () => {
    await renderAt('/compte')
    expect(fixture.nativeElement.textContent).not.toContain('Mon compte')
  })

  it('renders rail variant with avatar and Compte label (not display name)', async () => {
    await router.navigateByUrl('/agenda')
    fixture = TestBed.createComponent(MemberAccountMenuTrigger)
    fixture.componentRef.setInput('variant', 'rail-footer')
    fixture.detectChanges()
    await fixture.whenStable()
    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('.member-account-menu-trigger--rail')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelector('app-user-avatar')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Compte')
    expect(fixture.nativeElement.textContent).not.toContain('Alice')
  })

  it('renders shell icon variant with avatar only', async () => {
    await router.navigateByUrl('/agenda')
    fixture = TestBed.createComponent(MemberAccountMenuTrigger)
    fixture.componentRef.setInput('variant', 'shell-mobile-icon')
    fixture.detectChanges()
    await fixture.whenStable()
    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('.member-account-menu-trigger--shell-icon')).not.toBeNull()
    })
    expect(fixture.nativeElement.textContent).not.toContain('Alice')
  })

  it('stays visible when session user is already cached before init', async () => {
    sessionUser.set({
      slug: 'alice',
      email: 'alice@example.com',
      displayName: 'Alice',
      avatarUrl: null,
    })
    ensureSession.mockClear()
    await router.navigateByUrl('/agenda')
    fixture = TestBed.createComponent(MemberAccountMenuTrigger)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.member-account-menu-trigger')).not.toBeNull()
    expect(ensureSession).toHaveBeenCalled()
  })

  it('stays hidden when session has no user', async () => {
    sessionUser.set(null)
    ensureSession.mockResolvedValue({ ok: false, status: 401, data: null })
    await router.navigateByUrl('/agenda')
    fixture = TestBed.createComponent(MemberAccountMenuTrigger)
    fixture.detectChanges()
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('.member-account-menu-trigger')).toBeNull()
  })
})
