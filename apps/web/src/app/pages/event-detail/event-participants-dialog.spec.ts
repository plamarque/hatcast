import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { ParticipantApiService } from '../../core/participants/participant-api.service'
import {
  EventParticipantsDialog,
  type EventParticipantsDialogData,
} from './event-participants-dialog'

function dialogData(): EventParticipantsDialogData {
  return { seasonId: 'season-1', eventId: 'event-1' }
}

type Harness = {
  addEventParticipant: () => Promise<void>
  removeEventParticipant: (participantId: string) => Promise<void>
  close: () => void
  participantDisplayName: string
  participantEmail: string
  participantMessage: string
  eventParticipants: () => Array<{ id: string; displayName: string; email: string | null }>
}

async function setup(api: {
  listEventParticipants?: ReturnType<typeof vi.fn>
  createEventParticipant?: ReturnType<typeof vi.fn>
  removeEventParticipant?: ReturnType<typeof vi.fn>
}) {
  const listEventParticipants =
    api.listEventParticipants ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: [{ id: 'p-1', displayName: 'Jean', email: 'jean@example.com' }],
    })
  const createEventParticipant =
    api.createEventParticipant ?? vi.fn().mockResolvedValue({ ok: true, status: 200 })
  const removeEventParticipant =
    api.removeEventParticipant ?? vi.fn().mockResolvedValue({ ok: true, status: 200 })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventParticipantsDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: dialogData() },
      {
        provide: ParticipantApiService,
        useValue: { listEventParticipants, createEventParticipant, removeEventParticipant },
      },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventParticipantsDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return {
    fixture,
    close,
    listEventParticipants,
    createEventParticipant,
    removeEventParticipant,
    harness: () => fixture.componentInstance as unknown as Harness,
  }
}

describe('EventParticipantsDialog', () => {
  it('lists participants on open', async () => {
    const { fixture, listEventParticipants, harness } = await setup({})
    expect(listEventParticipants).toHaveBeenCalledWith('season-1', 'event-1')
    await vi.waitFor(() => {
      expect(harness().eventParticipants()).toHaveLength(1)
      expect(fixture.nativeElement.textContent).toContain('Jean')
    })
  })

  it('adds participant with display name and optional email', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const listEventParticipants = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, data: [] })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [{ id: 'p-2', displayName: 'Marie', email: null }],
      })
    const { harness, createEventParticipant: create } = await setup({
      createEventParticipant,
      listEventParticipants,
    })
    const h = harness()
    h.participantDisplayName = 'Marie'
    await h.addEventParticipant()
    expect(create).toHaveBeenCalledWith('season-1', 'event-1', {
      displayName: 'Marie',
      email: undefined,
    })
    expect(h.participantMessage).toContain('ajouté')
  })

  it('shows French message on 403 when adding', async () => {
    const createEventParticipant = vi.fn().mockResolvedValue({ ok: false, status: 403 })
    const { harness } = await setup({ createEventParticipant })
    const h = harness()
    h.participantDisplayName = 'X'
    await h.addEventParticipant()
    expect(h.participantMessage).toBe('Accès non autorisé.')
  })

  it('removes participant row', async () => {
    const removeEventParticipant = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const { harness, removeEventParticipant: remove } = await setup({ removeEventParticipant })
    await harness().removeEventParticipant('p-1')
    expect(remove).toHaveBeenCalledWith('season-1', 'event-1', 'p-1')
  })
})
