import { ComponentFixture, TestBed } from '@angular/core/testing'
import { signal, WritableSignal } from '@angular/core'
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { BehaviorSubject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { MemberShellBootstrapService } from '../../core/member-shell/member-shell-bootstrap.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { EventAvailabilitySummary } from '../../core/availability/availability-api.service'
import {
  CompositionApiService,
  type CompositionResponse,
} from '../../core/composition/composition-api.service'
import { EventApiService, type EventPageResponse, type EventResponse } from '../../core/events/event-api.service'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { EventDetail } from './event-detail'
import { emptyRoleSlots } from '../../core/events/event-types'

type EventDetailHarness = {
  event: WritableSignal<EventResponse | null>
  activeTab: WritableSignal<string>
  canManageEvents: () => boolean
}

function ev(id: string, overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id,
    seasonId: 'season-1',
    slug: overrides.slug ?? id,
    title: `Spectacle ${id}`,
    description: 'Description test',
    location: 'Paris',
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: { ...emptyRoleSlots(), player: 1, ...overrides.roleSlots },
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

function disposSummary(
  participants: EventAvailabilitySummary['participants'],
): EventAvailabilitySummary {
  return {
    eventId: 'event-2',
    roleSlots: {},
    roles: [],
    participants,
  }
}


const defaultSeasonPermissions = {
  isTroupeAdmin: false,
  isSeasonOrganizer: false,
  eventOrganizerFor: [] as string[],
  canManageEvents: false,
  canManageSeasonParticipants: false,
  canManageSeasonOrganizers: false,
  canManageMembers: false,
  canManageEventOrganizers: false,
  canManageEventParticipants: false,
  canManageSeasons: false,
  eventParticipantAdminFor: [] as string[],
}

function buildEventPage(
  event: EventResponse,
  tab: 'infos' | 'dispos' | 'equipe' = 'infos',
  overrides: Partial<EventPageResponse> = {},
): EventPageResponse {
  return {
    event,
    permissions: defaultSeasonPermissions,
    participantSelectors: [],
    organizers: tab === 'infos' ? [] : undefined,
    categories: tab === 'infos' ? [] : undefined,
    availabilitySummary: tab === 'dispos' ? disposSummary([]) : undefined,
    composition: tab === 'equipe' ? { visibility: 'none', slots: [] } : undefined,
    ...overrides,
  }
}

describe('EventDetail', () => {
  let fixture: ComponentFixture<EventDetail>
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  let getEventPage: ReturnType<typeof vi.fn>
  let pagePermissions: typeof defaultSeasonPermissions
  let archiveEvent: ReturnType<typeof vi.fn>
  let unarchiveEvent: ReturnType<typeof vi.fn>
  let mySeasonPermissions: ReturnType<typeof vi.fn>
  let listMyTroupes: ReturnType<typeof vi.fn>
  let getSeasonBySlug: ReturnType<typeof vi.fn>
  let getComposition: ReturnType<typeof vi.fn>
  let getEventAvailabilitySummary: ReturnType<typeof vi.fn>
  let dialogOpen: ReturnType<typeof vi.fn>
  let router: Router

  function mockEventPageResponse(
    event: EventResponse,
    overrides: Partial<EventPageResponse> = {},
  ) {
    getEventPage.mockImplementation(async (_seasonId: string, _ref: string, options: { tab?: string } = {}) => ({
      ok: true,
      status: 200,
      data: buildEventPage(
        event,
        (options.tab as 'infos' | 'dispos' | 'equipe') ?? 'infos',
        { permissions: pagePermissions, ...overrides },
      ),
    }))
  }

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(
      convertToParamMap({ troupeSlug: 'troupe', seasonSlug: 'season-a', eventSlug: 'event-2' }),
    )
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}))
    pagePermissions = { ...defaultSeasonPermissions }
    getEventPage = vi.fn().mockImplementation(async (_seasonId: string, _ref: string, options: { tab?: string } = {}) => ({
      ok: true,
      status: 200,
      data: buildEventPage(ev('event-2'), (options.tab as 'infos' | 'dispos' | 'equipe') ?? 'infos', {
        permissions: pagePermissions,
      }),
    }))
    archiveEvent = vi.fn().mockResolvedValue({ ok: true })
    unarchiveEvent = vi.fn().mockResolvedValue({ ok: true, data: ev('event-2', { archived: false }) })
    mySeasonPermissions = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        canManageEvents: false,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: false,
        canManageMembers: false,
        canManageEventOrganizers: false,
        canManageEventParticipants: false,
        canManageSeasons: false,
        eventParticipantAdminFor: [],
      },
    })
    listMyTroupes = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [{
        id: 'troupe-1',
        name: 'Troupe',
        slug: 'troupe',
        activeMemberCount: 1,
        upcomingEventCount: 0,
        membership: {
          id: 'm-1',
          displayName: 'Test',
          status: 'ACTIVE',
          baselineRole: 'MEMBER',
          createdAt: '',
          updatedAt: '',
        },
      }],
    })
    getSeasonBySlug = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        id: 'season-1',
        troupeId: 'troupe-1',
        slug: 'season-a',
        title: 'Saison',
        description: null,
        startDate: null,
        endDate: null,
        archived: false,
        active: true,
        eventCount: 2,
        participantCount: 0,
        createdAt: '',
        updatedAt: '',
      },
    })
    getComposition = vi.fn().mockResolvedValue({
      ok: true,
      data: { visibility: 'none', slots: [] },
    })
    getEventAvailabilitySummary = vi.fn().mockResolvedValue({
      ok: true,
      data: { participants: [], roles: [], roleSlots: {}, eventId: 'event-2' },
    })
    dialogOpen = vi.fn().mockReturnValue({
      componentInstance: {},
      afterClosed: () => new BehaviorSubject(undefined).asObservable(),
      close: vi.fn(),
    })

    await TestBed.configureTestingModule({
      imports: [EventDetail, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
            queryParamMap: queryParamMap$.asObservable(),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        {
          provide: AuthApiService,
          useValue: {
            sessionUser: signal({
              id: 'user-1',
              slug: 'test',
              email: 'a@b.c',
              displayName: 'Test',
              avatarUrl: null,
            }),
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'user-1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: MemberShellBootstrapService,
          useValue: { ensureReady: vi.fn().mockResolvedValue({ ok: true }) },
        },
        {
          provide: TroupeApiService,
          useValue: {
            listMyTroupes,
            listCategories: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          },
        },
        {
          provide: SeasonApiService,
          useValue: {
            getSeasonBySlug,
            resolveSeasonByTroupeAndSeasonSlug: vi.fn().mockResolvedValue({ ok: false, status: 404 }),
          },
        },
        {
          provide: EventApiService,
          useValue: {
            getEventPage,
            archiveEvent,
            unarchiveEvent,
          },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            mySeasonPermissions,
            listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          },
        },
        {
          provide: AvailabilityApiService,
          useValue: {
            getEventAvailabilitySummary,
          },
        },
        {
          provide: ParticipantApiService,
          useValue: {
            listSeasonParticipantSelectors: vi.fn().mockResolvedValue({ ok: true, data: [] }),
          },
        },
        {
          provide: CompositionApiService,
          useValue: {
            getComposition,
            publishComposition: vi.fn(),
          },
        },
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    }).compileComponents()

    TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })

    fixture = TestBed.createComponent(EventDetail)
    router = TestBed.inject(Router)
    vi.spyOn(router, 'navigate').mockResolvedValue(true)
  })

  it('loads event via getEventBySlug when route segment is a slug', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'infos', bySlug: true }))
    })
    expect((fixture.componentInstance as unknown as EventDetailHarness).event()?.id).toBe('event-2')
  })

  it('replaces UUID route with canonical slug URL', async () => {
    const uuid = 'c0000002-0000-4000-8000-000000000002'
    mockEventPageResponse(ev(uuid, { slug: 'match-vs-bruxelles' }))
    paramMap$.next(convertToParamMap({ troupeSlug: 'troupe', seasonSlug: 'season-a', eventSlug: uuid }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalledWith('season-1', uuid, expect.objectContaining({ bySlug: false }))
      expect(router.navigate).toHaveBeenCalledWith(
        ['/saison', 'troupe', 'season-a', 'event', 'match-vs-bruxelles'],
        expect.objectContaining({ replaceUrl: true }),
      )
    })
  })

  it('renders Infos labeled fields', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const labels = [...fixture.nativeElement.querySelectorAll('.event-infos__label')].map(
        (el: Element) => el.textContent?.trim(),
      )
      expect(labels).toEqual(['Date', 'Lieu', 'Format et besoins', 'Catégorie'])
    })
    expect(fixture.nativeElement.textContent).toContain('Description test')
    expect(fixture.nativeElement.textContent).toContain('Paris')
  })

  it('hides admin gear on Infos without any admin rights', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger')).toBeNull()
  })

  it('shows unified admin gear on Infos when canManageEvents', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
      ).not.toBeNull()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).toEqual([
      'Modifier',
      'Annoncer',
      'Participants',
      'Désactiver',
    ])
  })

  it('includes Annoncer in admin menu when published and canManageComposition', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: '2026-01-01T00:00:00.000Z' }))
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).toEqual([
      'Modifier',
      'Annoncer',
      'Participants',
      'Désactiver',
    ])
  })

  it('hides Annoncer in admin menu for draft events', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: null }))
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).not.toContain('Annoncer')
  })

  it('hides Relance dispos in admin menu for draft events', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: null }))
    getEventAvailabilitySummary.mockResolvedValue({
      ok: true,
      data: {
        eventId: 'event-2',
        roleSlots: {},
        roles: [],
        participants: [
          {
            participantId: 'p1',
            userId: 'user-1',
            displayName: 'Patrice',
            avatarUrl: null,
            status: 'unknown',
            roleKeys: [],
            comment: null,
          },
        ],
      },
    })
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).not.toContain('Relance dispos')
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
  })

  it('includes Relance dispos after Annoncer when unknown participants exist', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: '2026-01-01T00:00:00.000Z' }))
    getEventAvailabilitySummary.mockResolvedValue({
      ok: true,
      data: {
        eventId: 'event-2',
        roleSlots: {},
        roles: [],
        participants: [
          {
            participantId: 'p1',
            userId: 'user-1',
            displayName: 'Patrice',
            avatarUrl: null,
            status: 'unknown',
            roleKeys: [],
            comment: null,
          },
        ],
      },
    })
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
      onDisposSummaryChanged: (summary: EventAvailabilitySummary) => void
    }
    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })
    cmp.onDisposSummaryChanged(
      disposSummary([
        {
          participantId: 'p1',
          userId: 'user-1',
          displayName: 'Patrice',
          avatarUrl: null,
          status: 'unknown',
          roleKeys: [],
          comment: null,
        },
      ]),
    )
    fixture.detectChanges()
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    expect(cmp.eventAdminItems().map((i) => i.label)).toEqual([
      'Modifier',
      'Annoncer',
      'Relance dispos',
      'Participants',
      'Désactiver',
    ])
  })

  it('hides Relance dispos when no unknown participants', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: '2026-01-01T00:00:00.000Z' }))
    getEventAvailabilitySummary.mockResolvedValue({
      ok: true,
      data: {
        eventId: 'event-2',
        roleSlots: {},
        roles: [],
        participants: [
          {
            participantId: 'p1',
            userId: 'user-1',
            displayName: 'Patrice',
            avatarUrl: null,
            status: 'available',
            roleKeys: ['player'],
            comment: null,
          },
        ],
      },
    })
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
      onDisposSummaryChanged: (summary: EventAvailabilitySummary) => void
    }
    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })
    cmp.onDisposSummaryChanged(
      disposSummary([
        {
          participantId: 'p1',
          userId: 'user-1',
          displayName: 'Patrice',
          avatarUrl: null,
          status: 'available',
          roleKeys: ['player'],
          comment: null,
        },
      ]),
    )
    fixture.detectChanges()
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    expect(cmp.eventAdminItems().map((i) => i.label)).not.toContain('Relance dispos')
  })

  it('hides Relance dispos for members without canManageComposition', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: '2026-01-01T00:00:00.000Z' }))
    getEventAvailabilitySummary.mockResolvedValue({
      ok: true,
      data: {
        eventId: 'event-2',
        roleSlots: {},
        roles: [],
        participants: [
          {
            participantId: 'p1',
            userId: 'user-2',
            displayName: 'Alex',
            avatarUrl: null,
            status: 'unknown',
            roleKeys: [],
            comment: null,
          },
        ],
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).not.toContain('Relance dispos')
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
  })

  it('hides Relance dispos when event is archived', async () => {
    mockEventPageResponse(ev('event-2', {
        archived: true,
        availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
      }))
    getEventAvailabilitySummary.mockResolvedValue({
      ok: true,
      data: {
        eventId: 'event-2',
        roleSlots: {},
        roles: [],
        participants: [
          {
            participantId: 'p1',
            userId: 'user-1',
            displayName: 'Patrice',
            avatarUrl: null,
            status: 'unknown',
            roleKeys: [],
            comment: null,
          },
        ],
      },
    })
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).not.toContain('Relance dispos')
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
  })

  it('opens nudge dialog from Relance dispos admin menu action', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: '2026-01-01T00:00:00.000Z' }))
    getEventAvailabilitySummary.mockResolvedValue({
      ok: true,
      data: {
        eventId: 'event-2',
        roleSlots: {},
        roles: [],
        participants: [
          {
            participantId: 'p1',
            userId: 'user-1',
            displayName: 'Patrice',
            avatarUrl: null,
            status: 'unknown',
            roleKeys: [],
            comment: null,
          },
        ],
      },
    })
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string; action: () => void }>
      onDisposSummaryChanged: (summary: EventAvailabilitySummary) => void
    }
    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })
    cmp.onDisposSummaryChanged(
      disposSummary([
        {
          participantId: 'p1',
          userId: 'user-1',
          displayName: 'Patrice',
          avatarUrl: null,
          status: 'unknown',
          roleKeys: [],
          comment: null,
        },
      ]),
    )
    fixture.detectChanges()
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    expect(cmp.eventAdminItems().find((i) => i.label === 'Relance dispos')).toBeTruthy()
    const relance = cmp.eventAdminItems().find((i) => i.label === 'Relance dispos')
    relance?.action()
    expect(dialogOpen).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ intent: 'availability_nudge' }),
      }),
    )
  })

  it('opens announce dialog from admin menu action', async () => {
    mockEventPageResponse(ev('event-2', { availabilityOpenedAt: '2026-01-01T00:00:00.000Z' }))
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string; action: () => void }>
    }
    const announce = cmp.eventAdminItems().find((i) => i.label === 'Annoncer')
    expect(announce).toBeTruthy()
    announce?.action()
    expect(dialogOpen).toHaveBeenCalled()
  })

  it('selects Dispos tab when showAvailability=true', async () => {
    queryParamMap$.next(convertToParamMap({ showAvailability: 'true' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).activeTab()).toBe('dispos')
    })
  })

  it('maps legacy tab=compo to Équipe and loads composition once', async () => {
    queryParamMap$.next(convertToParamMap({ tab: 'compo' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).activeTab()).toBe('equipe')
      expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'equipe' }))
    })
    expect(getComposition).not.toHaveBeenCalled()
    expect(fixture.nativeElement.textContent).toContain('Aucun tirage pour le moment')
  })

  it('shows help trigger above tabs without open panel on Infos tab', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'confirmed',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participationStatus: 'pending',
          },
        ],
      },
    })
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: true,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(
      ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 2 },
        compositionLifecycle: 'awaitingConfirmations',
      }),
    )
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getComposition).not.toHaveBeenCalled()
      expect(fixture.nativeElement.querySelector('[data-testid="composition-status-hint"]')).toBeNull()
      expect(fixture.nativeElement.textContent).toContain('Confirmations en cours')
      expect(
        fixture.nativeElement.querySelector('.event-detail__status [data-testid="composition-status-badge"]'),
      ).not.toBeNull()
      expect(
        fixture.nativeElement.querySelector('.event-detail__status [data-testid="composition-status-help-trigger"]'),
      ).not.toBeNull()
    })
  })

  it('opens composition help panel from event detail status chrome', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: true,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(
      ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 2 },
      }),
      {
        composition: {
          publishedAt: null,
          validatedAt: null,
          visibility: 'organizerDraft',
          slots: [],
        },
      },
    )
    queryParamMap$.next(convertToParamMap({ tab: 'equipe' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'equipe' }))
      expect(getComposition).not.toHaveBeenCalled()
      expect(
        fixture.nativeElement.querySelector('[data-testid="composition-status-help-trigger"]'),
      ).not.toBeNull()
    })

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    const hint = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-hint"]',
    ) as HTMLElement
    expect(hint).not.toBeNull()
    expect(hint.textContent).toContain('À composer')
  })

  it('omits validate sentence from help panel when validate CTA is available on équipe tab', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: true,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(
      ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 2 },
      }),
      {
        composition: {
          publishedAt: null,
          validatedAt: null,
          visibility: 'organizerDraft',
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-1',
              participationStatus: 'pending',
            },
          ],
        },
      },
    )
    queryParamMap$.next(convertToParamMap({ tab: 'equipe' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'equipe' }))
      expect(getComposition).not.toHaveBeenCalled()
      expect(
        fixture.nativeElement.querySelector('[data-testid="composition-status-help-trigger"]'),
      ).not.toBeNull()
    })

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-help-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()

    const hint = fixture.nativeElement.querySelector(
      '[data-testid="composition-status-hint"]',
    ) as HTMLElement
    expect(hint.textContent).toContain('En préparation')
    expect(hint.textContent).not.toContain('Valider')
  })

  it('shows équipe status badge above tabs on Dispos tab', async () => {
    getComposition.mockResolvedValue({
      ok: true,
      data: {
        publishedAt: null,
        validatedAt: '2026-01-01T00:00:00.000Z',
        visibility: 'validated',
        slots: [
          {
            roleKey: 'player',
            slotIndex: 0,
            participantId: 'p-1',
            participationStatus: 'pending',
          },
          {
            roleKey: 'player',
            slotIndex: 1,
            participantId: 'p-2',
            participationStatus: 'pending',
          },
        ],
      },
    })
    mockEventPageResponse(
      ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 2 },
        compositionLifecycle: 'awaitingConfirmations',
      }),
    )
    queryParamMap$.next(convertToParamMap({ tab: 'dispos' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getComposition).not.toHaveBeenCalled()
      expect(
        fixture.nativeElement.querySelector('.event-detail__status [data-testid="composition-status-badge"]'),
      ).not.toBeNull()
      expect(fixture.nativeElement.textContent).toContain('Confirmations en cours')
      expect(
        fixture.nativeElement.querySelector('.event-detail__status [data-testid="composition-status-help-trigger"]'),
      ).toBeNull()
    })
  })

  it('does not show composition draft banner in global status chrome (moved to équipe tab)', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: true,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(
      ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 2 },
        compositionLifecycle: 'draftComposition',
      }),
    )
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getComposition).not.toHaveBeenCalled()
      const statusChrome = fixture.nativeElement.querySelector('.event-detail__status') as HTMLElement
      expect(statusChrome?.textContent ?? '').not.toContain('Composition en brouillon')
      expect(
        statusChrome?.querySelector('[data-testid="composition-status-help-trigger"]'),
      ).not.toBeNull()
    })
  })

  it('breadcrumb saison segment links to canonical /saison/ workspace', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const seasonLink = fixture.nativeElement.querySelector(
        'app-context-breadcrumb a.context-breadcrumb__link',
      ) as HTMLAnchorElement
      expect(seasonLink?.getAttribute('href')).toBe('/saison/troupe/season-a')
    })
  })

  it('syncs tab changes to URL query', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())

    ;(fixture.componentInstance as unknown as { onTabChange(index: number): void }).onTabChange(1)

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { tab: 'dispos' },
        replaceUrl: true,
      }),
    )
  })

  it('keeps pill tab bar capsule styling (PT-AC — ux-design-pill-tab-bar)', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())

    const tabGroup = fixture.nativeElement.querySelector(
      '.event-detail__tabs',
    ) as HTMLElement | null
    expect(tabGroup).toBeTruthy()

    const tabHeader = tabGroup!.querySelector('.mat-mdc-tab-header') as HTMLElement
    expect(tabHeader).toBeTruthy()
    expect(parseFloat(getComputedStyle(tabHeader).borderRadius)).toBeGreaterThanOrEqual(999)

    const indicator = tabGroup!.querySelector('.mdc-tab-indicator') as HTMLElement
    expect(indicator).toBeTruthy()
    expect(getComputedStyle(indicator).display).toBe('none')

    const tabs = tabGroup!.querySelectorAll('.mat-mdc-tab') as NodeListOf<HTMLElement>
    expect(tabs.length).toBeGreaterThanOrEqual(3)
    expect(parseFloat(getComputedStyle(tabs[0]!).opacity)).toBe(1)

    const activeTab = tabGroup!.querySelector('.mat-mdc-tab.mdc-tab--active') as HTMLElement
    expect(activeTab).toBeTruthy()
    expect(parseFloat(getComputedStyle(activeTab).borderRadius)).toBeGreaterThanOrEqual(999)

    const tabBody = tabGroup!.querySelector('.mat-mdc-tab-body-content') as HTMLElement
    expect(tabBody).toBeTruthy()
    expect(getComputedStyle(tabBody).paddingTop).toBe('1.5rem')
  })

  it('hides Modifier and Désactiver when event is inactive', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        canManageEvents: true,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: false,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(ev('event-2', { archived: true }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      const cmp = fixture.componentInstance as unknown as {
        eventAdminItems: () => Array<{ label: string }>
      }
      const labels = cmp.eventAdminItems().map((i) => i.label)
      expect(labels).not.toContain('Modifier')
      expect(labels).not.toContain('Désactiver')
      expect(labels).toContain('Réactiver')
    })
  })

  it('reactivates inactive event after confirm', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        canManageEvents: true,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: false,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(ev('event-2', { archived: true }))
    fixture.detectChanges()

    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())

    await (
      fixture.componentInstance as unknown as { runUnarchive(ev: EventResponse): Promise<void> }
    ).runUnarchive(ev('event-2', { archived: true }))

    await vi.waitFor(() => {
      expect(unarchiveEvent).toHaveBeenCalledWith('season-1', 'event-2')
    })
    const cmp = fixture.componentInstance as unknown as EventDetailHarness
    expect(cmp.event()?.archived).toBe(false)
  })

  it('selects Équipe and auto-opens participation modal when showConfirm=true', async () => {
    mockEventPageResponse(
      ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 1 },
      }),
      {
        composition: {
          publishedAt: null,
          validatedAt: '2026-01-01T00:00:00.000Z',
          visibility: 'validated',
          viewerParticipantIds: ['p-me'],
          slots: [
            {
              roleKey: 'player',
              slotIndex: 0,
              participantId: 'p-me',
              participantDisplayName: 'Moi',
              participationStatus: 'confirmed',
            },
          ],
        },
      },
    )

    queryParamMap$.next(convertToParamMap({ showConfirm: 'true' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).activeTab()).toBe('equipe')
      expect(dialogOpen).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.textContent).not.toContain(
      'La confirmation de participation sera disponible dans une prochaine version.',
    )
  })

  it('navigates to event participants admin when season participant admin', async () => {
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: true,
        eventOrganizerFor: [],
        canManageEvents: false,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: false,
        canManageMembers: false,
        canManageEventOrganizers: false,
        canManageEventParticipants: false,
        canManageSeasons: false,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
      ).not.toBeNull()
    })

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
      openEventParticipantsAdmin: () => void
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).toEqual(['Annoncer', 'Participants'])
    cmp.openEventParticipantsAdmin()
    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'troupe', 'season-a', 'event', 'event-2', 'admin', 'participants'])

    const trigger = fixture.nativeElement.querySelector(
      '.event-detail-header__admin .scope-admin-menu__trigger',
    ) as HTMLButtonElement
    expect(trigger.getAttribute('aria-label')).toBe('Administration du spectacle')
    expect(fixture.nativeElement.querySelector('[aria-label="Réglages saison"]')).toBeNull()
  })

  it('shows spectacle admin menu for event-only participant admin', async () => {
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        canManageEvents: false,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: false,
        canManageMembers: false,
        canManageEventOrganizers: false,
        canManageEventParticipants: false,
        canManageSeasons: false,
        eventParticipantAdminFor: ['event-2'],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
      ).not.toBeNull()
    })

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string; action?: () => void }>
      openEventParticipantsAdmin: () => void
    }
    expect(cmp.eventAdminItems()[0]?.label).toBe('Participants')
    cmp.openEventParticipantsAdmin()
    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'troupe', 'season-a', 'event', 'event-2', 'admin', 'participants'])
  })

  it('shows admin gear in header on Dispos tab when permitted', async () => {
    pagePermissions = {
        isTroupeAdmin: true,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())

    ;(fixture.componentInstance as unknown as { onTabChange(index: number): void }).onTabChange(1)
    fixture.detectChanges()

    expect(
      fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
    ).not.toBeNull()
  })

  it('links event organizers to participants admin via Participants menu item', async () => {
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: false,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: false,
        canManageMembers: false,
        canManageEventOrganizers: false,
        canManageEventParticipants: false,
        canManageSeasons: false,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
      ).not.toBeNull()
    })

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true)
    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string; action?: () => void }>
      openEventParticipantsAdmin: () => void
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).toEqual(['Annoncer', 'Participants'])
    cmp.openEventParticipantsAdmin()
    expect(navigateSpy).toHaveBeenCalledWith(['/saison', 'troupe', 'season-a', 'event', 'event-2', 'admin', 'participants'])
  })

  it('shows Participants for season organizer on event admin menu', async () => {
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: true,
        eventOrganizerFor: ['event-2'],
        canManageEvents: false,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: true,
        canManageMembers: false,
        canManageEventOrganizers: false,
        canManageEventParticipants: false,
        canManageSeasons: false,
        eventParticipantAdminFor: [],
      }
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-detail-header__admin .scope-admin-menu__trigger'),
      ).not.toBeNull()
    })

    const cmp = fixture.componentInstance as unknown as {
      eventAdminItems: () => Array<{ label: string }>
    }
    expect(cmp.eventAdminItems().map((i) => i.label)).toEqual(['Annoncer', 'Participants'])
  })

  it('does not render header settings or back chevron after breadcrumb refactor', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('app-context-breadcrumb')).toBeTruthy()
    })

    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[aria-label="Réglages saison"]')).toBeNull()
    expect(el.querySelector('[aria-label="Retour à l’agenda"]')).toBeNull()
    expect(el.querySelector('.event-detail-header__back')).toBeNull()
  })

  it('renders breadcrumb with troupe hub and saison links on event detail', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const troupeLink = fixture.nativeElement.querySelector(
        'app-context-breadcrumb a.context-breadcrumb__troupe',
      )
      expect(troupeLink).toBeTruthy()
    })

    const seasonLink = fixture.nativeElement.querySelector(
      'app-context-breadcrumb a.context-breadcrumb__link',
    ) as HTMLAnchorElement
    expect(seasonLink.getAttribute('href')).toBe('/saison/troupe/season-a')
  })

  it('navigates to season agenda after deactivate confirm', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())

    await (
      fixture.componentInstance as unknown as { runArchive(ev: EventResponse): Promise<void> }
    ).runArchive(ev('event-2'))

    await vi.waitFor(() => {
      expect(archiveEvent).toHaveBeenCalledWith('season-1', 'event-2')
    })
    expect(router.navigate).toHaveBeenCalledWith(['/saison', 'troupe', 'season-a'])
  })

  it('normalizes unknown tab query param in URL', async () => {
    queryParamMap$.next(convertToParamMap({ tab: 'unknown' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: { tab: 'infos' },
          replaceUrl: true,
        }),
      )
    })
  })

  it('does not render event context strip after successful load', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('app-event-detail-header')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelector('app-event-context-strip')).toBeNull()
    expect(fixture.nativeElement.querySelector('.event-context-strip')).toBeNull()
  })

  it('does not show Mon agenda header shortcut when signed in', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('app-event-detail-header')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelector('app-member-agenda-shortcut')).toBeNull()
  })

  it('links saison in breadcrumb to canonical /saison workspace', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const saisonLink = fixture.nativeElement.querySelector(
        'app-context-breadcrumb a.context-breadcrumb__link',
      )
      expect(saisonLink?.getAttribute('href')).toBe('/saison/troupe/season-a')
    })
  })

  it('shows event title in context row and omits it from breadcrumb after successful load', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(
        fixture.nativeElement.querySelector('.event-detail__event-title')?.textContent?.trim(),
      ).toBe('Spectacle event-2')
    })
    expect(fixture.nativeElement.querySelector('.context-breadcrumb__mobile-event-title')).toBeNull()
    const desktopTrail = fixture.nativeElement.querySelector(
      '.context-breadcrumb__trail--desktop',
    ) as HTMLElement
    expect(desktopTrail?.textContent).not.toContain('Spectacle event-2')
    expect(
      fixture.nativeElement.querySelector('.event-detail__event-title')?.getAttribute('aria-current'),
    ).toBe('page')
  })

  it('does not render mobile context row while loading', () => {
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.event-detail__context-row')).toBeNull()
    expect(fixture.nativeElement.querySelector('.context-breadcrumb__mobile-event-title')).toBeNull()
  })

  it('does not render mobile context row after season resolver failure', async () => {
    getSeasonBySlug.mockResolvedValue({ ok: false, status: 404 })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getSeasonBySlug).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.querySelector('.event-detail__context-row')).toBeNull()
  })

  it('does not render mobile context row when event is not found', async () => {
    getEventPage.mockResolvedValue({ ok: false, status: 404 })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.querySelector('.event-detail__context-row')).toBeNull()
  })

  it('syncCompositionFromEquipe patches lifecycle without reloading event', async () => {
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: true,
        eventOrganizerFor: [],
        canManageEvents: true,
        canManageSeasonParticipants: false,
        canManageSeasonOrganizers: false,
        canManageMembers: false,
        canManageEventOrganizers: false,
        canManageEventParticipants: false,
        canManageSeasons: false,
        eventParticipantAdminFor: [],
      }
    mockEventPageResponse(ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 2 },
        compositionLifecycle: 'draftComposition',
        teamStatusBadge: {
          key: 'preparing',
          label: 'Équipe en préparation',
          tone: 'preparing',
          shortLabel: 'Préparation',
        },
      }))
    fixture.detectChanges()

    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalledTimes(1))

    const cmp = fixture.componentInstance as unknown as {
      syncCompositionFromEquipe(composition: CompositionResponse): void
      event: () => EventResponse | null
    }
    const composition: CompositionResponse = {
      publishedAt: null,
      validatedAt: '2026-01-01T00:00:00.000Z',
      visibility: 'validated',
      slots: [
        {
          roleKey: 'player',
          slotIndex: 0,
          participantId: 'p-1',
          participantDisplayName: 'Alice',
          participationStatus: 'confirmed',
        },
      ],
    }
    cmp.syncCompositionFromEquipe(composition)

    expect(cmp.event()?.compositionLifecycle).toBe('gapsToFill')
    expect(cmp.event()?.teamStatusBadge?.shortLabel).toBe('Préparation')
    expect(getEventPage).toHaveBeenCalledTimes(1)
  })

  it('does not prefetch composition or dispos summary on Infos tab (PERF-03)', async () => {
    mockEventPageResponse(ev('event-2', {
        availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
        compositionLifecycle: 'awaitingConfirmations',
      }))
    pagePermissions = {
        isTroupeAdmin: false,
        isSeasonOrganizer: false,
        eventOrganizerFor: ['event-2'],
        canManageEvents: true,
        canManageSeasonParticipants: true,
        canManageSeasonOrganizers: true,
        canManageMembers: true,
        canManageEventOrganizers: true,
        canManageEventParticipants: true,
        canManageSeasons: true,
        eventParticipantAdminFor: [],
      }
    queryParamMap$.next(convertToParamMap({ tab: 'infos' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalled()
    })
    expect(getComposition).not.toHaveBeenCalled()
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
  })

  it('does not prefetch composition when Dispos tab is selected (story 5.9)', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())
    expect(getComposition).not.toHaveBeenCalled()

    const cmp = fixture.componentInstance as unknown as {
      onTabChange(index: number): void
      visibleTabs: () => string[]
    }
    const disposIndex = cmp.visibleTabs().indexOf('dispos')
    expect(disposIndex).toBeGreaterThanOrEqual(0)
    cmp.onTabChange(disposIndex)
    fixture.detectChanges()

    await new Promise((r) => setTimeout(r, 50))
    expect(getComposition).not.toHaveBeenCalled()
  })

  it('loads composition once when Équipe tab is selected (PERF-03)', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())
    expect(getComposition).not.toHaveBeenCalled()

    const cmp = fixture.componentInstance as unknown as {
      onTabChange(index: number): void
      visibleTabs: () => string[]
    }
    const equipeIndex = cmp.visibleTabs().indexOf('equipe')
    expect(equipeIndex).toBeGreaterThanOrEqual(0)
    cmp.onTabChange(equipeIndex)
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'equipe' }))
    })
    expect(getComposition).not.toHaveBeenCalled()
  })

  it('loads composition when query switches to équipe mid-session (PERF-03)', async () => {
    queryParamMap$.next(convertToParamMap({ tab: 'infos' }))
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())
    expect(getComposition).not.toHaveBeenCalled()

    queryParamMap$.next(convertToParamMap({ tab: 'equipe' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'equipe' }))
    })
    expect(getComposition).not.toHaveBeenCalled()
  })

  it('does not refetch composition when revisiting Équipe tab (PERF-03)', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())

    const cmp = fixture.componentInstance as unknown as {
      onTabChange(index: number): void
      visibleTabs: () => string[]
    }
    const equipeIndex = cmp.visibleTabs().indexOf('equipe')
    const infosIndex = cmp.visibleTabs().indexOf('infos')
    cmp.onTabChange(equipeIndex)
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'equipe' })))

    cmp.onTabChange(infosIndex)
    fixture.detectChanges()
    cmp.onTabChange(equipeIndex)
    fixture.detectChanges()

    expect(getEventPage).toHaveBeenCalledTimes(2)
    expect(getComposition).not.toHaveBeenCalled()
  })

  it('does not prefetch dispos summary on Infos; Dispos tab fetches via child (PERF-03 AC3)', async () => {
    mockEventPageResponse(ev('event-2', {
        availabilityOpenedAt: '2026-01-01T00:00:00.000Z',
      }))
    queryParamMap$.next(convertToParamMap({ tab: 'infos' }))
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalled())
    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    expect(getComposition).not.toHaveBeenCalled()

    getEventPage.mockClear()
    queryParamMap$.next(convertToParamMap({ tab: 'dispos' }))
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEventPage).toHaveBeenCalledWith('season-1', 'event-2', expect.objectContaining({ tab: 'dispos' })))
    await vi.waitFor(() => {
      expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    })
  })
})
