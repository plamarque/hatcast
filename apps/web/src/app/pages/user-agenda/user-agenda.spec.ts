import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
  type Routes,
} from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { USER_AGENDA_FILTERS_STORAGE_KEY } from '../../core/agenda/user-agenda-filters-storage'
import {
  UserAgendaApiService,
  type UserAgendaItem,
  type UserAgendaParticipationFilters,
  type UserAgendaResponse,
} from '../../core/agenda/user-agenda-api.service'
import { getPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'
import { UserAgenda } from './user-agenda'

const TROUPE_A = 'a0000001-0000-4000-8000-000000000001'
const LEAGUE_A = 'b0000001-0000-4000-8000-000000000001'

const testRoutes: Routes = [
  { path: 'agenda', component: UserAgenda },
  { path: 'troupes/:slug', component: UserAgenda },
  { path: 'saison/:slug', component: UserAgenda },
  { path: 'saison/:slug/event/:eventSlug', component: UserAgenda },
]

async function settle(fixture: ComponentFixture<UserAgenda>): Promise<void> {
  fixture.detectChanges()
  for (let i = 0; i < 20; i++) {
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (!fixture.componentInstance['loadingSession']() && !fixture.componentInstance['loadingAgenda']()) {
      break
    }
  }
  fixture.detectChanges()
}

describe('UserAgenda', () => {
  let fixture: ComponentFixture<UserAgenda>
  let agendaApi: { listAgenda: ReturnType<typeof vi.fn> }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> }
  let router: Router
  let navigateSpy: ReturnType<typeof vi.fn>
  let snack: { open: ReturnType<typeof vi.fn> }
  beforeEach(async () => {
    localStorage.clear()
    sessionStorage.clear()
    agendaApi = {
      listAgenda: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: agendaResponse([
          agendaItem('event-jan', 'Cabaret de janvier', '2026-01-15T19:30:00Z'),
          agendaItem('event-feb', 'Cabaret de février', '2026-02-02T20:00:00Z'),
        ]),
      }),
    }
    auth = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          user: {
            id: 'user-1',
            email: 'patrice@example.com',
            displayName: 'Patrice',
            avatarUrl: null,
          },
          platformAdmin: false,
        },
      }),
      logout: vi.fn().mockResolvedValue(true),
    }
    snack = { open: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [UserAgenda, NoopAnimationsModule],
      providers: [
        provideRouter(testRoutes),
        { provide: AuthApiService, useValue: auth },
        { provide: UserAgendaApiService, useValue: agendaApi },
        { provide: MatSnackBar, useValue: snack },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatSnackBar, { useValue: snack })

    router = TestBed.inject(Router)
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    fixture = TestBed.createComponent(UserAgenda)
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('n’affiche pas le raccourci Ma saison dans le header', async () => {
    await settle(fixture)
    expect(fixture.nativeElement.querySelector('app-member-season-shortcut')).toBeNull()
  })

  it('affiche les badges troupe et saison cliquables sur chaque carte', async () => {
    await settle(fixture)

    const troupeLink = fixture.nativeElement.querySelector(
      'a.agenda-card__badge--link[href="/troupes/la-bim"]',
    ) as HTMLAnchorElement
    const seasonLink = fixture.nativeElement.querySelector(
      'a.agenda-card__badge--league[href="/saison/ligue-2026"]',
    ) as HTMLAnchorElement

    expect(troupeLink).toBeTruthy()
    expect(troupeLink.getAttribute('aria-label')).toBe('Ouvrir la troupe La BIM')
    expect(seasonLink).toBeTruthy()
    expect(seasonLink.getAttribute('aria-label')).toBe('Ouvrir la saison Ligue 2026')
  })

  it('n’ouvre pas l’événement quand on clique sur le badge saison', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-badge', 'Cabaret badge', '2026-05-10T18:00:00Z'),
      ]),
    })

    await settle(fixture)
    navigateSpy.mockClear()

    const seasonLink = fixture.nativeElement.querySelector(
      'a.agenda-card__badge--league',
    ) as HTMLAnchorElement
    seasonLink.click()

    expect(navigateSpy).not.toHaveBeenCalled()
  })

  it('affiche les événements groupés par mois avec les badges troupe, ligue et disponibilité', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-jan', 'Cabaret de janvier', '2026-01-15T19:30:00Z', {
          location: 'Salle A',
          myAvailabilityStatus: 'available',
          troupeName: 'La BIM',
          leagueTitle: 'Ligue 2026',
        }),
        agendaItem('event-feb', 'Cabaret de février', '2026-02-02T20:00:00Z', {
          myAvailabilityStatus: null,
          troupeName: 'Les Improbots',
          leagueTitle: 'Matchs impro',
        }),
      ]),
    })

    await settle(fixture)

    const text = fixture.nativeElement.textContent
    expect(agendaApi.listAgenda).toHaveBeenCalledWith({ page: 0, size: 50, scope: 'upcoming' })
    expect(text).toContain('Mon agenda')
    expect(text).toContain('janvier 2026')
    expect(text).toContain('février 2026')
    expect(text).toContain('Cabaret de janvier')
    expect(text).toContain('Salle A')
    expect(text).toContain('La BIM')
    expect(text).toContain('Ligue 2026')
    expect(text).toContain('Dispo')
    expect(text).not.toContain('Filtres')
  })

  it('conserve deux lignes ayant le même titre et la même date dans deux troupes', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-home', 'Rencontre partagée', '2026-03-12T18:30:00Z', {
          troupeId: 'troupe-a',
          troupeName: 'Troupe A',
        }),
        agendaItem('event-away', 'Rencontre partagée', '2026-03-12T18:30:00Z', {
          troupeId: 'troupe-b',
          troupeName: 'Troupe B',
        }),
      ]),
    })

    await settle(fixture)

    const cards = fixture.nativeElement.querySelectorAll('.agenda-card')
    expect(cards).toHaveLength(2)
    expect(fixture.nativeElement.textContent).toContain('Troupe A')
    expect(fixture.nativeElement.textContent).toContain('Troupe B')
  })

  it('affiche l’état vide sans participation', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { noParticipation: true }),
    })

    await settle(fixture)

    const text = fixture.nativeElement.textContent
    expect(text).toContain('troupe de démonstration')
    expect(text).toContain('Rejoindre la troupe de démonstration')
    expect(text).toContain('Mes troupes')
  })

  it('affiche l’état vide sans spectacles à venir', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { noParticipation: false }),
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Aucun spectacle à venir.')
    expect(fixture.nativeElement.textContent).not.toContain('Chargement impossible')
  })

  it('redirige vers connexion avec snackbar si la session est invalide', async () => {
    auth.ensureHatcastSession.mockResolvedValue({ ok: false, status: 401 })
    Object.defineProperty(router, 'url', { value: '/agenda', configurable: true })

    await settle(fixture)

    expect(snack.open).toHaveBeenCalledWith(
      'Votre session a expiré ou vous n’êtes pas connecté.',
      'OK',
      { duration: 6000 },
    )
    expect(getPendingPostLoginRedirect()).toBe('/agenda')
    expect(navigateSpy).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
    expect(agendaApi.listAgenda).not.toHaveBeenCalled()
  })

  it('redirige vers connexion quand le chargement agenda retourne 401', async () => {
    agendaApi.listAgenda.mockResolvedValue({ ok: false, status: 401 })

    await settle(fixture)

    expect(snack.open).toHaveBeenCalledWith(
      'Votre session a expiré ou vous n’êtes pas connecté.',
      'OK',
      { duration: 6000 },
    )
    expect(navigateSpy).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })

  it('affiche une erreur retryable pour les erreurs non-auth', async () => {
    agendaApi.listAgenda.mockResolvedValue({ ok: false, status: 500 })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Chargement impossible')
    const retry = fixture.nativeElement.querySelector('button[data-testid="agenda-retry"]') as HTMLButtonElement
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([agendaItem('event-retry', 'Retour agenda', '2026-04-01T18:00:00Z')]),
    })
    retry.click()
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledTimes(2)
    expect(fixture.nativeElement.textContent).toContain('Retour agenda')
  })

  it('active une ligne au clavier et ouvre le détail existant de saison', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-keyboard', 'Cabaret clavier', '2026-05-03T18:00:00Z', {
          leagueSlug: 'ligue-clavier',
        }),
      ]),
    })

    await settle(fixture)

    const card = fixture.nativeElement.querySelector('.agenda-card__clickable') as HTMLElement
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(navigateSpy).toHaveBeenCalledWith([
      '/saison',
      'ligue-clavier',
      'event',
      'event-keyboard',
    ])
  })

  it('active une ligne avec la touche Space', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-space', 'Cabaret espace', '2026-05-04T18:00:00Z', {
          leagueSlug: 'ligue-espace',
        }),
      ]),
    })

    await settle(fixture)

    const card = fixture.nativeElement.querySelector('.agenda-card__clickable') as HTMLElement
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))

    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'ligue-espace', 'event', 'event-space'])
  })

  it('masque la barre de filtres quand filterBarVisible est false', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([agendaItem('event-1', 'Show', '2026-06-01T18:00:00Z')], {
        filterBarVisible: false,
      }),
    })

    await settle(fixture)

    expect(fixture.nativeElement.querySelector('[data-testid="agenda-filter-bar"]')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Effacer filtres')
  })

  it('affiche la barre de filtres et appelle l’API avec troupeId', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([agendaItem('event-1', 'Show', '2026-06-01T18:00:00Z')], {
        filterBarVisible: true,
        participationFilters: sampleParticipationFilters(),
      }),
    })

    await settle(fixture)

    expect(fixture.nativeElement.querySelector('[data-testid="agenda-filter-bar"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Toutes les troupes')

    agendaApi.listAgenda.mockClear()
    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ troupeId: TROUPE_A, scope: 'upcoming' }),
    )
  })

  it('appelle l’API avec leagueId et efface les filtres au reset', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], {
        filterBarVisible: true,
        participationFilters: sampleParticipationFilters(),
      }),
    })

    await settle(fixture)
    agendaApi.listAgenda.mockClear()

    await fixture.componentInstance['onLeagueFilterChange'](LEAGUE_A)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ leagueId: LEAGUE_A }),
    )

    agendaApi.listAgenda.mockClear()
    await fixture.componentInstance['onClearFilters']()
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith({
      page: 0,
      size: 50,
      scope: 'upcoming',
    })
    expect(sessionStorage.getItem(USER_AGENDA_FILTERS_STORAGE_KEY)).toBeNull()
  })

  it('affiche l’état vide filtré avec indication d’élargir les filtres', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], {
        filterBarVisible: true,
        participationFilters: sampleParticipationFilters(),
      }),
    })

    await settle(fixture)
    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Aucun spectacle à venir.')
    expect(fixture.nativeElement.textContent).toContain('Essaie d’élargir les filtres.')
    expect(fixture.nativeElement.textContent).not.toContain('Tu n\'es inscrit')
  })

  it('bootstrap les filtres depuis les query params URL', async () => {
    TestBed.resetTestingModule()
    sessionStorage.clear()
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { filterBarVisible: true, participationFilters: sampleParticipationFilters() }),
    })

    await TestBed.configureTestingModule({
      imports: [UserAgenda, NoopAnimationsModule],
      providers: [
        provideRouter(testRoutes),
        { provide: AuthApiService, useValue: auth },
        { provide: UserAgendaApiService, useValue: agendaApi },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                troupeId: TROUPE_A,
                leagueId: LEAGUE_A,
              }),
            },
          },
        },
      ],
    }).compileComponents()

    router = TestBed.inject(Router)
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    fixture = TestBed.createComponent(UserAgenda)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ troupeId: TROUPE_A, leagueId: LEAGUE_A }),
    )
  })

  it('restaure les filtres depuis sessionStorage et synchronise l’URL', async () => {
    TestBed.resetTestingModule()
    sessionStorage.setItem(
      USER_AGENDA_FILTERS_STORAGE_KEY,
      JSON.stringify({ troupeId: TROUPE_A, leagueId: null }),
    )
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { filterBarVisible: true, participationFilters: sampleParticipationFilters() }),
    })

    await TestBed.configureTestingModule({
      imports: [UserAgenda, NoopAnimationsModule],
      providers: [
        provideRouter(testRoutes),
        { provide: AuthApiService, useValue: auth },
        { provide: UserAgendaApiService, useValue: agendaApi },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents()

    router = TestBed.inject(Router)
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    fixture = TestBed.createComponent(UserAgenda)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ troupeId: TROUPE_A }),
    )
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { troupeId: TROUPE_A, leagueId: null },
      }),
    )
  })

  it('conserve la barre de filtres pendant le rechargement', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([agendaItem('event-1', 'Show', '2026-06-01T18:00:00Z')], {
        filterBarVisible: true,
        participationFilters: sampleParticipationFilters(),
      }),
    })

    await settle(fixture)
    expect(fixture.nativeElement.querySelector('[data-testid="agenda-filter-bar"]')).not.toBeNull()

    let resolveReload: ((value: unknown) => void) | undefined
    agendaApi.listAgenda.mockReturnValue(
      new Promise((resolve) => {
        resolveReload = resolve
      }),
    )

    void fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="agenda-filter-bar"]')).not.toBeNull()

    resolveReload?.({
      ok: true,
      status: 200,
      data: agendaResponse([], {
        filterBarVisible: true,
        participationFilters: sampleParticipationFilters(),
      }),
    })
    await settle(fixture)
  })

  it('efface leagueId quand la troupe change et invalide la ligue', async () => {
    const TROUPE_B = 'a0000002-0000-4000-8000-000000000002'
    const LEAGUE_B = 'b0000002-0000-4000-8000-000000000003'
    const filters: UserAgendaParticipationFilters = {
      troupes: [
        { id: TROUPE_A, name: 'La BIM', slug: 'la-bim' },
        { id: TROUPE_B, name: 'Autre troupe', slug: 'autre-troupe' },
      ],
      leagues: [
        { id: LEAGUE_A, title: 'Ligue A', slug: 'ligue-a', troupeId: TROUPE_A },
        { id: LEAGUE_B, title: 'Ligue B', slug: 'ligue-b', troupeId: TROUPE_B },
      ],
    }

    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { filterBarVisible: true, participationFilters: filters }),
    })

    await settle(fixture)
    await fixture.componentInstance['onLeagueFilterChange'](LEAGUE_B)
    await settle(fixture)
    agendaApi.listAgenda.mockClear()

    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ troupeId: TROUPE_A, leagueId: undefined }),
    )
  })

  it('vide sessionStorage quand les filtres sont remis à null via les menus', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], {
        filterBarVisible: true,
        participationFilters: sampleParticipationFilters(),
      }),
    })

    await settle(fixture)
    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await settle(fixture)
    expect(sessionStorage.getItem(USER_AGENDA_FILTERS_STORAGE_KEY)).not.toBeNull()

    await fixture.componentInstance['onTroupeFilterChange'](null)
    await settle(fixture)

    expect(sessionStorage.getItem(USER_AGENDA_FILTERS_STORAGE_KEY)).toBeNull()
  })

  it('ignore une réponse agenda obsolète quand un filtre plus récent est appliqué', async () => {
    const TROUPE_B = 'a0000002-0000-4000-8000-000000000002'
    const filters: UserAgendaParticipationFilters = {
      troupes: [
        { id: TROUPE_A, name: 'La BIM', slug: 'la-bim' },
        { id: TROUPE_B, name: 'Autre troupe', slug: 'autre-troupe' },
      ],
      leagues: [
        { id: LEAGUE_A, title: 'Ligue 2026', slug: 'ligue-2026', troupeId: TROUPE_A },
      ],
    }

    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { filterBarVisible: true, participationFilters: filters }),
    })

    await settle(fixture)

    const itemA = agendaItem('event-a', 'Spectacle Troupe A', '2026-06-10T18:00:00Z', {
      troupeId: TROUPE_A,
      troupeName: 'La BIM',
    })
    const itemB = agendaItem('event-b', 'Spectacle Troupe B', '2026-06-11T18:00:00Z', {
      troupeId: TROUPE_B,
      troupeName: 'Autre troupe',
      troupeSlug: 'autre-troupe',
    })

    let resolveSlow: ((value: unknown) => void) | undefined
    agendaApi.listAgenda
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSlow = resolve
          }),
      )
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: agendaResponse([itemB], { filterBarVisible: true, participationFilters: filters }),
      })

    void fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_B)

    resolveSlow?.({
      ok: true,
      status: 200,
      data: agendaResponse([itemA], { filterBarVisible: true, participationFilters: filters }),
    })
    await settle(fixture)

    const text = fixture.nativeElement.textContent
    expect(text).toContain('Spectacle Troupe B')
    expect(text).not.toContain('Spectacle Troupe A')
  })

  it('ignore les UUID invalides dans l’URL', async () => {
    TestBed.resetTestingModule()
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([agendaItem('event-1', 'Show', '2026-06-01T18:00:00Z')]),
    })

    await TestBed.configureTestingModule({
      imports: [UserAgenda, NoopAnimationsModule],
      providers: [
        provideRouter(testRoutes),
        { provide: AuthApiService, useValue: auth },
        { provide: UserAgendaApiService, useValue: agendaApi },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                troupeId: 'not-a-uuid',
                leagueId: 'also-bad',
              }),
            },
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(UserAgenda)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith({ page: 0, size: 50, scope: 'upcoming' })
  })
})

function sampleParticipationFilters(): UserAgendaParticipationFilters {
  return {
    troupes: [{ id: TROUPE_A, name: 'La BIM', slug: 'la-bim' }],
    leagues: [
      { id: LEAGUE_A, title: 'Ligue 2026', slug: 'ligue-2026', troupeId: TROUPE_A },
      {
        id: 'b0000002-0000-4000-8000-000000000002',
        title: 'Autre ligue',
        slug: 'autre-ligue',
        troupeId: TROUPE_A,
      },
    ],
  }
}

function agendaResponse(
  content: UserAgendaItem[],
  overrides: Partial<UserAgendaResponse> = {},
): UserAgendaResponse {
  return {
    content,
    page: 0,
    size: 50,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    filterBarVisible: false,
    noParticipation: false,
    ...overrides,
  }
}

function agendaItem(
  eventId: string,
  title: string,
  startsAt: string,
  overrides: Partial<UserAgendaItem> = {},
): UserAgendaItem {
  return {
    eventId,
    eventSlug: overrides.eventSlug ?? eventId,
    title,
    startsAt,
    location: null,
    troupeId: 'troupe-1',
    troupeName: 'La BIM',
    troupeSlug: 'la-bim',
    leagueId: 'league-1',
    leagueSlug: 'ligue-2026',
    leagueTitle: 'Ligue 2026',
    myAvailabilityStatus: 'unknown',
    ...overrides,
  }
}
