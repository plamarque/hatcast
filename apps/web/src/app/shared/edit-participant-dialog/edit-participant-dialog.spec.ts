import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { describe, expect, it, vi } from 'vitest'

import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { ParticipantGenderToggleField } from '../participant-add/participant-gender-toggle-field'
import {
  EditParticipantDialog,
  type EditParticipantDialogData,
} from './edit-participant-dialog'

function seasonDialogData(
  overrides: Partial<Extract<EditParticipantDialogData, { scope: 'season' }>> = {},
): EditParticipantDialogData {
  return {
    scope: 'season',
    seasonId: 'season-1',
    participantId: 'p-1',
    displayName: 'Marie',
    email: null,
    genderManagedOnAccount: false,
    participantGender: null,
    ...overrides,
  }
}

describe('EditParticipantDialog', () => {
  it('shows gender toggle and sends gender on update when writable', async () => {
    const updateSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await TestBed.configureTestingModule({
      imports: [EditParticipantDialog, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: seasonDialogData({ participantGender: 'female' }) },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: ParticipantApiService,
          useValue: { updateSeasonParticipant, updateEventParticipant: vi.fn() },
        },
      ],
    }).compileComponents()

    const fixture: ComponentFixture<EditParticipantDialog> = TestBed.createComponent(EditParticipantDialog)
    fixture.detectChanges()

    expect(document.querySelector('[data-testid="participant-gender-group"]')).toBeTruthy()

    await fixture.componentInstance.submit()

    expect(updateSeasonParticipant).toHaveBeenCalledWith('season-1', 'p-1', {
      displayName: 'Marie',
      gender: 'female',
    })
  })

  it('hides writable toggle payload when gender managed on account', async () => {
    const updateSeasonParticipant = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await TestBed.configureTestingModule({
      imports: [EditParticipantDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: seasonDialogData({
            genderManagedOnAccount: true,
            participantGender: null,
            accountGender: 'male',
          }),
        },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: ParticipantApiService,
          useValue: { updateSeasonParticipant, updateEventParticipant: vi.fn() },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EditParticipantDialog)
    fixture.detectChanges()

    expect(document.querySelector('.participant-gender-field__managed-hint')?.textContent).toContain(
      'Mon compte',
    )
    const genderField = fixture.debugElement.query(By.directive(ParticipantGenderToggleField))
      .componentInstance as ParticipantGenderToggleField
    expect(genderField.accountGender()).toBe('male')
    expect(genderField.readOnlyManagedOnAccount()).toBe(true)

    await fixture.componentInstance.submit()

    expect(updateSeasonParticipant).toHaveBeenCalledWith('season-1', 'p-1', {
      displayName: 'Marie',
    })
  })
})
