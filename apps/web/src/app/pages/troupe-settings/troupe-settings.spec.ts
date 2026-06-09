import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSettings } from './troupe-settings'

describe('TroupeSettings', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'test-troupe' }))
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({ tab: 'categories' }))

  async function setup(
    role: 'TROUPE_ADMIN' | 'MEMBER' = 'TROUPE_ADMIN',
    platformAdmin = false,
  ) {
    const router = { navigate: vi.fn().mockResolvedValue(true) }
    const snack = { open: vi.fn() }
    const troupe = {
      id: 't1',
      name: 'Test Troupe',
      slug: 'test-troupe',
      logoUrl: null,
      isDemo: false,
      joinPolicy: 'INVITE_ONLY' as const,
      membership: {
        id: 'm1',
        displayName: 'Admin',
        status: 'ACTIVE' as const,
        baselineRole: role,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      activeMemberCount: 1,
      upcomingEventCount: 0,
    }

    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [TroupeSettings, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
            queryParamMap: queryParamMap$.asObservable(),
            snapshot: { routeConfig: { path: 'troupes/:slug/admin/parametres' } },
          },
        },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { user: { email: 'a@example.com', displayName: 'Admin' }, platformAdmin },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            resolveTroupeBySlug: vi.fn().mockResolvedValue(troupe),
            selectTroupe: vi.fn(),
          },
        },
      ],
    })
      .overrideProvider(MatSnackBar, { useValue: snack })
      .overrideProvider(Router, { useValue: router })
      .overrideProvider(TroupeContextService, {
        useValue: {
          load: vi.fn().mockResolvedValue(true),
          resolveTroupeBySlug: vi.fn().mockResolvedValue(troupe),
          selectTroupe: vi.fn(),
        },
      })
      .overrideProvider(AuthApiService, {
        useValue: {
          ensureHatcastSession: vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            data: { user: { email: 'a@example.com', displayName: 'Admin' }, platformAdmin },
          }),
        },
      })
      .compileComponents()

    const fixture = TestBed.createComponent(TroupeSettings)
    fixture.detectChanges()
    await vi.waitFor(
      () => {
        const instance = fixture.componentInstance as unknown as { loading: () => boolean }
        expect(instance.loading()).toBe(false)
      },
      { timeout: 3000 },
    )
    return { fixture, router, snack, troupe }
  }

  it('renders breadcrumb leaf Paramètres for troupe admin', async () => {
    const { fixture } = await setup()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Paramètres')
    })
    expect(fixture.nativeElement.textContent).toContain('Paramètres troupe')
    expect(fixture.nativeElement.textContent).toContain('Catégories')
  })

  it('redirects non-admin to troupe hub with snackbar', async () => {
    const { fixture, router, snack } = await setup('MEMBER')
    await fixture.whenStable()
    const instance = fixture.componentInstance as unknown as {
      canManageTroupe: () => boolean
      troupeId: () => string | null
    }
    expect(instance.troupeId()).toBe('t1')
    expect(instance.canManageTroupe()).toBe(false)
    expect(fixture.nativeElement.textContent).not.toContain('Ajouter une catégorie')
    expect(snack.open).toHaveBeenCalledWith('Accès non autorisé', 'OK', { duration: 5000 })
    expect(router.navigate).toHaveBeenCalledWith(['/', 'troupes', 'test-troupe'])
  })
})
