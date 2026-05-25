import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { provideRouter } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
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
import { AddEventParticipantDialog } from './add-event-participant-dialog'
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

  const seasonRow: EventRosterParticipant = {
    seasonParticipantId: 'sp-1',
    eventParticipantId: null,
    displayName: 'Alice',
    email: 'alice@example.com',
    userId: 'u-1',
    kind: 'MEMBER',
    source: 'SEASON',
  }

  const eventRow: EventRosterParticipant = {
    seasonParticipantId: null,
    eventParticipantId: 'ep-1',
    displayName: 'Guest Bob',
    email: 'bob@example.com',
    userId: null,
    kind: 'NAME_ONLY',
    source: 'EVENT',
  }

  const adminPermissions: MySeasonPermissions = {
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
  }

  async function setup(
    permissions: MySeasonPermissions,
    options: {
      roster?: EventRosterParticipant[]
      dialogAfterClosed?: boolean
      dialog?: { open: ReturnType<typeof vi.fn> }
    } = {},
  ) {
    const router = { navigate: vi.fn().mockResolvedValue(true) }
    const snack = { open: vi.fn() }
    const listEventParticipantRoster = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: options.roster ?? [seasonRow],
    })
    const dialogRef = { afterClosed: () => of(options.dialogAfterClosed ?? false) }
    const dialog =
      options.dialog ??
      ({
        open: vi.fn().mockReturnValue(dialogRef),
      } as { open: ReturnType<typeof vi.fn> })

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
        { provide: MatDialog, useValue: dialog },
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
    return { fixture, router, snack, listEventParticipantRoster, dialog }
  }

  it('loads merged roster and shows participant names', async () => {
    const { fixture, listEventParticipantRoster } = await setup(adminPermissions)

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

  it('shows toolbar Ajouter button and no inline add section', async () => {
    const { fixture } = await setup(adminPermissions)

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Alice')
    })

    const root = fixture.nativeElement as HTMLElement
    expect(root.querySelector('.admin-event-participants__add')).toBeNull()
    expect(root.textContent).not.toContain('Ajouter un participant ponctuel')
    const addButton = Array.from(root.querySelectorAll('button')).find((b) =>
      b.textContent?.trim().includes('Ajouter'),
    )
    expect(addButton).toBeTruthy()
  })

  it('opens add dialog and reloads roster on success', async () => {
    const { fixture, dialog, listEventParticipantRoster } = await setup(adminPermissions, {
      dialogAfterClosed: true,
    })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Alice')
    })

    const cmp = fixture.componentInstance as AdminEventParticipants
    cmp['openAddDialog']()
    expect(dialog.open).toHaveBeenCalledWith(AddEventParticipantDialog, {
      data: { seasonId: 'season-1', eventId: 'event-1' },
      width: 'min(100vw - 2rem, 28rem)',
    })
    await vi.waitFor(() => {
      expect(listEventParticipantRoster.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('splits roster into Externes and Membres sections without filter button', async () => {
    const { fixture } = await setup(adminPermissions, {
      roster: [seasonRow, eventRow],
    })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Alice')
      expect(fixture.nativeElement.textContent).toContain('Guest Bob')
    })

    const root = fixture.nativeElement as HTMLElement
    expect(root.textContent).not.toContain('Ajouts au spectacle')
    expect(root.querySelector('#externes-heading')?.textContent).toContain('Externes')
    expect(root.querySelector('#membres-heading')?.textContent).toContain('Membres')

    const externesSection = root.querySelector('#externes-heading')?.closest('section')
    const membresSection = root.querySelector('#membres-heading')?.closest('section')
    expect(externesSection?.textContent).toContain('Guest Bob')
    expect(externesSection?.textContent).not.toContain('Alice')
    expect(membresSection?.textContent).toContain('Alice')
    expect(membresSection?.textContent).not.toContain('Guest Bob')
  })

  it('shows empty Externes section when no event-only participants', async () => {
    const { fixture } = await setup(adminPermissions, {
      roster: [seasonRow],
    })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Alice')
    })

    expect(fixture.nativeElement.textContent).toContain('Aucun ajout ponctuel sur ce spectacle.')
    expect(fixture.nativeElement.querySelector('#membres-heading')).toBeTruthy()
  })
})
