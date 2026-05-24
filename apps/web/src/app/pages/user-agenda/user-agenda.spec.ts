import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  UserAgendaApiService,
  type UserAgendaItem,
  type UserAgendaResponse,
} from '../../core/agenda/user-agenda-api.service'
import { UserAgenda } from './user-agenda'

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
        provideRouter([]),
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
    vi.restoreAllMocks()
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
          troupeName: 'La Malice',
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
    expect(text).toContain("Tu n'es inscrit·e à aucune ligue pour l'instant.")
    expect(text).toContain('Découvrir les troupes')
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

    await settle(fixture)

    expect(snack.open).toHaveBeenCalledWith(
      'Votre session a expiré ou vous n’êtes pas connecté.',
      'OK',
      { duration: 6000 },
    )
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

    const card = fixture.nativeElement.querySelector('.agenda-card') as HTMLElement
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(navigateSpy).toHaveBeenCalledWith([
      '/saison',
      'ligue-clavier',
      'event',
      'event-keyboard',
    ])
  })
})

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
