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
  })
}

describe('EventFormDialog equity tag regression', () => {
  it('does not expose an equity tag field in the form', async () => {
    const { fixture } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: event('ev-1'),
    })
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toMatch(/equityTag/i)
    expect(html).not.toMatch(/Tag \(optionnel\)/)
    expect(fixture.nativeElement.querySelector('[formcontrolname="equityTag"]')).toBeNull()
  })
})

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

describe('EventFormDialog slug field regression', () => {
  it('does not expose a slug field in the form', async () => {
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' })
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toMatch(/Identifiant URL/)
    expect(html).not.toMatch(/Lien partageable/)
    expect(fixture.nativeElement.querySelector('[formcontrolname="slug"]')).toBeNull()
  })

  it('createEvent payload omits slug', async () => {
    const created = event('ev-new')
    const createEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: created })
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' }, { createEvent })
    fillRequiredCreateFields(fixture)
    const cmp = fixture.componentInstance as unknown as { submit: () => Promise<void> }
    await cmp.submit()
    expect(createEvent).toHaveBeenCalledWith('season-1', expect.not.objectContaining({ slug: expect.anything() }))
    const body = createEvent.mock.calls[0]?.[1] as Record<string, unknown>
    expect(body).not.toHaveProperty('slug')
  })

  it('updateEvent payload omits slug', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: event('ev-1') })
    const { fixture } = await setup(
      { mode: 'edit', seasonId: 'season-1', event: event('ev-1') },
      { updateEvent },
    )
    const cmp = fixture.componentInstance as unknown as {
      form: { patchValue: (v: Record<string, string>) => void }
      submit: () => Promise<void>
    }
    cmp.form.patchValue({ title: 'Nouveau titre' })
    await cmp.submit()
    expect(updateEvent).toHaveBeenCalledWith('season-1', 'ev-1', expect.not.objectContaining({ slug: expect.anything() }))
    const body = updateEvent.mock.calls[0]?.[2] as Record<string, unknown>
    expect(body).not.toHaveProperty('slug')
  })

  it('surfaces generic API error on failed update', async () => {
    const updateEvent = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      errorMessage: 'Mise à jour impossible : conflit.',
    })
    const { fixture, close } = await setup(
      { mode: 'edit', seasonId: 'season-1', event: event('ev-1') },
      { updateEvent },
    )
    const cmp = fixture.componentInstance as unknown as { submit: () => Promise<void> }
    await cmp.submit()
    expect(updateEvent).toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
    const err = (cmp as unknown as { formError: string }).formError
    expect(err).toContain('Mise à jour impossible')
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.form-error')?.textContent).toContain(
      'Mise à jour impossible',
    )
  })

  it('surfaces generic API error on failed create', async () => {
    const createEvent = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      errorMessage: 'Création impossible : conflit sur le titre.',
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
    const err = (cmp as unknown as { formError: string }).formError
    expect(err).toContain('Création impossible')
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('.form-error')?.textContent).toContain('Création impossible')
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
