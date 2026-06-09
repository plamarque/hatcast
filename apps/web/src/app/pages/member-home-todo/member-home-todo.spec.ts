import { signal } from '@angular/core'
import { By } from '@angular/platform-browser'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { MemberShellBootstrapService } from '../../core/member-shell/member-shell-bootstrap.service'
import type { UserSummary } from '../../core/auth/auth-api.service'
import {
  MeInboxApiService,
  type InboxAction,
  type MeInboxResponse,
} from '../../core/inbox/me-inbox-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-season-storage'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'
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
  let inboxApi: {
    getInbox: ReturnType<typeof vi.fn>
    peekFreshCache: ReturnType<typeof vi.fn>
  }
  let auth: {
    sessionUser: ReturnType<typeof signal<UserSummary | null>>
    ensureHatcastSession: ReturnType<typeof vi.fn>
  }
  let memberBootstrap: { ensureReady: ReturnType<typeof vi.fn> }
  let getPreferences: ReturnType<typeof vi.fn>
  let router: Router
  let navigateByUrlSpy: ReturnType<typeof vi.fn>
  let navigateSpy: ReturnType<typeof vi.fn>
  let snack: { open: ReturnType<typeof vi.fn> }
  let seasonResolver: { resolveSeasonSlug: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    localStorage.clear()
    seasonResolver = {
      resolveSeasonSlug: vi.fn().mockResolvedValue({ kind: 'not-found' }),
    }
    inboxApi = {
      getInbox: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: inboxResponse([]),
      }),
      peekFreshCache: vi.fn().mockReturnValue(null),
    }
    const sessionUser = signal<UserSummary | null>({
      id: 'user-1',
      slug: 'patrice',
      email: 'patrice@example.com',
      displayName: 'Patrice',
      avatarUrl: null,
    })
    auth = {
      sessionUser,
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          user: sessionUser(),
          platformAdmin: false,
        },
      }),
    }
    memberBootstrap = {
      ensureReady: vi.fn().mockResolvedValue({ ok: true }),
    }
    snack = { open: vi.fn() }
    getPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Patrice', preferredRoleKeys: [], gender: 'female' },
    })

    await TestBed.configureTestingModule({
      imports: [MemberHomeTodo, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthApiService, useValue: auth },
        { provide: MemberShellBootstrapService, useValue: memberBootstrap },
        { provide: MeInboxApiService, useValue: inboxApi },
        {
          provide: MePreferencesApiService,
          useValue: { getPreferences, cacheRevision: () => 0 },
        },
        { provide: TroupeSeasonResolverService, useValue: seasonResolver },
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
    expect(inboxApi.getInbox).toHaveBeenCalledWith({ force: false })
  })

  it('affiche le titre et les accès rapides avant la fin du chargement inbox', async () => {
    let resolveInbox!: (value: unknown) => void
    const inboxDeferred = new Promise((resolve) => {
      resolveInbox = resolve
    })
    inboxApi.getInbox.mockReturnValue(inboxDeferred)

    fixture.detectChanges()
    for (let i = 0; i < 15; i++) {
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (!fixture.componentInstance['loadingSession']()) {
        break
      }
    }
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Accueil')
    expect(fixture.componentInstance['loadingInbox']()).toBe(true)
    expect(fixture.nativeElement.querySelector('[data-testid="todo-actions-skeleton"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="todo-shortcut-troupes-list"]')).toBeTruthy()

    resolveInbox({ ok: true, status: 200, data: inboxResponse([]) })
    await settle(fixture)
  })

  it('affiche le cache inbox puis rafraîchit en arrière-plan', async () => {
    const stale = inboxResponse([availabilityAction('stale', 'Spectacle en cache', isoInDays(2))])
    const fresh = inboxResponse([availabilityAction('fresh', 'Spectacle à jour', isoInDays(2))])
    inboxApi.peekFreshCache.mockReturnValue(stale)

    let resolveBackground!: (value: unknown) => void
    inboxApi.getInbox.mockReturnValue(
      new Promise((resolve) => {
        resolveBackground = resolve
      }),
    )

    fixture.detectChanges()
    for (let i = 0; i < 15; i++) {
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (!fixture.componentInstance['loadingSession']()) {
        break
      }
    }
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Spectacle en cache')
    expect(inboxApi.getInbox).toHaveBeenCalledWith({ force: true })

    resolveBackground({ ok: true, status: 200, data: fresh })
    await settle(fixture)
    expect(fixture.nativeElement.textContent).toContain('Spectacle à jour')
  })

  it('conserve le cache inbox quand le refresh background échoue', async () => {
    const stale = inboxResponse([availabilityAction('stale', 'Spectacle en cache', isoInDays(2))])
    inboxApi.peekFreshCache.mockReturnValue(stale)
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Spectacle en cache')
    expect(fixture.nativeElement.textContent).not.toContain('Impossible de charger')
  })

  it('ne masque pas le badge quand le refresh background échoue', async () => {
    const stale = inboxResponse([availabilityAction('stale', 'Spectacle en cache', isoInDays(2))])
    inboxApi.peekFreshCache.mockReturnValue(stale)

    const badge = TestBed.inject(MemberInboxBadgeService)
    inboxApi.getInbox.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: stale,
    })
    await badge.refresh()
    expect(badge.pendingActionCount()).toBe(1)

    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })
    fixture = TestBed.createComponent(MemberHomeTodo)
    await settle(fixture)

    expect(badge.pendingActionCount()).toBe(1)
    expect(fixture.nativeElement.textContent).toContain('Spectacle en cache')
  })

  it('n’affiche pas « Tout est à jour » pendant la revalidation SWR', async () => {
    inboxApi.peekFreshCache.mockReturnValue(inboxResponse([]))

    let resolveBackground!: (value: unknown) => void
    inboxApi.getInbox.mockReturnValue(
      new Promise((resolve) => {
        resolveBackground = resolve
      }),
    )

    fixture.detectChanges()
    for (let i = 0; i < 15; i++) {
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
      if (!fixture.componentInstance['loadingSession']()) {
        break
      }
    }
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).not.toContain('Tout est à jour')

    resolveBackground({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })
    await settle(fixture)
    expect(fixture.nativeElement.textContent).toContain('Tout est à jour')
  })

  it('affiche les accès rapides même en erreur de chargement inbox', async () => {
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Impossible de charger')
    expect(fixture.nativeElement.querySelector('[data-testid="todo-shortcut-troupes-list"]')).toBeTruthy()
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

    const rows = fixture.nativeElement.querySelectorAll('.member-home-todo__action-card')
    expect(rows.length).toBe(2)
    expect(fixture.nativeElement.textContent).toContain('Donne ta dispo')
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

    expect(fixture.nativeElement.querySelectorAll('.member-home-todo__action-card').length).toBe(5)
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
    expect(fixture.nativeElement.textContent).toContain('Tu es à jour pour tes spectacles')
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

    expect(fixture.nativeElement.textContent).toContain('Confirme ta présence')
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

  it('affiche le rôle sur la ligne titre pour une confirmation, sans ligne date/troupe', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([
        confirmAction('ev-c', 'Apérock Juin', isoInDays(3), 'player', 'Comédien·ne'),
      ]),
    })

    await settle(fixture)

    const card = fixture.nativeElement.querySelector(
      '[data-testid="todo-action-confirm"]',
    ) as HTMLButtonElement
    expect(card.textContent).toContain('Apérock Juin')
    expect(card.textContent).toContain('Comédien·ne')
    expect(card.textContent).not.toContain('La BIM')
    expect(card.querySelector('.member-home-todo__date-chip')?.textContent).toContain('Dans 3 j')
    expect(card.getAttribute('aria-label')).toContain('Comédien·ne')
    expect(card.getAttribute('aria-label')).toContain('Dans 3 j')
  })

  it('affiche un badge daté « Dans 3 j » pour une action dispo dans les 7 jours', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([availabilityAction('soon', 'Cabaret urgent', isoInDays(3))]),
    })

    await settle(fixture)

    expect(fixture.nativeElement.querySelector('.member-home-todo__date-chip')?.textContent).toContain(
      'Dans 3 j',
    )
  })

  it('rejoue une carte cochée (ghost) au retour quand une action a été résolue', async () => {
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

    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })
    await fixture.componentInstance['loadInbox']()
    fixture.detectChanges()

    const ghost = fixture.nativeElement.querySelector(
      '.member-home-todo__action-card--done',
    ) as HTMLElement
    expect(ghost).toBeTruthy()
    expect(ghost.textContent).toContain('noté')
    expect(fixture.nativeElement.querySelector('.member-home-todo__check--checked')).toBeTruthy()
    expect(fixture.nativeElement.textContent).not.toContain('Tout est à jour')

    fixture.destroy()
  })

  it('affiche le CTA Mes troupes sans Mon agenda quand tout est à jour sans événement', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Tout est à jour')
    expect(fixture.nativeElement.textContent).toContain('Rien ne te retient')
    expect(fixture.nativeElement.textContent).toContain('Toutes mes troupes')
    expect(fixture.nativeElement.querySelector('.member-home-todo__celebration-icon')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="todo-shortcut-season-stats"]')).toBeFalsy()
  })

  it('met en avant Ma saison et les raccourcis contextuels quand une saison est mémorisée', async () => {
    rememberLastVisitedSeasonSlug('ligue-2026', 'troupe-1')
    seasonResolver.resolveSeasonSlug.mockResolvedValue({
      kind: 'resolved',
      troupe: { id: 'troupe-1', name: 'La Malice', slug: 'la-malice' },
      season: {
        id: 'league-1',
        slug: 'ligue-2026',
        title: 'Malice 2025-2026',
      } as SeasonResponse,
    })
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })

    await settle(fixture)

    const seasonLink = fixture.nativeElement.querySelector(
      '[data-testid="todo-shortcut-season"]',
    ) as HTMLAnchorElement
    expect(seasonLink.textContent).toContain('Ma saison')
    expect(seasonLink.textContent).toContain('Malice 2025-2026')
    expect(seasonLink.getAttribute('href')).toContain('/saison/la-malice/ligue-2026')

    const statsLink = fixture.nativeElement.querySelector(
      '[data-testid="todo-shortcut-season-stats"]',
    ) as HTMLAnchorElement
    expect(statsLink.textContent).toContain('Stats · Malice 2025-2026')
    expect(statsLink.getAttribute('href')).toContain('/saison/la-malice/ligue-2026')
    expect(statsLink.getAttribute('href')).toContain('view=stats')

    const troupeLink = fixture.nativeElement.querySelector(
      '[data-testid="todo-shortcut-troupe"]',
    ) as HTMLAnchorElement
    expect(troupeLink.textContent).toContain('La Malice')
    expect(troupeLink.getAttribute('href')).toContain('/troupes/la-malice')
  })

  it('redirige vers connexion quand la session est absente', async () => {
    memberBootstrap.ensureReady.mockResolvedValue({ ok: false, status: 401 })
    auth.sessionUser.set(null)

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
    expect(inboxApi.getInbox).toHaveBeenLastCalledWith({ force: true })
    expect(fixture.nativeElement.textContent).toContain('Retour hub')
  })

  it('affiche description et lieu sur la carte prochain spectacle sans chips troupe/saison', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse(
        [],
        agendaItem('detail-ev', 'Apérock Juin', isoInDays(2), 'available', {
          description: 'Soirée détente après le match',
          location: 'La Malice, Lyon',
        }),
      ),
    })

    await settle(fixture)

    const card = fixture.nativeElement.querySelector('[data-testid="todo-next-event-card"]')
    expect(card?.textContent).toContain('Soirée détente')
    expect(card?.textContent).toContain('La Malice, Lyon')
    expect(card?.querySelector('.agenda-card__badge--meta')).toBeFalsy()
    expect(card?.querySelector('.agenda-card__badge--season')).toBeFalsy()
    expect(card?.querySelector('.agenda-card__meta-loc mat-icon')).toBeTruthy()
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
    expect(card?.querySelector('app-agenda-participation-status')).toBeTruthy()
    expect(card?.querySelector('.agenda-card__loc')).toBeFalsy()
  })

  it('preloads viewer gender once for the next-event participation status card', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([], agendaItem('soon', 'Le prochain', isoInDays(2), 'available')),
    })

    await settle(fixture)

    const card = fixture.debugElement.query(By.directive(AgendaParticipationStatus))
    expect(card).toBeTruthy()
    expect(getPreferences).toHaveBeenCalledTimes(1)
    expect(card.componentInstance.viewerGender()).toBe('female')
  })

  it('ouvre le prochain spectacle au clic sur la zone cliquable', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([], agendaItem('next-click', 'Cabaret accueil', isoInDays(2), 'available')),
    })

    await settle(fixture)

    const clickable = fixture.nativeElement.querySelector(
      '[data-testid="todo-next-event-card"] .agenda-card__clickable',
    ) as HTMLElement
    clickable.click()
    await fixture.whenStable()

    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'la-bim', 'ligue-2026', 'event', 'next-click'])
  })

  it('affiche le rôle et la confirmation en attente via participantFocus', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse(
        [],
        agendaItem('composed', 'Gala composé', isoInDays(4), 'available', {
          participantFocus: {
            availabilityStatus: 'available',
            compositionRoleKey: 'player',
            inTeam: true,
            slotParticipationStatus: 'pending',
          },
        }),
      ),
    })

    await settle(fixture)

    const statusCell = fixture.nativeElement.querySelector(
      '[data-testid="todo-next-event-card"] app-participation-event-cell',
    )
    expect(statusCell?.textContent).toContain('Comédien')
  })

  it('ouvre le prochain spectacle au clavier Enter/Space', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([], agendaItem('next-key', 'Cabaret clavier', isoInDays(3), 'unknown')),
    })

    await settle(fixture)

    const clickable = fixture.nativeElement.querySelector(
      '[data-testid="todo-next-event-card"] .agenda-card__clickable',
    ) as HTMLElement

    clickable.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'la-bim', 'ligue-2026', 'event', 'next-key'])

    navigateSpy.mockClear()
    clickable.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'la-bim', 'ligue-2026', 'event', 'next-key'])
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

    const verbs = Array.from(
      fixture.nativeElement.querySelectorAll('.member-home-todo__action-verb'),
      (el) => (el as HTMLElement).textContent ?? '',
    )
    expect(verbs[0]).toContain('Confirme ta présence')
    expect(verbs[1]).toContain('Donne ta dispo')
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
      lastSeasonSlug: nextEvent?.seasonSlug ?? null,
      seasonGlanceQuery: nextEvent
        ? { troupeId: nextEvent.troupeId, seasonId: nextEvent.seasonId }
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
    seasonSlug: 'ligue-2026',
    title,
    startsAt,
    location: null,
    troupeId: 'troupe-1',
    troupeName: 'La BIM',
    troupeSlug: 'la-bim',
    seasonId: 'league-1',
    seasonTitle: 'Ligue 2026',
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
  overrides: Partial<UserAgendaItem> = {},
): UserAgendaItem {
  return {
    eventId,
    eventSlug: eventId,
    title,
    startsAt,
    location: null,
    troupeId: overrides.troupeId ?? 'troupe-1',
    troupeName: 'La BIM',
    troupeSlug: 'la-bim',
    seasonId: overrides.seasonId ?? 'league-1',
    seasonSlug: 'ligue-2026',
    seasonTitle: 'Ligue 2026',
    myAvailabilityStatus,
    ...overrides,
  }
}
