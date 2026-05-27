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
  fixture.componentRef.setInput('initialRoleKeys', ['player'])
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
      persist: (status: string) => Promise<void>
    }
    form.commentText.set('x'.repeat(AVAILABILITY_COMMENT_MAX_LENGTH + 1))
    fixture.detectChanges()
    await form.persist('available')
    fixture.detectChanges()

    expect(setMyAvailability).not.toHaveBeenCalled()
    expect(form.commentError()).toBe(
      `Le commentaire ne peut pas dépasser ${AVAILABILITY_COMMENT_MAX_LENGTH} caractères.`,
    )
  })
})
