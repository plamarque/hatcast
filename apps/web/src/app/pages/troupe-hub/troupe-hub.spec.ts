import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { getLastVisitedTroupeSlug } from '../../core/navigation/last-visited-troupe-storage'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeHub } from './troupe-hub'
import { TroupeEditDialog } from './troupe-edit-dialog'

describe('TroupeHub', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'les-improbots' }))

  const seasons = [
    {
      id: 's1',
      troupeId: 't1',
      slug: '2025-26',
      title: 'Saison active',
      description: null,
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      archived: false,
      active: true,
      eventCount: 3,
      participantCount: 12,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 's2',
      troupeId: 't1',
      slug: '2023-24',
      title: 'Ancienne',
      description: null,
      startDate: null,
      endDate: null,
      archived: true,
      active: false,
      eventCount: 1,
      participantCount: 5,
      createdAt: '',
      updatedAt: '',
    },
  ]

  const secondTroupe = {
    id: 't2',
    name: 'Autre Troupe',
    slug: 'autre-troupe',
    membership: {
      id: 'm2',
      displayName: 'Membre',
      status: 'ACTIVE' as const,
      baselineRole: 'MEMBER' as const,
      createdAt: '',
      updatedAt: '',
    },
    activeMemberCount: 2,
    upcomingEventCount: 0,
  }

  async function setup(
    baselineRole: 'MEMBER' | 'TROUPE_ADMIN' = 'TROUPE_ADMIN',
    platformAdmin = false,
    options: { patchTroupeProfile?: ReturnType<typeof vi.fn> } = {},
  ) {
    const dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of('new-saison') }),
    }
    const patchTroupeProfile = options.patchTroupeProfile ?? vi.fn()
    const troupes = [
      {
        id: 't1',
        name: 'Les Improbots',
        slug: 'les-improbots',
        membership: {
          id: 'm1',
          displayName: 'Admin',
          status: 'ACTIVE' as const,
          baselineRole,
          createdAt: '',
          updatedAt: '',
        },
        activeMemberCount: 4,
        upcomingEventCount: 2,
      },
    ]

    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'troupes/:slug', component: TroupeHub },
          { path: 'saison/:slug', component: TroupeHub },
        ]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: {
                user: { id: 'u1', email: 'a@b.c', displayName: 'Test' },
                platformAdmin,
              },
            }),
            logout: vi.fn(),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            patchTroupeName: patchTroupeProfile,
            patchTroupeProfile,
            currentUserDisplayLabel: (u: { displayName: string }) => u.displayName,
            activeTroupes: () => troupes,
            resolveTroupeBySlug: vi.fn().mockImplementation(async (slug: string) =>
              troupes.find((t) => t.slug === slug) ?? null,
            ),
          },
        },
        {
          provide: SeasonApiService,
          useValue: {
            listSeasons: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { content: seasons, page: 0, size: 50, totalElements: 2, totalPages: 1 },
            }),
          },
        },
        { provide: MatDialog, useValue: dialog },
        {
          provide: TroupeApiService,
          useValue: {
            updateTroupe: vi.fn(),
            updateMyMembership: vi.fn(),
            listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          },
        },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: dialog })

    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__title')).not.toBeNull()
    })
    return { fixture, dialog, patchTroupeProfile }
  }

  it('remembers last visited troupe slug after hub loads', async () => {
    await setup()
    expect(getLastVisitedTroupeSlug()).toBe('les-improbots')
  })

  it('shows breadcrumb Troupes › troupe name', async () => {
    const { fixture } = await setup()
    const breadcrumb = fixture.nativeElement.querySelector('.troupe-hub__breadcrumb')
    expect(breadcrumb?.textContent).toContain('Troupes')
    expect(breadcrumb?.textContent).toContain('Les Improbots')
    expect(fixture.nativeElement.querySelector('.troupe-hub__breadcrumb-logo mat-icon')).toBeTruthy()
    const link = breadcrumb?.querySelector('a') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/troupes')
  })

  it('lists active seasons with clickable card surface', async () => {
    const { fixture } = await setup()
    const cards = fixture.nativeElement.querySelectorAll('app-season-card')
    expect(cards.length).toBe(1)
    expect(cards[0].textContent).toContain('Saison active')
    expect(cards[0].textContent).toContain('3 spectacles')
    const openLink = cards[0].querySelector('a.season-card__surface') as HTMLAnchorElement
    expect(openLink.getAttribute('href')).toBe('/saison/2025-26')
  })

  it('reveals archived seasons when toggled', async () => {
    const { fixture } = await setup()
    const archivedBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Afficher les saisons archivées'))!
    archivedBtn.click()
    fixture.detectChanges()
    const cards = fixture.nativeElement.querySelectorAll('app-season-card')
    expect(cards.length).toBe(2)
  })

  it('shows admin gear for TROUPE_ADMIN without section Nouvelle saison button', async () => {
    const { fixture } = await setup('TROUPE_ADMIN')
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Préférences dans cette troupe')
    const sectionHeaderButton = Array.from(
      fixture.nativeElement.querySelectorAll('.troupe-hub__seasons button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Nouvelle saison'))
    expect(sectionHeaderButton).toBeUndefined()
  })

  it('hides admin gear for non-admin members', async () => {
    const { fixture } = await setup('MEMBER')
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeNull()
  })

  it('does not render preferences trigger or discovery footer', async () => {
    const { fixture } = await setup('MEMBER')
    expect(fixture.nativeElement.textContent).not.toContain('Préférences dans cette troupe')
    expect(fixture.nativeElement.querySelector('.troupe-hub__footer')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Explorer d’autres troupes')
  })

  it('does not navigate when create dialog is cancelled', async () => {
    const { fixture, dialog } = await setup('TROUPE_ADMIN')
    dialog.open.mockReturnValueOnce({ afterClosed: () => of('') })
    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    ;(fixture.componentInstance as unknown as { openCreateSeason(): void }).openCreateSeason()
    await vi.waitFor(() => {
      expect(dialog.open).toHaveBeenCalled()
    })
    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it('navigates to new season after create dialog returns slug', async () => {
    const { fixture, dialog } = await setup('TROUPE_ADMIN')
    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    ;(fixture.componentInstance as unknown as { openCreateSeason(): void }).openCreateSeason()
    expect(dialog.open).toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'new-saison'])
    })
  })

  it('opens edit dialog from admin menu action', async () => {
    const { fixture, dialog } = await setup('TROUPE_ADMIN')
    dialog.open.mockReturnValueOnce({
      afterClosed: () => of({ id: 't1', name: 'Nom modifié', slug: 'les-improbots' }),
    })
    ;(fixture.componentInstance as unknown as { openEditTroupe(): void }).openEditTroupe()
    expect(dialog.open).toHaveBeenCalledWith(
      TroupeEditDialog,
      expect.objectContaining({
        data: expect.objectContaining({ troupe: expect.objectContaining({ slug: 'les-improbots' }) }),
      }),
    )
  })

  it('updates troupe hero name after edit dialog closes', async () => {
    const patchTroupeProfile = vi.fn()
    const { fixture, dialog } = await setup('TROUPE_ADMIN', false, { patchTroupeProfile })
    dialog.open.mockReturnValueOnce({
      afterClosed: () =>
        of({
          id: 't1',
          name: 'Nom modifié',
          slug: 'les-improbots',
          logoUrl: '/v1/troupes/t1/logo?v=2',
          description: 'Nouvelle description',
          isDemo: false,
          joinPolicy: 'OPEN',
          membership: {
            id: 'm1',
            displayName: 'Admin',
            status: 'ACTIVE',
            baselineRole: 'TROUPE_ADMIN',
            createdAt: '',
            updatedAt: '',
          },
          activeMemberCount: 4,
          upcomingEventCount: 2,
        }),
    })
    ;(fixture.componentInstance as unknown as { openEditTroupe(): void }).openEditTroupe()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__title')?.textContent).toContain(
        'Nom modifié',
      )
    })
    expect(patchTroupeProfile).toHaveBeenCalledWith('t1', {
      name: 'Nom modifié',
      logoUrl: '/v1/troupes/t1/logo?v=2',
      description: 'Nouvelle description',
    })
  })

  it('affiche le logo et la description dans le hero', async () => {
    const troupeWithIdentity = {
      id: 't1',
      name: 'Les Improbots',
      slug: 'les-improbots',
      logoUrl: '/v1/troupes/t1/logo?v=1',
      description: 'Troupe d’impro à Malice.',
      membership: {
        id: 'm1',
        displayName: 'Admin',
        status: 'ACTIVE' as const,
        baselineRole: 'TROUPE_ADMIN' as const,
        createdAt: '',
        updatedAt: '',
      },
      activeMemberCount: 4,
      upcomingEventCount: 2,
      isDemo: false,
      joinPolicy: 'OPEN' as const,
    }
    const dialog = { open: vi.fn() }
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'troupes/:slug', component: TroupeHub }]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' }, platformAdmin: false },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            patchTroupeProfile: vi.fn(),
            patchTroupeName: vi.fn(),
            resolveTroupeBySlug: vi.fn().mockResolvedValue(troupeWithIdentity),
          },
        },
        {
          provide: SeasonApiService,
          useValue: {
            listSeasons: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { content: seasons, page: 0, size: 50, totalElements: 0, totalPages: 0 },
            }),
          },
        },
        { provide: MatDialog, useValue: dialog },
        {
          provide: TroupeApiService,
          useValue: { listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, data: [] }) },
        },
      ],
    }).compileComponents()
    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      const img = fixture.nativeElement.querySelector('.troupe-hub__logo img') as HTMLImageElement
      expect(img?.getAttribute('src')).toBe('/v1/troupes/t1/logo?v=1')
      expect(fixture.nativeElement.querySelector('.troupe-hub__description')?.textContent).toContain(
        'Troupe d’impro',
      )
    })
  })

  it('reloads troupe when slug param changes', async () => {
    const listSeasons = vi.fn().mockImplementation(async (troupeId: string) => ({
      ok: true,
      status: 200,
      data: {
        content:
          troupeId === 't1'
            ? [seasons[0]]
            : [
                {
                  ...seasons[0],
                  id: 's3',
                  troupeId: 't2',
                  slug: 'saison-b',
                  title: 'Saison B',
                },
              ],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      },
    }))
    const selectTroupe = vi.fn()
    const hubTroupes = [
      {
        id: 't1',
        name: 'Les Improbots',
        slug: 'les-improbots',
        membership: {
          id: 'm1',
          displayName: 'Admin',
          status: 'ACTIVE' as const,
          baselineRole: 'TROUPE_ADMIN' as const,
          createdAt: '',
          updatedAt: '',
        },
        activeMemberCount: 4,
        upcomingEventCount: 2,
      },
      secondTroupe,
    ]

    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe,
            patchTroupeName: vi.fn(),
            currentUserDisplayLabel: (u: { displayName: string }) => u.displayName,
            activeTroupes: () => hubTroupes,
            resolveTroupeBySlug: vi.fn().mockImplementation(async (slug: string) =>
              hubTroupes.find((t) => t.slug === slug) ?? null,
            ),
          },
        },
        { provide: SeasonApiService, useValue: { listSeasons } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: TroupeApiService, useValue: { updateTroupe: vi.fn(), listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }) } },
      ],
    }).compileComponents()

    paramMap$.next(convertToParamMap({ slug: 'les-improbots' }))
    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__title')?.textContent).toContain(
        'Les Improbots',
      )
    })

    paramMap$.next(convertToParamMap({ slug: 'autre-troupe' }))
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__title')?.textContent).toContain(
        'Autre Troupe',
      )
      expect(fixture.nativeElement.textContent).toContain('Saison B')
    })
    expect(selectTroupe).toHaveBeenCalledWith('t2')
    paramMap$.next(convertToParamMap({ slug: 'les-improbots' }))
  })

  it('shows only-archived hint before toggle', async () => {
    const listSeasons = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        content: [seasons[1]],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      },
    })
    const archivedTroupes = [
      {
        id: 't1',
        name: 'Les Improbots',
        slug: 'les-improbots',
        membership: {
          id: 'm1',
          displayName: 'Admin',
          status: 'ACTIVE' as const,
          baselineRole: 'TROUPE_ADMIN' as const,
          createdAt: '',
          updatedAt: '',
        },
        activeMemberCount: 4,
        upcomingEventCount: 2,
      },
    ]
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            patchTroupeName: vi.fn(),
            currentUserDisplayLabel: () => 'Test',
            activeTroupes: () => archivedTroupes,
            resolveTroupeBySlug: vi.fn().mockImplementation(async (slug: string) =>
              archivedTroupes.find((t) => t.slug === slug) ?? null,
            ),
          },
        },
        { provide: SeasonApiService, useValue: { listSeasons } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: TroupeApiService, useValue: { updateTroupe: vi.fn(), listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }) } },
      ],
    }).compileComponents()

    paramMap$.next(convertToParamMap({ slug: 'les-improbots' }))
    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Aucune saison active')
    })
  })

  it('builds admin menu items Modifier, Nouvelle saison, Membres in order', async () => {
    const { fixture } = await setup('TROUPE_ADMIN')
    const items = (fixture.componentInstance as unknown as { troupeAdminItems(): { label: string }[] })
      .troupeAdminItems()
      .map((item) => item.label)
    expect(items).toEqual([
      'Modifier',
      'Nouvelle saison',
      'Membres',
      'Paramètres',
      "Journal d'audit",
    ])
  })

  it('links Membres to canonical troupe admin path', async () => {
    const { fixture } = await setup('TROUPE_ADMIN')
    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    const membresLink = Array.from(
      document.querySelectorAll('.cdk-overlay-container a'),
    ).find((a) => a.textContent?.includes('Membres')) as HTMLAnchorElement | undefined
    expect(membresLink?.getAttribute('href')).toBe('/troupes/les-improbots/admin/membres')
  })

  it('links Paramètres with categories tab query param', async () => {
    const { fixture } = await setup('TROUPE_ADMIN')
    const items = (
      fixture.componentInstance as unknown as {
        troupeAdminItems(): { label: string; queryParams?: Record<string, string> }[]
      }
    ).troupeAdminItems()
    const settings = items.find((item) => item.label === 'Paramètres')
    expect(settings?.queryParams).toEqual({ tab: 'categories' })
  })

  it('shows Membres admin menu for platform admin without troupe admin role', async () => {
    const { fixture } = await setup('MEMBER', true)
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeTruthy()
  })

  it('builds admin menu items for platform admin in order', async () => {
    const { fixture } = await setup('MEMBER', true)
    const items = (fixture.componentInstance as unknown as { troupeAdminItems(): { label: string }[] })
      .troupeAdminItems()
      .map((item) => item.label)
    expect(items).toEqual([
      'Modifier',
      'Nouvelle saison',
      'Membres',
      'Paramètres',
      "Journal d'audit",
    ])
  })

  it('shows access denied for public slug without membership', async () => {
    paramMap$.next(convertToParamMap({ slug: 'la-malice' }))
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            patchTroupeName: vi.fn(),
            currentUserDisplayLabel: () => 'Test',
            activeTroupes: () => [],
            resolveTroupeBySlug: vi.fn().mockResolvedValue(null),
          },
        },
        {
          provide: SeasonApiService,
          useValue: { listSeasons: vi.fn() },
        },
        {
          provide: TroupeApiService,
          useValue: {
            updateTroupe: vi.fn(),
            listPublicTroupes: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: [{ id: 't-public', name: 'La Malice', slug: 'la-malice', activeMemberCount: 1, upcomingEventCount: 0 }],
            }),
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('#troupe-access-denied-heading')).not.toBeNull()
    })
    expect(fixture.nativeElement.textContent).toContain('Tu n’es pas membre de cette troupe.')
    expect(fixture.nativeElement.textContent).toContain("Découvrir d'autres troupes")
    const decouvrirLink = fixture.nativeElement.querySelector(
      'a[href="/troupes#decouvrir"]',
    ) as HTMLAnchorElement | null
    expect(decouvrirLink).not.toBeNull()
    const agendaLink = fixture.nativeElement.querySelector(
      'a[href="/agenda"]',
    ) as HTMLAnchorElement | null
    expect(agendaLink).not.toBeNull()
    expect(fixture.nativeElement.querySelector('.troupe-hub__empty-actions')).not.toBeNull()
  })

  it('shows access check error when public directory lookup fails', async () => {
    paramMap$.next(convertToParamMap({ slug: 'la-malice' }))
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            patchTroupeName: vi.fn(),
            currentUserDisplayLabel: () => 'Test',
            activeTroupes: () => [],
            resolveTroupeBySlug: vi.fn().mockResolvedValue(null),
          },
        },
        {
          provide: SeasonApiService,
          useValue: { listSeasons: vi.fn() },
        },
        {
          provide: TroupeApiService,
          useValue: {
            updateTroupe: vi.fn(),
            listPublicTroupes: vi.fn().mockResolvedValue({ ok: false, status: 503 }),
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('#troupe-access-check-error-heading'),
      ).not.toBeNull()
    })
    expect(fixture.nativeElement.textContent).toContain('Vérification impossible')
  })

  it('shows not found for unknown slug', async () => {
    paramMap$.next(convertToParamMap({ slug: 'unknown' }))
    await TestBed.configureTestingModule({
      imports: [TroupeHub],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'u1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            selectTroupe: vi.fn(),
            patchTroupeName: vi.fn(),
            currentUserDisplayLabel: () => 'Test',
            activeTroupes: () => [],
            resolveTroupeBySlug: vi.fn().mockResolvedValue(null),
          },
        },
        {
          provide: SeasonApiService,
          useValue: { listSeasons: vi.fn() },
        },
        {
          provide: TroupeApiService,
          useValue: {
            listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          },
        },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()
    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('#troupe-not-found-heading')).not.toBeNull()
    })
  })
})

describe('TroupeHub session gate', () => {
  it('redirige vers connexion sans session', async () => {
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: new BehaviorSubject(convertToParamMap({ slug: 'les-improbots' })).asObservable(),
          },
        },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: { load: vi.fn(), activeTroupes: () => [] },
        },
        { provide: SeasonApiService, useValue: { listSeasons: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const router = TestBed.inject(Router)
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const fixture = TestBed.createComponent(TroupeHub)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
    })
  })
})
