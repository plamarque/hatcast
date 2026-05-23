import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import type { EventResponse } from '../../core/events/event-api.service'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { EventFormDialog, type EventFormDialogData } from './event-form-dialog'

function event(id: string): EventResponse {
  return {
    id,
    seasonId: 'season-1',
    title: 'Spectacle',
    description: null,
    location: null,
    startsAt: '2030-06-15T18:00:00Z',
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
  }
}

async function setup(data: EventFormDialogData) {
  const listEventParticipants = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: [],
  })

  await TestBed.configureTestingModule({
    imports: [EventFormDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: MAT_DIALOG_DATA, useValue: data },
      {
        provide: EventApiService,
        useValue: { updateEvent: vi.fn(), createEvent: vi.fn() },
      },
      {
        provide: OrganizerApiService,
        useValue: {
          listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, status: 200, data: [] }),
          addEventOrganizer: vi.fn(),
          removeEventOrganizer: vi.fn(),
        },
      },
      {
        provide: ParticipantApiService,
        useValue: {
          listEventParticipants,
          createEventParticipant: vi.fn(),
          removeEventParticipant: vi.fn(),
        },
      },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventFormDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture, listEventParticipants }
}

describe('EventFormDialog participants section', () => {
  it('does not load event participants without permission', async () => {
    const { listEventParticipants } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: event('ev-1'),
      canManageEventParticipants: false,
    })

    expect(listEventParticipants).not.toHaveBeenCalled()
  })

  it('loads event participants in edit mode when permitted', async () => {
    const { listEventParticipants } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: event('ev-1'),
      canManageEventParticipants: true,
    })

    await vi.waitFor(() => {
      expect(listEventParticipants).toHaveBeenCalledWith('season-1', 'ev-1')
    })
  })

  it('does not load event participants in create mode', async () => {
    const { listEventParticipants } = await setup({
      mode: 'create',
      seasonId: 'season-1',
      canManageEventParticipants: true,
    })

    expect(listEventParticipants).not.toHaveBeenCalled()
  })
})
