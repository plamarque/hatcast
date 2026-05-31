import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { AvailabilityForm } from './availability-form'
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
      comment: null,
    },
    {
      participantId: 'p2',
      userId: 'user-2',
      displayName: 'Alex',
      avatarUrl: null,
      status: 'unknown' as const,
      roleKeys: [],
      comment: null,
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
  const setMyAvailability = vi.fn()
  const setParticipantAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available' as const, roleKeys: ['player'], comment: null },
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
        useValue: {
          getEventAvailabilitySummary,
          setMyAvailability,
          setParticipantAvailability,
        },
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
  return { fixture, getEventAvailabilitySummary, setMyAvailability, setParticipantAvailability }
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

  it('allows organizer to edit another subject (not read-only)', async () => {
    const { fixture } = await setup(true)
    const comp = fixture.componentInstance as unknown as {
      onSubjectChange: (id: string) => void
    }
    comp.onSubjectChange('p2')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const form = fixture.nativeElement.querySelector('app-availability-form')
    expect(form).not.toBeNull()
    const readOnly = form?.getAttribute('ng-reflect-read-only')
    expect(readOnly === 'false' || readOnly === null).toBe(true)
  })

  it('calls proxy API when organizer saves for another subject', async () => {
    const { fixture, setParticipantAvailability, setMyAvailability } = await setup(true)
    const comp = fixture.componentInstance as unknown as {
      onSubjectChange: (id: string) => void
    }
    comp.onSubjectChange('p2')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityForm)
      ?.componentInstance as AvailabilityForm
    await (form as unknown as { choose: (s: string) => Promise<void> }).choose('available')
    await fixture.whenStable()
    fixture.detectChanges()

    expect(setParticipantAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      'p2',
      expect.objectContaining({ status: 'available', comment: null }),
    )
    expect(setMyAvailability).not.toHaveBeenCalled()
  })

  it('uses French aria-label on Tous panel rows when organizer', async () => {
    const { fixture } = await setup(true)
    const comp = fixture.componentInstance as unknown as { setViewMode: (mode: 'moi' | 'tous') => void }
    await comp.setViewMode('tous')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const btn = fixture.nativeElement.querySelector(
      '.availability-tous__person--clickable',
    ) as HTMLElement
    expect(btn?.getAttribute('aria-label')).toBe('Modifier la disponibilité de Patrice')
  })

  it('loads summary with includeChances when switching to Tous', async () => {
    const { fixture, getEventAvailabilitySummary } = await setup()
    const comp = fixture.componentInstance as unknown as { setViewMode: (mode: 'moi' | 'tous') => void }
    await comp.setViewMode('tous')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(getEventAvailabilitySummary).toHaveBeenCalledWith('season-1', 'event-1', true)
    expect(fixture.nativeElement.querySelector('mat-expansion-panel')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('100 %')
    const chanceEl = fixture.nativeElement.querySelector('.availability-tous__chance') as HTMLElement
    expect(chanceEl?.classList.contains('availability-tous__chance--high')).toBe(true)
    expect(chanceEl?.style.color).toBe('var(--hatcast-chance-high)')
  })

  it('does not show Afficher les chances toggle', async () => {
    const { fixture } = await setup()
    const comp = fixture.componentInstance as unknown as { setViewMode: (mode: 'moi' | 'tous') => void }
    await comp.setViewMode('tous')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).not.toContain('Afficher les chances')
  })
})
