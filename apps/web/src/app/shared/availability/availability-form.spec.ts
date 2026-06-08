import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

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
  it('renders three status toggles', async () => {
    const { fixture } = await setupForm()
    expect(fixture.nativeElement.querySelectorAll('mat-button-toggle').length).toBe(3)
  })

  it('shows comment field as readonly in readOnly mode', async () => {
    const { fixture } = await setupForm({
      readOnly: true,
      initialComment: 'Déjà noté',
      initialStatus: 'available',
    })
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea).not.toBeNull()
    expect(textarea.readOnly).toBe(true)
    expect(textarea.value).toBe('Déjà noté')
    expect(fixture.nativeElement.textContent).not.toContain('/ 500')
  })

  it('allows editing comment in proxy mode', async () => {
    const { fixture } = await setupForm({
      proxyMode: true,
      initialComment: 'Commentaire existant',
      initialStatus: 'available',
    })
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.readOnly).toBe(false)
    expect(fixture.nativeElement.textContent).toContain('/ 500')
  })

  it('sends comment when saving in proxy mode', async () => {
    const { fixture, setParticipantAvailability, setMyAvailability } = await setupForm({
      proxyMode: true,
      initialComment: 'Arrive vers 19h',
      initialStatus: 'available',
    })
    const form = fixture.componentInstance
    await (form as unknown as { choose: (s: string) => Promise<void> }).choose('unavailable')

    expect(setParticipantAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      'p-other',
      expect.objectContaining({
        status: 'unavailable',
        comment: 'Arrive vers 19h',
      }),
    )
    expect(setMyAvailability).not.toHaveBeenCalled()
  })

  it('shows French error and does not persist when comment exceeds 500 characters', async () => {
    const { fixture, setMyAvailability } = await setupForm({ initialStatus: 'available' })
    const form = fixture.componentInstance as unknown as {
      commentText: { set: (value: string) => void }
      commentError: () => string | null
      saveDetails: () => Promise<void>
    }
    form.commentText.set('x'.repeat(AVAILABILITY_COMMENT_MAX_LENGTH + 1))
    fixture.detectChanges()
    await form.saveDetails()
    fixture.detectChanges()

    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(form.commentError()).toBe(
      `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
    )
  })

  it('saves status without draft roles or comment', async () => {
    const { fixture, setMyAvailability } = await setupForm({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
      initialComment: 'Enregistré',
    })
    const form = fixture.componentInstance as unknown as {
      selectedRoleKeys: { set: (value: string[]) => void }
      commentText: { set: (value: string) => void }
      choose: (status: string) => Promise<void>
    }
    form.selectedRoleKeys.set(['player', 'mc'])
    form.commentText.set('Brouillon non enregistré')
    fixture.detectChanges()

    await form.choose('unavailable')

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({
        status: 'unavailable',
        roleKeys: [],
        comment: 'Enregistré',
      }),
    )
  })

  it('pre-checks preferred roles in UI when becoming available', async () => {
    const { fixture } = await setupForm({ initialStatus: 'unknown', initialRoleKeys: [] })
    const form = fixture.componentInstance as unknown as {
      choose: (status: string) => Promise<void>
      selected: () => string
    }
    await form.choose('available')
    fixture.detectChanges()

    expect(form.selected()).toBe('available')
    expect(fixture.nativeElement.textContent).toContain('Comédien·ne')
  })

  it('hides role block immediately when becoming unavailable', async () => {
    const { fixture, setMyAvailability } = await setupForm({
      initialStatus: 'available',
      initialRoleKeys: ['player', 'mc'],
    })
    setMyAvailability.mockResolvedValue({
      ok: true,
      status: 200,
      data: { status: 'unavailable', roleKeys: [], comment: null },
    })
    const form = fixture.componentInstance as unknown as {
      choose: (status: string) => Promise<void>
      selected: () => string
    }
    await form.choose('unavailable')
    fixture.detectChanges()

    expect(form.selected()).toBe('unavailable')
    expect(fixture.nativeElement.textContent).not.toContain(
      'Choisis les rôles pour lesquels tu es disponible',
    )
  })

  it('renders role toggle chips instead of checkboxes', async () => {
    const { fixture } = await setupForm({ initialStatus: 'available' })
    expect(fixture.nativeElement.querySelector('app-role-toggle-chip-set')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeNull()
    expect(fixture.nativeElement.querySelectorAll('mat-chip').length).toBeGreaterThan(0)
  })

  it('persists roles and comment only via save button', async () => {
    const { fixture, setMyAvailability } = await setupForm({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })
    const form = fixture.componentInstance as unknown as {
      toggleRole: (key: string, checked: boolean) => void
      commentText: { set: (value: string) => void }
      saveDetails: () => Promise<void>
    }
    form.toggleRole('mc', true)
    form.commentText.set('Arrive vers 19h')
    fixture.detectChanges()
    expect(setMyAvailability).not.toHaveBeenCalled()

    await form.saveDetails()

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({
        status: 'available',
        roleKeys: ['player', 'mc'],
        comment: 'Arrive vers 19h',
      }),
    )
  })
})
