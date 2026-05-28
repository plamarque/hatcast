import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  MeInboxApiService,
  type InboxAction,
  type MeInboxResponse,
} from '../../core/inbox/me-inbox-api.service'
import { MemberHomeTodo } from './member-home-todo'

async function settle(fixture: ComponentFixture<MemberHomeTodo>): Promise<void> {
  fixture.detectChanges()
  for (let i = 0; i < 25; i++) {
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (!fixture.componentInstance['loadingSession']() && !fixture.componentInstance['loadingInbox']()) {
      break
    }
  }
  fixture.detectChanges()
}

describe('MemberHomeTodo', () => {
  let fixture: ComponentFixture<MemberHomeTodo>
  let inboxApi: { getInbox: ReturnType<typeof vi.fn> }
  let auth: { ensureHatcastSession: ReturnType<typeof vi.fn> }
  let router: Router
  let navigateByUrlSpy: ReturnType<typeof vi.fn>
  let navigateSpy: ReturnType<typeof vi.fn>
  let snack: { open: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    localStorage.clear()
    inboxApi = {
      getInbox: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: inboxResponse([]),
      }),
    }
    auth = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          user: {
            id: 'user-1',
            slug: 'patrice',
            email: 'patrice@example.com',
            displayName: 'Patrice',
            avatarUrl: null,
          },
          platformAdmin: false,
        },
      }),
    }
    snack = { open: vi.fn() }

    await TestBed.configureTestingModule({
      imports: [MemberHomeTodo, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthApiService, useValue: auth },
        { provide: MeInboxApiService, useValue: inboxApi },
        { provide: MatSnackBar, useValue: snack },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatSnackBar, { useValue: snack })

    router = TestBed.inject(Router)
    navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true)
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    fixture = TestBed.createComponent(MemberHomeTodo)
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('affiche le titre Accueil', async () => {
    await settle(fixture)
    expect(fixture.nativeElement.textContent).toContain('Accueil')
    expect(inboxApi.getInbox).toHaveBeenCalled()
  })

  it('affiche deux lignes d’action pour deux dispos unknown', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([
        availabilityAction('a', 'Match A', isoInDays(3)),
        availabilityAction('b', 'Match B', isoInDays(10)),
      ]),
    })

    await settle(fixture)

    const rows = fixture.nativeElement.querySelectorAll('.member-home-todo__action-item')
    expect(rows.length).toBe(2)
    expect(fixture.nativeElement.textContent).toContain('Indiquer ta dispo')
    expect(fixture.nativeElement.textContent).toContain('Match A')
  })

  it('limite à 5 actions et propose Voir tout dans l’agenda', async () => {
    const actions = Array.from({ length: 6 }, (_, i) =>
      availabilityAction(`ev-${i}`, `Show ${i}`, isoInDays(i + 1)),
    )
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse(actions),
    })

    await settle(fixture)

    expect(fixture.nativeElement.querySelectorAll('.member-home-todo__action-item').length).toBe(5)
    expect(fixture.nativeElement.querySelector('[data-testid="todo-see-all-agenda"]')).toBeTruthy()
  })

  it('masque la section Actions quand aucune action inbox', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse(
        [],
        agendaItem('ok', 'Déjà répondu', isoInDays(5), 'available'),
      ),
    })

    await settle(fixture)

    expect(fixture.nativeElement.querySelector('#todo-actions-heading')).toBeFalsy()
    expect(fixture.nativeElement.textContent).toContain('Tout est à jour')
    expect(fixture.nativeElement.querySelector('[data-testid="todo-next-event-card"]')).toBeTruthy()
  })

  it('affiche l’empty noParticipation', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([], null, { noParticipation: true }),
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Rien en attente pour l')
    expect(fixture.nativeElement.textContent).toContain('troupe de démonstration')
    expect(fixture.nativeElement.textContent).toContain('Rejoindre la troupe de démonstration')
    expect(fixture.nativeElement.textContent).toContain('Découvrir les troupes')
  })

  it('navigue via deepLink dispos au tap action disponibilité', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([availabilityAction('ev-1', 'Cabaret', isoInDays(4))]),
    })

    await settle(fixture)

    const row = fixture.nativeElement.querySelector(
      '[data-testid="todo-action-dispo"]',
    ) as HTMLButtonElement
    row.click()
    await fixture.whenStable()

    expect(navigateByUrlSpy).toHaveBeenCalledWith(
      '/saison/ligue-2026/event/ev-1?tab=dispos',
    )
  })

  it('affiche la ligne confirmation et navigue avec showConfirm', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([
        confirmAction('ev-c', 'Gala', isoInDays(5), 'player', 'Comédien·ne'),
      ]),
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Confirmer ta participation')
    expect(fixture.nativeElement.textContent).toContain('Comédien·ne')

    const row = fixture.nativeElement.querySelector(
      '[data-testid="todo-action-confirm"]',
    ) as HTMLButtonElement
    row.click()
    await fixture.whenStable()

    expect(navigateByUrlSpy).toHaveBeenCalledWith(
      '/saison/ligue-2026/event/ev-c?showConfirm=true',
    )
  })

  it('affiche le badge Bientôt pour une action dispo dans les 7 jours', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([availabilityAction('soon', 'Cabaret urgent', isoInDays(3))]),
    })

    await settle(fixture)

    expect(fixture.nativeElement.querySelector('.member-home-todo__soon-chip')?.textContent).toContain(
      'Bientôt',
    )
  })

  it('affiche le CTA Mes troupes sans Mon agenda quand tout est à jour sans événement', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Tout est à jour')
    expect(fixture.nativeElement.textContent).toContain('Aucun spectacle à venir')
    expect(fixture.nativeElement.textContent).toContain('Mes troupes')
    const shortcuts = fixture.nativeElement.querySelector('.member-home-todo__shortcuts')
    expect(shortcuts?.querySelector('app-member-agenda-shortcut')).toBeNull()
    expect(shortcuts?.textContent).not.toContain("Saison en un clin d'œil")
  })

  it('redirige vers connexion quand la session est absente', async () => {
    auth.ensureHatcastSession.mockResolvedValue({ ok: false, status: 401 })

    await settle(fixture)

    expect(snack.open).toHaveBeenCalledWith(
      'Votre session a expiré ou vous n’êtes pas connecté.',
      'OK',
      { duration: 6000 },
    )
    expect(navigateSpy).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
    expect(inboxApi.getInbox).not.toHaveBeenCalled()
  })

  it('redirige vers connexion quand le chargement inbox retourne 401', async () => {
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 401 })

    await settle(fixture)

    expect(navigateSpy).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })

  it('affiche une erreur retryable et recharge au clic', async () => {
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Impossible de charger')
    const retry = fixture.nativeElement.querySelector(
      '[data-testid="todo-retry"]',
    ) as HTMLButtonElement
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse(
        [],
        agendaItem('ok', 'Retour hub', isoInDays(5), 'available'),
      ),
    })
    retry.click()
    await settle(fixture)

    expect(inboxApi.getInbox).toHaveBeenCalledTimes(2)
    expect(fixture.nativeElement.textContent).toContain('Retour hub')
  })

  it('affiche la carte prochain spectacle depuis nextEvent inbox', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([], agendaItem('soon', 'Le prochain', isoInDays(2), 'available')),
    })

    await settle(fixture)

    const card = fixture.nativeElement.querySelector('[data-testid="todo-next-event-card"]')
    expect(card?.textContent).toContain('Le prochain')
  })

  it('affiche confirm avant dispo quand le tri serveur le fournit', async () => {
    const startsAt = isoInDays(4)
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([
        confirmAction('same', 'Spectacle', startsAt, 'player', 'Comédien·ne'),
        availabilityAction('same', 'Spectacle', startsAt),
      ]),
    })

    await settle(fixture)

    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('.member-home-todo__action-title'),
      (el) => (el as HTMLElement).textContent ?? '',
    )
    expect(titles[0]).toContain('Confirmer ta participation')
    expect(titles[1]).toContain('Indiquer ta dispo')
  })
})

function inboxResponse(
  actions: InboxAction[],
  nextEvent: UserAgendaItem | null = null,
  overrides: Partial<MeInboxResponse> = {},
): MeInboxResponse {
  return {
    actions,
    nextEvent,
    shortcuts: {
      lastSeasonSlug: nextEvent?.leagueSlug ?? null,
      seasonGlanceQuery: nextEvent
        ? { troupeId: nextEvent.troupeId, leagueId: nextEvent.leagueId }
        : {},
    },
    noParticipation: false,
    ...overrides,
  }
}

function isoInDays(days: number): string {
  const d = new Date()
  d.setHours(18, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function availabilityAction(
  eventId: string,
  title: string,
  startsAt: string,
): InboxAction {
  return {
    type: 'availability_unknown',
    eventId,
    eventSlug: eventId,
    leagueSlug: 'ligue-2026',
    title,
    startsAt,
    location: null,
    troupeId: 'troupe-1',
    troupeName: 'La BIM',
    troupeSlug: 'la-bim',
    leagueId: 'league-1',
    leagueTitle: 'Ligue 2026',
    deepLink: `/saison/ligue-2026/event/${eventId}?tab=dispos`,
  }
}

function confirmAction(
  eventId: string,
  title: string,
  startsAt: string,
  roleKey: string,
  roleLabel: string,
): InboxAction {
  return {
    ...availabilityAction(eventId, title, startsAt),
    type: 'composition_confirm_pending',
    roleKey,
    roleLabel,
    deepLink: `/saison/ligue-2026/event/${eventId}?showConfirm=true`,
  }
}

function agendaItem(
  eventId: string,
  title: string,
  startsAt: string,
  myAvailabilityStatus: UserAgendaItem['myAvailabilityStatus'] = 'unknown',
  ids: { troupeId?: string; leagueId?: string } = {},
): UserAgendaItem {
  return {
    eventId,
    eventSlug: eventId,
    title,
    startsAt,
    location: null,
    troupeId: ids.troupeId ?? 'troupe-1',
    troupeName: 'La BIM',
    troupeSlug: 'la-bim',
    leagueId: ids.leagueId ?? 'league-1',
    leagueSlug: 'ligue-2026',
    leagueTitle: 'Ligue 2026',
    myAvailabilityStatus,
  }
}
