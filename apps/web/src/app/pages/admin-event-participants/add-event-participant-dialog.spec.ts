import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatAutocompleteTrigger } from '@angular/material/autocomplete'
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import {
  AddEventParticipantDialog,
  type AddEventParticipantDialogData,
} from './add-event-participant-dialog'

function dialogData(): AddEventParticipantDialogData {
  return { seasonId: 'season-1', eventId: 'event-1', troupeId: 'troupe-1' }
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
  ],
  page: 0,
  size: 100,
  totalElements: 2,
  totalPages: 1,
}

type Harness = {
  filteredSuggestions: () => Array<{ userId: string; displayName: string; email: string | null }>
  onDisplayNameInput: (value: string) => void
  onMemberOptionSelected: (userId: string) => void
  onSuggestionOptionSelected?: (key: string) => void
  displayName: () => string
  email: () => string
  gender: { set: (value: 'male' | 'female' | 'non_specified') => void }
  selectedMember: () => unknown
  submit: () => Promise<void>
  error: () => string
}

async function setup(api: {
  listMembers?: ReturnType<typeof vi.fn>
  listEventParticipantRoster?: ReturnType<typeof vi.fn>
  listSeasonParticipants?: ReturnType<typeof vi.fn>
  createEventParticipant?: ReturnType<typeof vi.fn>
  includeSeasonParticipantOnEvent?: ReturnType<typeof vi.fn>
}) {
  const listMembers =
    api.listMembers ?? vi.fn().mockResolvedValue({ ok: true, status: 200, data: troupeMembers })
  const listEventParticipantRoster =
    api.listEventParticipantRoster ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [
        {
          seasonParticipantId: 'sp-1',
          eventParticipantId: null,
          displayName: 'Alice',
          email: 'alice@example.com',
          userId: 'u-1',
          kind: 'MEMBER',
          source: 'SEASON',
        },
      ],
    })
  const listSeasonParticipants =
    api.listSeasonParticipants ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [
        {
          id: 'sp-2',
          displayName: 'Laetitia MC',
          email: 'laetitia@example.com',
          userId: 'u-10',
          troupeMembershipId: 'm-10',
          kind: 'EXTERNE',
          status: 'ACTIVE',
          removable: true,
        },
      ],
    })
  const createEventParticipant =
    api.createEventParticipant ?? vi.fn().mockResolvedValue({ ok: true, status: 201 })
  const includeSeasonParticipantOnEvent =
    api.includeSeasonParticipantOnEvent ?? vi.fn().mockResolvedValue({ ok: true, status: 204 })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [AddEventParticipantDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: dialogData() },
      {
        provide: ParticipantApiService,
        useValue: {
          listEventParticipantRoster,
          listSeasonParticipants,
          createEventParticipant,
          includeSeasonParticipantOnEvent,
        },
      },
      { provide: TroupeApiService, useValue: { listMembers } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(AddEventParticipantDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  const harness = () => fixture.componentInstance as unknown as Harness
  await vi.waitFor(() => {
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions().some((m) => m.displayName === 'Bob')).toBe(true)
  })
  harness().onDisplayNameInput('')
  return {
    fixture,
    close,
    listMembers,
    listEventParticipantRoster,
    createEventParticipant,
    harness,
  }
}

describe('AddEventParticipantDialog', () => {
  it('loads troupe members, season roster, and excludes event roster rows', async () => {
    const { listMembers, harness } = await setup({})
    expect(listMembers).toHaveBeenCalledWith('troupe-1', 0, 100)
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions().map((m) => m.displayName)).toEqual(['Bob'])
    harness().onDisplayNameInput('Laet')
    expect(harness().filteredSuggestions().map((m) => m.displayName)).toEqual(['Laetitia MC'])
  })

  it('excludes roster rows by display name when userId is null', async () => {
    const { harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: [
          {
            seasonParticipantId: null,
            eventParticipantId: 'ep-guest',
            displayName: 'Alice',
            email: null,
            userId: null,
            kind: 'GUEST',
            source: 'EVENT',
          },
        ],
      }),
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('alice')
    expect(harness().filteredSuggestions()).toEqual([])
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions().map((m) => m.displayName)).toEqual(['Bob'])
  })

  it('filters suggestions by query', async () => {
    const { harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('alice')
    expect(harness().filteredSuggestions()[0]?.displayName).toBe('Alice')
  })

  it('submits season roster selection without troupeMembershipId', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { close, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('Laet')
    harness().onSuggestionOptionSelected!('s:sp-2')
    expect(harness().email()).toBe('laetitia@example.com')
    await harness().submit()
    expect(createEventParticipant).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'Laetitia MC',
      email: 'laetitia@example.com',
    })
    expect(close).toHaveBeenCalledWith(true)
  })

  it('re-includes excluded troupe member via roster include API', async () => {
    const includeSeasonParticipantOnEvent = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { close, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      listSeasonParticipants: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        data: [
          {
            id: 'sp-bob',
            displayName: 'Bob',
            email: 'bob@example.com',
            userId: 'u-2',
            troupeMembershipId: 'm-2',
            kind: 'MEMBER',
            status: 'ACTIVE',
            removable: true,
          },
        ],
      }),
      includeSeasonParticipantOnEvent,
      createEventParticipant,
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    harness().onSuggestionOptionSelected!('m:m-2')
    await harness().submit()
    expect(includeSeasonParticipantOnEvent).toHaveBeenCalledWith('season-1', 'event-1', 'sp-bob')
    expect(createEventParticipant).not.toHaveBeenCalled()
    expect(close).toHaveBeenCalledWith(true)
  })

  it('prefills email on member selection and submits', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { close, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('alice')
    harness().onMemberOptionSelected('u-1')
    expect(harness().email()).toBe('alice@example.com')
    await harness().submit()
    expect(createEventParticipant).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'Alice',
      email: 'alice@example.com',
      troupeMembershipId: 'm-1',
    })
    expect(close).toHaveBeenCalledWith(true)
  })

  it('submits free-text name without member selection', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { close, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    harness().onDisplayNameInput('Guest')
    await harness().submit()
    expect(createEventParticipant).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'Guest',
      email: undefined,
    })
    expect(close).toHaveBeenCalledWith(true)
  })

  it('shows event scope hint for free-text guest add', async () => {
    const { fixture, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onDisplayNameInput('Ruben')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Externe spectacle — ce spectacle seulement')
  })

  it('hides event scope hint when troupe member is selected', async () => {
    const { fixture, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onMemberOptionSelected('u-1')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Externe spectacle — ce spectacle seulement')
  })

  it('does not show event scope hint before name is entered', async () => {
    const { fixture } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Externe spectacle — ce spectacle seulement')
  })

  it('renders addToSeasonRoster checkbox default off for guest add', async () => {
    const { fixture, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    harness().onDisplayNameInput('DJ')
    fixture.detectChanges()
    const checkbox = fixture.nativeElement.querySelector('mat-checkbox')
    expect(checkbox).toBeTruthy()
    expect(checkbox.textContent).toContain('Ajouter aussi à la saison')
    expect(checkbox.classList.contains('mat-mdc-checkbox-checked')).toBe(false)
  })

  it('submits addToSeasonRoster when checkbox is checked', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { harness, fixture } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    harness().onDisplayNameInput('DJ Opt-in')
    const cmp = fixture.componentInstance as unknown as { addToSeasonRoster: { set: (v: boolean) => void } }
    cmp.addToSeasonRoster.set(true)
    await harness().submit()
    expect(createEventParticipant).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'DJ Opt-in',
      addToSeasonRoster: true,
    })
  })

  it('loads event roster to build exclusion sets', async () => {
    const listEventParticipantRoster = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [],
    })
    const { listEventParticipantRoster: list } = await setup({ listEventParticipantRoster })
    expect(list).toHaveBeenCalledWith('season-1', 'event-1')
  })

  it('wires mat-autocomplete and avatar on display name field', async () => {
    const { fixture, harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    expect(fixture.nativeElement.querySelector('mat-autocomplete')).toBeTruthy()
    harness().onDisplayNameInput('alice')
    fixture.detectChanges()
    const trigger = fixture.debugElement
      .query(By.css('input[matinput]'))
      .injector.get(MatAutocompleteTrigger)
    trigger.openPanel()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(document.querySelector('.cdk-overlay-container app-user-avatar')).toBeTruthy()
  })

  it('includes gender in create payload for name-only add', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    harness().onDisplayNameInput('Marie')
    harness().gender.set('female')
    await harness().submit()
    expect(createEventParticipant).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'Marie',
      gender: 'female',
    })
  })

  it('omits gender when typeahead selects member with account M/F', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    const { harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    harness().onDisplayNameInput('bob')
    harness().onMemberOptionSelected('u-2')
    await harness().submit()
    expect(createEventParticipant).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'Bob',
      email: 'bob@example.com',
      troupeMembershipId: 'm-2',
    })
  })

  it('shows validation error when name is empty', async () => {
    const { harness, createEventParticipant } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
    })
    await harness().submit()
    expect(harness().error()).toBe('Saisissez un nom.')
    expect(createEventParticipant).not.toHaveBeenCalled()
  })

  it('maps API 409 to French duplicate-name message', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: false, status: 409 })
    const { harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    harness().onDisplayNameInput('Guest')
    await harness().submit()
    expect(harness().error()).toBe('Un participant avec ce nom existe déjà.')
  })

  it('maps API 403 to French unauthorized message', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: false, status: 403 })
    const { harness } = await setup({
      listEventParticipantRoster: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
      createEventParticipant,
    })
    harness().onDisplayNameInput('Guest')
    await harness().submit()
    expect(harness().error()).toBe('Accès non autorisé.')
  })

  it('shows future notifications hint copy', async () => {
    const { fixture } = await setup({})
    expect(fixture.nativeElement.textContent).toContain('externes du carnet')
    expect(fixture.nativeElement.textContent).toContain('invitations et notifications à venir')
  })
})
