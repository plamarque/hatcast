import { ComponentFixture, TestBed } from '@angular/core/testing'
import { WritableSignal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { OrganizerApiService, type MySeasonPermissions } from '../../core/permissions/organizer-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { AGENDA_UPCOMING_CAP } from './season-events.utils'
import { SeasonHome } from './season-home'
import { emptyRoleSlots } from '../../core/events/event-types'

type SeasonHomeHarness = {
  loadingEvents: WritableSignal<boolean>
  eventsTruncated: WritableSignal<boolean>
  eventLoadLimit: WritableSignal<number>
  selectedEventId: WritableSignal<string | null>
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
  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'season-a' }))

  beforeEach(async () => {
    router = { navigate: vi.fn() }
    dialog = { open: vi.fn() }
    snack = { open: vi.fn() }
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
          isTroupeAdmin: false,
          isSeasonOrganizer: false,
          eventOrganizerFor: [],
        },
      }),
    }

    await TestBed.configureTestingModule({
      imports: [SeasonHome],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snack },
        { provide: AuthApiService, useValue: { ensureHatcastSession: vi.fn() } },
        { provide: SeasonApiService, useValue: {} },
        { provide: EventApiService, useValue: {} },
        { provide: OrganizerApiService, useValue: organizerApi },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(SeasonHome)
  })

  it('navigates cards to the event detail route for the current slug', () => {
    const component = fixture.componentInstance as unknown as SeasonHomeHarness

    component.openEvent('event-1')

    expect(router.navigate).toHaveBeenCalledWith(['/saison', 'season-a', 'event', 'event-1'])
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

    component.selectedEventId.set('missing')
    component.resetStaleEventFilter([ev('kept')])

    expect(component.selectedEventId()).toBeNull()
  })
})
