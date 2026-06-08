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

  it('shows three status toggles', async () => {
    const { fixture } = await setup()
    const toggles = fixture.nativeElement.querySelectorAll('mat-button-toggle')
    expect(toggles.length).toBe(3)
    expect(fixture.nativeElement.textContent).toContain('Dispo')
    expect(fixture.nativeElement.textContent).toContain('Pas dispo')
    expect(fixture.nativeElement.textContent).toContain('Non renseigné')
  })

  it('calls API on available choice without auto-closing', async () => {
    const { fixture, setMyAvailability, close } = await setup()
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { choose: (s: string) => Promise<void> }).choose('available')
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: [],
      applyVolunteerRule: true,
      comment: null,
    })
    expect(close).not.toHaveBeenCalled()
  })

  it('shows feedback for unavailable selection', async () => {
    const { fixture } = await setup({ initialStatus: 'unavailable' })
    expect(fixture.nativeElement.textContent).toContain(
      'Tu n\'es pas disponible pour cet événement.',
    )
  })

  it('shows role chips only when available and roles exist', async () => {
    const { fixture } = await setup({ initialStatus: 'available', initialRoleKeys: ['player'] })
    const el = fixture.nativeElement as HTMLElement

    expect(el.textContent).toContain('Choisis les rôles pour lesquels tu es disponible')
    expect(el.querySelector('app-role-toggle-chip-set')).toBeTruthy()
    expect(el.textContent).toContain('Comédien·ne')
    expect(el.textContent).toContain('MC')
  })

  it('pre-checks preferred roles when switching to available', async () => {
    const { fixture, getPreferredRoles, setMyAvailability } = await setup()
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { choose: (s: string) => Promise<void> }).choose('available')
    await fixture.whenStable()

    expect(getPreferredRoles).toHaveBeenCalledWith('troupe-1')
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: [],
      applyVolunteerRule: true,
      comment: null,
    })
    const formEl = fixture.nativeElement as HTMLElement
    expect(formEl.textContent).toContain('Comédien·ne')
    expect(formEl.textContent).toContain('MC')
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

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { choose: (s: string) => Promise<void> }).choose('available')
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: [],
      applyVolunteerRule: true,
      comment: null,
    })
  })

  it('saves role toggles via the details save button', async () => {
    const { fixture, setMyAvailability } = await setup({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    ;(form as unknown as { toggleRole: (k: string, c: boolean) => void }).toggleRole('mc', true)
    fixture.detectChanges()
    expect(setMyAvailability).not.toHaveBeenCalled()

    await (form as unknown as { saveDetails: () => Promise<void> }).saveDetails()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: ['player', 'mc'],
      applyVolunteerRule: true,
      comment: null,
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

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { choose: (s: string) => Promise<void> }).choose('unavailable')
    await fixture.whenStable()
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).not.toContain('Choisis les rôles pour lesquels tu es disponible')
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'unavailable',
      roleKeys: [],
      applyVolunteerRule: true,
      comment: null,
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

  it('persists role chip toggle after explicit save', async () => {
    const { fixture, setMyAvailability } = await setup({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })

    const mcChip = [...fixture.nativeElement.querySelectorAll('mat-chip')].find((el: Element) =>
      el.textContent?.includes('MC'),
    ) as HTMLElement
    mcChip.click()
    fixture.detectChanges()
    expect(setMyAvailability).not.toHaveBeenCalled()

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { saveDetails: () => Promise<void> }).saveDetails()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', {
      status: 'available',
      roleKeys: ['player', 'mc'],
      applyVolunteerRule: true,
      comment: null,
    })
  })
})
