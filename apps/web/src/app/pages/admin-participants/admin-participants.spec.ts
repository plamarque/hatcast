import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { provideRouter } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { OrganizerApiService, type MySeasonPermissions } from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type SeasonParticipantAdmin,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { AdminParticipants } from './admin-participants'

describe('AdminParticipants', () => {
  const paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'season-a' }))

  const guest: SeasonParticipantAdmin = {
    id: 'p-guest',
    displayName: 'Guest Artist',
    email: null,
    userId: null,
    troupeMembershipId: null,
    kind: 'NAME_ONLY',
    status: 'ACTIVE',
    removable: true,
  }

  async function setup(
    permissions: MySeasonPermissions,
    options: {
      participants?: SeasonParticipantAdmin[]
      dialogAfterClosed?: boolean
      dialog?: { open: ReturnType<typeof vi.fn> }
    } = {},
  ) {
    const router = { navigate: vi.fn().mockResolvedValue(true) }
    const snack = { open: vi.fn() }
    const participants = options.participants ?? [guest]
    const listSeasonParticipants = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: participants,
    })
    const removeSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const dialogRef = { afterClosed: () => of(options.dialogAfterClosed ?? false) }
    const dialog = options.dialog ?? { open: vi.fn().mockReturnValue(dialogRef) }

    await TestBed.configureTestingModule({
      imports: [AdminParticipants, NoopAnimationsModule],
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
              troupe: {
                id: 't1',
                name: 'Ma Troupe',
                slug: 't1',
                membership: {
                  id: 'm-1',
                  displayName: 'Admin',
                  status: 'ACTIVE',
                  baselineRole: 'TROUPE_ADMIN',
                  createdAt: '',
                  updatedAt: '',
                },
              },
              season: season('s1'),
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            selectTroupe: vi.fn(),
            currentUserDisplayLabel: () => 'Admin',
          },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            mySeasonPermissions: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: permissions,
            }),
          },
        },
        {
          provide: ParticipantApiService,
          useValue: {
            listSeasonParticipants,
            removeSeasonParticipant,
            createSeasonParticipant: vi.fn(),
          },
        },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatSnackBar, { useValue: snack })

    const fixture = TestBed.createComponent(AdminParticipants)
    fixture.detectChanges()
    await waitForPageLoad(fixture)
    fixture.detectChanges()
    return {
      fixture,
      router,
      snack,
      dialog,
      listSeasonParticipants,
      removeSeasonParticipant,
    }
  }

  it('redirects unauthorized users to season agenda', async () => {
    const { router } = await setup(noPermissions())

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/saison', 'season-a'])
    })
  })

  it('shows breadcrumb without back chevron when authorized', async () => {
    const { fixture } = await setup(participantsAdmin())
    const el = fixture.nativeElement as HTMLElement

    expect(el.querySelector('app-context-breadcrumb')).toBeTruthy()
    expect(el.querySelector('.admin-participants__back')).toBeNull()
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Participants')
    expect(el.querySelector('.context-breadcrumb__link')?.textContent).toContain('Saison A')
    expect(text(fixture)).toContain('Guest Artist')
  })

  it('does not show breadcrumb before season context resolves', async () => {
    await TestBed.configureTestingModule({
      imports: [AdminParticipants, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
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
            resolveSeasonSlug: vi.fn().mockImplementation(
              () => new Promise(() => undefined),
            ),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            selectTroupe: vi.fn(),
            currentUserDisplayLabel: () => 'Admin',
          },
        },
        {
          provide: OrganizerApiService,
          useValue: { mySeasonPermissions: vi.fn() },
        },
        {
          provide: ParticipantApiService,
          useValue: { listSeasonParticipants: vi.fn(), removeSeasonParticipant: vi.fn() },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AdminParticipants)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-context-breadcrumb')).toBeNull()
  })

  it('opens add dialog and reloads list on success', async () => {
    const { fixture, dialog, listSeasonParticipants } = await setup(participantsAdmin(), {
      dialogAfterClosed: true,
    })

    expect(dialog.open).not.toHaveBeenCalled()
    const cmp = fixture.componentInstance as AdminParticipants
    cmp['openAddDialog']()
    expect(dialog.open).toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(listSeasonParticipants.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('removes a removable participant after confirm', async () => {
    const dialogRef = { afterClosed: () => of(true) }
    const dialog = { open: vi.fn().mockReturnValue(dialogRef) }
    const { fixture, removeSeasonParticipant, listSeasonParticipants } = await setup(participantsAdmin(), {
      dialog,
    })

    const cmp = fixture.componentInstance as AdminParticipants
    cmp['confirmRemove'](guest)
    await vi.waitFor(() => {
      expect(removeSeasonParticipant).toHaveBeenCalledWith('s1', 'p-guest')
    })
    await vi.waitFor(() => {
      expect(listSeasonParticipants.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('blocks remove for membership-synced rows', async () => {
    const member: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-member',
      displayName: 'Troupe Member',
      kind: 'MEMBER',
      troupeMembershipId: 'm-2',
      removable: false,
    }
    const { fixture, snack, removeSeasonParticipant } = await setup(participantsAdmin(), {
      participants: [member],
    })
    const cmp = fixture.componentInstance as AdminParticipants
    cmp['confirmRemove'](member)

    expect(snack.open).toHaveBeenCalledWith(
      expect.stringContaining('Membres'),
      'OK',
      expect.any(Object),
    )
    expect(removeSeasonParticipant).not.toHaveBeenCalled()
  })
})

async function waitForPageLoad(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 20; i++) {
    await fixture.whenStable()
    await new Promise((r) => setTimeout(r, 0))
    const cmp = fixture.componentInstance as { loading: () => boolean }
    if (!cmp.loading()) {
      return
    }
  }
}

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? ''
}

function season(id: string): SeasonResponse {
  return {
    id,
    troupeId: 't1',
    slug: 'season-a',
    title: 'Saison A',
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

function noPermissions(): MySeasonPermissions {
  return {
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
  }
}

function participantsAdmin(): MySeasonPermissions {
  return { ...noPermissions(), canManageSeasonParticipants: true, isTroupeAdmin: true }
}
