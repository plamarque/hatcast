import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { OrganizerApiService, type MySeasonPermissions } from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type EventRosterParticipant,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { AdminEventParticipants } from './admin-event-participants'

describe('AdminEventParticipants', () => {
  const paramMap$ = new BehaviorSubject(
    convertToParamMap({ slug: 'season-a', eventSlug: 'show-1' }),
  )

  const season: SeasonResponse = {
    id: 'season-1',
    troupeId: 'troupe-1',
    slug: 'season-a',
    title: 'Saison A',
    description: null,
    startDate: null,
    endDate: null,
    archived: false,
    active: true,
    eventCount: 1,
    participantCount: 2,
    createdAt: '',
    updatedAt: '',
  }

  const event: EventResponse = {
    id: 'event-1',
    seasonId: 'season-1',
    slug: 'show-1',
    title: 'Show One',
    description: null,
    location: null,
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: {},
    createdAt: '',
    updatedAt: '',
  }

  const rosterRow: EventRosterParticipant = {
    seasonParticipantId: 'sp-1',
    eventParticipantId: null,
    displayName: 'Alice',
    email: 'alice@example.com',
    userId: 'u-1',
    kind: 'MEMBER',
    source: 'SEASON',
  }

  async function setup(
    permissions: MySeasonPermissions,
    options: {
      roster?: EventRosterParticipant[]
    } = {},
  ) {
    const router = { navigate: vi.fn().mockResolvedValue(true) }
    const snack = { open: vi.fn() }
    const listEventParticipantRoster = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: options.roster ?? [rosterRow],
    })

    await TestBed.configureTestingModule({
      imports: [AdminEventParticipants, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { user: { email: 'a@example.com', displayName: 'Admin' } },
            }),
          },
        },
        {
          provide: TroupeSeasonResolverService,
          useValue: {
            resolveSeasonSlug: vi.fn().mockResolvedValue({
              kind: 'resolved',
              troupe: { id: 'troupe-1', name: 'Troupe', slug: 'troupe-a' },
              season,
            }),
          },
        },
        {
          provide: EventApiService,
          useValue: {
            getEventBySlug: vi.fn().mockResolvedValue({ ok: true, status: 200, data: event }),
          },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            mySeasonPermissions: vi.fn().mockResolvedValue({ ok: true, data: permissions }),
          },
        },
        {
          provide: ParticipantApiService,
          useValue: {
            listEventParticipantRoster,
            createEventParticipant: vi.fn(),
            removeEventParticipant: vi.fn(),
            excludeSeasonParticipantFromEvent: vi.fn(),
          },
        },
        {
          provide: TroupeContextService,
          useValue: { currentUserDisplayLabel: () => 'Admin' },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AdminEventParticipants)
    fixture.detectChanges()
    await fixture.whenStable()
    await vi.waitFor(() => expect(fixture.componentInstance).toBeTruthy())
    return { fixture, router, snack, listEventParticipantRoster }
  }

  it('loads merged roster and shows participant names', async () => {
    const { fixture, listEventParticipantRoster } = await setup({
      isTroupeAdmin: true,
      isSeasonOrganizer: false,
      eventOrganizerFor: [],
      canManageEvents: false,
      canManageSeasonParticipants: true,
      canManageSeasonOrganizers: false,
      canManageMembers: false,
      canManageEventOrganizers: false,
      canManageEventParticipants: true,
      canManageSeasons: false,
      eventParticipantAdminFor: [],
    })

    await vi.waitFor(() => {
      expect(listEventParticipantRoster).toHaveBeenCalledWith('season-1', 'event-1')
    })
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('Participants du spectacle')
  })

  it('redirects when user lacks participant admin rights', async () => {
    const { router } = await setup({
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
    })

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/saison', 'season-a', 'event', 'show-1'], {
        replaceUrl: true,
      })
    })
  })
})
