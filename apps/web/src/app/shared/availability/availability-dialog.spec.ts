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
  it('renders title with subject display name and event context', async () => {
    const { fixture } = await setup()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Disponibilité de Patrice')
    expect(el.textContent).toContain('Match du samedi')
  })

  it('shows three choice buttons', async () => {
    const { fixture } = await setup()
    const buttons = fixture.nativeElement.querySelectorAll('.availability-form__choice')
    expect(buttons.length).toBe(3)
    expect(fixture.nativeElement.textContent).toContain('Dispo')
    expect(fixture.nativeElement.textContent).toContain('Pas dispo')
    expect(fixture.nativeElement.textContent).toContain('Non renseigné')
  })

  it('calls API on available choice without auto-closing', async () => {
    const { fixture, setMyAvailability, close } = await setup()
    const availableBtn = fixture.nativeElement.querySelector(
      '.availability-form__choice--available',
    ) as HTMLButtonElement
    availableBtn.click()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: ['player', 'mc'],
      applyVolunteerRule: true,
    })
    expect(close).not.toHaveBeenCalled()
  })

  it('shows feedback for unavailable selection', async () => {
    const { fixture } = await setup({ initialStatus: 'unavailable' })
    expect(fixture.nativeElement.textContent).toContain(
      'Tu n\'es pas disponible pour cet événement.',
    )
  })

  it('shows role checklist only when available and roles exist', async () => {
    const { fixture } = await setup({ initialStatus: 'available', initialRoleKeys: ['player'] })
    const el = fixture.nativeElement as HTMLElement

    expect(el.textContent).toContain('Choisis les rôles pour lesquels tu es disponible')
    expect(el.textContent).toContain('Comédien·nes')
    expect(el.textContent).toContain('MC')
  })

  it('pre-checks preferred roles when switching to available', async () => {
    const { fixture, getPreferredRoles, setMyAvailability } = await setup()
    const availableBtn = fixture.nativeElement.querySelector(
      '.availability-form__choice--available',
    ) as HTMLButtonElement

    availableBtn.click()
    await fixture.whenStable()

    expect(getPreferredRoles).toHaveBeenCalledWith('troupe-1')
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: ['player', 'mc'],
      applyVolunteerRule: true,
    })
  })

  it('does not pre-check on reopen when available with empty saved roles', async () => {
    const { getPreferredRoles } = await setup({
      initialStatus: 'available',
      initialRoleKeys: [],
    })

    expect(getPreferredRoles).not.toHaveBeenCalled()
  })

  it('saves empty roles when preferred roles API fails', async () => {
    const getPreferredRoles = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const setMyAvailability = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { status: 'available', roleKeys: [] },
    })

    await TestBed.configureTestingModule({
      imports: [AvailabilityDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { ...dialogData, initialStatus: 'unknown' } },
        { provide: AvailabilityApiService, useValue: { setMyAvailability } },
        { provide: MemberProfileApiService, useValue: { getPreferredRoles } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityDialog)
    fixture.detectChanges()

    const availableBtn = fixture.nativeElement.querySelector(
      '.availability-form__choice--available',
    ) as HTMLButtonElement
    availableBtn.click()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: [],
      applyVolunteerRule: true,
    })
  })

  it('saves role toggles while status is available', async () => {
    const { fixture, setMyAvailability } = await setup({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { toggleRole: (k: string, c: boolean) => Promise<void> }).toggleRole(
      'mc',
      true,
    )
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: ['player', 'mc'],
      applyVolunteerRule: true,
    })
  })

  it('hides role block and clears roles when selecting Pas dispo', async () => {
    const { fixture, setMyAvailability } = await setup({
      initialStatus: 'available',
      initialRoleKeys: ['player', 'mc'],
    })
    setMyAvailability.mockResolvedValue({
      ok: true,
      status: 200,
      data: { status: 'unavailable', roleKeys: [] },
    })

    const unavailableBtn = fixture.nativeElement.querySelector(
      '.availability-form__choice--unavailable',
    ) as HTMLButtonElement
    unavailableBtn.click()
    await fixture.whenStable()
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).not.toContain('Choisis les rôles pour lesquels tu es disponible')
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'unavailable',
      roleKeys: [],
      applyVolunteerRule: true,
    })
  })

  it('does not show role block when the event has no required roles', async () => {
    const { fixture } = await setup({
      initialStatus: 'available',
      roleSlots: ROLE_TEMPLATES.survey,
      initialRoleKeys: [],
    })
    const el = fixture.nativeElement as HTMLElement

    expect(el.textContent).not.toContain('Choisis les rôles pour lesquels tu es disponible')
  })

  it('persists role toggle via keyboard on checkboxes', async () => {
    const { fixture, setMyAvailability } = await setup({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })

    const mcCheckbox = [...fixture.nativeElement.querySelectorAll('.availability-form__role')].find(
      (el: Element) => el.textContent?.includes('MC'),
    ) as HTMLElement
    const mcInput = mcCheckbox.querySelector('input[type="checkbox"]') as HTMLInputElement

    mcInput.focus()
    mcInput.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    mcInput.click()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: ['player', 'mc'],
      applyVolunteerRule: true,
    })
  })
})
