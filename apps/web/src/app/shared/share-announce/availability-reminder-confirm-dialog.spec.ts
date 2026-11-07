import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityReminderConfirmDialog } from './availability-reminder-confirm-dialog'

async function configureDialog(allRecipients = false, lastManualNotifyAt: string | null = null): Promise<ComponentFixture<AvailabilityReminderConfirmDialog>> {
  await TestBed.configureTestingModule({
    imports: [AvailabilityReminderConfirmDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {
          messageText: 'Rappel',
          allRecipients,
          lastManualNotifyAt,
          guardDays: 3,
          recipients: [
            { participantId: 'p-1', displayName: 'Alice', channels: { email: { eligible: true }, push: { eligible: false } } },
            { participantId: 'p-3', displayName: 'Chloé', channels: { email: { eligible: false }, push: { eligible: true } } },
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
    expect(fixture.componentInstance.selectedCount()).toBe(2)
    expect(fixture.componentInstance.allSelected()).toBe(true)
    fixture.componentInstance.toggleAll(false)
    expect(fixture.componentInstance.selectedCount()).toBe(0)
    expect(fixture.componentInstance.allSelected()).toBe(false)
  })

  it('confirms every eligible recipient without selection controls in all-recipient mode', async () => {
    const fixture = await configureDialog(true)
    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('Notifications désactivées')
    fixture.componentInstance.confirm()
    expect(TestBed.inject(MatDialogRef).close).toHaveBeenCalledWith(['p-1', 'p-3'])
  })

  it('shows the previous reminder date and guard interval', async () => {
    const fixture = await configureDialog(true, '2026-11-01T12:00:00Z')
    expect(fixture.nativeElement.textContent).toContain('1 novembre 2026')
    expect(fixture.nativeElement.textContent).toContain('Période de référence : 3 jours')
  })

  it('shows opted-out people as manual contacts and returns the selected ids', async () => {
    const fixture = await configureDialog()
    expect(fixture.nativeElement.textContent).toContain('Notifications désactivées')
    fixture.componentInstance.confirm()
    const ref = TestBed.inject(MatDialogRef)
    expect(ref.close).toHaveBeenCalledWith(['p-1', 'p-3'])
  })
})
