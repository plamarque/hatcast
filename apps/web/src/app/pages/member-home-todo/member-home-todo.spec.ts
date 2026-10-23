import { signal } from '@angular/core'
import { By } from '@angular/platform-browser'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserAgendaApiService, type UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
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
import { InboxFeedbackService } from '../../core/inbox/inbox-feedback.service'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-season-storage'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'
import { MemberHomeTodo } from './member-home-todo'
import { AgendaEventActionsService } from '../../shared/participation/agenda-event-actions.service'
import { AgendaEventCard } from '../../shared/participation/agenda-event-card'

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
  let listAgenda: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    localStorage.clear()
    listAgenda = vi.fn().mockResolvedValue({ ok: false, status: 503 })
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
        { provide: UserAgendaApiService, useValue: { listAgenda } },
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
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('affiche le titre Accueil', async () => {
    await settle(fixture)
    expect(fixture.nativeElement.textContent).toContain('Accueil')
    expect(inboxApi.getInbox).toHaveBeenCalledWith({ force: false })
  })

  it('affiche le titre sans accès rapides pendant le chargement inbox', async () => {
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
    expect(fixture.nativeElement.querySelector('[data-testid="todo-shortcut-troupes-list"]')).toBeNull()

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

    const skeleton = fixture.nativeElement.querySelector('[data-testid="todo-caught-up-region"]')
    expect(skeleton?.getAttribute('aria-hidden')).toBe('true')
    expect(skeleton?.querySelector('.member-home-todo__celebration--pending')).toBeTruthy()

    resolveBackground({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })
    await settle(fixture)
    expect(fixture.nativeElement.textContent).toContain('Tout est à jour')
  })

  describe('caught-up confirmation lifecycle', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200,
        data: inboxResponse([], agendaItem('next', 'Next show', isoInDays(2), 'available')) })
    })

    async function flush(): Promise<void> {
      fixture.detectChanges()
      await vi.advanceTimersByTimeAsync(0)
      fixture.detectChanges()
      await vi.advanceTimersByTimeAsync(0)
      fixture.detectChanges()
    }

    const region = () => fixture.nativeElement.querySelector('[data-testid="todo-caught-up-region"]') as HTMLElement | null

    it('holds, fades, collapses, then removes confirmation without replay on return', async () => {
      await flush()
      expect(region()).toBeTruthy()
      expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe('Tout est à jour')
      await vi.advanceTimersByTimeAsync(3000)
      fixture.detectChanges()
      expect(region()?.classList).toContain('member-home-todo__feedback--fading')
      await vi.advanceTimersByTimeAsync(220)
      fixture.detectChanges()
      expect(region()?.classList).toContain('member-home-todo__feedback--collapsing')
      await vi.advanceTimersByTimeAsync(280)
      fixture.detectChanges()
      expect(region()).toBeNull()
      fixture.destroy()
      inboxApi.peekFreshCache.mockReturnValue(inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))))
      fixture = TestBed.createComponent(MemberHomeTodo)
      await flush()
      expect(region()).toBeNull()
      expect(inboxApi.getInbox).toHaveBeenLastCalledWith({ force: true })
    })

    it('does not recreate a skeleton while revalidating unchanged empty data', async () => {
      await flush()
      fixture.destroy()
      inboxApi.peekFreshCache.mockReturnValue(inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))))
      let resolve!: (value: unknown) => void
      inboxApi.getInbox.mockReturnValue(new Promise(r => { resolve = r }))
      fixture = TestBed.createComponent(MemberHomeTodo)
      await flush()
      expect(region()).toBeNull()
      expect(fixture.nativeElement.querySelector('[data-testid="todo-next-event-card"]')).toBeTruthy()
      resolve({ ok: true, status: 200, data: inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))) })
      await flush()
      expect(region()).toBeNull()
    })

    it.each([0, 3000, 3220])('prioritizes new tasks at dismissal time %i and rearms confirmation', async time => {
      await flush()
      await vi.advanceTimersByTimeAsync(time)
      fixture.detectChanges()
      inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200,
        data: inboxResponse([availabilityAction('new', 'New task', isoInDays(2))]) })
      await fixture.componentInstance['loadInbox']()
      await flush()
      expect(region()).toBeNull()
      await vi.advanceTimersByTimeAsync(1000)
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('[data-testid="todo-action-dispo"]')).toBeTruthy()
      inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200,
        data: inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))) })
      await fixture.componentInstance['loadInbox']()
      await flush()
      expect(region()).toBeTruthy()
      expect(fixture.componentInstance['confirmationPhase']()).toBe('shown')
      await vi.advanceTimersByTimeAsync(2999)
      fixture.detectChanges()
      expect(fixture.componentInstance['confirmationPhase']()).toBe('shown')
    })

    it('does not celebrate an empty cache when revalidation fails', async () => {
      inboxApi.peekFreshCache.mockReturnValue(inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))))
      inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })
      await flush()
      expect(region()).toBeNull()
      expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe('')
      expect(TestBed.inject(InboxFeedbackService).confirmationPending()).toBe(true)
    })

    it('keeps the no-upcoming-event state and Mes troupes destination', async () => {
      inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([]) })
      await flush()
      await vi.advanceTimersByTimeAsync(10000)
      fixture.detectChanges()
      expect(region()).toBeTruthy()
      expect(region()?.textContent).toContain('Mes troupes')
      expect(region()?.classList).not.toContain('member-home-todo__feedback--fading')
    })

    it('dismisses without animated phases for reduced motion', async () => {
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
      await flush()
      await vi.advanceTimersByTimeAsync(3000)
      fixture.detectChanges()
      expect(region()).toBeNull()
      vi.unstubAllGlobals()
    })

    it('cleans dismissal timers when leaving the page', async () => {
      await flush()
      const instance = fixture.componentInstance
      fixture.destroy()
      await vi.advanceTimersByTimeAsync(10000)
      expect(instance['confirmationPhase']()).toBe('idle')
    })

    it('does not start inbox loading when destroyed during shell bootstrap', async () => {
      let resolve!: (value: unknown) => void
      memberBootstrap.ensureReady.mockReturnValue(new Promise(r => { resolve = r }))
      await flush()
      fixture.destroy()
      resolve({ ok: true })
      await vi.advanceTimersByTimeAsync(0)
      expect(inboxApi.getInbox).not.toHaveBeenCalled()
    })

    it('preserves acted actions through empty-cache revalidation and failure until confirmed', async () => {
      const key = 'availability_unknown|done|'
      sessionStorage.setItem('hatcast.todo.acted', JSON.stringify({ [key]: {
        verb: 'Donne ta dispo', title: 'Action terminée', confirm: false,
      } }))
      inboxApi.peekFreshCache.mockReturnValue(inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))))
      let resolve!: (value: unknown) => void
      inboxApi.getInbox.mockReturnValue(new Promise(r => { resolve = r }))
      await flush()
      expect(sessionStorage.getItem('hatcast.todo.acted')).toContain(key)
      expect(fixture.nativeElement.querySelector('.member-home-todo__action-card--done')).toBeNull()
      resolve({ ok: false, status: 500 })
      await flush()
      expect(sessionStorage.getItem('hatcast.todo.acted')).toContain(key)
      inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200,
        data: inboxResponse([], agendaItem('next', 'Next show', isoInDays(2))) })
      await fixture.componentInstance['loadInbox']()
      await flush()
      expect(fixture.nativeElement.querySelector('.member-home-todo__action-card--done')).toBeTruthy()
      expect(region()).toBeNull()
      await vi.advanceTimersByTimeAsync(1400)
      fixture.detectChanges()
      await vi.advanceTimersByTimeAsync(0)
      fixture.detectChanges()
      expect(fixture.componentInstance['confirmationPhase']()).toBe('shown')
      await vi.advanceTimersByTimeAsync(2999)
      fixture.detectChanges()
      expect(fixture.componentInstance['confirmationPhase']()).toBe('shown')
    })

    it('keeps the persistent empty-state link available through navigation and refresh failure', async () => {
      inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([]) })
      await flush()
      fixture.destroy()
      inboxApi.peekFreshCache.mockReturnValue(inboxResponse([]))
      let resolve!: (value: unknown) => void
      inboxApi.getInbox.mockReturnValue(new Promise(r => { resolve = r }))
      fixture = TestBed.createComponent(MemberHomeTodo)
      await flush()
      expect(region()?.hasAttribute('aria-hidden')).toBe(false)
      expect(region()?.hasAttribute('inert')).toBe(false)
      const link = region()?.querySelector('a') as HTMLAnchorElement
      expect(link.getAttribute('href')).toBe('/troupes')
      link.focus()
      expect(document.activeElement).toBe(link)
      resolve({ ok: false, status: 500 })
      await flush()
      expect(region()?.textContent).toContain('Mes troupes')
      expect(region()?.hasAttribute('aria-hidden')).toBe(false)
    })

    it('ignores late inbox results after the component is destroyed' , async () => {
      let resolve!: (value: unknown) => void
      inboxApi.getInbox.mockReturnValue(new Promise(r => { resolve = r }))
      await flush()
      const instance = fixture.componentInstance
      fixture.destroy()
      resolve({ ok: true, status: 200, data: inboxResponse([], agendaItem('late', 'Late show', isoInDays(2))) })
      await vi.advanceTimersByTimeAsync(0)
      expect(instance['nextEvent']()).toBeNull()
      expect(instance['confirmationPhase']()).toBe('idle')
    })
  })

  it('préserve l’erreur inbox sans accès rapides', async () => {
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 500 })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Impossible de charger')
    expect(fixture.nativeElement.querySelector('[data-testid="todo-shortcut-troupes-list"]')).toBeNull()
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

  it('affiche Tout est à jour sans accès rapides quand aucun événement', async () => {
    inboxApi.getInbox.mockResolvedValue({
      ok: true,
      status: 200,
      data: inboxResponse([]),
    })

    await settle(fixture)

    expect(fixture.nativeElement.textContent).toContain('Tout est à jour')
    expect(fixture.nativeElement.textContent).toContain('Rien ne te retient')
    expect(fixture.nativeElement.textContent).not.toContain('Accès rapides')
    expect(fixture.nativeElement.querySelector('.member-home-todo__celebration-icon')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="todo-shortcut-season-stats"]')).toBeFalsy()
  })

  it('n’affiche aucun accès rapide même avec une saison mémorisée', async () => {
    rememberLastVisitedSeasonSlug('ligue-2026', 'troupe-1')
    await settle(fixture)
    expect(fixture.nativeElement.textContent).not.toContain('Accès rapides')
    expect(fixture.nativeElement.querySelector('[data-testid^="todo-shortcut-"]')).toBeNull()
    expect(seasonResolver.resolveSeasonSlug).not.toHaveBeenCalled()
    expect(localStorage.getItem('lastVisitedSeason')).toBe('ligue-2026')
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

  it('loads upcoming cards without filters and keeps the agenda link', async () => {
    const first = agendaItem('first', 'Premier spectacle', isoInDays(2), 'available')
    const second = agendaItem('second', 'Deuxième spectacle', isoInDays(4), 'available')
    inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([], first) })
    listAgenda.mockResolvedValue({ ok: true, status: 200, data: { content: [first, second] } })
    await settle(fixture)
    expect(listAgenda).toHaveBeenCalledWith({ page: 0, size: 10, scope: 'upcoming' })
    const cards = fixture.nativeElement.querySelectorAll('[data-testid="todo-next-event-card"]')
    expect(cards.length).toBe(2)
    expect(cards[1].textContent).toContain('Deuxième spectacle')
    const link = fixture.nativeElement.querySelector('[data-testid="todo-upcoming-see-more"]')
    expect(link.textContent).toContain('Voir plus')
    expect(link.getAttribute('href')).toBe('/agenda')
    cards[1].querySelector('.agenda-card__clickable').click()
    expect(navigateSpy).toHaveBeenCalledWith(['/saison', second.troupeSlug, second.seasonSlug, 'event', second.eventSlug])
  })

  it('keeps only the first five chronological shows from the batch of ten', async () => {
    const content = Array.from({ length: 10 }, (_, index) =>
      agendaItem(`show-${index}`, `Show ${index}`, isoInDays(index + 1), 'available'))
    inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([], content[0]) })
    listAgenda.mockResolvedValue({ ok: true, status: 200, data: { content } })
    await settle(fixture)
    expect(fixture.componentInstance['upcomingEvents']().map(item => item.eventId)).toEqual(content.slice(0, 5).map(item => item.eventId))
    expect(fixture.nativeElement.querySelectorAll('[data-testid="todo-next-event-card"]').length).toBe(5)
    expect(fixture.nativeElement.textContent).not.toContain('Show 5')
    expect(fixture.nativeElement.querySelector('[data-testid="todo-upcoming-see-more"]')).toBeTruthy()
  })

  it('expands a usable cached inbox even when inbox revalidation fails', async () => {
    const content = Array.from({ length: 5 }, (_, index) =>
      agendaItem(`cached-${index}`, `Cached show ${index}`, isoInDays(index + 1), 'available'))
    inboxApi.peekFreshCache.mockReturnValue(inboxResponse([], content[0]))
    inboxApi.getInbox.mockResolvedValue({ ok: false, status: 503 })
    listAgenda.mockResolvedValue({ ok: true, status: 200, data: { content } })
    await settle(fixture)
    expect(fixture.componentInstance['upcomingEvents']().length).toBe(5)
    expect(fixture.nativeElement.querySelectorAll('[data-testid="todo-next-event-card"]').length).toBe(5)
  })

  it.each(['openAvailability', 'openParticipation'] as const)('preserves the later card while refreshing after %s', async action => {
    const content = Array.from({ length: 5 }, (_, index) =>
      agendaItem(`editable-${index}`, `Editable show ${index}`, isoInDays(index + 1), 'available'))
    inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([], content[0]) })
    listAgenda.mockResolvedValue({ ok: true, status: 200, data: { content } })
    await settle(fixture)
    let resolveAgenda!: (value: unknown) => void
    listAgenda.mockReturnValueOnce(new Promise(resolve => { resolveAgenda = resolve }))
    const updated: UserAgendaItem = action === 'openAvailability'
      ? { ...content[3], myAvailabilityStatus: 'unavailable' }
      : { ...content[3], participantFocus: { availabilityStatus: 'available', inTeam: true, compositionRoleKey: 'player', slotParticipationStatus: 'confirmed' } }
    const open = vi.spyOn(TestBed.inject(AgendaEventActionsService), action).mockResolvedValue({ kind: 'saved', item: updated })
    const fourth = fixture.debugElement.queryAll(By.directive(AgendaEventCard))[3]
    if (action === 'openAvailability') fourth.componentInstance.availabilityClick.emit()
    else fourth.componentInstance.participationClick.emit()
    await settle(fixture)
    expect(open.mock.calls[0][0].eventId).toBe(content[3].eventId)
    expect(fixture.componentInstance['upcomingEvents']().length).toBe(5)
    expect(fixture.componentInstance['upcomingEvents']()[3]).toMatchObject(updated)
    expect(fixture.debugElement.queryAll(By.directive(AgendaEventCard))[3].nativeElement).toBe(fourth.nativeElement)
    resolveAgenda({ ok: true, status: 200, data: { content: content.map(item => item.eventId === updated.eventId ? updated : item) } })
    await settle(fixture)
    expect(fixture.componentInstance['upcomingEvents']()[3]).toMatchObject(updated)
    expect(fixture.debugElement.queryAll(By.directive(AgendaEventCard))[3].nativeElement).toBe(fourth.nativeElement)
  })

  it('reconciles a successful empty agenda with the existing no-upcoming state', async () => {
    const first = agendaItem('gone', 'Removed show', isoInDays(2), 'available')
    inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([], first) })
    listAgenda.mockResolvedValue({ ok: true, status: 200, data: { content: [] } })
    await settle(fixture)
    expect(fixture.componentInstance['nextEvent']()).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="todo-next-event-card"]')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain("Rien ne te retient pour l'instant")
  })

  it('discards an older agenda response after an inbox refresh', async () => {
    let resolveOld!: (value: unknown) => void
    const first = agendaItem('old', 'Old show', isoInDays(2), 'available')
    const second = agendaItem('fresh', 'Fresh show', isoInDays(3), 'available')
    listAgenda.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve }))
    inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([], first) })
    await settle(fixture)
    inboxApi.getInbox.mockResolvedValue({ ok: true, status: 200, data: inboxResponse([], second) })
    await fixture.componentInstance['loadInbox']()
    resolveOld({ ok: true, status: 200, data: { content: [first] } })
    await settle(fixture)
    expect(fixture.componentInstance['upcomingEvents']().map(item => item.eventId)).toEqual(['fresh'])
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
  it.each(['openAvailability', 'openParticipation'] as const)('refreshes only after a saved %s action', async action => {
    await settle(fixture)
    const service = TestBed.inject(AgendaEventActionsService)
    const open = vi.spyOn(service, action).mockResolvedValue(false)
    const reload = vi.spyOn(fixture.componentInstance as any, 'loadInbox').mockResolvedValue(undefined)
    const item = agendaItem('edited', 'Edited event', '2030-01-01T18:00:00Z')
    await (fixture.componentInstance as any)[action](item)
    expect(reload).not.toHaveBeenCalled()
    open.mockResolvedValue({ kind: 'saved', item: { ...item, myAvailabilityStatus: 'available' } })
    await (fixture.componentInstance as any)[action](item)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(navigateSpy).not.toHaveBeenCalledWith(expect.arrayContaining(['saison']))
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
