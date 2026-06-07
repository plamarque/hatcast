import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { ChanceBreakdownService } from './chance-breakdown.service'
import {
  CompositionSlotPickerDialog,
  type CompositionSlotPickerDialogData,
} from './composition-slot-picker-dialog'

describe('CompositionSlotPickerDialog', () => {
  let fixture: ComponentFixture<CompositionSlotPickerDialog>
  let close: ReturnType<typeof vi.fn>
  let breakdownOpen: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    close = vi.fn()
    breakdownOpen = vi.fn()
    await TestBed.configureTestingModule({
      imports: [CompositionSlotPickerDialog, NoopAnimationsModule],
      providers: [
        {
          provide: ChanceBreakdownService,
          useValue: { open: breakdownOpen },
        },
        {
          provide: MatDialogRef,
          useValue: { close },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            roleLabel: 'Comédien·ne',
            roleKey: 'player',
            seasonId: 'season-1',
            eventId: 'event-1',
            explainabilityEnabled: true,
            viewerParticipantIds: [],
            candidates: [
              {
                participantId: 'p-1',
                displayName: 'Alice',
                chancePercent: 60,
                pastSelectionCount: 0,
              },
            ],
            loading: false,
            error: null,
          } satisfies CompositionSlotPickerDialogData,
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(CompositionSlotPickerDialog)
    fixture.detectChanges()
  })

  it('lists candidates with percent', () => {
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('60')
  })

  it('closes with participantId on row click', () => {
    const row = fixture.nativeElement.querySelector(
      '.composition-slot-picker__row',
    ) as HTMLButtonElement
    row.click()
    expect(close).toHaveBeenCalledWith({ participantId: 'p-1' })
  })

  it('opens breakdown on percent trigger without selecting candidate', async () => {
    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="chance-breakdown-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    await fixture.whenStable()
    expect(breakdownOpen).toHaveBeenCalledWith({
      seasonId: 'season-1',
      eventId: 'event-1',
      roleKey: 'player',
      participantId: 'p-1',
      viewerParticipantIds: [],
    })
    expect(close).not.toHaveBeenCalled()
  })
})
