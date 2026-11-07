import { Subject } from 'rxjs'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNativeDateAdapter } from '@angular/material/core'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { provideRouter } from '@angular/router'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { describe, expect, it, vi } from 'vitest'
import { of } from 'rxjs'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { MatSelectHarness } from '@angular/material/select/testing'

import { EventApiService } from '../../core/events/event-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { applyTemplate, emptyRoleSlots } from '../../core/events/event-types'
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
  apiOverrides: Partial<Pick<EventApiService, 'createEvent' | 'updateEvent' | 'openAvailabilityResilient' | 'closeAvailability'>> = {},
) {
  const close = vi.fn()
  const organizerApi = {
    listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    removeEventOrganizer: vi.fn().mockResolvedValue({ ok: true, status: 204 }),
  }

  await TestBed.configureTestingModule({
    imports: [EventFormDialog, NoopAnimationsModule],
    providers: [
      provideNativeDateAdapter(),
      provideRouter([]),
      { provide: OrganizerApiService, useValue: organizerApi },
      { provide: TroupeApiService, useValue: { listCategories: vi.fn().mockResolvedValue({ ok: true, data: [{ slug: 'deplacements', label: 'Déplacements' }] }) } },
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
  return { fixture, close, organizerApi }
}

const CREATE_START_DATE = new Date(2030, 5, 15, 12, 0, 0, 0)
const CREATE_START_TIME = formatStartTime(20, 0)
const CREATE_STARTS_AT_ISO = buildStartsAtIso(CREATE_START_DATE, 20, 0)

/** Accès test aux membres protected du dialog. */
function dialogHarness(fixture: ComponentFixture<EventFormDialog>): {
  form: { getRawValue: () => Record<string, unknown>; patchValue: (v: Record<string, unknown>) => void; controls: Record<string, { value: unknown; invalid: boolean }> }
  submit: () => Promise<void>
  formError: string
} {
  return fixture.componentInstance as unknown as {
    form: { getRawValue: () => Record<string, unknown>; patchValue: (v: Record<string, unknown>) => void; controls: Record<string, { value: unknown; invalid: boolean }> }
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

describe('EventFormDialog category regression', () => {
  it('does not expose a category field in the form', async () => {
    const { fixture } = await setup({
      mode: 'edit',
      seasonId: 'season-1',
      event: event('ev-1'),
    })
    const html = fixture.nativeElement.innerHTML
    expect(html).not.toMatch(/category/i)
    expect(html).not.toMatch(/Tag \(optionnel\)/)
    expect(fixture.nativeElement.querySelector('[formcontrolname="category"]')).toBeNull()
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
    expect(html).not.toMatch(/Type de spectacle|type de spectacle/)
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


describe('EventFormDialog unified editing permissions', () => {
  it('publishes for a composition-only organizer without an empty PATCH', async () => {
    const original = event('ev-1')
    const published = { ...original, availabilityOpenedAt: '2030-01-01T00:00:00Z' }
    const updateEvent = vi.fn()
    const openAvailabilityResilient = vi.fn().mockResolvedValue({ ok: true, data: published })
    const { fixture, close } = await setup({ mode: 'edit', seasonId: 'season-1', event: original, canManageEvents: false, canManageComposition: true, canManagePublication: true }, { updateEvent, openAvailabilityResilient })
    ;(fixture.componentInstance as unknown as { publishDraft: boolean }).publishDraft = true
    await dialogHarness(fixture).submit()
    expect(updateEvent).not.toHaveBeenCalled()
    expect(openAvailabilityResilient).toHaveBeenCalledWith('season-1', 'ev-1')
    expect(close).toHaveBeenCalledWith(published)
  })

  it('closes unchanged for a composition-only organizer without a PATCH', async () => {
    const original = event('ev-1')
    const updateEvent = vi.fn()
    const { fixture, close } = await setup({ mode: 'edit', seasonId: 'season-1', event: original, canManageEvents: false, canManageComposition: true }, { updateEvent })
    await dialogHarness(fixture).submit()
    expect(updateEvent).not.toHaveBeenCalled()
    expect(close).toHaveBeenCalledWith(original)
  })

  it('cancels a return to draft before saving any edits', async () => {
    const updateEvent = vi.fn()
    const closeAvailability = vi.fn()
    const { fixture, close } = await setup({ mode: 'edit', seasonId: 'season-1', event: { ...event('ev-1'), availabilityOpenedAt: '2030-01-01T00:00:00Z' }, canManageEvents: true, canManagePublication: true }, { updateEvent, closeAvailability })
    vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as never)
    dialogHarness(fixture).form.patchValue({ title: 'Titre modifié' })
    ;(fixture.componentInstance as unknown as { revertToDraft: boolean }).revertToDraft = true
    await dialogHarness(fixture).submit()
    expect(updateEvent).not.toHaveBeenCalled()
    expect(closeAvailability).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
  })

  it('shows an empty state when there are no dedicated organizers', async () => {
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', canManageEventOrganizers: true, organizers: [] })
    expect(fixture.nativeElement.textContent).toContain('Aucun·e organisateur·ice attitré·e')
  })

  it('hides organizer and category management when permissions are absent', async () => {
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', troupeSlug: 'improbots', canManageEvents: false, canManageComposition: true, canManageEventOrganizers: false, canManageTroupe: false })
    expect(fixture.nativeElement.textContent).not.toContain('Ajouter un·e organisateur·ice')
    expect(fixture.nativeElement.textContent).not.toContain('Gérer les catégories')
  })

  it('keeps organizer removals saved immediately when the other form changes are cancelled', async () => {
    const updateEvent = vi.fn()
    const { fixture, close, organizerApi } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', canManageEvents: true, canManageEventOrganizers: true, organizers: [{ userId: 'u1', email: 'a@example.test', displayName: 'Alice', grantedAt: '' }] }, { updateEvent })
    const changed = vi.fn()
    fixture.componentInstance.organizersChanged.subscribe(changed)
    dialogHarness(fixture).form.patchValue({ title: 'Non enregistré' })
    const dialogText = fixture.nativeElement.textContent as string
    expect(dialogText).not.toContain('enregistrés immédiatement, même si tu annules')
    const remove = fixture.nativeElement.querySelector('[aria-label="Retirer Alice"]') as HTMLElement
    expect(remove).not.toBeNull()
    remove.click()
    await vi.waitFor(() => expect(organizerApi.removeEventOrganizer).toHaveBeenCalledWith('season-1', 'ev-1', 'u1'))
    await vi.waitFor(() => expect(changed).toHaveBeenCalledOnce())
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).not.toContain('Alice')
    const cancel = [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLButtonElement) => button.textContent?.trim() === 'Annuler') as HTMLButtonElement
    cancel.click()
    expect(close).toHaveBeenCalled()
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('shows organizer removal errors without changing the list or notifying the parent', async () => {
    const { fixture, organizerApi } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', canManageEventOrganizers: true, organizers: [{ userId: 'u1', email: 'a@example.test', displayName: 'Alice', grantedAt: '' }] })
    organizerApi.removeEventOrganizer.mockResolvedValue({ ok: false, status: 403 })
    const changed = vi.fn()
    fixture.componentInstance.organizersChanged.subscribe(changed)
    ;(fixture.nativeElement.querySelector('[aria-label="Retirer Alice"]') as HTMLElement).click()
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Retrait impossible.') })
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(changed).not.toHaveBeenCalled()
  })

  it('refreshes and reports an organizer added through the existing picker', async () => {
    const { fixture, organizerApi } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', canManageEventOrganizers: true, organizers: [] })
    organizerApi.listEventOrganizers.mockResolvedValue({ ok: true, data: [{ userId: 'u1', email: 'a@example.test', displayName: 'Alice', grantedAt: '' }] })
    const changed = vi.fn()
    fixture.componentInstance.organizersChanged.subscribe(changed)
    const dialog = (fixture.componentInstance as unknown as { dialog: MatDialog }).dialog
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never)
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element: HTMLButtonElement) => element.textContent?.includes('Ajouter un·e organisateur·ice')) as HTMLButtonElement
    expect(button).toBeTruthy()
    button.click()
    expect(changed).toHaveBeenCalledOnce()
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Alice') })
    expect(organizerApi.listEventOrganizers).toHaveBeenCalledWith('season-1', 'ev-1')
  })

  it('keeps all pending changes while managing categories and refreshes their labels', async () => {
    const { fixture, close } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', troupeSlug: 'improbots', canManageTroupe: true, canManageEvents: true, canManageComposition: true, canManagePublication: true })
    const categories = vi.mocked(TestBed.inject(TroupeApiService).listCategories)
    categories.mockResolvedValue({ ok: true, data: [{ slug: 'deplacements', label: 'Déplacements modifiés' }, { slug: 'nouveau', label: 'Nouveau' }] } as never)
    const closed = new Subject<void>()
    const open = vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => closed.asObservable() } as never)
    const component = fixture.componentInstance as unknown as { selectedTemplate: string; selectedCategory: string | null; publishDraft: boolean; categoryOptions: { slug: string | null; label: string }[] }
    const changed = vi.fn()
    fixture.componentInstance.categoriesChanged.subscribe(changed)
    dialogHarness(fixture).form.patchValue({ title: 'Titre modifié', startDate: new Date(2031, 1, 2), startTime: '21:30' })
    component.selectedTemplate = 'cabaret'
    component.selectedCategory = 'deplacements'
    component.publishDraft = true
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element: HTMLButtonElement) => element.textContent?.includes('Gérer les catégories')) as HTMLButtonElement
    button.click()
    expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: { troupeId: 'troupe-1' } }))
    expect(close).not.toHaveBeenCalled()
    closed.next()
    await vi.waitFor(() => expect(component.categoryOptions).toContainEqual({ slug: 'nouveau', label: 'Nouveau' }))
    expect(component.categoryOptions).toContainEqual({ slug: 'deplacements', label: 'Déplacements modifiés' })
    expect(dialogHarness(fixture).form.getRawValue()).toMatchObject({ title: 'Titre modifié', startDate: new Date(2031, 1, 2), startTime: '21:30' })
    expect(component.selectedTemplate).toBe('cabaret')
    expect(component.selectedCategory).toBe('deplacements')
    expect(component.publishDraft).toBe(true)
    expect(changed).toHaveBeenCalledOnce()
  })

  it('retains a deleted selected category and requires another selection', async () => {
    const { fixture, close } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', troupeSlug: 'improbots', canManageTroupe: true, canManageEvents: true })
    vi.mocked(TestBed.inject(TroupeApiService).listCategories).mockResolvedValue({ ok: true, data: [] } as never)
    const closed = new Subject<void>()
    vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => closed.asObservable() } as never)
    const component = fixture.componentInstance as unknown as { selectedCategory: string | null; selectedCategoryMissing: boolean; onCategoryChanged: (slug: string | null) => void }
    component.selectedCategory = 'deplacements'
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element: HTMLButtonElement) => element.textContent?.includes('Gérer les catégories')) as HTMLButtonElement
    button.click(); closed.next()
    await vi.waitFor(() => expect(component.selectedCategoryMissing).toBe(true))
    fixture.detectChanges()
    expect(component.selectedCategory).toBe('deplacements')
    expect(fixture.nativeElement.textContent).toContain('La catégorie sélectionnée a été supprimée')
    await dialogHarness(fixture).submit()
    expect(close).not.toHaveBeenCalled()
    component.onCategoryChanged(null)
    expect(component.selectedCategoryMissing).toBe(false)
  })

  it('shows refresh errors and lets the user retry without losing the form', async () => {
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', troupeSlug: 'improbots', canManageTroupe: true, canManageEvents: true })
    const categories = vi.mocked(TestBed.inject(TroupeApiService).listCategories)
    categories.mockResolvedValueOnce({ ok: false, status: 500 } as never).mockResolvedValueOnce({ ok: true, data: [] } as never)
    const closed = new Subject<void>()
    vi.spyOn((fixture.componentInstance as unknown as { dialog: MatDialog }).dialog, 'open').mockReturnValue({ afterClosed: () => closed.asObservable() } as never)
    dialogHarness(fixture).form.patchValue({ title: 'Conservé' })
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element: HTMLButtonElement) => element.textContent?.includes('Gérer les catégories')) as HTMLButtonElement
    button.click(); closed.next()
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Impossible de charger les catégories.') })
    const retry = [...fixture.nativeElement.querySelectorAll('button')].find((element: HTMLButtonElement) => element.textContent?.trim() === 'Réessayer') as HTMLButtonElement
    retry.click()
    await vi.waitFor(() => { fixture.detectChanges(); expect(fixture.nativeElement.textContent).not.toContain('Impossible de charger les catégories.') })
    expect(dialogHarness(fixture).form.getRawValue()['title']).toBe('Conservé')
  })

  it('previews preset needs with French role labels', async () => {
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), canManageComposition: true })
    const component = fixture.componentInstance as unknown as { selectedTemplate: string }
    component.selectedTemplate = 'match'
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Comédiens·nes : 5')
    expect(fixture.nativeElement.textContent).toContain('Bénévoles : 5')
    expect(fixture.nativeElement.textContent).not.toContain('player :')
    expect(fixture.nativeElement.textContent).not.toContain('volunteer :')
  })

  it('lets a composition manager change the format without sending general details', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, data: event('ev-1') })
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), canManageEvents: false, canManageComposition: true }, { updateEvent })
    const [format] = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(MatSelectHarness)
    await format.open()
    await format.clickOptions({ text: /Cabaret/ })
    await dialogHarness(fixture).submit()
    expect(updateEvent).toHaveBeenCalledWith('season-1', 'ev-1', {
      templateType: 'cabaret', roleSlots: applyTemplate('cabaret'),
    })
  })


  it('loads categories and saves the selected category for an authorized editor', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, data: event('ev-1') })
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', canManageEvents: true }, { updateEvent })
    const [, category] = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(MatSelectHarness)
    await category.open()
    await category.clickOptions({ text: 'Déplacements' })
    await dialogHarness(fixture).submit()
    expect(updateEvent.mock.calls[0][2]).toHaveProperty('category', 'deplacements')
  })

  it('does not send a category when event editing is denied', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, data: event('ev-1') })
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), troupeId: 'troupe-1', canManageEvents: false, canManageComposition: true }, { updateEvent })
    const component = fixture.componentInstance as unknown as { selectedCategory: string | null; submit: () => Promise<void> }
    component.selectedCategory = 'deplacements'
    await component.submit()
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('does not include format changes when composition management is denied', async () => {
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, data: event('ev-1') })
    const { fixture } = await setup({ mode: 'edit', seasonId: 'season-1', event: event('ev-1'), canManageEvents: true, canManageComposition: false }, { updateEvent })
    const component = fixture.componentInstance as unknown as { selectedTemplate: string; submit: () => Promise<void> }
    component.selectedTemplate = 'cabaret'
    await component.submit()
    expect(updateEvent.mock.calls[0][2]).not.toHaveProperty('templateType')
    expect(updateEvent.mock.calls[0][2]).not.toHaveProperty('roleSlots')
  })
})
