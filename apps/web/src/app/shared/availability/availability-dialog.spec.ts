import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { AvailabilityDialog, type AvailabilityDialogData } from './availability-dialog'

const dialogData: AvailabilityDialogData = {
  seasonId: 'season-1',
  eventId: 'event-1',
  eventTitle: 'Match du samedi',
  eventStartsAt: '2030-06-15T18:00:00Z',
  subjectDisplayName: 'Patrice',
  initialStatus: 'unknown',
}

async function setup(initialStatus: AvailabilityDialogData['initialStatus'] = 'unknown') {
  const setMyAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available' },
  })
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [AvailabilityDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { ...dialogData, initialStatus },
      },
      {
        provide: AvailabilityApiService,
        useValue: { setMyAvailability },
      },
      {
        provide: MatSnackBar,
        useValue: { open: vi.fn() },
      },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(AvailabilityDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture, setMyAvailability, close }
}

describe('AvailabilityDialog', () => {
  it('renders title with subject display name and event context', async () => {
    const { fixture } = await setup()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Disponibilité de Patrice')
    expect(el.textContent).toContain('Match du samedi')
  })

  it('shows three choice buttons', async () => {
    const { fixture } = await setup()
    const buttons = fixture.nativeElement.querySelectorAll('.availability-dialog__choice')
    expect(buttons.length).toBe(3)
    expect(fixture.nativeElement.textContent).toContain('Dispo')
    expect(fixture.nativeElement.textContent).toContain('Pas dispo')
    expect(fixture.nativeElement.textContent).toContain('Non renseigné')
  })

  it('calls API and closes on choice', async () => {
    const { fixture, setMyAvailability, close } = await setup()
    const availableBtn = fixture.nativeElement.querySelector(
      '.availability-dialog__choice--available',
    ) as HTMLButtonElement
    availableBtn.click()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', { status: 'available' })
    expect(close).toHaveBeenCalledWith({ status: 'available' })
  })

  it('shows feedback for unavailable selection', async () => {
    const { fixture } = await setup('unavailable')
    expect(fixture.nativeElement.textContent).toContain(
      'Tu n\'es pas disponible pour cet événement.',
    )
  })
})
