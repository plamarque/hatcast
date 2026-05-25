import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNativeDateAdapter } from '@angular/material/core'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import type { EventResponse } from '../../core/events/event-api.service'
import {
  buildStartsAtIso,
  EventFormDialog,
  formatStartTime,
  parseStartsAt,
  parseStartTime,
  resolveStartTimeParts,
  startTimeForForm,
  type EventFormDialogData,
} from './event-form-dialog'

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
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [EventFormDialog, NoopAnimationsModule],
    providers: [
      provideNativeDateAdapter(),
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
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventFormDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture, close }
}

const CREATE_START_DATE = new Date(2030, 5, 15, 12, 0, 0, 0)
const CREATE_START_TIME = formatStartTime(20, 0)
const CREATE_STARTS_AT_ISO = buildStartsAtIso(CREATE_START_DATE, 20, 0)

/** Accès test aux membres protected du dialog. */
function dialogHarness(fixture: ComponentFixture<EventFormDialog>): {
  form: { patchValue: (v: Record<string, unknown>) => void; controls: Record<string, { value: unknown; invalid: boolean }> }
  submit: () => Promise<void>
  formError: string
} {
  return fixture.componentInstance as unknown as {
    form: { patchValue: (v: Record<string, unknown>) => void; controls: Record<string, { value: unknown; invalid: boolean }> }
    submit: () => Promise<void>
    formError: string
  }
}

function fillRequiredCreateFields(fixture: ComponentFixture<EventFormDialog>): void {
  dialogHarness(fixture).form.patchValue({
    title: 'Cabaret test',
    startDate: CREATE_START_DATE,
    startTime: CREATE_START_TIME,
  })
}

describe('EventFormDialog datetime pickers', () => {
  it('does not use datetime-local input', async () => {
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' })
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toMatch(/datetime-local/i)
    expect(fixture.nativeElement.querySelector('[formcontrolname="startsAtLocal"]')).toBeNull()
  })

  it('renders Material datepicker and ngx-mat-timepicker (24h dial)', async () => {
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' })
    expect(fixture.nativeElement.querySelector('mat-datepicker')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('[formcontrolname="startDate"]')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('[formcontrolname="startTime"]')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('ngx-mat-timepicker')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('ngx-mat-timepicker-toggle')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('[formcontrolname="startHour"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[formcontrolname="startMinute"]')).toBeNull()
  })

  it('createEvent sends startsAt ISO from local date and time', async () => {
    const createEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: event('ev-new') })
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' }, { createEvent })
    fillRequiredCreateFields(fixture)
    await dialogHarness(fixture).submit()
    const body = createEvent.mock.calls[0]?.[1] as { startsAt: string }
    expect(body.startsAt).toBe(CREATE_STARTS_AT_ISO)
  })

  it('edit mode initializes startTime from event.startsAt', async () => {
    const iso = '2030-06-15T18:00:00Z'
    const { fixture } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: { ...event('ev-1'), startsAt: iso },
    })
    const expected = parseStartsAt(iso)
    const { controls } = dialogHarness(fixture).form
    expect(controls['startTime'].value).toBe(formatStartTime(expected.hour, expected.minute))
    const date = controls['startDate'].value as Date | null
    expect(date?.getFullYear()).toBe(expected.date.getFullYear())
    expect(date?.getMonth()).toBe(expected.date.getMonth())
    expect(date?.getDate()).toBe(expected.date.getDate())
  })

  it('updateEvent sends new startsAt when time changes', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: event('ev-1') })
    const { fixture } = await setup(
      { mode: 'edit', seasonId: 'season-1', event: event('ev-1') },
      { updateEvent },
    )
    const harness = dialogHarness(fixture)
    const date = harness.form.controls['startDate'].value as Date
    harness.form.patchValue({ startTime: '21:30' })
    await harness.submit()
    const body = updateEvent.mock.calls[0]?.[2] as { startsAt: string }
    expect(body.startsAt).toBe(buildStartsAtIso(date, 21, 30))
  })

  it('stays invalid without start date on submit', async () => {
    const createEvent = vi.fn()
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' }, { createEvent })
    const harness = dialogHarness(fixture)
    harness.form.patchValue({
      title: 'Sans date',
      startDate: null,
    })
    await harness.submit()
    expect(createEvent).not.toHaveBeenCalled()
    expect(harness.form.controls['startDate'].invalid).toBe(true)
  })
})

describe('parseStartsAt / buildStartsAtIso / parseStartTime', () => {
  it('round-trips local wall clock', () => {
    const date = new Date(2030, 5, 15, 12, 0, 0, 0)
    const iso = buildStartsAtIso(date, 20, 0)
    const parsed = parseStartsAt(iso)
    expect(parsed.hour).toBe(20)
    expect(parsed.minute).toBe(0)
    expect(parsed.date.getDate()).toBe(15)
    expect(parsed.date.getMonth()).toBe(5)
  })

  it('parseStartTime accepts HH:mm 24h', () => {
    expect(parseStartTime('21:30')).toEqual({ hour: 21, minute: 30 })
    expect(parseStartTime('invalid')).toBeNull()
    expect(parseStartTime('25:00')).toBeNull()
  })

  it('resolveStartTimeParts uses midnight when empty', () => {
    expect(resolveStartTimeParts('')).toEqual({ hour: 0, minute: 0 })
    expect(resolveStartTimeParts('21:30')).toEqual({ hour: 21, minute: 30 })
  })

  it('startTimeForForm hides midnight (unspecified time)', () => {
    expect(startTimeForForm(0, 0)).toBe('')
    expect(startTimeForForm(20, 0)).toBe('20:00')
  })
})

describe('EventFormDialog optional start time', () => {
  const dateOnlyStartsAtIso = buildStartsAtIso(CREATE_START_DATE, 0, 0)

  it('createEvent uses midnight when startTime is empty', async () => {
    const createEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: event('ev-new') })
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' }, { createEvent })
    dialogHarness(fixture).form.patchValue({
      title: 'Sans heure',
      startDate: CREATE_START_DATE,
      startTime: '',
    })
    await dialogHarness(fixture).submit()
    const body = createEvent.mock.calls[0]?.[1] as { startsAt: string }
    expect(body.startsAt).toBe(dateOnlyStartsAtIso)
  })

  it('edit mode shows empty startTime when event is at midnight (unspecified)', async () => {
    const iso = buildStartsAtIso(CREATE_START_DATE, 0, 0)
    const { fixture } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: { ...event('ev-1'), startsAt: iso },
    })
    expect(dialogHarness(fixture).form.controls['startTime'].value).toBe('')
  })

  it('does not submit with invalid startTime', async () => {
    const createEvent = vi.fn()
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' }, { createEvent })
    const harness = dialogHarness(fixture)
    harness.form.patchValue({
      title: 'Heure invalide',
      startDate: CREATE_START_DATE,
      startTime: '99:99',
    })
    await harness.submit()
    expect(createEvent).not.toHaveBeenCalled()
    expect(harness.form.controls['startTime'].invalid).toBe(true)
  })
})

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

describe('EventFormDialog organizers and participants regression', () => {
  it('does not expose organizer or participant sections', async () => {
    const { fixture } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: event('ev-1'),
    })
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toContain('Organisateur·ices du spectacle')
    expect(html).not.toContain('Participants du spectacle')
  })
})

describe('EventFormDialog type and roles regression', () => {
  it('does not expose type or role controls in the form', async () => {
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' })
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toMatch(/Type de spectacle/)
    expect(fixture.nativeElement.querySelector('[formcontrolname="templateType"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('.roles-grid')).toBeNull()
    expect(html).not.toMatch(/Personnaliser/)
    expect(html).not.toMatch(/Changement de type/)
  })

  it('createEvent payload omits templateType and roleSlots', async () => {
    const createEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: event('ev-new') })
    const { fixture } = await setup({ mode: 'create', seasonId: 'season-1' }, { createEvent })
    fillRequiredCreateFields(fixture)
    await dialogHarness(fixture).submit()
    const body = createEvent.mock.calls[0]?.[1] as Record<string, unknown>
    expect(body).not.toHaveProperty('templateType')
    expect(body).not.toHaveProperty('roleSlots')
  })

  it('updateEvent payload omits templateType and roleSlots', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: event('ev-1') })
    const { fixture } = await setup(
      { mode: 'edit', seasonId: 'season-1', event: event('ev-1') },
      { updateEvent },
    )
    const harness = dialogHarness(fixture)
    harness.form.patchValue({ title: 'Nouveau titre' })
    await harness.submit()
    const body = updateEvent.mock.calls[0]?.[2] as Record<string, unknown>
    expect(body).not.toHaveProperty('templateType')
    expect(body).not.toHaveProperty('roleSlots')
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
    await dialogHarness(fixture).submit()
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
    const harness = dialogHarness(fixture)
    harness.form.patchValue({ title: 'Nouveau titre' })
    await harness.submit()
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
    const harness = dialogHarness(fixture)
    await harness.submit()
    expect(updateEvent).toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
    expect(harness.formError).toContain('Mise à jour impossible')
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
    const harness = dialogHarness(fixture)
    await harness.submit()
    expect(createEvent).toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
    expect(harness.formError).toContain('Création impossible')
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
    await dialogHarness(fixture).submit()
    expect(close).toHaveBeenCalledWith(created)
  })
})
