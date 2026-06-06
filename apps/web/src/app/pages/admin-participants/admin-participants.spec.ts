import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { provideRouter } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  OrganizerApiService,
  type MySeasonPermissions,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type SeasonParticipantAdmin,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { EditParticipantDialog } from '../../shared/edit-participant-dialog/edit-participant-dialog'
import {
  ORGANIZER_LIST_RELOAD_FAILED,
  PARTICIPATION_ROLE_UPDATE_FAILED,
} from '../../shared/admin-organizer-row/organizer-row.helper'
import { AdminParticipants } from './admin-participants'
import { AddParticipantDialog } from './add-participant-dialog'

describe('AdminParticipants', () => {
  const paramMap$ = new BehaviorSubject(
    convertToParamMap({ troupeSlug: 't1', seasonSlug: 'season-a' }),
  )

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
      organizers?: OrganizerResponse[]
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
    const deactivateMember = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const removeSeasonOrganizer = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const listSeasonOrganizers = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: options.organizers ?? [],
    })
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
            resolveSeasonInTroupe: vi.fn().mockResolvedValue({
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
            listSeasonOrganizers,
            addSeasonOrganizer: vi.fn().mockResolvedValue({ ok: true, status: 201 }),
            removeSeasonOrganizer,
          },
        },
        {
          provide: TroupeApiService,
          useValue: { deactivateMember },
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
      deactivateMember,
      removeSeasonOrganizer,
      listSeasonOrganizers,
    }
  }

  it('redirects unauthorized users to season agenda', async () => {
    const { router } = await setup(noPermissions())

    await vi.waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/saison', 't1', 'season-a'])
    })
  })

  it('allows platform admin without season permissions to manage participants', async () => {
    const router = { navigate: vi.fn().mockResolvedValue(true) }
    const listSeasonParticipants = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [guest],
    })

    await TestBed.configureTestingModule({
      imports: [AdminParticipants, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: {
                user: { email: 'platform@example.com', displayName: 'Platform' },
                platformAdmin: true,
              },
            }),
          },
        },
        {
          provide: TroupeSeasonResolverService,
          useValue: {
            resolveSeasonInTroupe: vi.fn().mockResolvedValue({
              kind: 'resolved',
              troupe: { id: 't1', name: 'Ma Troupe', slug: 't1' },
              season: season('s1'),
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: { selectTroupe: vi.fn(), currentUserDisplayLabel: () => 'Platform' },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            mySeasonPermissions: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: noPermissions(),
            }),
            listSeasonOrganizers: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          },
        },
        {
          provide: TroupeApiService,
          useValue: { deactivateMember: vi.fn() },
        },
        {
          provide: ParticipantApiService,
          useValue: { listSeasonParticipants, removeSeasonParticipant: vi.fn() },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AdminParticipants)
    fixture.detectChanges()
    await waitForPageLoad(fixture)
    fixture.detectChanges()

    expect(router.navigate).not.toHaveBeenCalled()
    expect(listSeasonParticipants).toHaveBeenCalled()
    expect(text(fixture)).toContain('Ajouter')
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
            resolveSeasonInTroupe: vi.fn().mockImplementation(
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
    expect(dialog.open).toHaveBeenCalledWith(AddParticipantDialog, {
      data: { seasonId: 's1', troupeId: 't1' },
      width: 'min(100vw - 2rem, 28rem)',
    })
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

  it('splits roster into Externes and Membres sections', async () => {
    const member: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-member',
      displayName: 'Alice Member',
      kind: 'MEMBER',
      troupeMembershipId: 'm-1',
      removable: false,
    }
    const external: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-guest',
      displayName: 'Guest Artist',
      kind: 'NAME_ONLY',
    }
    const { fixture } = await setup(participantsAdmin(), {
      participants: [member, external],
    })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Alice Member')
      expect(fixture.nativeElement.textContent).toContain('Guest Artist')
    })

    const root = fixture.nativeElement as HTMLElement
    expect(root.querySelector('#externes-heading')?.textContent).toContain('Externes')
    expect(root.querySelector('#membres-heading')?.textContent).toContain('Membres')

    const externesSection = root.querySelector('#externes-heading')?.closest('section')
    const membresSection = root.querySelector('#membres-heading')?.closest('section')
    expect(externesSection?.textContent).toContain('Guest Artist')
    expect(externesSection?.textContent).not.toContain('Alice Member')
    expect(membresSection?.textContent).toContain('Alice Member')
    expect(membresSection?.textContent).not.toContain('Guest Artist')
  })

  it('does not embed OrganisateursTab and keeps Participants title', async () => {
    const { fixture } = await setup(
      { ...participantsAdmin(), canManageSeasonOrganizers: true },
      {
        participants: [
          {
            ...guest,
            userId: 'u-guest',
            email: 'guest@example.com',
          },
        ],
        organizers: [
          {
            userId: 'u-guest',
            email: 'guest@example.com',
            displayName: 'Guest Artist',
            grantedAt: '',
          },
        ],
      },
    )

    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('app-organisateurs-tab')).toBeNull()
    expect(el.textContent).not.toContain('Organisateur·ices de saison')
    expect(el.textContent).toContain('Organisateur·ice')
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Participants')
  })

  it('shows delete for troupe member rows when canManageMembers', async () => {
    const member: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-member',
      displayName: 'Troupe Member',
      kind: 'MEMBER',
      troupeMembershipId: 'm-2',
      removable: false,
    }
    const { fixture } = await setup(participantsAdmin(), {
      participants: [member],
    })

    const deleteBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Retirer ce membre de la saison"]',
    )
    expect(deleteBtn).toBeTruthy()
  })

  it('removes troupe member from season after confirm without deactivating membership', async () => {
    const member: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-member',
      displayName: 'Troupe Member',
      kind: 'MEMBER',
      troupeMembershipId: 'm-2',
      removable: false,
    }
    const { fixture, deactivateMember, removeSeasonParticipant, snack } = await setup(
      participantsAdmin(),
      { participants: [member], dialogAfterClosed: true },
    )
    const cmp = fixture.componentInstance as AdminParticipants
    cmp['confirmRemove'](member)

    await vi.waitFor(() => {
      expect(removeSeasonParticipant).toHaveBeenCalledWith('s1', 'p-member')
    })
    expect(deactivateMember).not.toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(snack.open).toHaveBeenCalledWith('Membre retiré de la saison.', 'OK', {
        duration: 4000,
      })
    })
  })

  it('demotes a season organizer when removing them from the season roster', async () => {
    const organizerMember: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-orga',
      displayName: 'Orga Member',
      email: 'orga@example.com',
      userId: 'u-orga',
      kind: 'MEMBER',
      troupeMembershipId: 'm-orga',
      removable: false,
    }
    const {
      fixture,
      removeSeasonParticipant,
      removeSeasonOrganizer,
      listSeasonOrganizers,
    } = await setup(participantsAdmin(), {
      participants: [organizerMember],
      organizers: [
        {
          userId: 'u-orga',
          email: 'orga@example.com',
          displayName: 'Orga Member',
          grantedAt: '',
        },
      ],
      dialogAfterClosed: true,
    })
    const cmp = fixture.componentInstance as AdminParticipants
    cmp['confirmRemove'](organizerMember)

    await vi.waitFor(() => {
      expect(removeSeasonParticipant).toHaveBeenCalledWith('s1', 'p-orga')
    })
    await vi.waitFor(() => {
      expect(removeSeasonOrganizer).toHaveBeenCalledWith('s1', 'u-orga')
    })
    await vi.waitFor(() => {
      expect(listSeasonOrganizers.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('shows edit for external season participant and opens edit dialog', async () => {
    const linked: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-linked',
      displayName: 'Linked Guest',
      email: 'linked@example.com',
      userId: 'u-1',
      kind: 'LINKED',
    }
    const { fixture, dialog } = await setup(participantsAdmin(), {
      participants: [guest, linked],
    })
    await waitForPageLoad(fixture)

    const editButtons = fixture.nativeElement.querySelectorAll(
      'button[aria-label="Modifier le participant"]',
    )
    expect(editButtons.length).toBe(2)

    editButtons[0].dispatchEvent(new Event('click'))
    expect(dialog.open).toHaveBeenCalledWith(
      EditParticipantDialog,
      expect.objectContaining({
        data: expect.objectContaining({
          scope: 'season',
          seasonId: 's1',
          participantId: 'p-guest',
        }),
      }),
    )
  })

  it('hides edit for troupe member row', async () => {
    const member: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-member',
      displayName: 'Troupe Member',
      kind: 'MEMBER',
      troupeMembershipId: 'm-2',
    }
    const { fixture } = await setup(participantsAdmin(), { participants: [member] })
    await waitForPageLoad(fixture)

    expect(
      fixture.nativeElement.querySelector('button[aria-label="Modifier le participant"]'),
    ).toBeNull()
  })

  it('hides delete for troupe member without canManageMembers', async () => {
    const member: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-member',
      displayName: 'Troupe Member',
      kind: 'MEMBER',
      troupeMembershipId: 'm-2',
      removable: false,
    }
    const perms = { ...participantsAdmin(), canManageMembers: false }
    const { fixture } = await setup(perms, { participants: [member] })

    expect(
      fixture.nativeElement.querySelector('button.admin-row-delete-btn'),
    ).toBeNull()
  })

  it('shows snackbar when demoting organizer missing from cached list', async () => {
    const linked: SeasonParticipantAdmin = {
      ...guest,
      id: 'p-linked',
      email: 'linked@example.com',
      userId: 'u-1',
      kind: 'LINKED',
    }
    const { fixture, snack } = await setup(
      { ...participantsAdmin(), canManageSeasonOrganizers: true },
      { participants: [linked], organizers: [] },
    )
    const cmp = fixture.componentInstance as AdminParticipants
    await cmp['demoteSeasonOrganizer'](linked)

    expect(snack.open).toHaveBeenCalledWith(PARTICIPATION_ROLE_UPDATE_FAILED, 'OK', {
      duration: 5000,
    })
  })

  it('shows snackbar when organizer reload fails after mutation', async () => {
    const listSeasonOrganizers = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const snack = { open: vi.fn() }
    await TestBed.configureTestingModule({
      imports: [AdminParticipants, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: MatSnackBar, useValue: snack },
        { provide: MatDialog, useValue: { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) } },
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
            resolveSeasonInTroupe: vi.fn().mockResolvedValue({
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
              data: participantsAdmin(),
            }),
            listSeasonOrganizers,
            addSeasonOrganizer: vi.fn(),
            removeSeasonOrganizer: vi.fn(),
          },
        },
        { provide: TroupeApiService, useValue: { deactivateMember: vi.fn() } },
        {
          provide: ParticipantApiService,
          useValue: {
            listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, data: [] }),
            removeSeasonParticipant: vi.fn(),
            createSeasonParticipant: vi.fn(),
          },
        },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatSnackBar, { useValue: snack })

    const fixture = TestBed.createComponent(AdminParticipants)
    const cmp = fixture.componentInstance as AdminParticipants
    cmp['season'].set(season('s1'))
    await cmp['reloadSeasonOrganizers']('Organisateur·ice ajouté·e.')

    expect(snack.open).toHaveBeenCalledWith(ORGANIZER_LIST_RELOAD_FAILED, 'OK', {
      duration: 5000,
    })
    expect(snack.open).not.toHaveBeenCalledWith('Organisateur·ice ajouté·e.', 'OK', {
      duration: 4000,
    })
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
  return {
    ...noPermissions(),
    canManageSeasonParticipants: true,
    canManageMembers: true,
    isTroupeAdmin: true,
  }
}
