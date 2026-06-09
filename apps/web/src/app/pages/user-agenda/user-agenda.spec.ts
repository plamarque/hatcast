import { By } from '@angular/platform-browser'
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

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { USER_AGENDA_FILTERS_STORAGE_KEY } from '../../core/agenda/user-agenda-filters-storage'
import {
  UserAgendaApiService,
  type UserAgendaItem,
  type UserAgendaParticipationFilters,
  type UserAgendaResponse,
} from '../../core/agenda/user-agenda-api.service'
import { getPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'
import { UserAgenda } from './user-agenda'

const TROUPE_A = 'a0000001-0000-4000-8000-000000000001'
const SEASON_A = 'b0000001-0000-4000-8000-000000000001'

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
  let getPreferences: ReturnType<typeof vi.fn>
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
    getPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Patrice', preferredRoleKeys: [], gender: 'female' },
    })

    await TestBed.configureTestingModule({
      imports: [UserAgenda, NoopAnimationsModule],
      providers: [
        provideRouter(testRoutes),
        { provide: AuthApiService, useValue: auth },
        { provide: UserAgendaApiService, useValue: agendaApi },
        { provide: MePreferencesApiService, useValue: { getPreferences, cacheRevision: () => 0 } },
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

  it('preloads viewer gender once and passes it to participation status cards', async () => {
    await settle(fixture)

    const cards = fixture.debugElement.queryAll(By.directive(AgendaParticipationStatus))
    expect(cards.length).toBe(2)
    expect(getPreferences).toHaveBeenCalledTimes(1)
    for (const card of cards) {
      expect(card.componentInstance.viewerGender()).toBe('female')
    }
  })

  it('n’affiche pas le raccourci Ma saison dans le header', async () => {
    await settle(fixture)
    expect(fixture.nativeElement.querySelector('app-member-season-shortcut')).toBeNull()
  })

  it('n’affiche pas les badges troupe et saison sur les cartes', async () => {
    await settle(fixture)

    expect(
      fixture.nativeElement.querySelector('a.agenda-card__badge--link[href="/troupes/la-bim"]'),
    ).toBeNull()
    expect(
      fixture.nativeElement.querySelector('a.agenda-card__badge--season[href="/saison/ligue-2026"]'),
    ).toBeNull()
  })

  it('affiche le badge composition quand teamStatusBadge est présent', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-prep', 'Cabaret préparation', '2026-06-15T19:30:00Z', {
          teamStatusBadge: {
            key: 'preparing',
            label: 'Équipe en préparation',
            tone: 'preparing',
            shortLabel: 'Préparation',
          },
        }),
      ]),
    })

    await settle(fixture)

    const badge = fixture.nativeElement.querySelector('.composition-status-badge--preparing')
    expect(badge).toBeTruthy()
    expect(badge.textContent?.trim()).toBe('Préparation')
  })

  it('affiche les événements groupés par mois avec le statut de disponibilité', async () => {
    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([
        agendaItem('event-jan', 'Cabaret de janvier', '2026-01-15T19:30:00Z', {
          location: 'Salle A',
          myAvailabilityStatus: 'available',
          troupeName: 'La BIM',
          seasonTitle: 'Festibask 2026',
        }),
        agendaItem('event-feb', 'Cabaret de février', '2026-02-02T20:00:00Z', {
          myAvailabilityStatus: null,
          troupeName: 'Les Improbots',
          seasonTitle: 'Matchs impro',
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
    expect(fixture.nativeElement.querySelector('.agenda-card__loc')).toBeNull()
    expect(text).not.toContain('La BIM')
    expect(text).not.toContain('Festibask 2026')
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
    expect(fixture.nativeElement.textContent).toContain('Rencontre partagée')
    expect(fixture.nativeElement.textContent).not.toContain('Troupe A')
    expect(fixture.nativeElement.textContent).not.toContain('Troupe B')
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
          seasonSlug: 'ligue-clavier',
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
          seasonSlug: 'ligue-espace',
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

    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('Tout effacer')
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

    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="agenda-troupe-filter"]')).toBeNull()

    agendaApi.listAgenda.mockClear()
    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ troupeId: TROUPE_A, scope: 'upcoming' }),
    )
  })

  it('appelle l’API avec seasonId et efface les filtres au reset', async () => {
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

    await fixture.componentInstance['onSeasonFilterChange'](SEASON_A)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ seasonId: SEASON_A }),
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
                seasonId: SEASON_A,
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
      expect.objectContaining({ troupeId: TROUPE_A, seasonId: SEASON_A }),
    )
  })

  it('restaure les filtres depuis sessionStorage et synchronise l’URL', async () => {
    TestBed.resetTestingModule()
    sessionStorage.setItem(
      USER_AGENDA_FILTERS_STORAGE_KEY,
      JSON.stringify({ troupeId: TROUPE_A, seasonId: null }),
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
        queryParams: { troupeId: TROUPE_A, seasonId: null },
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
    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).not.toBeNull()

    let resolveReload: ((value: unknown) => void) | undefined
    agendaApi.listAgenda.mockReturnValue(
      new Promise((resolve) => {
        resolveReload = resolve
      }),
    )

    void fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).not.toBeNull()

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

  it('efface seasonId quand la troupe change et invalide la saison', async () => {
    const TROUPE_B = 'a0000002-0000-4000-8000-000000000002'
    const SEASON_B = 'b0000002-0000-4000-8000-000000000003'
    const filters: UserAgendaParticipationFilters = {
      troupes: [
        { id: TROUPE_A, name: 'La BIM', slug: 'la-bim' },
        { id: TROUPE_B, name: 'Autre troupe', slug: 'autre-troupe' },
      ],
      seasons: [
        { id: SEASON_A, title: 'Saison A', slug: 'saison-a', troupeId: TROUPE_A },
        { id: SEASON_B, title: 'Saison B', slug: 'saison-b', troupeId: TROUPE_B },
      ],
    }

    agendaApi.listAgenda.mockResolvedValue({
      ok: true,
      status: 200,
      data: agendaResponse([], { filterBarVisible: true, participationFilters: filters }),
    })

    await settle(fixture)
    await fixture.componentInstance['onSeasonFilterChange'](SEASON_B)
    await settle(fixture)
    agendaApi.listAgenda.mockClear()

    await fixture.componentInstance['onTroupeFilterChange'](TROUPE_A)
    await settle(fixture)

    expect(agendaApi.listAgenda).toHaveBeenCalledWith(
      expect.objectContaining({ troupeId: TROUPE_A, seasonId: undefined }),
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
      seasons: [
        { id: SEASON_A, title: 'Festibask 2026', slug: 'ligue-2026', troupeId: TROUPE_A },
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
                seasonId: 'also-bad',
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
    seasons: [
      { id: SEASON_A, title: 'Festibask 2026', slug: 'ligue-2026', troupeId: TROUPE_A },
      {
        id: 'b0000002-0000-4000-8000-000000000002',
        title: 'Autre saison',
        slug: 'autre-saison',
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
    seasonId: 'league-1',
    seasonSlug: 'ligue-2026',
    seasonTitle: 'Festibask 2026',
    myAvailabilityStatus: 'unknown',
    ...overrides,
  }
}
