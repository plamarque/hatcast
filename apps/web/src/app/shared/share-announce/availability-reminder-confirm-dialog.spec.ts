import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityReminderConfirmDialog } from './availability-reminder-confirm-dialog'

async function configureDialog(): Promise<ComponentFixture<AvailabilityReminderConfirmDialog>> {
  await TestBed.configureTestingModule({
    imports: [AvailabilityReminderConfirmDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {
          messageText: 'Rappel',
          recipients: [
            { participantId: 'p-1', displayName: 'Alice', channels: { email: { eligible: true }, push: { eligible: false } } },
            { participantId: 'p-2', displayName: 'Bob', channels: { email: { eligible: false, unavailableReason: 'preference_disabled' }, push: { eligible: false, unavailableReason: 'preference_disabled' } } },
          ],
        },
      },
    ],
  }).compileComponents()
  const fixture = TestBed.createComponent(AvailabilityReminderConfirmDialog)
  fixture.detectChanges()
  return fixture
}

describe('AvailabilityReminderConfirmDialog', () => {
  it('selects every eligible recipient initially and lets the header clear the selection', async () => {
    const fixture = await configureDialog()
    expect(fixture.componentInstance.selectedCount()).toBe(1)
    expect(fixture.componentInstance.allSelected()).toBe(true)
    fixture.componentInstance.toggleAll(false)
    expect(fixture.componentInstance.selectedCount()).toBe(0)
    expect(fixture.componentInstance.allSelected()).toBe(false)
  })

  it('shows opted-out people as manual contacts and returns the selected ids', async () => {
    const fixture = await configureDialog()
    expect(fixture.nativeElement.textContent).toContain('Notifications désactivées')
    fixture.componentInstance.confirm()
    const ref = TestBed.inject(MatDialogRef)
    expect(ref.close).toHaveBeenCalledWith(['p-1'])
  })
})
