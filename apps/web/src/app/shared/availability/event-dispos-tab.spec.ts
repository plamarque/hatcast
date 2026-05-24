import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { EventDisposTab } from './event-dispos-tab'

const mockSummary = {
  eventId: 'event-1',
  roleSlots: ROLE_TEMPLATES.cabaret,
  participants: [
    {
      participantId: 'p1',
      userId: 'user-1',
      displayName: 'Patrice',
      avatarUrl: null,
      status: 'available' as const,
      roleKeys: ['player'],
    },
    {
      participantId: 'p2',
      userId: 'user-2',
      displayName: 'Alex',
      avatarUrl: null,
      status: 'unknown' as const,
      roleKeys: [],
    },
  ],
  roles: [
    {
      roleKey: 'player',
      requiredCount: 5,
      candidates: [
        { participantId: 'p1', displayName: 'Patrice', avatarUrl: null, chancePercent: 100 },
      ],
    },
  ],
}

async function setup(canSwitchSubject = false) {
  const getEventAvailabilitySummary = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: mockSummary,
  })
  const listSeasonParticipantSelectors = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: [{ id: 'p1', displayName: 'Patrice', avatarUrl: null, kind: 'MEMBER' }],
  })

  await TestBed.configureTestingModule({
    imports: [EventDisposTab, NoopAnimationsModule],
    providers: [
      {
        provide: AvailabilityApiService,
        useValue: { getEventAvailabilitySummary, setMyAvailability: vi.fn() },
      },
      {
        provide: ParticipantApiService,
        useValue: { listSeasonParticipantSelectors },
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventDisposTab)
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('event', {
    id: 'event-1',
    title: 'Match',
    startsAt: '2030-06-15T18:00:00Z',
    templateType: 'cabaret',
    roleSlots: ROLE_TEMPLATES.cabaret,
    archived: false,
  })
  fixture.componentRef.setInput('currentUserId', 'user-1')
  fixture.componentRef.setInput('canSwitchSubject', canSwitchSubject)
  fixture.detectChanges()
  await fixture.whenStable()
  await vi.waitFor(() => {
    expect(fixture.nativeElement.textContent).not.toContain('mat-spinner')
  })
  fixture.detectChanges()
  return { fixture, getEventAvailabilitySummary }
}

describe('EventDisposTab', () => {
  it('renders Moi/Tous toggle and Moi panel by default', async () => {
    const { fixture } = await setup()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Moi')
    expect(el.textContent).toContain('Tous')
    expect(el.textContent).toContain('Dispo')
  })

  it('hides subject selector for regular members', async () => {
    const { fixture } = await setup(false)
    expect(fixture.nativeElement.querySelector('app-availability-subject-selector')).toBeNull()
  })

  it('shows subject selector for organizers in Moi view', async () => {
    const { fixture } = await setup(true)
    expect(fixture.nativeElement.querySelector('app-availability-subject-selector')).not.toBeNull()
  })

  it('switches to Tous panel with role accordion', async () => {
    const { fixture } = await setup()
    const comp = fixture.componentInstance as unknown as { setViewMode: (mode: 'moi' | 'tous') => void }
    comp.setViewMode('tous')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Comédien·nes')
    expect(el.textContent).toContain('100 %')
  })
})
