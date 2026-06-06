import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import {
  AddParticipantDialog,
  type AddParticipantDialogData,
} from './add-participant-dialog'

function dialogData(): AddParticipantDialogData {
  return { seasonId: 'season-1', troupeId: 'troupe-1' }
}

const troupeMembers = {
  content: [
    {
      id: 'm-1',
      userId: 'u-1',
      userSlug: 'alice',
      email: 'alice@example.com',
      displayName: 'Alice',
      status: 'ACTIVE',
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm-2',
      userId: 'u-2',
      userSlug: 'bob',
      email: 'bob@example.com',
      displayName: 'Bob',
      gender: 'male',
      status: 'ACTIVE',
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm-3',
      userId: 'u-3',
      userSlug: 'noemail',
      email: null,
      displayName: 'No Email',
      status: 'ACTIVE',
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm-4',
      userId: null,
      userSlug: null,
      email: 'ruben@cambo.fr',
      displayName: 'Ruben DJ',
      status: 'ACTIVE',
      baselineRole: 'EXTERNE',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'm-5',
      userId: 'u-4',
      userSlug: 'carol',
      email: 'carol@example.com',
      displayName: 'Carol',
      status: 'INACTIVE',
      baselineRole: 'MEMBER',
      createdAt: '',
      updatedAt: '',
    },
  ],
  page: 0,
  size: 100,
  totalElements: 4,
  totalPages: 1,
}

type Harness = {
  filteredSuggestions: () => Array<{
    userId: string
    displayName: string
    email: string | null
    gender?: 'male' | 'female' | 'non_specified' | null
  }>
  onDisplayNameInput: (value: string) => void
  onMemberOptionSelected: (userId: string) => void
  onSuggestionOptionSelected?: (key: string) => void
  onMemberSelected: (member: (typeof troupeMembers.content)[number]) => void
  displayName: () => string
  email: () => string
  gender: { set: (value: 'male' | 'female' | 'non_specified') => void }
  selectedMember: () => unknown
  selectedSuggestion: () => unknown
  submit: () => Promise<void>
  error: () => string
}

function harnessFrom(fixture: ComponentFixture<AddParticipantDialog>): Harness {
  const cmp = fixture.componentInstance as unknown as Harness
  return cmp
}

async function setup(api: {
  listMembers?: ReturnType<typeof vi.fn>
  listSeasonParticipants?: ReturnType<typeof vi.fn>
  createSeasonParticipant?: ReturnType<typeof vi.fn>
}) {
  const listMembers =
    api.listMembers ?? vi.fn().mockResolvedValue({ ok: true, status: 200, data: troupeMembers })
  const listSeasonParticipants =
    api.listSeasonParticipants ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [
        {
          id: 'p-1',
          displayName: 'Alice',
          email: 'alice@example.com',
          userId: 'u-1',
          troupeMembershipId: 'm-1',
          kind: 'MEMBER',
          status: 'ACTIVE',
          removable: false,
        },
      ],
    })
  const createSeasonParticipant =
    api.createSeasonParticipant ?? vi.fn().mockResolvedValue({ ok: true, status: 201 })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [AddParticipantDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: dialogData() },
      {
        provide: ParticipantApiService,
        useValue: { listSeasonParticipants, createSeasonParticipant },
      },
      { provide: TroupeApiService, useValue: { listMembers } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(AddParticipantDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  const harness = () => harnessFrom(fixture)
  await vi.waitFor(() => {
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions().some((m) => m.displayName === 'Bob')).toBe(true)
  })
  harness().onDisplayNameInput('')
  return {
    fixture,
    close,
    listMembers,
    listSeasonParticipants,
    createSeasonParticipant,
    harness,
  }
}

describe('AddParticipantDialog', () => {
  it('loads troupe members on init', async () => {
    const { listMembers } = await setup({})
    expect(listMembers).toHaveBeenCalledWith('troupe-1', 0, 100)
  })

  it('excludes active season participants from suggestions', async () => {
    const { harness } = await setup({})
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('alice')
    expect(harness().filteredSuggestions()).toEqual([])
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions().map((m) => m.displayName)).toEqual(['Bob'])
  })

  it('filters suggestions by display name or email', async () => {
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions()[0]?.displayName).toBe('Bob')
    expect(harness().filteredSuggestions()[0]?.gender).toBe('male')
  })

  it('prefills email when a member is selected via autocomplete option', async () => {
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    harness().onMemberOptionSelected('u-2')
    expect(harness().displayName()).toBe('Bob')
    expect(harness().email()).toBe('bob@example.com')
  })

  it('clears stale email when selecting a member without email', async () => {
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    harness().onMemberOptionSelected('u-2')
    harness().onDisplayNameInput('no')
    harness().onMemberOptionSelected('u-3')
    expect(harness().displayName()).toBe('No Email')
    expect(harness().email()).toBe('')
  })

  it('clears selected member and email when typing freely after selection', async () => {
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    harness().onMemberOptionSelected('u-2')
    harness().onDisplayNameInput('Bob Custom')
    expect(harness().selectedSuggestion()).toBeNull()
    expect(harness().displayName()).toBe('Bob Custom')
    expect(harness().email()).toBe('')
  })

  it('submits free-text participant without selection', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { close, harness, createSeasonParticipant: create } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    harness().onDisplayNameInput('Guest')
    await harness().submit()
    expect(create).toHaveBeenCalledWith('season-1', {
      displayName: 'Guest',
      email: undefined,
    })
    expect(close).toHaveBeenCalledWith(true)
  })

  it('submits selected member with prefilled email', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { close, harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    harness().onMemberOptionSelected('u-2')
    await harness().submit()
    expect(createSeasonParticipant).toHaveBeenCalledWith('season-1', {
      displayName: 'Bob',
      email: 'bob@example.com',
      troupeMembershipId: 'm-2',
    })
    expect(close).toHaveBeenCalledWith(true)
  })

  it('wires mat-autocomplete on display name field', async () => {
    const { fixture, harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    expect(fixture.nativeElement.querySelector('mat-autocomplete')).toBeTruthy()
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions()[0]?.displayName).toBe('Bob')
  })

  it('loads season participants to build exclusion sets', async () => {
    const listSeasonParticipants = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [
        {
          id: 'p-1',
          displayName: 'Alice',
          email: 'alice@example.com',
          userId: 'u-1',
          troupeMembershipId: 'm-1',
          kind: 'MEMBER',
          status: 'ACTIVE',
          removable: false,
        },
      ],
    })
    const { listSeasonParticipants: list } = await setup({ listSeasonParticipants })
    expect(list).toHaveBeenCalledWith('season-1')
  })

  it('includes gender in create payload for name-only add', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    harness().onDisplayNameInput('Marie')
    harness().gender.set('female')
    await harness().submit()
    expect(createSeasonParticipant).toHaveBeenCalledWith('season-1', {
      displayName: 'Marie',
      gender: 'female',
    })
  })

  it('omits gender when typeahead selects member with account M/F', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    harness().onMemberSelected(troupeMembers.content[1])
    await harness().submit()
    expect(createSeasonParticipant).toHaveBeenCalledWith('season-1', {
      displayName: 'Bob',
      email: 'bob@example.com',
      troupeMembershipId: 'm-2',
    })
  })

  it('shows validation error when name is empty', async () => {
    const { harness, createSeasonParticipant } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await harness().submit()
    expect(harness().error()).toBe('Saisissez un nom.')
    expect(createSeasonParticipant).not.toHaveBeenCalled()
  })

  it('maps API 409 to French duplicate-name message', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: false, status: 409 })
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    harness().onDisplayNameInput('Guest')
    await harness().submit()
    expect(harness().error()).toBe('Un participant avec ce nom existe déjà.')
  })

  it('maps API 403 to French unauthorized message', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: false, status: 403 })
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    harness().onDisplayNameInput('Guest')
    await harness().submit()
    expect(harness().error()).toBe('Accès non autorisé.')
  })

  it('renders avatar in suggestion option rows when panel opens', async () => {
    const { fixture, harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onDisplayNameInput('bob')
    fixture.detectChanges()
    const trigger = fixture.debugElement
      .query(By.css('input[matinput]'))
      .injector.get(MatAutocompleteTrigger)
    trigger.openPanel()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(document.querySelector('.cdk-overlay-container app-user-avatar')).toBeTruthy()
  })

  it('shows season scope hint for free-text guest add', async () => {
    const { fixture, harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onDisplayNameInput('Laetitia')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain(
      'Externe saison — disponibilités sur toute la saison',
    )
  })

  it('hides season scope hint when troupe member is selected', async () => {
    const { fixture, harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onMemberSelected(troupeMembers.content[1])
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain(
      'Externe saison — disponibilités sur toute la saison',
    )
  })

  it('shows future notifications hint copy', async () => {
    const { fixture } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    expect(fixture.nativeElement.textContent).toContain('externes du carnet')
    expect(fixture.nativeElement.textContent).not.toContain('participants de la saison')
    expect(fixture.nativeElement.textContent).toContain('invitations et notifications à venir')
  })

  it('suggests EXTERNE carnet rows without linked userId', async () => {
    const { harness } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onDisplayNameInput('Ruben')
    expect(harness().filteredSuggestions().map((s) => s.displayName)).toEqual(['Ruben DJ'])
  })

  it('submits carnet selection with troupeMembershipId', async () => {
    const createSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { harness, close } = await setup({
      listSeasonParticipants: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createSeasonParticipant,
    })
    harness().onDisplayNameInput('Ruben')
    harness().onSuggestionOptionSelected!('m:m-4')
    await harness().submit()
    expect(createSeasonParticipant).toHaveBeenCalledWith('season-1', {
      displayName: 'Ruben DJ',
      email: 'ruben@cambo.fr',
      troupeMembershipId: 'm-4',
    })
    expect(close).toHaveBeenCalledWith(true)
  })
})
