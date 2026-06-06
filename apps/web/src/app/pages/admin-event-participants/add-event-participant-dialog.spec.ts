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
  displayName: () => string
  email: () => string
  selectedMember: () => unknown
  submit: () => Promise<void>
  error: () => string
}

async function setup(api: {
  listMembers?: ReturnType<typeof vi.fn>
  listEventParticipantRoster?: ReturnType<typeof vi.fn>
  createEventParticipant?: ReturnType<typeof vi.fn>
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
  const createEventParticipant =
    api.createEventParticipant ?? vi.fn().mockResolvedValue({ ok: true, status: 201 })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [AddEventParticipantDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: dialogData() },
      {
        provide: ParticipantApiService,
        useValue: { listEventParticipantRoster, createEventParticipant },
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
  it('loads troupe members and excludes roster user ids', async () => {
    const { listMembers, harness } = await setup({})
    expect(listMembers).toHaveBeenCalledWith('troupe-1', 0, 100)
    await vi.waitFor(() => expect(harness().filteredSuggestions()).toEqual([]))
    harness().onDisplayNameInput('bob')
    expect(harness().filteredSuggestions().map((m) => m.displayName)).toEqual(['Bob'])
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

  it('preserves event-only intro hint', async () => {
    const { fixture } = await setup({})
    expect(fixture.nativeElement.textContent).toContain(
      'Personne présente uniquement pour ce spectacle',
    )
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
    expect(fixture.nativeElement.textContent).toContain('invitations et notifications à venir')
  })
})
