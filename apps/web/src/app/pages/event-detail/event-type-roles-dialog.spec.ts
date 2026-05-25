import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import {
  applyTemplate,
  emptyRoleSlots,
  type EventTypeId,
} from '../../core/events/event-types'
import {
  EventTypeRolesDialog,
  type EventTypeRolesDialogData,
} from './event-type-roles-dialog'

function dialogData(overrides: Partial<EventTypeRolesDialogData> = {}): EventTypeRolesDialogData {
  return {
    seasonId: 'season-1',
    eventId: 'event-1',
    templateType: 'cabaret',
    roleSlots: applyTemplate('cabaret'),
    ...overrides,
  }
}

async function setup(data: EventTypeRolesDialogData) {
  const close = vi.fn()
  await TestBed.configureTestingModule({
    imports: [EventTypeRolesDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventTypeRolesDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture, close }
}

type Harness = {
  onTemplateSelected: (id: EventTypeId) => void
  confirmTemplateChange: () => void
  onRoleCountChange: (role: 'player', raw: string) => void
  submit: () => void
  showTemplateChangeConfirmation: boolean
  selectedTemplateType: EventTypeId
  roleSlots: Record<string, number>
}

function harness(fixture: ComponentFixture<EventTypeRolesDialog>): Harness {
  return fixture.componentInstance as unknown as Harness
}

describe('EventTypeRolesDialog', () => {
  it('shows template change confirmation when roles differ from template', async () => {
    const customSlots = { ...applyTemplate('cabaret'), player: 99 }
    const { fixture } = await setup(
      dialogData({ templateType: 'cabaret', roleSlots: customSlots }),
    )
    const h = harness(fixture)

    h.onTemplateSelected('match')
    fixture.detectChanges()

    expect(h.showTemplateChangeConfirmation).toBe(true)
    expect(fixture.nativeElement.textContent).toContain('Changement de type de spectacle')
  })

  it('applies template slots on confirm', async () => {
    const customSlots = { ...applyTemplate('cabaret'), player: 99 }
    const { fixture } = await setup(
      dialogData({ templateType: 'cabaret', roleSlots: customSlots }),
    )
    const h = harness(fixture)

    h.onTemplateSelected('match')
    h.confirmTemplateChange()
    fixture.detectChanges()

    expect(h.selectedTemplateType).toBe('match')
    expect(h.roleSlots).toEqual(applyTemplate('match'))
    expect(h.showTemplateChangeConfirmation).toBe(false)
  })

  it('closes with normalized result on save', async () => {
    const { fixture, close } = await setup(dialogData())
    const h = harness(fixture)

    h.onRoleCountChange('player', '25')
    h.submit()

    expect(close).toHaveBeenCalledWith(
      expect.objectContaining({
        templateType: expect.any(String),
        roleSlots: expect.objectContaining({ player: 20 }),
      }),
    )
  })

  it('initializes templateType from API value', async () => {
    const { fixture } = await setup(
      dialogData({ templateType: 'match', roleSlots: emptyRoleSlots() }),
    )
    expect(harness(fixture).selectedTemplateType).toBe('match')
  })
})
