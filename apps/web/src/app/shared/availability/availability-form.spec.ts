import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import {
  AVAILABILITY_COMMENT_MAX_LENGTH,
  AvailabilityForm,
} from './availability-form'

async function setupForm(options: {
  readOnly?: boolean
  proxyMode?: boolean
  initialComment?: string | null
  initialStatus?: 'available' | 'unavailable' | 'unknown'
  initialRoleKeys?: string[]
} = {}) {
  const setMyAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      status: 'available',
      roleKeys: ['player'],
      comment: null,
    },
  })
  const setParticipantAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      status: 'available',
      roleKeys: ['player'],
      comment: 'Commentaire existant',
    },
  })

  await TestBed.configureTestingModule({
    imports: [AvailabilityForm, NoopAnimationsModule],
    providers: [
      {
        provide: AvailabilityApiService,
        useValue: { setMyAvailability, setParticipantAvailability },
      },
      {
        provide: MemberProfileApiService,
        useValue: {
          getPreferredRoles: vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            data: { preferredRoleKeys: ['player'] },
          }),
        },
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(AvailabilityForm)
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('eventId', 'event-1')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('roleSlots', ROLE_TEMPLATES.cabaret)
  fixture.componentRef.setInput('subjectDisplayName', 'Patrice')
  fixture.componentRef.setInput('readOnly', options.readOnly ?? false)
  fixture.componentRef.setInput('proxyMode', options.proxyMode ?? false)
  fixture.componentRef.setInput('subjectParticipantId', options.proxyMode ? 'p-other' : null)
  fixture.componentRef.setInput('initialStatus', options.initialStatus ?? 'available')
  fixture.componentRef.setInput('initialRoleKeys', options.initialRoleKeys ?? ['player'])
  fixture.componentRef.setInput('initialComment', options.initialComment ?? null)
  fixture.detectChanges()
  await fixture.whenStable()
  fixture.detectChanges()

  return { fixture, setMyAvailability, setParticipantAvailability }
}

describe('AvailabilityForm', () => {
  it('locks volunteer in proxy drafts and includes it in the proxy payload', async () => {
    const { fixture, setMyAvailability, setParticipantAvailability } = await setupForm({ proxyMode: true, initialRoleKeys: [] })
    fixture.componentRef.setInput('roleSlots', ROLE_TEMPLATES.match)
    fixture.detectChanges()
    draft(fixture).toggleRole('volunteer', false)
    fixture.detectChanges()
    const box = [...fixture.nativeElement.querySelectorAll('mat-checkbox')].find((el: any) => el.textContent.includes('Bénévole')) as HTMLElement
    expect(box.querySelector('input')!.disabled).toBe(true)
    expect(box.querySelector('input')!.checked).toBe(true)
    await fixture.componentInstance.submit()
    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(setParticipantAvailability).toHaveBeenLastCalledWith('season-1', 'event-1', 'p-other', expect.objectContaining({ roleKeys: ['volunteer'], applyVolunteerRule: true }))
  })

  function draft(fixture: Awaited<ReturnType<typeof setupForm>>['fixture']) {
    return fixture.componentInstance as unknown as {
      choose(status: string): Promise<void>
      toggleRole(key: string, checked: boolean): void
      onCommentInput(value: string): void
      error(): string | null
      commentError(): string | null
    }
  }

  it('keeps all edits local until one submit, without preferred role selection', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialStatus: 'unknown', initialRoleKeys: [] })
    await draft(fixture).choose('available')
    fixture.detectChanges()
    expect(fixture.componentInstance.currentState().roleKeys).toEqual([])
    expect(TestBed.inject(MemberProfileApiService).getPreferredRoles).not.toHaveBeenCalled()
    draft(fixture).toggleRole('mc', true)
    draft(fixture).toggleRole('dj', true)
    draft(fixture).onCommentInput('  Arrive à 19h  ')
    expect(setMyAvailability).not.toHaveBeenCalled()
    await fixture.componentInstance.submit()
    expect(setMyAvailability).toHaveBeenCalledExactlyOnceWith('season-1', 'event-1', {
      status: 'available', roleKeys: ['mc', 'dj'], comment: 'Arrive à 19h', applyVolunteerRule: true,
    })
  })

  it('renders explicit checked state on Material checkboxes', async () => {
    const { fixture } = await setupForm()
    const boxes = [...fixture.nativeElement.querySelectorAll('input[type="checkbox"]')] as HTMLInputElement[]
    expect(boxes.length).toBeGreaterThan(1)
    expect(boxes.filter(box => box.checked)).toHaveLength(1)
    expect(fixture.nativeElement.querySelector('app-role-toggle-chip-set')).toBeNull()
    boxes.find(box => !box.checked)!.click()
    fixture.detectChanges()
    expect(boxes.filter(box => box.checked)).toHaveLength(2)
  })

  it('requires a role for new and legacy available submissions', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialRoleKeys: [] })
    await fixture.componentInstance.submit()
    fixture.detectChanges()
    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('au moins un rôle')
    expect(fixture.componentInstance.currentState().roleKeys).toEqual([])
  })

  it('allows general availability when no roles exist', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialRoleKeys: [] })
    fixture.componentRef.setInput('roleSlots', ROLE_TEMPLATES.survey)
    fixture.detectChanges()
    await fixture.componentInstance.submit()
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', expect.objectContaining({ status: 'available', roleKeys: [] }))
  })

  it.each(['unavailable', 'unknown'])('submits %s explicitly with empty roles', async status => {
    const { fixture, setMyAvailability } = await setupForm()
    await draft(fixture).choose(status)
    expect(setMyAvailability).not.toHaveBeenCalled()
    await fixture.componentInstance.submit()
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', expect.objectContaining({ status, roleKeys: [] }))
  })

  it('submits the whole response to the proxy endpoint', async () => {
    const { fixture, setMyAvailability, setParticipantAvailability } = await setupForm({ proxyMode: true })
    draft(fixture).onCommentInput('À 19h')
    await fixture.componentInstance.submit()
    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(setParticipantAvailability).toHaveBeenCalledWith('season-1', 'event-1', 'p-other', expect.objectContaining({ status: 'available', roleKeys: ['player'], comment: 'À 19h' }))
  })

  it.each([400, 500])('retains the editable draft after API error %s without emitting success', async status => {
    const { fixture, setMyAvailability } = await setupForm()
    setMyAvailability.mockResolvedValue({ ok: false, status })
    const saved = vi.fn()
    fixture.componentInstance.saved.subscribe(saved)
    draft(fixture).toggleRole('mc', true)
    draft(fixture).onCommentInput('Brouillon')
    await fixture.componentInstance.submit()
    expect(saved).not.toHaveBeenCalled()
    expect(fixture.componentInstance.currentState()).toEqual({ status: 'available', roleKeys: ['player', 'mc'], comment: 'Brouillon' })
    expect(draft(fixture).error()).toBeTruthy()
    expect(fixture.componentInstance.saving()).toBe(false)
  })

  it('validates comment length before writing', async () => {
    const { fixture, setMyAvailability } = await setupForm()
    draft(fixture).onCommentInput('x'.repeat(AVAILABILITY_COMMENT_MAX_LENGTH + 1))
    await fixture.componentInstance.submit()
    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(draft(fixture).commentError()).toContain('500')
  })

  it.each(['readOnly', 'archived'])('does not write or edit in %s mode', async mode => {
    const { fixture, setMyAvailability } = await setupForm()
    fixture.componentRef.setInput(mode, true)
    fixture.detectChanges()
    await draft(fixture).choose('unavailable')
    await fixture.componentInstance.submit()
    expect(fixture.componentInstance.currentState().status).toBe('available')
    expect(setMyAvailability).not.toHaveBeenCalled()
  })

  it('starts available drafts with volunteer, locks removal and explains the control', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialStatus: 'unknown', initialRoleKeys: [] })
    fixture.componentRef.setInput('roleSlots', { ...ROLE_TEMPLATES.cabaret, volunteer: 1 })
    fixture.detectChanges()
    await draft(fixture).choose('available')
    fixture.detectChanges()
    expect(fixture.componentInstance.currentState().roleKeys).toEqual(['volunteer'])
    draft(fixture).toggleRole('volunteer', false)
    expect(fixture.componentInstance.currentState().roleKeys).toEqual(['volunteer'])
    const checkbox = [...fixture.nativeElement.querySelectorAll('mat-checkbox')].find((el: any) => el.textContent.includes('Bénévole')) as HTMLElement
    expect(checkbox.querySelector('input')!.disabled).toBe(true)
    fixture.nativeElement.querySelector('button[aria-label="Pourquoi bénévole est obligatoire"]').click()
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Quand tu es disponible, tu es aussi disponible comme bénévole.')
    expect(setMyAvailability).not.toHaveBeenCalled()
    await fixture.componentInstance.submit()
    expect(setMyAvailability).toHaveBeenLastCalledWith('season-1', 'event-1', expect.objectContaining({ roleKeys: ['volunteer'], applyVolunteerRule: true }))
  })

  it.each([{ roles: [] as string[] }, { roles: ['player'] }])('normalizes historic available draft %j only on explicit save', async ({ roles }) => {
    const { fixture, setMyAvailability } = await setupForm({ initialRoleKeys: roles })
    fixture.componentRef.setInput('roleSlots', { ...ROLE_TEMPLATES.cabaret, volunteer: 1 })
    fixture.detectChanges()
    expect(fixture.componentInstance.currentState().roleKeys).toEqual([...roles, 'volunteer'])
    expect(fixture.componentInstance.detailsDirty()).toBe(true)
    expect(setMyAvailability).not.toHaveBeenCalled()
    await fixture.componentInstance.submit()
    expect(setMyAvailability).toHaveBeenLastCalledWith('season-1', 'event-1', expect.objectContaining({ roleKeys: [...roles, 'volunteer'], applyVolunteerRule: true }))
  })

  it('retains role draft across temporary status choices but submits empty roles for unavailable', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialRoleKeys: ['dj', 'mc'] })
    await draft(fixture).choose('unavailable')
    await draft(fixture).choose('available')
    expect(fixture.componentInstance.currentState().roleKeys).toEqual(['dj', 'mc'])
    await draft(fixture).choose('unavailable')
    await fixture.componentInstance.submit()
    expect(setMyAvailability).toHaveBeenCalledWith('season-1', 'event-1', expect.objectContaining({ status: 'unavailable', roleKeys: [] }))
  })

  it('does not count unknown-to-unknown as a first availability response', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialStatus: 'unknown', initialRoleKeys: [] })
    fixture.componentRef.setInput('availabilityOpenedAt', '2026-01-01T12:00:00Z')
    setMyAvailability.mockResolvedValue({ ok: true, status: 200, data: { status: 'unknown', roleKeys: [], comment: null } })
    const capture = vi.spyOn(TestBed.inject(ProductAnalyticsService), 'captureAvailabilityFirstSubmission')
    await fixture.componentInstance.submit()
    expect(capture).not.toHaveBeenCalled()
    setMyAvailability.mockResolvedValue({ ok: true, status: 200, data: { status: 'unavailable', roleKeys: [], comment: null } })
    await draft(fixture).choose('unavailable')
    await fixture.componentInstance.submit()
    expect(capture).toHaveBeenCalledTimes(1)
  })

})
