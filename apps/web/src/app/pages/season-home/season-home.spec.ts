import { ComponentFixture, TestBed } from '@angular/core/testing'
import { WritableSignal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { OrganizerApiService, type MySeasonPermissions } from '../../core/permissions/organizer-api.service'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { SeasonStatisticsApiService } from '../../core/seasons/season-statistics-api.service'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { AGENDA_UPCOMING_CAP } from './season-events.utils'
import { SeasonHome } from './season-home'
import { SeasonFormDialog } from '../seasons-list/season-form-dialog'
import { emptyRoleSlots } from '../../core/events/event-types'

type SeasonHomeHarness = {
  loadingEvents: WritableSignal<boolean>
  loadingSession: WritableSignal<boolean>
  eventsTruncated: WritableSignal<boolean>
  eventLoadLimit: WritableSignal<number>
  selectedEventIds: WritableSignal<string[]>
  season: WritableSignal<SeasonResponse | null>
  seasonPermissions: WritableSignal<MySeasonPermissions | null>
  openEvent(eventId: string): void
  loadMoreEvents(): void
  resetStaleEventFilter(events: EventResponse[]): void
}

function ev(id: string): EventResponse {
  return {
    id,
    seasonId: 'season-1',
    slug: id,
    title: `Spectacle ${id}`,
    description: null,
    location: null,
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
  }
}

describe('SeasonHome', () => {
  let fixture: ComponentFixture<SeasonHome>
  let router: { navigate: ReturnType<typeof vi.fn> }
  let dialog: { open: ReturnType<typeof vi.fn> }
  let snack: { open: ReturnType<typeof vi.fn> }
  let organizerApi: { mySeasonPermissions: ReturnType<typeof vi.fn> }
  let participantApi: { listSeasonParticipantSelectors: ReturnType<typeof vi.fn> }
  let authApi: { ensureHatcastSession: ReturnType<typeof vi.fn> }
  let troupeApi: {
    listMyTroupes: ReturnType<typeof vi.fn>
    listCategories: ReturnType<typeof vi.fn>
  }
  let seasonsApi: { getSeasonBySlug: ReturnType<typeof vi.fn>; getSeason: ReturnType<typeof vi.fn> }
  let eventsApi: { listEvents: ReturnType<typeof vi.fn> }
  let statisticsApi: { loadStatistics: ReturnType<typeof vi.fn> }
  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'season-a' }))
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}))

  afterEach(() => {
    localStorage.clear()
  })

  beforeEach(async () => {
    localStorage.clear()
    paramMap$.next(convertToParamMap({ slug: 'season-a' }))
    router = { navigate: vi.fn() }
    dialog = { open: vi.fn() }
    snack = { open: vi.fn() }
    authApi = {
      ensureHatcastSession: vi.fn().mockResolvedValue({
        ok: true,
        data: { user: { email: 'a@example.com', displayName: 'Admin' } },
      }),
    }
    troupeApi = {
      listMyTroupes: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: [troupe('troupe-1'), troupe('troupe-2')],
      }),
      listCategories: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    }
    seasonsApi = {
      getSeasonBySlug: vi.fn().mockResolvedValue({ ok: true, status: 200, data: season('season-1', 'troupe-1') }),
      getSeason: vi.fn(),
    }
    eventsApi = {
      listEvents: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0 },
      }),
    }
    statisticsApi = {
      loadStatistics: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: { participants: [], monthKeys: [], events: [], rows: [] },
      }),
    }
    organizerApi = {
      mySeasonPermissions: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: {
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
      }),
    }
    participantApi = {
      listSeasonParticipantSelectors: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: [{ id: 'p-1', displayName: 'Alice', avatarUrl: null, kind: 'MEMBER' }],
      }),
    }

    await TestBed.configureTestingModule({
      imports: [SeasonHome],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: {
          paramMap: paramMap$.asObservable(),
          queryParamMap: queryParamMap$.asObservable(),
          snapshot: { queryParamMap: convertToParamMap({}) },
        } },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snack },
        { provide: AuthApiService, useValue: authApi },
        { provide: SeasonApiService, useValue: seasonsApi },
        { provide: EventApiService, useValue: eventsApi },
        { provide: TroupeApiService, useValue: troupeApi },
        { provide: OrganizerApiService, useValue: organizerApi },
        { provide: ParticipantApiService, useValue: participantApi },
        { provide: SeasonStatisticsApiService, useValue: statisticsApi },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatSnackBar, { useValue: snack })
    TestBed.overrideProvider(MatDialog, { useValue: dialog })

    fixture = TestBed.createComponent(SeasonHome)
  })

  it('navigates cards to the event detail route for the current slug', () => {
    const component = fixture.componentInstance as unknown as SeasonHomeHarness

    component.openEvent('event-1')

    expect(router.navigate).toHaveBeenCalledWith(['/saison', 'season-a', 'event', 'event-1'])
  })

  it('redirects legacy event_details modal query to event detail route', async () => {
    queryParamMap$.next(
      convertToParamMap({ event: 'event-legacy', modal: 'event_details', tab: 'dispos' }),
    )
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(
        ['/saison', 'season-a', 'event', 'event-legacy'],
        expect.objectContaining({
          queryParams: { tab: 'dispos' },
          replaceUrl: true,
        }),
      )
    })
  })

  it('does not request more events while a load is already running', () => {
    const component = fixture.componentInstance as unknown as SeasonHomeHarness

    component.loadingEvents.set(true)
    component.eventsTruncated.set(true)
    component.eventLoadLimit.set(AGENDA_UPCOMING_CAP)
    component.loadMoreEvents()

    expect(component.eventLoadLimit()).toBe(AGENDA_UPCOMING_CAP)
  })

  it('clears an event filter when the selected event disappears', () => {
    const component = fixture.componentInstance as unknown as SeasonHomeHarness

    component.selectedEventIds.set(['missing'])
    component.resetStaleEventFilter([ev('kept')])

    expect(component.selectedEventIds()).toEqual([])
  })

  it('mémorise la dernière saison visitée après chargement réussi', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(localStorage.getItem('lastVisitedSeason')).toBe('season-a')
    })
  })

  it('redirige vers /agenda quand l’utilisateur n’a aucune troupe', async () => {
    troupeApi.listMyTroupes.mockResolvedValue({ ok: true, status: 200, data: [] })
    paramMap$.next(convertToParamMap({ slug: 'deplacements-2026-27' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/agenda'], { replaceUrl: true })
    })
    expect(snack.open).not.toHaveBeenCalled()
  })

  it('redirige vers le hub troupe quand le slug de saison est inconnu', async () => {
    seasonsApi.getSeasonBySlug.mockResolvedValue({ ok: false, status: 404 })
    paramMap$.next(convertToParamMap({ slug: 'inconnue' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/', 'troupes', 'troupe-1'], {
        replaceUrl: true,
      })
    })
    expect(snack.open).not.toHaveBeenCalled()
  })

  it('résout la saison dans la troupe sélectionnée avant les autres', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-2')
    seasonsApi.getSeasonBySlug.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: season('season-2', 'troupe-2'),
    })

    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(organizerApi.mySeasonPermissions).toHaveBeenCalledWith('season-2')
    })
    expect(seasonsApi.getSeasonBySlug).toHaveBeenCalledWith('troupe-2', 'season-a')
    expect((fixture.componentInstance as unknown as { troupeId: () => string | null }).troupeId()).toBe('troupe-2')
  })

  it('bascule vers une autre troupe quand elle est seule à posséder le slug', async () => {
    localStorage.setItem('hatcast.selectedTroupeId', 'troupe-1')
    seasonsApi.getSeasonBySlug
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, status: 200, data: season('season-2', 'troupe-2') })

    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(organizerApi.mySeasonPermissions).toHaveBeenCalledWith('season-2')
    })
    expect((fixture.componentInstance as unknown as { troupeId: () => string | null }).troupeId()).toBe('troupe-2')
    expect(localStorage.getItem('hatcast.selectedTroupeId')).toBe('troupe-2')
  })

  it('populates participant filter options from selectors API', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(participantApi.listSeasonParticipantSelectors).toHaveBeenCalledWith('season-1')
    })

    const cmp = fixture.componentInstance as unknown as {
      participantOptions: () => Array<{ id: string | null; label: string }>
    }
    expect(cmp.participantOptions()).toEqual([
      { id: null, label: 'Tous' },
      { id: 'p-1', label: 'Alice' },
    ])
  })

  it('affiche le bandeau admin saison avec liens participants et organisateurs', async () => {
    organizerApi.mySeasonPermissions.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        canManageSeasonOrganizers: true,
        canManageEventOrganizers: false,
        canManageMembers: false,
        canManageSeasons: false,
        canManageEvents: false,
        canManageSeasonParticipants: true,
        canManageEventParticipants: false,
        isTroupeAdmin: false,
        isSeasonOrganizer: true,
        eventOrganizerFor: [],
        eventParticipantAdminFor: [],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('app-season-header app-scope-admin-menu'),
      ).not.toBeNull()
    })

    const cmp = fixture.componentInstance as unknown as {
      seasonAdminItems: () => Array<{
        label: string
        routerLink?: string[]
        queryParams?: Record<string, string>
      }>
    }
    const items = cmp.seasonAdminItems()
    expect(items.map((i) => i.label)).toEqual(['Participants', 'Organisateur·ices', 'Exporter'])
    expect(items[0]?.routerLink).toEqual(['/saison', 'season-a', 'admin', 'participants'])

    const trigger = fixture.nativeElement.querySelector(
      '.scope-admin-menu__trigger',
    ) as HTMLButtonElement
    expect(trigger.getAttribute('aria-label')).toBe('Administration de la saison')
    expect(fixture.nativeElement.querySelector('[aria-label="Réglages saison"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('.scope-admin-bar')).toBeNull()
  })

  it("affiche Exporter pour un organisateur saison sans droits d'administration troupe", () => {
    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      seasonAdminItems: () => Array<{ label: string }>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: false,
      canManageSeasons: false,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: false,
      isSeasonOrganizer: true,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    fixture.detectChanges()

    expect(cmp.seasonAdminItems().map((i) => i.label)).toEqual(['Exporter'])
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).not.toBeNull()
  })

  it('affiche le menu réglages avec Nouveau spectacle pour un admin événements sans droit participants', () => {
    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      canManageSettings: () => boolean
      seasonAdminItems: () => Array<{ label: string }>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: true,
      canManageSeasons: true,
      canManageEvents: true,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: true,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    fixture.detectChanges()

    expect(cmp.canManageSettings()).toBe(false)
    expect(cmp.seasonAdminItems().map((i) => i.label)).toEqual([
      'Modifier',
      'Nouveau spectacle',
      'Exporter',
    ])
    expect(fixture.nativeElement.querySelector('.scope-admin-menu__trigger')).not.toBeNull()
  })

  it('inclut Modifier en tête du menu admin pour canManageSeasons', () => {
    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      seasonPermissions: { set: (v: MySeasonPermissions) => void }
      seasonAdminItems: () => Array<{ label: string; icon?: string }>
      openEditSeason: () => void
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: true,
      canManageSeasons: true,
      canManageEvents: false,
      canManageSeasonParticipants: true,
      canManageEventParticipants: false,
      isTroupeAdmin: true,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    fixture.detectChanges()

    expect(cmp.seasonAdminItems().map((i) => i.label)).toEqual(['Modifier', 'Participants', 'Exporter'])
    expect(cmp.seasonAdminItems()[0]?.icon).toBe('edit')

    dialog.open.mockReturnValue({
      afterClosed: () => ({
        subscribe: () => undefined,
      }),
    })
    cmp.openEditSeason()
    expect(dialog.open).toHaveBeenCalledWith(SeasonFormDialog, {
      data: { mode: 'edit', troupeId: 'troupe-1', season: cmp.season() },
      width: 'min(100vw - 2rem, 28rem)',
    })
  })

  it('exporte les statistiques complètes depuis le menu admin', async () => {
    statisticsApi.loadStatistics.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        participants: [{ id: 'p-1', displayName: 'Alice' }],
        monthKeys: ['2026-05'],
        events: [
          {
            id: 'e1',
            title: 'Show',
            startsAt: '2026-05-12T19:00:00.000Z',
            templateType: 'custom',
            category: null,
            monthKey: '2026-05',
          },
        ],
        rows: [
          {
            participantId: 'p-1',
            displayName: 'Alice',
            annual: { totalJeu: { selections: 1, dispos: 1, declines: 0 } },
            monthSummary: {},
            byMonth: {},
            eventCells: { e1: 'Comédien·ne' },
            eventCellDetails: {},
          },
        ],
      },
    })
    const createElementSpy = vi.spyOn(document, 'createElement')
    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      exportSeasonStatisticsCsv: () => Promise<void>
      seasonPermissions: WritableSignal<MySeasonPermissions | null>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: false,
      canManageSeasons: false,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: false,
      isSeasonOrganizer: true,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    fixture.detectChanges()

    await cmp.exportSeasonStatisticsCsv()

    expect(statisticsApi.loadStatistics).toHaveBeenCalledWith('season-1', { categories: 'all' })
    expect(createElementSpy).toHaveBeenCalledWith('a')
    createElementSpy.mockRestore()
  })

  it('affiche un snack quand l export statistiques n a aucune donnée', async () => {
    statisticsApi.loadStatistics.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        participants: [],
        monthKeys: [],
        events: [],
        rows: [],
      },
    })
    const createElementSpy = vi.spyOn(document, 'createElement')
    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      exportSeasonStatisticsCsv: () => Promise<void>
      seasonPermissions: WritableSignal<MySeasonPermissions | null>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: false,
      canManageSeasons: false,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: false,
      isSeasonOrganizer: true,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })

    await cmp.exportSeasonStatisticsCsv()

    expect(statisticsApi.loadStatistics).toHaveBeenCalledWith('season-1', { categories: 'all' })
    expect(snack.open).toHaveBeenCalledWith('Aucune donnée à exporter.', 'OK', { duration: 4000 })
    expect(createElementSpy).not.toHaveBeenCalledWith('a')
    createElementSpy.mockRestore()
  })

  it("n'exporte pas les statistiques pour un membre sans droit admin saison", async () => {
    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      exportSeasonStatisticsCsv: () => Promise<void>
      seasonPermissions: WritableSignal<MySeasonPermissions | null>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
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
    })

    await cmp.exportSeasonStatisticsCsv()

    expect(statisticsApi.loadStatistics).not.toHaveBeenCalled()
    expect(snack.open).toHaveBeenCalledWith('Vous ne pouvez pas exporter ces statistiques.', 'OK', {
      duration: 5000,
    })
  })

  it('ne navigue pas après édition si le slug est inchangé', () => {
    const updated = season('season-1', 'troupe-1')
    updated.title = 'Titre mis à jour'
    dialog.open.mockReturnValue({
      afterClosed: () => ({
        subscribe: (fn: (value: SeasonResponse) => void) => fn(updated),
      }),
    })

    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      openEditSeason: () => void
      seasonPermissions: WritableSignal<MySeasonPermissions | null>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: true,
      canManageSeasons: true,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: true,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    fixture.detectChanges()

    cmp.openEditSeason()

    expect(router.navigate).not.toHaveBeenCalled()
    expect(snack.open).toHaveBeenCalledWith('Saison mise à jour.', 'OK', { duration: 4000 })
    expect(cmp.season()?.title).toBe('Titre mis à jour')
  })

  it('navigue vers le nouveau slug après édition si le titre change', () => {
    const updated = season('season-1', 'troupe-1')
    updated.slug = 'nouveau-slug'
    updated.title = 'Nouveau titre'
    dialog.open.mockReturnValue({
      afterClosed: () => ({
        subscribe: (fn: (value: SeasonResponse) => void) => fn(updated),
      }),
    })

    const cmp = fixture.componentInstance as unknown as SeasonHomeHarness & {
      seasonView: WritableSignal<'agenda' | 'history' | 'stats'>
      openEditSeason: () => void
      canManageSeasons: () => boolean
      seasonPermissions: WritableSignal<MySeasonPermissions | null>
    }
    cmp.loadingSession.set(false)
    cmp.season.set(season('season-1', 'troupe-1'))
    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: true,
      canManageSeasons: true,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: true,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    cmp.seasonView.set('stats')
    fixture.detectChanges()

    cmp.openEditSeason()

    expect(router.navigate).toHaveBeenCalledWith(['/saison', 'nouveau-slug'], {
      replaceUrl: true,
      queryParams: { view: 'stats' },
    })
    expect(snack.open).toHaveBeenCalledWith('Saison mise à jour.', 'OK', { duration: 4000 })
    expect(cmp.season()?.title).toBe('Nouveau titre')
  })

  it('affiche le menu réglages pour participants ou orga saison sans admin troupe', () => {
    const cmp = fixture.componentInstance as unknown as {
      seasonPermissions: { set: (v: MySeasonPermissions) => void }
      canManageSettings: () => boolean
      canManageSeasonOrganizersOnly: () => boolean
    }

    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: false,
      canManageEventOrganizers: false,
      canManageMembers: false,
      canManageSeasons: false,
      canManageEvents: false,
      canManageSeasonParticipants: true,
      canManageEventParticipants: false,
      isTroupeAdmin: false,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    expect(cmp.canManageSettings()).toBe(true)

    cmp.seasonPermissions.set({
      canManageSeasonOrganizers: true,
      canManageEventOrganizers: false,
      canManageMembers: false,
      canManageSeasons: false,
      canManageEvents: false,
      canManageSeasonParticipants: false,
      canManageEventParticipants: false,
      isTroupeAdmin: false,
      isSeasonOrganizer: true,
      eventOrganizerFor: [],
      eventParticipantAdminFor: [],
    })
    expect(cmp.canManageSeasonOrganizersOnly()).toBe(true)
    expect(cmp.canManageSettings()).toBe(true)
  })

  it('loads upcoming events after season resolves', async () => {
    eventsApi.listEvents.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        content: [ev('event-1')],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      },
    })

    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(eventsApi.listEvents).toHaveBeenCalledWith(
        'season-1',
        0,
        50,
        'upcoming',
        { participantId: null },
      )
    })

    const cmp = fixture.componentInstance as unknown as {
      events: () => EventResponse[]
      monthGroups: () => Array<{ events: EventResponse[] }>
    }
    expect(cmp.events()).toHaveLength(1)
    expect(cmp.monthGroups()[0]?.events[0]?.title).toBe('Spectacle event-1')
  })

  it('ne charge pas une saison quand le slug est ambigu', async () => {
    Object.defineProperty(fixture.componentInstance, 'troupeSeasonResolver', {
      value: {
        resolveSeasonSlug: vi.fn().mockResolvedValue({ kind: 'ambiguous', matches: [] }),
      },
    })

    await fixture.componentInstance['loadTroupeAndSeason']('troupe-a', 'season-a')

    expect(router.navigate).toHaveBeenCalledWith(['/', 'troupes'], { replaceUrl: true })
    expect(snack.open).not.toHaveBeenCalled()
    expect(organizerApi.mySeasonPermissions).not.toHaveBeenCalled()
    expect(eventsApi.listEvents).not.toHaveBeenCalled()
  })

  it('charge les statistiques quand la saison se charge avec view=stats (retour navigateur)', async () => {
    statisticsApi.loadStatistics.mockClear()
    statisticsApi.loadStatistics.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        participants: [],
        monthKeys: ['2026-05'],
        events: [
          {
            id: 'e1',
            title: 'Spectacle',
            startsAt: '2026-05-12T19:00:00.000Z',
            templateType: 'custom',
            category: null,
            monthKey: '2026-05',
          },
        ],
        rows: [
          {
            participantId: 'p-1',
            displayName: 'Alice',
            userSlug: 'alice',
            avatarUrl: null,
            annual: { totalJeu: { selections: 1, dispos: 0, declines: 0 } },
            monthSummary: {},
            byMonth: {},
            eventCells: { e1: '1/0/0' },
            eventCellDetails: {},
          },
        ],
      },
    })
    queryParamMap$.next(convertToParamMap({ view: 'stats' }))
    const activatedRoute = TestBed.inject(ActivatedRoute) as {
      snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> }
    }
    activatedRoute.snapshot.queryParamMap = convertToParamMap({ view: 'stats' })

    const statsFixture = TestBed.createComponent(SeasonHome)
    statsFixture.detectChanges()

    await vi.waitFor(() => {
      expect(statisticsApi.loadStatistics).toHaveBeenCalledWith('season-1', expect.any(Object))
    })

    const cmp = statsFixture.componentInstance as unknown as {
      statisticsData: () => { rows: unknown[] } | null
      seasonView: () => string
    }
    expect(cmp.seasonView()).toBe('stats')
    expect(cmp.statisticsData()?.rows.length).toBe(1)
  })
})

function troupe(id: string): TroupeListItem {
  return {
    id,
    name: `Troupe ${id}`,
    slug: id,
    isDemo: false,
    joinPolicy: 'OPEN',
    activeMemberCount: 1,
    upcomingEventCount: 0,
    membership: {
      id: `membership-${id}`,
      displayName: id,
      status: 'ACTIVE',
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
  }
}

function season(id: string, troupeId: string): SeasonResponse {
  return {
    id,
    troupeId,
    slug: 'season-a',
    title: `Saison ${id}`,
    description: null,
    startDate: null,
    endDate: null,
    archived: false,
    active: true,
    eventCount: 0,
    participantCount: 0,
    createdAt: '',
    updatedAt: '',
  }
}
