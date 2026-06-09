import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import {
  EventOrganizersDialog,
  type EventOrganizersDialogData,
} from './event-organizers-dialog'

function dialogData(): EventOrganizersDialogData {
  return { seasonId: 'season-1', eventId: 'event-1', troupeId: 'troupe-1' }
}

const troupeMembers = {
  content: [
    {
      id: 'm-1',
      userId: 'u-1',
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
  submit: () => Promise<void>
  close: () => void
  onPickerInput: (value: string) => void
  onMemberSelected: (email: string) => void
  pickerQuery: () => string
  errorMessage: () => string
  filteredMembers: () => Array<{ id: string; email: string | null }>
}

async function setup(api: {
  listEventOrganizers?: ReturnType<typeof vi.fn>
  addEventOrganizer?: ReturnType<typeof vi.fn>
  listMembers?: ReturnType<typeof vi.fn>
}) {
  const listEventOrganizers =
    api.listEventOrganizers ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [{ userId: 'u-1', email: 'alice@example.com', displayName: 'Alice' }],
    })
  const addEventOrganizer =
    api.addEventOrganizer ?? vi.fn().mockResolvedValue({ ok: true, status: 200 })
  const listMembers =
    api.listMembers ?? vi.fn().mockResolvedValue({ ok: true, status: 200, data: troupeMembers })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventOrganizersDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: dialogData() },
      {
        provide: OrganizerApiService,
        useValue: { listEventOrganizers, addEventOrganizer },
      },
      { provide: TroupeApiService, useValue: { listMembers } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventOrganizersDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return {
    fixture,
    close,
    listEventOrganizers,
    addEventOrganizer,
    listMembers,
    harness: () => fixture.componentInstance as unknown as Harness,
  }
}

describe('EventOrganizersDialog', () => {
  it('does not render an organizers list', async () => {
    const { fixture } = await setup({})
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toContain('Retirer')
    expect(fixture.nativeElement.textContent).toContain('Ajouter un·e organisateur·ice')
  })

  it('loads troupe members and excludes already assigned organizers from suggestions', async () => {
    const { listMembers, harness } = await setup({})
    expect(listMembers).toHaveBeenCalledWith('troupe-1', 0, 100)
    await vi.waitFor(() => {
      expect(harness().filteredMembers().map((m) => m.email)).toEqual(['bob@example.com'])
    })
  })

  it('filters members by name or email', async () => {
    const { harness } = await setup({})
    await vi.waitFor(() => expect(harness().filteredMembers()).toHaveLength(1))
    harness().onPickerInput('bob')
    expect(harness().filteredMembers()[0]?.email).toBe('bob@example.com')
  })

  it('closes with true after successful add', async () => {
    const addEventOrganizer = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const { close, harness } = await setup({ addEventOrganizer })
    const h = harness()
    h.onPickerInput('bob@example.com')
    await h.submit()
    expect(addEventOrganizer).toHaveBeenCalledWith('season-1', 'event-1', 'bob@example.com')
    expect(close).toHaveBeenCalledWith(true)
  })

  it('closes without result when dismissed without adding', async () => {
    const { close, harness } = await setup({})
    harness().close()
    expect(close).toHaveBeenCalledWith()
  })

  it('shows French message on 404 when adding', async () => {
    const addEventOrganizer = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    const { close, harness } = await setup({ addEventOrganizer })
    const h = harness()
    h.onPickerInput('missing@example.com')
    await h.submit()
    expect(h.errorMessage()).toBe('Utilisateur introuvable.')
    expect(close).not.toHaveBeenCalled()
  })
})
