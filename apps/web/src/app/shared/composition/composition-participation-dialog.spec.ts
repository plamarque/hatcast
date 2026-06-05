import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import {
  CompositionParticipationDialog,
  type CompositionParticipationDialogData,
} from './composition-participation-dialog'

describe('CompositionParticipationDialog', () => {
  let fixture: ComponentFixture<CompositionParticipationDialog>
  let close: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    close = vi.fn()
    await TestBed.configureTestingModule({
      imports: [CompositionParticipationDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            eventTitle: 'Gala',
            eventDate: '2026-05-12T19:00:00.000Z',
            roleLabel: 'Comédien·ne',
            roleEmoji: '🎭',
            currentStatus: 'pending',
          } satisfies CompositionParticipationDialogData,
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(CompositionParticipationDialog)
    fixture.detectChanges()
  })

  it('shows event and role recap', () => {
    expect(fixture.nativeElement.textContent).toContain('Gala')
    expect(fixture.nativeElement.textContent).toContain('Comédien·ne')
    expect(fixture.nativeElement.textContent).toContain('Confirmer ma participation')
    const note = fixture.nativeElement.querySelector('#participation-note') as HTMLTextAreaElement
    expect(note.placeholder).toBe('Message pour les orgas.')
  })

  it('closes with status only on confirm', () => {
    const textarea = fixture.nativeElement.querySelector('#participation-note') as HTMLTextAreaElement
    textarea.value = 'Je serai là'
    textarea.dispatchEvent(new InputEvent('input'))
    fixture.detectChanges()

    const confirmBtn = fixture.nativeElement.querySelector(
      '.composition-participation__action--confirm',
    ) as HTMLButtonElement
    confirmBtn.click()

    expect(close).toHaveBeenCalledWith({ status: 'confirmed', note: null })
  })

  it('includes note only when declining', () => {
    const textarea = fixture.nativeElement.querySelector('#participation-note') as HTMLTextAreaElement
    textarea.value = 'Indispo ce soir'
    textarea.dispatchEvent(new InputEvent('input'))
    fixture.detectChanges()

    const declineBtn = fixture.nativeElement.querySelector(
      '.composition-participation__action--decline',
    ) as HTMLButtonElement
    declineBtn.click()

    expect(close).toHaveBeenCalledWith({ status: 'declined', note: 'Indispo ce soir' })
  })

  it('closes undefined on cancel', () => {
    const cancelBtn = [...fixture.nativeElement.querySelectorAll('button')].find(
      (btn: HTMLButtonElement) => btn.textContent?.trim() === 'Annuler',
    ) as HTMLButtonElement
    cancelBtn.click()
    expect(close).toHaveBeenCalledWith(undefined)
  })

  it('shows proxy title and hint when mode is proxy', async () => {
    await TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [CompositionParticipationDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            eventTitle: 'Gala',
            eventDate: '2026-05-12T19:00:00.000Z',
            roleLabel: 'Comédien·ne',
            roleEmoji: '🎭',
            currentStatus: 'pending',
            mode: 'proxy',
            assigneeDisplayName: 'Alice',
          } satisfies CompositionParticipationDialogData,
        },
      ],
    }).compileComponents()

    const proxyFixture = TestBed.createComponent(CompositionParticipationDialog)
    proxyFixture.detectChanges()

    expect(proxyFixture.nativeElement.textContent).toContain(
      'Confirmer la participation de Alice',
    )
    expect(proxyFixture.nativeElement.textContent).toContain(
      'Vous agissez pour le compte de Alice.',
    )
  })
})
