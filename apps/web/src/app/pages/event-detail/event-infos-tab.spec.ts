import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { applyTemplate } from '../../core/events/event-types'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { CompositionApiService } from '../../core/composition/composition-api.service'
import { EventInfosTab } from './event-infos-tab'
import { EventEquityTagDialog } from './event-equity-tag-dialog'
import { EventOrganizersDialog } from './event-organizers-dialog'
import { EventTypeRolesDialog } from './event-type-roles-dialog'

function baseEvent(overrides: Partial<EventResponse> = {}): EventResponse {
  return {
    id: 'event-1',
    seasonId: 'season-1',
    slug: 'spectacle',
    title: 'Spectacle',
    description: null,
    location: null,
    startsAt: '2026-05-12T19:00:00.000Z',
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

const glossary = [
  { slug: 'deplacements', label: 'Déplacements' },
  { slug: 'aperock', label: 'Apérock' },
]

async function setup(options: {
  canManageEvents?: boolean
  canManageEventOrganizers?: boolean
  equityTag?: string | null
  organizers?: Array<{ userId: string; email: string; displayName: string | null }>
  updateEvent?: ReturnType<typeof vi.fn>
  dialogResult?: string | null | undefined
  typeRolesDialogResult?: { templateType: string; roleSlots: Record<string, number> }
  organizersDialogChanged?: boolean
}) {
  const updateEvent =
    options.updateEvent ??
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: baseEvent({ equityTag: 'deplacements' }),
    })
  const listEquityTags = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: glossary,
  })
  const snackOpen = vi.fn()
  const listEventOrganizers = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: options.organizers ?? [],
  })
  const getComposition = vi.fn().mockResolvedValue({
    ok: true,
    data: {
      publishedAt: null,
      validatedAt: null,
      visibility: 'none',
      slots: [],
    },
  })
  const dialogOpen = vi.fn().mockReturnValue({
    afterClosed: () => ({
      subscribe: (fn: (v: unknown) => void) => {
        if (options.organizersDialogChanged !== undefined) {
          fn(options.organizersDialogChanged ? true : undefined)
        } else if (options.typeRolesDialogResult !== undefined) {
          fn(options.typeRolesDialogResult)
        } else {
          fn(options.dialogResult)
        }
      },
    }),
  })

  await TestBed.configureTestingModule({
    imports: [EventInfosTab, NoopAnimationsModule],
    providers: [
      { provide: EventApiService, useValue: { updateEvent } },
      { provide: TroupeApiService, useValue: { listEquityTags } },
      {
        provide: OrganizerApiService,
        useValue: {
          listEventOrganizers,
          removeEventOrganizer: vi.fn().mockResolvedValue({ ok: true, status: 200 }),
        },
      },
      { provide: CompositionApiService, useValue: { getComposition } },
      { provide: MatSnackBar, useValue: { open: snackOpen } },
      { provide: MatDialog, useValue: { open: dialogOpen } },
    ],
  }).compileComponents()
  TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })
  TestBed.overrideProvider(MatSnackBar, { useValue: { open: snackOpen } })

  const fixture = TestBed.createComponent(EventInfosTab)
  fixture.componentRef.setInput('event', baseEvent({ equityTag: options.equityTag ?? null }))
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('canManageEvents', options.canManageEvents ?? true)
  fixture.componentRef.setInput(
    'canManageEventOrganizers',
    options.canManageEventOrganizers ?? false,
  )
  fixture.detectChanges()
  await fixture.whenStable()

  return { fixture, updateEvent, listEquityTags, listEventOrganizers, snackOpen, dialogOpen }
}

describe('EventInfosTab equity tag', () => {
  it('hides the equity section when the user cannot manage and no tag is set', async () => {
    const { fixture } = await setup({ canManageEvents: false, equityTag: null })

    expect(fixture.nativeElement.querySelector('.event-infos__equity')).toBeNull()
  })

  it('shows a read-only chip when a tag is set but the user cannot manage', async () => {
    const { fixture } = await setup({ canManageEvents: false, equityTag: 'deplacements' })

    await vi.waitFor(() => {
      const chip = fixture.nativeElement.querySelector('.event-infos__equity-chip')
      expect(chip?.textContent?.trim()).toBe('Déplacements')
    })
    expect(fixture.nativeElement.querySelector('.event-infos__add-tag')).toBeNull()
  })

  it('shows add-tag control when the user can manage and no tag is set', async () => {
    const { fixture } = await setup({ canManageEvents: true, equityTag: null })

    expect(fixture.nativeElement.querySelector('.event-infos__add-tag')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('.event-infos__equity-chip')).toBeNull()
  })

  it('shows a removable chip when a tag is set', async () => {
    const { fixture } = await setup({ canManageEvents: true, equityTag: 'deplacements' })

    await vi.waitFor(() => {
      expect(fixture.nativeElement.querySelector('.event-infos__equity-chip')).toBeTruthy()
    })
  })

  it('calls updateEvent with equityTag null when removing the chip', async () => {
    const updateEvent = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: baseEvent({ equityTag: null }),
    })
    const { fixture } = await setup({ equityTag: 'deplacements', updateEvent })
    const cmp = fixture.componentInstance as unknown as { removeTag: () => void }

    cmp.removeTag()
    await vi.waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith('season-1', 'event-1', { equityTag: null })
    })
  })

  it('opens the tag dialog and persists the result', async () => {
    const updateEvent = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: baseEvent({ equityTag: 'deplacements' }),
    })
    const { fixture, dialogOpen } = await setup({
      updateEvent,
      dialogResult: 'Déplacements',
    })
    const cmp = fixture.componentInstance as unknown as { openTagDialog: () => void }

    cmp.openTagDialog()
    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalledWith(
        EventEquityTagDialog,
        expect.objectContaining({
          data: expect.objectContaining({ troupeId: 'troupe-1' }),
        }),
      )
      expect(updateEvent).toHaveBeenCalledWith('season-1', 'event-1', { equityTag: 'Déplacements' })
    })
  })

  it('emits eventUpdated after a successful save from the dialog', async () => {
    const updated = baseEvent({ equityTag: 'aperock' })
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: updated })
    const { fixture } = await setup({ updateEvent, dialogResult: 'Apérock' })
    const spy = vi.fn()
    fixture.componentInstance.eventUpdated.subscribe(spy)
    const cmp = fixture.componentInstance as unknown as { openTagDialog: () => void }

    cmp.openTagDialog()
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(updated)
    })
  })

  it('places the equity section after the location field', async () => {
    const { fixture } = await setup({ equityTag: 'deplacements' })
    const labels = [...fixture.nativeElement.querySelectorAll('.event-infos__label')].map(
      (el: Element) => el.textContent?.trim(),
    )
    const lieuIdx = labels.indexOf('Lieu')
    const typeRolesIdx = labels.indexOf('Format et besoins')
    const tagIdx = labels.indexOf('Groupe de spectacles')
    expect(lieuIdx).toBeGreaterThanOrEqual(0)
    expect(typeRolesIdx).toBeGreaterThan(lieuIdx)
    expect(tagIdx).toBeGreaterThan(typeRolesIdx)
  })
})

describe('EventInfosTab organizers', () => {
  it('hides organizers section when empty and user cannot manage', async () => {
    const { fixture } = await setup({
      canManageEventOrganizers: false,
      organizers: [],
      equityTag: null,
      canManageEvents: false,
    })
    expect(fixture.nativeElement.querySelector('.event-infos__organizers')).toBeNull()
  })

  it('shows non-removable chips when organizers exist without manage rights', async () => {
    const { fixture } = await setup({
      canManageEventOrganizers: false,
      organizers: [{ userId: 'u-1', email: 'a@x.com', displayName: 'Alice' }],
      equityTag: null,
      canManageEvents: false,
    })
    await vi.waitFor(() => {
      const chip = fixture.nativeElement.querySelector('.event-infos__organizer-chip')
      expect(chip?.textContent?.trim()).toBe('Alice')
    })
    expect(fixture.nativeElement.querySelector('.event-infos__add-organizer')).toBeNull()
  })

  it('shows add control and opens organizers dialog when permitted', async () => {
    const { fixture, dialogOpen } = await setup({
      canManageEventOrganizers: true,
      organizers: [],
      equityTag: null,
    })
    expect(fixture.nativeElement.querySelector('.event-infos__add-organizer')).toBeTruthy()
    const cmp = fixture.componentInstance as unknown as { openOrganizersDialog: () => void }
    cmp.openOrganizersDialog()
    expect(dialogOpen).toHaveBeenCalledWith(
      EventOrganizersDialog,
      expect.objectContaining({
        data: { seasonId: 'season-1', eventId: 'event-1', troupeId: 'troupe-1' },
      }),
    )
  })

  it('removes organizer chip via API', async () => {
    const removeEventOrganizer = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const listEventOrganizers = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: [{ userId: 'u-1', email: 'a@x.com', displayName: 'Alice' }],
      })
      .mockResolvedValueOnce({ ok: true, status: 200, data: [] })
    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        { provide: EventApiService, useValue: { updateEvent: vi.fn() } },
        { provide: TroupeApiService, useValue: { listEquityTags: vi.fn().mockResolvedValue({ ok: true, data: [] }) } },
        {
          provide: OrganizerApiService,
          useValue: { listEventOrganizers, removeEventOrganizer },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()
    const fixture = TestBed.createComponent(EventInfosTab)
    fixture.componentRef.setInput('event', baseEvent())
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('canManageEventOrganizers', true)
    fixture.detectChanges()
    await fixture.whenStable()

    const cmp = fixture.componentInstance as unknown as { removeOrganizer: (id: string) => void }
    cmp.removeOrganizer('u-1')
    await vi.waitFor(() => {
      expect(removeEventOrganizer).toHaveBeenCalledWith('season-1', 'event-1', 'u-1')
    })
  })

  it('reloads organizers list after dialog closes with change', async () => {
    const { fixture, listEventOrganizers } = await setup({
      canManageEventOrganizers: true,
      organizersDialogChanged: true,
    })
    const cmp = fixture.componentInstance as unknown as { openOrganizersDialog: () => void }
    cmp.openOrganizersDialog()
    await vi.waitFor(() => {
      expect(listEventOrganizers.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('EventInfosTab type and roles', () => {
  it('shows type label and role summary for all users', async () => {
    const { fixture } = await setup({
      canManageEvents: false,
      equityTag: null,
    })
    fixture.componentRef.setInput(
      'event',
      baseEvent({
        templateType: 'match',
        roleSlots: { ...applyTemplate('match') },
      }),
    )
    fixture.detectChanges()
    await fixture.whenStable()

    expect(fixture.nativeElement.textContent).toContain('Match')
    expect(fixture.nativeElement.querySelector('.event-infos__format')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('.event-infos__format-edit')).toBeNull()
  })

  it('shows edit icon when user can manage events', async () => {
    const { fixture } = await setup({ canManageEvents: true, equityTag: null })
    const editBtn = fixture.nativeElement.querySelector('.event-infos__format-edit')
    expect(editBtn).toBeTruthy()
    expect(editBtn?.getAttribute('aria-label')).toBe('Modifier format et besoins')
  })

  it('opens type/roles dialog and PATCHes templateType and roleSlots', async () => {
    const updated = baseEvent({
      templateType: 'longform',
      roleSlots: applyTemplate('longform'),
    })
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: updated })
    const dialogOpen = vi.fn().mockReturnValue({
      afterClosed: () => ({
        subscribe: (fn: (v: { templateType: string; roleSlots: Record<string, number> } | undefined) => void) => {
          fn({ templateType: 'longform', roleSlots: applyTemplate('longform') })
        },
      }),
    })
    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        { provide: EventApiService, useValue: { updateEvent } },
        { provide: TroupeApiService, useValue: { listEquityTags: vi.fn().mockResolvedValue({ ok: true, data: [] }) } },
        {
          provide: OrganizerApiService,
          useValue: { listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }) },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })

    const fixture = TestBed.createComponent(EventInfosTab)
    fixture.componentRef.setInput('event', baseEvent())
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.componentRef.setInput('canManageEventOrganizers', false)
    fixture.detectChanges()

    const cmp = fixture.componentInstance as unknown as { openTypeRolesDialog: () => void }
    cmp.openTypeRolesDialog()
    await vi.waitFor(() => {
      expect(dialogOpen).toHaveBeenCalledWith(
        EventTypeRolesDialog,
        expect.objectContaining({
          data: expect.objectContaining({ seasonId: 'season-1', eventId: 'event-1' }),
        }),
      )
      expect(updateEvent).toHaveBeenCalledWith('season-1', 'event-1', {
        templateType: 'longform',
        roleSlots: applyTemplate('longform'),
      })
    })
  })

  it('shows snackbar when type/roles PATCH fails', async () => {
    const { fixture, snackOpen, updateEvent } = await setup({
      canManageEvents: true,
      equityTag: null,
      updateEvent: vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        errorMessage: 'Format invalide.',
      }),
      typeRolesDialogResult: { templateType: 'longform', roleSlots: applyTemplate('longform') },
    })
    const spy = vi.fn()
    fixture.componentInstance.eventUpdated.subscribe(spy)
    const cmp = fixture.componentInstance as unknown as { openTypeRolesDialog: () => void }

    cmp.openTypeRolesDialog()
    await vi.waitFor(() => {
      expect(updateEvent).toHaveBeenCalled()
    })
    await vi.waitFor(() => {
      expect(snackOpen).toHaveBeenCalledWith('Format invalide.', 'OK', { duration: 6000 })
    })
    expect(spy).not.toHaveBeenCalled()
  })

  it('emits eventUpdated after successful type/roles save', async () => {
    const updated = baseEvent({ templateType: 'catch', roleSlots: applyTemplate('catch') })
    const updateEvent = vi.fn().mockResolvedValue({ ok: true, status: 200, data: updated })
    const dialogOpen = vi.fn().mockReturnValue({
      afterClosed: () => ({
        subscribe: (fn: (v: { templateType: string; roleSlots: Record<string, number> } | undefined) => void) => {
          fn({ templateType: 'catch', roleSlots: applyTemplate('catch') })
        },
      }),
    })
    await TestBed.configureTestingModule({
      imports: [EventInfosTab, NoopAnimationsModule],
      providers: [
        { provide: EventApiService, useValue: { updateEvent } },
        { provide: TroupeApiService, useValue: { listEquityTags: vi.fn().mockResolvedValue({ ok: true, data: [] }) } },
        {
          provide: OrganizerApiService,
          useValue: { listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }) },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: dialogOpen } },
      ],
    }).compileComponents()
    TestBed.overrideProvider(MatDialog, { useValue: { open: dialogOpen } })

    const fixture = TestBed.createComponent(EventInfosTab)
    fixture.componentRef.setInput('event', baseEvent())
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('canManageEvents', true)
    fixture.componentRef.setInput('canManageEventOrganizers', false)
    const spy = vi.fn()
    fixture.componentInstance.eventUpdated.subscribe(spy)
    fixture.detectChanges()

    const cmp = fixture.componentInstance as unknown as { openTypeRolesDialog: () => void }
    cmp.openTypeRolesDialog()
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(updated)
    })
  })
})
