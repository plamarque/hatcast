import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { slugifyTitle } from '../../core/navigation/url-slug'

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
    slug: 'spectacle-test',
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

async function setup(
  data: EventFormDialogData,
  apiOverrides: Partial<Pick<EventApiService, 'createEvent' | 'updateEvent'>> = {},
) {
  const listEventParticipants = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: [],
  })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventFormDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: data },
      {
        provide: EventApiService,
        useValue: {
          updateEvent: vi.fn(),
          createEvent: vi.fn(),
          ...apiOverrides,
        },
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
  return { fixture, listEventParticipants, close }
}

function fillRequiredCreateFields(fixture: ComponentFixture<EventFormDialog>): void {
  const cmp = fixture.componentInstance as unknown as {
    form: { patchValue: (v: Record<string, string>) => void }
  }
  cmp.form.patchValue({
    title: 'Cabaret test',
    startsAtLocal: '2030-06-15T18:00',
    slug: 'cabaret-test',
  })
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

describe('EventFormDialog slug field', () => {
  it('prefills slug from title on blur in create mode', async () => {
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' })
    const cmp = fixture.componentInstance as unknown as {
      form: { controls: { title: { setValue: (v: string) => void }; slug: { value: string } } }
      onTitleBlur: () => void
    }
    cmp.form.controls.title.setValue('Cabaret de rentrée')
    cmp.onTitleBlur()
    expect(cmp.form.controls.slug.value).toBe(slugifyTitle('Cabaret de rentrée'))
  })

  it('does not overwrite slug after manual edit', async () => {
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' })
    const cmp = fixture.componentInstance as unknown as {
      slugTouched: boolean
      form: {
        controls: { title: { setValue: (v: string) => void }; slug: { setValue: (v: string) => void; value: string } }
      }
      onTitleBlur: () => void
      onSlugInput: () => void
    }
    cmp.form.controls.slug.setValue('mon-slug')
    cmp.onSlugInput()
    cmp.form.controls.title.setValue('Autre titre')
    cmp.onTitleBlur()
    expect(cmp.form.controls.slug.value).toBe('mon-slug')
  })

  it('surfaces API error message on failed create', async () => {
    const createEvent = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      errorMessage: 'L’identifiant URL ne peut pas reprendre le format d’un identifiant technique.',
    })
    const { fixture, close } = await setup(
      { mode: 'create', seasonId: 'season-1' },
      { createEvent },
    )
    fillRequiredCreateFields(fixture)
    const cmp = fixture.componentInstance as unknown as { submit: () => Promise<void> }
    await cmp.submit()
    expect(createEvent).toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
    const err = (cmp as unknown as { slugError: string }).slugError
    expect(err).toContain('identifiant technique')
  })

  it('closes with created event on success', async () => {
    const created = event('ev-new')
    const createEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: created })
    const { fixture, close } = await setup(
      { mode: 'create', seasonId: 'season-1' },
      { createEvent },
    )
    fillRequiredCreateFields(fixture)
    const cmp = fixture.componentInstance as unknown as { submit: () => Promise<void> }
    await cmp.submit()
    expect(close).toHaveBeenCalledWith(created)
  })
})
