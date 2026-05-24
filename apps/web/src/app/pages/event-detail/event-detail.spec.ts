import { OverlayContainer } from '@angular/cdk/overlay'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { WritableSignal } from '@angular/core'
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { BehaviorSubject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { CompositionApiService } from '../../core/composition/composition-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
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
    title: `Spectacle ${id}`,
    description: 'Description test',
    location: 'Paris',
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('EventDetail', () => {
  let fixture: ComponentFixture<EventDetail>
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>
  let getEvent: ReturnType<typeof vi.fn>
  let archiveEvent: ReturnType<typeof vi.fn>
  let mySeasonPermissions: ReturnType<typeof vi.fn>
  let listMyTroupes: ReturnType<typeof vi.fn>
  let getSeasonBySlug: ReturnType<typeof vi.fn>
  let getComposition: ReturnType<typeof vi.fn>
  let dialogOpen: ReturnType<typeof vi.fn>
  let router: Router

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'season-a', eventId: 'event-2' }))
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}))
    getEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: ev('event-2') })
    archiveEvent = vi.fn().mockResolvedValue({ ok: true })
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
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              data: { user: { id: 'user-1', email: 'a@b.c', displayName: 'Test' } },
            }),
          },
        },
        {
          provide: TroupeApiService,
          useValue: { listMyTroupes },
        },
        {
          provide: SeasonApiService,
          useValue: { getSeasonBySlug },
        },
        { provide: EventApiService, useValue: { getEvent, archiveEvent } },
        { provide: OrganizerApiService, useValue: { mySeasonPermissions } },
        {
          provide: AvailabilityApiService,
          useValue: {
            getEventAvailabilitySummary: vi.fn().mockResolvedValue({
              ok: true,
              data: { participants: [], roles: [], roleSlots: {}, eventId: 'event-2' },
            }),
          },
        },
        {
          provide: ParticipantApiService,
          useValue: { listSeasonParticipantSelectors: vi.fn().mockResolvedValue({ ok: true, data: [] }) },
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

  it('loads event via getEvent endpoint', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEvent).toHaveBeenCalledWith('season-1', 'event-2')
    })
    expect((fixture.componentInstance as unknown as EventDetailHarness).event()?.id).toBe('event-2')
  })

  it('renders Infos labeled fields', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const labels = [...fixture.nativeElement.querySelectorAll('.event-infos__label')].map(
        (el: Element) => el.textContent?.trim(),
      )
      expect(labels).toEqual(['Titre', 'Description', 'Date', 'Lieu'])
    })
    expect(fixture.nativeElement.textContent).toContain('Description test')
    expect(fixture.nativeElement.textContent).toContain('Paris')
  })

  it('hides kebab without canManageEvents', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEvent).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.querySelector('.event-infos__kebab')).toBeNull()
  })

  it('shows kebab when canManageEvents', async () => {
    mySeasonPermissions.mockResolvedValue({
      ok: true,
      data: {
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
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-infos__kebab')).not.toBeNull()
    })
  })

  it('selects Dispos tab when showAvailability=true', async () => {
    queryParamMap$.next(convertToParamMap({ showAvailability: 'true' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).activeTab()).toBe('dispos')
    })
  })

  it('maps legacy tab=compo to Équipe', async () => {
    queryParamMap$.next(convertToParamMap({ tab: 'compo' }))
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect((fixture.componentInstance as unknown as EventDetailHarness).activeTab()).toBe('equipe')
    })
    expect(fixture.nativeElement.textContent).toContain('Aucun tirage pour le moment')
  })

  it('shows composition status hint on Infos tab', async () => {
    getEvent.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        ...ev('event-2'),
        compositionLifecycle: 'awaitingConfirmations',
        teamStatusBadge: {
          key: 'preparing',
          label: 'Équipe en préparation',
          tone: 'preparing',
          shortLabel: 'Préparation',
        },
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      const hint = fixture.nativeElement.querySelector('.event-infos__status-hint')
      expect(hint?.textContent?.trim()).toBe(
        'En attente des confirmations des personnes composées.',
      )
    })
  })

  it('header back link targets season agenda', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const back = fixture.nativeElement.querySelector('.event-detail-header__back')
      expect(back?.getAttribute('href')).toBe('/ligue/season-a')
    })
  })

  it('syncs tab changes to URL query', async () => {
    fixture.detectChanges()
    await vi.waitFor(() => expect(getEvent).toHaveBeenCalled())

    ;(fixture.componentInstance as unknown as { onTabChange(index: number): void }).onTabChange(1)

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { tab: 'dispos' },
        replaceUrl: true,
      }),
    )
  })

  it('hides kebab when event is archived even with canManageEvents', async () => {
    mySeasonPermissions.mockResolvedValue({
      ok: true,
      data: {
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
      },
    })
    getEvent.mockResolvedValue({
      ok: true,
      status: 200,
      data: ev('event-2', { archived: true }),
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-infos__kebab')).toBeNull()
    })
  })

  it('selects Équipe and auto-opens participation modal when showConfirm=true', async () => {
    getEvent.mockResolvedValue({
      ok: true,
      status: 200,
      data: ev('event-2', {
        roleSlots: { ...emptyRoleSlots(), player: 1 },
      }),
    })
    getComposition.mockResolvedValue({
      ok: true,
      data: {
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
    })

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

  it('shows Participants link in settings menu when permitted', async () => {
    mySeasonPermissions.mockResolvedValue({
      ok: true,
      data: {
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
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('[aria-label="Réglages saison"]')).not.toBeNull()
    })

    const settingsBtn = fixture.nativeElement.querySelector(
      '[aria-label="Réglages saison"]',
    ) as HTMLButtonElement
    settingsBtn.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const overlayEl = TestBed.inject(OverlayContainer).getContainerElement()
    expect(overlayEl.textContent).toContain('Participants')
    expect(overlayEl.querySelector('a[href*="admin/participants"]')).toBeTruthy()
  })

  it('navigates to season agenda after archive confirm', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => expect(getEvent).toHaveBeenCalled())

    await (
      fixture.componentInstance as unknown as { runArchive(ev: EventResponse): Promise<void> }
    ).runArchive(ev('event-2'))

    await vi.waitFor(() => {
      expect(archiveEvent).toHaveBeenCalledWith('season-1', 'event-2')
    })
    expect(router.navigate).toHaveBeenCalledWith(['/', 'ligue', 'season-a'])
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

  it('shows context strip with troupe and league labels after successful load', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-context-strip')).not.toBeNull()
    })
    const line = fixture.nativeElement.querySelector('.event-context-strip__line')
    expect(line?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Troupe · Saison')
  })

  it('links league title to the current season workspace', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      const leagueLink = fixture.nativeElement.querySelector('a.event-context-strip__league')
      expect(leagueLink?.getAttribute('href')).toBe('/ligue/season-a')
      expect(leagueLink?.textContent?.trim()).toBe('Saison')
    })
  })

  it('shows troupe name as plain text for ordinary members', async () => {
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-context-strip')).not.toBeNull()
    })
    expect(fixture.nativeElement.querySelector('a.event-context-strip__troupe')).toBeNull()
    expect(fixture.nativeElement.querySelector('.event-context-strip__troupe')?.textContent?.trim()).toBe(
      'Troupe',
    )
  })

  it('links troupe name to admin membres for troupe admins', async () => {
    listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [{
        id: 'troupe-1',
        name: 'Troupe',
        slug: 'troupe',
        membership: {
          id: 'm-1',
          displayName: 'Admin',
          status: 'ACTIVE',
          baselineRole: 'TROUPE_ADMIN',
          createdAt: '',
          updatedAt: '',
        },
      }],
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      const troupeLink = fixture.nativeElement.querySelector('a.event-context-strip__troupe')
      expect(troupeLink?.getAttribute('href')).toBe('/troupe/troupe/admin/membres')
      expect(troupeLink?.textContent?.trim()).toBe('Troupe')
    })
  })

  it('reflects the resolved event troupe and league in cross-troupe fixtures', async () => {
    listMyTroupes.mockResolvedValue({
      ok: true,
      status: 200,
      data: [{
        id: 'troupe-beta',
        name: 'Les Beta',
        slug: 'beta-troupe',
        membership: {
          id: 'm-beta',
          displayName: 'Beta',
          status: 'ACTIVE',
          baselineRole: 'MEMBER',
          createdAt: '',
          updatedAt: '',
        },
      }],
    })
    getSeasonBySlug.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        id: 'season-beta',
        troupeId: 'troupe-beta',
        slug: 'season-a',
        title: 'Ligue Beta',
        description: null,
        startDate: null,
        endDate: null,
        archived: false,
        active: true,
        eventCount: 1,
        participantCount: 0,
        createdAt: '',
        updatedAt: '',
      },
    })
    fixture.detectChanges()

    await vi.waitFor(() => {
      const line = fixture.nativeElement.querySelector('.event-context-strip__line')
      expect(line?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Les Beta · Ligue Beta')
    })
    expect(fixture.nativeElement.querySelector('.event-context-strip__troupe')?.textContent?.trim()).toBe(
      'Les Beta',
    )
    expect(fixture.nativeElement.querySelector('a.event-context-strip__league')?.getAttribute('href')).toBe(
      '/ligue/season-a',
    )
  })

  it('does not render context strip while loading', () => {
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.event-context-strip')).toBeNull()
  })

  it('does not render context strip after season resolver failure', async () => {
    getSeasonBySlug.mockResolvedValue({ ok: false, status: 404 })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getSeasonBySlug).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.querySelector('.event-context-strip')).toBeNull()
  })

  it('does not render context strip when event is not found', async () => {
    getEvent.mockResolvedValue({ ok: false, status: 404 })
    fixture.detectChanges()

    await vi.waitFor(() => {
      expect(getEvent).toHaveBeenCalled()
    })
    expect(fixture.nativeElement.querySelector('.event-context-strip')).toBeNull()
  })
})
