import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { CompositionApiService } from '../../core/composition/composition-api.service'
import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import {
  getLastVisitedSeasonSlugForTroupe,
  rememberLastVisitedSeasonSlug,
} from '../../core/navigation/last-visited-season-storage'
import { getLastVisitedTroupeSlug } from '../../core/navigation/last-visited-troupe-storage'
import { SeasonApiService, type SeasonResponse } from '../../core/seasons/season-api.service'
import { SeasonStatisticsApiService } from '../../core/seasons/season-statistics-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  participantPreviewCap,
  PARTICIPANT_DESKTOP_MAX_LINES,
  PARTICIPANT_DESKTOP_AVATARS_PER_ROW,
  PARTICIPANT_PREVIEW_CAP_MOBILE,
  pickDefaultSeason,
  TroupeHub,
} from './troupe-hub'
import { TroupeEditDialog } from './troupe-edit-dialog'

const hubSupportProviders = [
  {
    provide: AvailabilityApiService,
    useValue: {
      getMyAvailability: vi.fn(),
      setMyAvailability: vi.fn(),
    },
  },
  {
    provide: CompositionApiService,
    useValue: {
      getComposition: vi.fn(),
      respondToSlot: vi.fn(),
    },
  },
  {
    provide: MePreferencesApiService,
    useValue: {
      getPreferences: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { gender: null } }),
    },
  },
]

describe('participantPreviewCap', () => {
  it('returns mobile cap below desktop breakpoint', () => {
    expect(participantPreviewCap(false)).toBe(PARTICIPANT_PREVIEW_CAP_MOBILE)
  })

  it('returns up to six rows on desktop dashboard', () => {
    expect(participantPreviewCap(true)).toBe(
      PARTICIPANT_DESKTOP_MAX_LINES * PARTICIPANT_DESKTOP_AVATARS_PER_ROW,
    )
  })
})

describe('pickDefaultSeason', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  const activeSeasons = [
    {
      id: 's-old',
      troupeId: 't1',
      slug: '2023-24',
      title: 'Ancienne active',
      description: null,
      startDate: '2023-09-01',
      endDate: '2024-06-30',
      archived: false,
      active: true,
      eventCount: 1,
      participantCount: 4,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 's-new',
      troupeId: 't1',
      slug: '2025-26',
      title: 'Saison récente',
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
  ]

  it('prefers last visited season slug for troupe when present', () => {
    rememberLastVisitedSeasonSlug('2023-24', 't1')
    expect(pickDefaultSeason(activeSeasons, 't1')?.slug).toBe('2023-24')
  })

  it('falls back to latest startDate when no remembered slug', () => {
    expect(pickDefaultSeason(activeSeasons, 't1')?.slug).toBe('2025-26')
  })

  it('returns null when no active seasons', () => {
    expect(pickDefaultSeason([], 't1')).toBeNull()
  })
})

describe('TroupeHub', () => {
  beforeEach(() => {
    localStorage.clear()
    paramMap$.next(convertToParamMap({ slug: 'les-improbots' }))
  })

  afterEach(() => {
    localStorage.clear()
  })

  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'les-improbots' }))

  const activeSeason: SeasonResponse = {
    id: 's1',
    troupeId: 't1',
    slug: '2025-26',
    title: 'Saison 2025-26',
    description: null,
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    archived: false,
    active: true,
    eventCount: 24,
    participantCount: 12,
    createdAt: '',
    updatedAt: '',
  }

  const secondActiveSeason: SeasonResponse = {
    ...activeSeason,
    id: 's2',
    slug: '2024-25',
    title: 'Saison 2024-25',
    startDate: '2024-09-01',
    eventCount: 10,
    participantCount: 8,
  }

  const archivedSeason: SeasonResponse = {
    id: 's-arch',
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
  }

  const workspaceFixture = {
    permissions: {
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: false,
      canManageSeasons: false,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: false,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    },
    participantSelectors: [],
    categories: [{ slug: 'gala', label: 'Gala', sortOrder: 0 }],
    upcomingEvents: {
      content: [
        {
          id: 'e1',
          seasonId: 's1',
          slug: 'gala-1',
          title: 'Gala d’ouverture',
          description: null,
          location: null,
          startsAt: '2026-01-15T20:00:00+01:00',
          archived: false,
          templateType: 'MATCH',
          roleSlots: {},
          createdAt: '',
          updatedAt: '',
          category: 'gala',
          myAvailabilityStatus: 'available',
        },
        {
          id: 'e2',
          seasonId: 's1',
          slug: 'gala-2',
          title: 'Deuxième gala',
          description: null,
          location: null,
          startsAt: '2026-02-10T20:00:00+01:00',
          archived: false,
          templateType: 'MATCH',
          roleSlots: {},
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'e3',
          seasonId: 's1',
          slug: 'gala-3',
          title: 'Troisième gala',
          description: null,
          location: null,
          startsAt: '2026-03-10T20:00:00+01:00',
          archived: false,
          templateType: 'MATCH',
          roleSlots: {},
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'e4',
          seasonId: 's1',
          slug: 'gala-4',
          title: 'Quatrième gala',
          description: null,
          location: null,
          startsAt: '2026-04-10T20:00:00+01:00',
          archived: false,
          templateType: 'MATCH',
          roleSlots: {},
          createdAt: '',
          updatedAt: '',
        },
      ],
      page: 0,
      size: 3,
      totalElements: 4,
      totalPages: 2,
    },
  }

  const statsFixture = {
    participants: [],
    monthKeys: [],
    events: [],
    confirmedCompositionsCount: 7,
    rows: [
      {
        participantId: 'p1',
        displayName: 'Alice',
        userSlug: 'alice',
        avatarUrl: null,
        annual: { totalJeu: { selections: 40, dispos: 10, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
      {
        participantId: 'p2',
        displayName: 'Bob',
        userSlug: 'bob',
        avatarUrl: null,
        annual: { totalJeu: { selections: 35, dispos: 8, declines: 1 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
      {
        participantId: 'p3',
        displayName: 'Charlie',
        userSlug: null,
        avatarUrl: null,
        annual: { totalJeu: { selections: 20, dispos: 5, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
      {
        participantId: 'p4',
        displayName: 'Dana',
        userSlug: 'dana',
        avatarUrl: null,
        annual: { totalJeu: { selections: 15, dispos: 4, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
      {
        participantId: 'p5',
        displayName: 'Eve',
        userSlug: 'eve',
        avatarUrl: null,
        annual: { totalJeu: { selections: 12, dispos: 3, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
      {
        participantId: 'p6',
        displayName: 'Frank',
        userSlug: 'frank',
        avatarUrl: null,
        annual: { totalJeu: { selections: 10, dispos: 2, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
      {
        participantId: 'p7',
        displayName: 'Grace',
        userSlug: 'grace',
        avatarUrl: null,
        annual: { totalJeu: { selections: 8, dispos: 1, declines: 0 } },
        monthSummary: {},
        byMonth: {},
        eventCells: {},
        eventCellDetails: {},
      },
    ],
  }

  function statsWithPastEvents(count: number) {
    const tones = ['collecting', 'preparing', 'confirmed', 'draft'] as const
    const events = Array.from({ length: count }, (_, index) => {
      const month = String((index % 5) + 1).padStart(2, '0')
      const tone = tones[index % tones.length]
      return {
        id: `past-e${index + 1}`,
        slug: `spectacle-${index + 1}`,
        title: `Spectacle ${index + 1}`,
        startsAt: `2026-${month}-10T20:00:00+01:00`,
        templateType: 'match',
        category: null,
        monthKey: `2026-${month}`,
        teamStatusBadge: {
          key: tone,
          label: tone,
          tone,
          shortLabel: tone,
        },
      }
    })
    return {
      ...statsFixture,
      events,
      monthKeys: [...new Set(events.map((event) => event.monthKey))],
    }
  }

  async function setup(
    baselineRole: 'MEMBER' | 'TROUPE_ADMIN' | 'EXTERNE' = 'TROUPE_ADMIN',
    platformAdmin = false,
    options: {
      seasons?: SeasonResponse[]
      activeTroupes?: ReturnType<typeof defaultTroupes>
      patchTroupeProfile?: ReturnType<typeof vi.fn>
      getSeasonWorkspace?: ReturnType<typeof vi.fn>
      loadStatistics?: ReturnType<typeof vi.fn>
    } = {},
  ) {
    const dialog = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of('new-saison') }),
    }
    const patchTroupeProfile = options.patchTroupeProfile ?? vi.fn()
    const troupes = options.activeTroupes ?? defaultTroupes(baselineRole)
    const seasons = options.seasons ?? [activeSeason, archivedSeason]
    const getSeasonWorkspace =
      options.getSeasonWorkspace ??
      vi.fn().mockResolvedValue({ ok: true, status: 200, data: workspaceFixture })
    const loadStatistics =
      options.loadStatistics ??
      vi.fn().mockResolvedValue({ ok: true, status: 200, data: statsFixture })

    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'troupes/:slug', component: TroupeHub },
          { path: 'saison/:troupeSlug/:seasonSlug', component: TroupeHub },
          { path: 'saison/:troupeSlug/:seasonSlug/event/:eventSlug', component: TroupeHub },
          { path: 'membre/:userSlug', component: TroupeHub },
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
              data: {
                content: seasons,
                page: 0,
                size: 50,
                totalElements: seasons.length,
                totalPages: 1,
              },
            }),
            getSeasonWorkspace,
          },
        },
        {
          provide: SeasonStatisticsApiService,
          useValue: { loadStatistics },
        },
        ...hubSupportProviders,
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
    return { fixture, dialog, patchTroupeProfile, getSeasonWorkspace, loadStatistics }
  }

  function defaultTroupes(baselineRole: 'MEMBER' | 'TROUPE_ADMIN' | 'EXTERNE') {
    return [
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
  }

  it('remembers last visited troupe slug after hub loads', async () => {
    await setup()
    expect(getLastVisitedTroupeSlug()).toBe('les-improbots')
  })

  it('does not render breadcrumb', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.querySelector('.troupe-hub__breadcrumb')).toBeNull()
  })

  it('shows selected season title as h2 dashboard heading', async () => {
    const { fixture } = await setup()
    const heading = fixture.nativeElement.querySelector('#troupe-season-dashboard-heading')
    expect(heading?.textContent).toContain('Saison 2025-26')
    expect(fixture.nativeElement.querySelector('#saisons-heading')).toBeNull()
  })

  it('hides season switcher for mono-season troupe', async () => {
    const { fixture } = await setup('MEMBER', false, { seasons: [activeSeason] })
    expect(fixture.nativeElement.querySelector('.troupe-hub__season-switcher')).toBeNull()
  })

  it('shows season switcher when multiple active seasons exist', async () => {
    const { fixture } = await setup('MEMBER', false, {
      seasons: [activeSeason, secondActiveSeason, archivedSeason],
    })
    expect(fixture.nativeElement.querySelector('.troupe-hub__season-switcher')).not.toBeNull()
  })

  it('renders metric tiles without active season grid or season CTA', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).toContain('Spectacles')
    expect(fixture.nativeElement.textContent).toContain('Compos')
    expect(fixture.nativeElement.textContent).toContain('Personnes')
    expect(fixture.nativeElement.textContent).toContain('24')
    expect(fixture.nativeElement.textContent).toContain('7')
    expect(fixture.nativeElement.textContent).not.toContain('Ouvrir la saison')
    const cards = fixture.nativeElement.querySelectorAll('app-season-card')
    expect(cards.length).toBe(0)
    expect(fixture.nativeElement.querySelector('a.troupe-hub__season-cta')).toBeNull()
  })

  it('toggles archived seasons inline list', async () => {
    const { fixture } = await setup()
    const toggle = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Saisons archivées (1)'))!
    toggle.click()
    fixture.detectChanges()
    const cards = fixture.nativeElement.querySelectorAll('app-season-card')
    expect(cards.length).toBe(1)
    expect(cards[0].textContent).toContain('Ancienne')
  })

  it('shows empty state when only archived seasons exist', async () => {
    const { fixture } = await setup('TROUPE_ADMIN', false, { seasons: [archivedSeason] })
    expect(fixture.nativeElement.textContent).toContain('Aucune saison en cours pour l\'instant.')
    expect(fixture.nativeElement.textContent).toContain('Saisons archivées (1)')
  })

  it('shows expanded participant strip with overflow CTA link', async () => {
    const manyRows = Array.from({ length: 14 }, (_, index) => ({
      participantId: `p${index}`,
      displayName: `User ${index}`,
      userSlug: `user-${index}`,
      avatarUrl: null,
      annual: { totalJeu: { selections: 1, dispos: 0, declines: 0 } },
      monthSummary: {},
      byMonth: {},
      eventCells: {},
      eventCellDetails: {},
    }))
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { ...statsFixture, rows: manyRows },
      }),
    })
    expect(fixture.nativeElement.querySelectorAll('app-user-avatar').length).toBe(12)
    const overflow = fixture.nativeElement.querySelector(
      '.troupe-hub__avatar-overflow',
    ) as HTMLAnchorElement
    expect(overflow?.textContent).toContain('+2')
    expect(overflow?.getAttribute('href')).toBe('/saison/les-improbots/2025-26')
    expect(fixture.nativeElement.textContent).not.toContain('Voir tout le monde')
  })

  it('navigates to member glance when avatar with slug is tapped', async () => {
    const { fixture } = await setup()
    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const avatarButtons = fixture.nativeElement.querySelectorAll('.troupe-hub__avatar-btn')
    ;(avatarButtons[0] as HTMLButtonElement).click()
    expect(navigateSpy).toHaveBeenCalledWith(['/membre', 'alice'], {
      queryParams: { troupeId: 't1', seasonId: 's1' },
    })
  })

  it('renders at most three upcoming event cards in teaser', async () => {
    const { fixture } = await setup()
    await vi.waitFor(() => {
      const cards = fixture.nativeElement.querySelectorAll('.agenda-card')
      expect(cards.length).toBe(3)
    })
    expect(fixture.nativeElement.textContent).toContain('Gala d’ouverture')
    const agendaLink = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    ).find((link) => link.textContent?.includes('Voir tous les spectacles'))
    expect(agendaLink?.getAttribute('href')).toBe('/saison/les-improbots/2025-26')
  })

  it('shows teaser empty copy when workspace has no upcoming events', async () => {
    const { fixture } = await setup('MEMBER', false, {
      getSeasonWorkspace: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          ...workspaceFixture,
          upcomingEvents: { content: [], page: 0, size: 3, totalElements: 0, totalPages: 0 },
        },
      }),
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Aucun spectacle à venir cette saison.')
    })
  })

  it('shows season mini-chart when stats include at least three past events', async () => {
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: statsWithPastEvents(3),
      }),
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelectorAll('.troupe-hub__season-chart-block').length).toBe(3)
    expect(
      fixture.nativeElement.querySelector('.troupe-hub__season-chart-block--confirmed'),
    ).not.toBeNull()
  })

  it('links to season history stats from mini-chart CTA', async () => {
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: statsWithPastEvents(3),
      }),
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__season-stats-cta')).not.toBeNull()
    })
    const cta = fixture.nativeElement.querySelector(
      '.troupe-hub__season-stats-cta',
    ) as HTMLAnchorElement
    expect(cta.textContent).toContain('Voir toutes les stats')
    expect(cta.getAttribute('href')).toBe('/saison/les-improbots/2025-26?view=stats')
  })

  it('hides season mini-chart when fewer than three past events', async () => {
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: statsWithPastEvents(2),
      }),
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__metrics')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).toBeNull()
  })

  it('hides season mini-chart when stats load fails', async () => {
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Compos')
    })
    expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).toBeNull()
  })

  it('hides season mini-chart while stats are loading', async () => {
    let resolveStats!: (value: {
      ok: true
      status: 200
      data: ReturnType<typeof statsWithPastEvents>
    }) => void
    const statsPromise = new Promise<{
      ok: true
      status: 200
      data: ReturnType<typeof statsWithPastEvents>
    }>((resolve) => {
      resolveStats = resolve
    })
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockReturnValue(statsPromise),
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__metrics mat-spinner')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).toBeNull()

    resolveStats({ ok: true, status: 200, data: statsWithPastEvents(3) })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).not.toBeNull()
    })
  })

  it('navigates to event detail when a chart block is clicked', async () => {
    const { fixture } = await setup('MEMBER', false, {
      loadStatistics: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: statsWithPastEvents(3),
      }),
    })
    const router = TestBed.inject(Router)
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart-block')).not.toBeNull()
    })
    ;(fixture.nativeElement.querySelector('.troupe-hub__season-chart-block') as HTMLButtonElement).click()
    expect(navigateSpy).toHaveBeenCalledWith([
      '/saison',
      'les-improbots',
      '2025-26',
      'event',
      'spectacle-1',
    ])
  })

  it('clears season mini-chart when switching seasons', async () => {
    const loadStatistics = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: statsWithPastEvents(3),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: statsWithPastEvents(2),
      })
    const { fixture } = await setup('TROUPE_ADMIN', false, {
      seasons: [activeSeason, secondActiveSeason],
      loadStatistics,
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).not.toBeNull()
    })
    const switcher = fixture.nativeElement.querySelector('.troupe-hub__season-switcher') as HTMLButtonElement
    switcher.click()
    fixture.detectChanges()
    const menuItems = document.querySelectorAll('.mat-mdc-menu-item')
    ;(menuItems[1] as HTMLButtonElement).click()
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.troupe-hub__season-chart')).toBeNull()
    })
  })

  it('shows multi-troupe footer link when user has at least two troupes', async () => {
    const { fixture } = await setup('MEMBER', false, {
      activeTroupes: [
        ...defaultTroupes('MEMBER'),
        {
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
        },
      ],
    })
    const footerLink = fixture.nativeElement.querySelector('.troupe-hub__footer a') as HTMLAnchorElement
    expect(footerLink?.textContent).toContain('Voir les autres troupes')
    expect(footerLink.getAttribute('href')).toBe('/troupes')
  })

  it('hides multi-troupe footer for mono-troupe member', async () => {
    const { fixture } = await setup('MEMBER')
    expect(fixture.nativeElement.querySelector('.troupe-hub__footer')).toBeNull()
  })

  it('resolves default season from last visited slug for troupe', async () => {
    rememberLastVisitedSeasonSlug('2024-25', 't1')
    const { fixture } = await setup('MEMBER', false, {
      seasons: [activeSeason, secondActiveSeason],
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('#troupe-season-dashboard-heading')?.textContent).toContain(
        'Saison 2024-25',
      )
    })
    expect(getLastVisitedSeasonSlugForTroupe('t1')).toBe('2024-25')
  })

  it('persists season slug when user switches season on hub', async () => {
    const { fixture } = await setup('MEMBER', false, {
      seasons: [activeSeason, secondActiveSeason],
    })
    ;(
      fixture.componentInstance as unknown as { selectSeason(season: typeof secondActiveSeason): void }
    ).selectSeason(secondActiveSeason)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(getLastVisitedSeasonSlugForTroupe('t1')).toBe('2024-25')
      expect(fixture.nativeElement.querySelector('#troupe-season-dashboard-heading')?.textContent).toContain(
        'Saison 2024-25',
      )
    })
  })

  it('shows guest hint for externe viewers', async () => {
    const { fixture } = await setup('EXTERNE')
    expect(fixture.nativeElement.textContent).toContain('Saisons où tu es invité·e.')
  })

  it('shows admin gear for TROUPE_ADMIN without section Nouvelle saison button', async () => {
    const { fixture } = await setup('TROUPE_ADMIN')
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).not.toBeNull()
    const sectionHeaderButton = Array.from(
      fixture.nativeElement.querySelectorAll('.troupe-hub__dashboard button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Nouvelle saison'))
    expect(sectionHeaderButton).toBeUndefined()
  })

  it('hides admin gear for non-admin members', async () => {
    const { fixture } = await setup('MEMBER')
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).toBeNull()
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
      expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'les-improbots', 'new-saison'])
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

  it('reloads troupe when slug param changes', async () => {
    const listSeasons = vi.fn().mockImplementation(async (troupeId: string) => ({
      ok: true,
      status: 200,
      data: {
        content:
          troupeId === 't1'
            ? [activeSeason]
            : [{ ...activeSeason, id: 's3', troupeId: 't2', slug: 'saison-b', title: 'Saison B' }],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      },
    }))
    const selectTroupe = vi.fn()
    const hubTroupes = [
      ...defaultTroupes('TROUPE_ADMIN'),
      {
        id: 't2',
        name: 'Autre Troupe',
        slug: 'autre-troupe',
        membership: {
          id: 'm2',
          displayName: 'Admin',
          status: 'ACTIVE' as const,
          baselineRole: 'TROUPE_ADMIN' as const,
          createdAt: '',
          updatedAt: '',
        },
        activeMemberCount: 2,
        upcomingEventCount: 0,
      },
    ]

    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
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
        {
          provide: SeasonApiService,
          useValue: {
            listSeasons,
            getSeasonWorkspace: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: workspaceFixture,
            }),
          },
        },
        {
          provide: SeasonStatisticsApiService,
          useValue: {
            loadStatistics: vi.fn().mockResolvedValue({ ok: true, status: 200, data: statsFixture }),
          },
        },
        ...hubSupportProviders,
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: TroupeApiService,
          useValue: {
            updateTroupe: vi.fn(),
            listPublicTroupes: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          },
        },
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

  it('shows access denied for public slug without membership', async () => {
    paramMap$.next(convertToParamMap({ slug: 'la-malice' }))
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
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
          useValue: { listSeasons: vi.fn(), getSeasonWorkspace: vi.fn() },
        },
        {
          provide: SeasonStatisticsApiService,
          useValue: { loadStatistics: vi.fn() },
        },
        ...hubSupportProviders,
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
  })

  it('shows access check error when public directory lookup fails', async () => {
    paramMap$.next(convertToParamMap({ slug: 'la-malice' }))
    await TestBed.configureTestingModule({
      imports: [TroupeHub, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
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
          useValue: { listSeasons: vi.fn(), getSeasonWorkspace: vi.fn() },
        },
        {
          provide: SeasonStatisticsApiService,
          useValue: { loadStatistics: vi.fn() },
        },
        ...hubSupportProviders,
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
      expect(fixture.nativeElement.querySelector('#troupe-access-check-error-heading')).not.toBeNull()
    })
    expect(fixture.nativeElement.textContent).toContain('Vérification impossible')
  })

  it('shows not found for unknown slug', async () => {
    paramMap$.next(convertToParamMap({ slug: 'unknown' }))
    await TestBed.configureTestingModule({
      imports: [TroupeHub],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
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
          useValue: { listSeasons: vi.fn(), getSeasonWorkspace: vi.fn() },
        },
        {
          provide: SeasonStatisticsApiService,
          useValue: { loadStatistics: vi.fn() },
        },
        ...hubSupportProviders,
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
        {
          provide: SeasonApiService,
          useValue: { listSeasons: vi.fn(), getSeasonWorkspace: vi.fn() },
        },
        {
          provide: SeasonStatisticsApiService,
          useValue: { loadStatistics: vi.fn() },
        },
        ...hubSupportProviders,
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
