import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { AvailabilityDialog, type AvailabilityDialogData } from './availability-dialog'
import { AvailabilityForm } from './availability-form'

const dialogData: AvailabilityDialogData = {
  seasonId: 'season-1',
  eventId: 'event-1',
  eventTitle: 'Match du samedi',
  eventStartsAt: '2030-06-15T18:00:00Z',
  subjectDisplayName: 'Patrice',
  initialStatus: 'unknown',
  troupeId: 'troupe-1',
  roleSlots: ROLE_TEMPLATES.cabaret,
  initialRoleKeys: [],
}

async function setup(data: Partial<AvailabilityDialogData> = {}) {
  const setMyAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available', roleKeys: ['player'] },
  })
  const getPreferredRoles = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { preferredRoleKeys: ['player', 'mc'] },
  })
  const snackOpen = vi.fn()
  const close = vi.fn()

  await TestBed.configureTestingModule({
    imports: [AvailabilityDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      {
        provide: MAT_DIALOG_DATA,
        useValue: { ...dialogData, ...data },
      },
      {
        provide: AvailabilityApiService,
        useValue: { setMyAvailability },
      },
      {
        provide: MemberProfileApiService,
        useValue: { getPreferredRoles },
      },
      {
        provide: MatSnackBar,
        useValue: { open: snackOpen },
      },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(AvailabilityDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  fixture.detectChanges()
  return { fixture, setMyAvailability, getPreferredRoles, close, snackOpen }
}

describe('AvailabilityDialog', () => {
  function form(fixture: Awaited<ReturnType<typeof setup>>['fixture']): AvailabilityForm {
    return fixture.debugElement.query(d => d.componentInstance instanceof AvailabilityForm).componentInstance
  }
  function click(fixture: Awaited<ReturnType<typeof setup>>['fixture'], text: string) {
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((b: any) => b.textContent.includes(text)) as HTMLButtonElement
    button.click()
  }

  it('shows event context and persistent submit outside scrollable content', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).toContain('Disponibilité de Patrice')
    expect(fixture.nativeElement.textContent).toContain('Match du samedi')
    expect(fixture.nativeElement.querySelector('mat-dialog-actions').textContent).toContain('Enregistrer')
    expect(fixture.nativeElement.querySelector('mat-dialog-content button.availability-form__details-save')).toBeNull()
  })

  it('cancels draft status roles and comment without request or result', async () => {
    const { fixture, close, setMyAvailability } = await setup()
    const editor = form(fixture) as any
    await editor.choose('available')
    editor.toggleRole('mc', true)
    editor.onCommentInput('Brouillon')
    click(fixture, 'Annuler')
    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(close).toHaveBeenCalledExactlyOnceWith()
  })

  it('returns server state only after submitting successfully', async () => {
    const { fixture, close, setMyAvailability } = await setup({ initialStatus: 'available', initialRoleKeys: ['mc'] })
    setMyAvailability.mockResolvedValue({ ok: true, status: 200, data: { status: 'available', roleKeys: ['mc'], comment: 'Persisté' } })
    click(fixture, 'Enregistrer')
    await fixture.whenStable()
    expect(close).toHaveBeenCalledExactlyOnceWith({ status: 'available', roleKeys: ['mc'], comment: 'Persisté' })
  })

  it('keeps failed draft open and permits retry', async () => {
    const { fixture, close, setMyAvailability } = await setup({ initialStatus: 'available', initialRoleKeys: ['mc'] })
    setMyAvailability.mockResolvedValueOnce({ ok: false, status: 500 })
    click(fixture, 'Enregistrer')
    await fixture.whenStable()
    fixture.detectChanges()
    expect(close).not.toHaveBeenCalled()
    expect(fixture.nativeElement.textContent).toContain('Enregistrement impossible')
    expect(form(fixture).currentState().roleKeys).toEqual(['mc'])
    click(fixture, 'Enregistrer')
    await fixture.whenStable()
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('reopens with persisted explicit roles and no preferred precheck', async () => {
    const { fixture, getPreferredRoles } = await setup({ initialStatus: 'available', initialRoleKeys: ['mc', 'dj'], initialComment: 'À 19h' })
    expect(form(fixture).currentState()).toEqual({ status: 'available', roleKeys: ['mc', 'dj'], comment: 'À 19h' })
    expect(getPreferredRoles).not.toHaveBeenCalled()
  })
})
