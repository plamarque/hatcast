import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { EventFormDialog } from './event-form-dialog'
import type { EventResponse } from '../../core/events/event-api.service'

type EventFormHarness = EventFormDialog & {
  onTemplateSelected(typeId: import('../../core/events/event-types').EventTypeId): void
  confirmTemplateChange(): void
}

describe('EventFormDialog', () => {
  let fixture: ComponentFixture<EventFormDialog>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode: 'create', seasonId: 'season-1' },
        },
        {
          provide: EventApiService,
          useValue: { createEvent: vi.fn().mockResolvedValue({ ok: true }) },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }),
            addEventOrganizer: vi.fn(),
            removeEventOrganizer: vi.fn(),
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(EventFormDialog)
    fixture.detectChanges()
  })

  it('defaults to cabaret template slots on create', () => {
    const cmp = fixture.componentInstance
    expect(cmp['selectedTemplateType']).toBe('cabaret')
    expect(cmp['roleSlots']).toEqual(ROLE_TEMPLATES.cabaret)
  })

  it('does not show event organizers while creating an event', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
      'Organisateur·ices du spectacle',
    )
  })

  it('shows confirmation when changing type after customization', () => {
    const cmp = fixture.componentInstance as EventFormHarness
    cmp['roleSlots'] = { ...ROLE_TEMPLATES.cabaret, player: 6 }
    cmp.onTemplateSelected('match')
    expect(cmp['showTemplateChangeConfirmation']).toBe(true)
    expect(cmp['pendingTemplateId']).toBe('match')
  })

  it('applies template on confirm', () => {
    const cmp = fixture.componentInstance as EventFormHarness
    cmp['roleSlots'] = { ...ROLE_TEMPLATES.cabaret, player: 6 }
    cmp.onTemplateSelected('match')
    cmp.confirmTemplateChange()
    expect(cmp['selectedTemplateType']).toBe('match')
    expect(cmp['roleSlots']).toEqual(ROLE_TEMPLATES.match)
    expect(cmp['showTemplateChangeConfirmation']).toBe(false)
  })

  it('edit mode preserves persisted templateType over slot inference', async () => {
    fixture.destroy()
    await TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [EventFormDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            seasonId: 'season-1',
            canManageEventOrganizers: true,
            event: {
              id: 'e1',
              seasonId: 'season-1',
              title: 'Test',
              description: null,
              location: null,
              startsAt: '2030-01-01T12:00:00.000Z',
              archived: false,
              templateType: 'custom',
              roleSlots: ROLE_TEMPLATES.cabaret,
              createdAt: '',
              updatedAt: '',
            } satisfies EventResponse,
          },
        },
        {
          provide: EventApiService,
          useValue: { updateEvent: vi.fn().mockResolvedValue({ ok: true }) },
        },
        {
          provide: OrganizerApiService,
          useValue: {
            listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }),
            addEventOrganizer: vi.fn(),
            removeEventOrganizer: vi.fn(),
          },
        },
      ],
    }).compileComponents()
    const editFixture = TestBed.createComponent(EventFormDialog)
    editFixture.detectChanges()
    expect(editFixture.componentInstance['selectedTemplateType']).toBe('custom')
  })

  it('hides event organizers in edit mode without organizer-management permission', async () => {
    fixture.destroy()
    await TestBed.resetTestingModule()
    const organizerApi = {
      listEventOrganizers: vi.fn().mockResolvedValue({ ok: true, data: [] }),
      addEventOrganizer: vi.fn(),
      removeEventOrganizer: vi.fn(),
    }
    await TestBed.configureTestingModule({
      imports: [EventFormDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            seasonId: 'season-1',
            canManageEventOrganizers: false,
            event: {
              id: 'e1',
              seasonId: 'season-1',
              title: 'Test',
              description: null,
              location: null,
              startsAt: '2030-01-01T12:00:00.000Z',
              archived: false,
              templateType: 'cabaret',
              roleSlots: ROLE_TEMPLATES.cabaret,
              createdAt: '',
              updatedAt: '',
            } satisfies EventResponse,
          },
        },
        {
          provide: EventApiService,
          useValue: { updateEvent: vi.fn().mockResolvedValue({ ok: true }) },
        },
        { provide: OrganizerApiService, useValue: organizerApi },
      ],
    }).compileComponents()
    const editFixture = TestBed.createComponent(EventFormDialog)
    editFixture.detectChanges()
    await editFixture.whenStable()

    expect(organizerApi.listEventOrganizers).not.toHaveBeenCalled()
    expect((editFixture.nativeElement as HTMLElement).textContent).not.toContain(
      'Organisateur·ices du spectacle',
    )
  })

  it('loads event organizers when editing an event', async () => {
    fixture.destroy()
    await TestBed.resetTestingModule()
    const organizerApi = {
      listEventOrganizers: vi.fn().mockResolvedValue({
        ok: true,
        data: [{ userId: 'u1', email: 'orga@example.com', displayName: 'Orga', grantedAt: '' }],
      }),
      addEventOrganizer: vi.fn(),
      removeEventOrganizer: vi.fn(),
    }
    await TestBed.configureTestingModule({
      imports: [EventFormDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            seasonId: 'season-1',
            canManageEventOrganizers: true,
            event: {
              id: 'e1',
              seasonId: 'season-1',
              title: 'Test',
              description: null,
              location: null,
              startsAt: '2030-01-01T12:00:00.000Z',
              archived: false,
              templateType: 'cabaret',
              roleSlots: ROLE_TEMPLATES.cabaret,
              createdAt: '',
              updatedAt: '',
            } satisfies EventResponse,
          },
        },
        {
          provide: EventApiService,
          useValue: { updateEvent: vi.fn().mockResolvedValue({ ok: true }) },
        },
        { provide: OrganizerApiService, useValue: organizerApi },
      ],
    }).compileComponents()
    const editFixture = TestBed.createComponent(EventFormDialog)
    editFixture.detectChanges()
    await editFixture.whenStable()
    editFixture.detectChanges()

    expect(organizerApi.listEventOrganizers).toHaveBeenCalledWith('season-1', 'e1')
    expect((editFixture.nativeElement as HTMLElement).textContent).toContain('orga@example.com')
  })
})
