import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { EventApiService } from '../../core/events/event-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
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
      ],
    }).compileComponents()
    const editFixture = TestBed.createComponent(EventFormDialog)
    editFixture.detectChanges()
    expect(editFixture.componentInstance['selectedTemplateType']).toBe('custom')
  })
})
