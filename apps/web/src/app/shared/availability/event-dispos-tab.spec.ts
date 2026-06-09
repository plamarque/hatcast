import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { AvailabilityPoll } from './availability-poll'
import { AvailabilityPersistService } from './availability-persist.service'
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
    {
      participantId: 'p3',
      userId: null,
      displayName: 'Guest Artist',
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

/** BFF tab=dispos payload: candidates without chancePercent (PERF-10 / PERF-13). */
const mockBootstrapSummaryWithoutChances = {
  ...mockSummary,
  roles: [
    {
      roleKey: 'player',
      requiredCount: 5,
      candidates: [
        { participantId: 'p1', displayName: 'Patrice', avatarUrl: null, chancePercent: null },
      ],
    },
  ],
}

async function setup(
  canSwitchSubject = false,
  currentUserId = 'user-1',
  linkedParticipantId: string | null = null,
) {
  const getEventAvailabilitySummary = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: mockSummary,
  })
  const setMyAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available' as const, roleKeys: ['player'], comment: null },
  })
  const setParticipantAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available' as const, roleKeys: ['player'], comment: null },
  })

  await TestBed.configureTestingModule({
    imports: [EventDisposTab, NoopAnimationsModule],
    providers: [
      AvailabilityPersistService,
      {
        provide: AvailabilityApiService,
        useValue: {
          getEventAvailabilitySummary,
          setMyAvailability,
          setParticipantAvailability,
        },
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
      {
        provide: ProductAnalyticsService,
        useValue: {
          captureAvailabilityFirstSubmission: vi.fn(),
          eventContext: vi.fn().mockReturnValue({}),
        },
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(EventDisposTab)
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('seasonSlug', 'saison-test')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('troupeSlug', 'troupe-test')
  fixture.componentRef.setInput('event', {
    id: 'event-1',
    title: 'Match',
    startsAt: '2030-06-15T18:00:00Z',
    templateType: 'cabaret',
    roleSlots: ROLE_TEMPLATES.cabaret,
    archived: false,
  })
  fixture.componentRef.setInput('currentUserId', currentUserId)
  fixture.componentRef.setInput('linkedParticipantId', linkedParticipantId)
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
  it('renders unified poll view without Moi/Tous toggle', async () => {
    const { fixture } = await setup()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Pas disponible')
    expect(el.textContent).not.toContain('Moi')
    expect(el.textContent).not.toContain('Tous')
    expect(el.querySelector('app-availability-poll')).not.toBeNull()
  })

  it('hides subject selector for regular members', async () => {
    const { fixture } = await setup(false)
    expect(fixture.nativeElement.querySelector('app-availability-subject-selector')).toBeNull()
  })

  it('shows subject selector for organizers', async () => {
    const { fixture } = await setup(true)
    expect(fixture.nativeElement.querySelector('app-availability-subject-selector')).not.toBeNull()
  })

  it('auto-selects first summary participant for organizer without linked self row', async () => {
    const { fixture } = await setup(true, 'user-not-on-event')
    expect(fixture.nativeElement.querySelector('app-availability-poll')).not.toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain(
      'Aucun participant lié à ce compte pour cet événement.',
    )
    const comp = fixture.componentInstance as unknown as {
      subjectParticipantId: () => string
    }
    expect(comp.subjectParticipantId()).toBe('p1')
  })

  it('prefers linked season participant when self row is absent from summary', async () => {
    const { fixture } = await setup(false, 'user-not-on-event', 'p2')
    expect(fixture.nativeElement.querySelector('app-availability-poll')).not.toBeNull()
    const comp = fixture.componentInstance as unknown as {
      subjectParticipantId: () => string
    }
    expect(comp.subjectParticipantId()).toBe('p2')
  })

  it('lists every summary participant in subject selector including name-only event roster', async () => {
    const { fixture } = await setup(true)
    const comp = fixture.componentInstance as unknown as {
      subjectSelectorOptions: () => { id: string; displayName: string }[]
    }
    const names = comp.subjectSelectorOptions().map((p) => p.displayName)
    expect(names).toContain('Patrice')
    expect(names).toContain('Alex')
    expect(names).toContain('Guest Artist')
  })

  it('allows organizer to edit another subject (not read-only poll)', async () => {
    const { fixture } = await setup(true)
    const comp = fixture.componentInstance as unknown as {
      onSubjectChange: (id: string) => void
    }
    comp.onSubjectChange('p2')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const poll = fixture.nativeElement.querySelector('app-availability-poll')
    expect(poll).not.toBeNull()
    const readOnly = poll?.getAttribute('ng-reflect-read-only')
    expect(readOnly === 'false' || readOnly === null).toBe(true)
  })

  it('calls proxy API when organizer votes for another subject', async () => {
    const { fixture, setParticipantAvailability, setMyAvailability } = await setup(true)
    const comp = fixture.componentInstance as unknown as {
      onSubjectChange: (id: string) => void
    }
    comp.onSubjectChange('p2')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const poll = fixture.debugElement.query((d) => d.componentInstance instanceof AvailabilityPoll)
      ?.componentInstance as AvailabilityPoll
    await (poll as unknown as { onRoleToggle: (roleKey: string, checked: boolean) => Promise<void> }).onRoleToggle(
      'player',
      true,
    )
    await fixture.whenStable()

    expect(setParticipantAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      'p2',
      expect.objectContaining({ status: 'available', comment: null }),
    )
    expect(setMyAvailability).not.toHaveBeenCalled()
  })

  it('does not eager-load chances on initial summary fetch', async () => {
    const { getEventAvailabilitySummary } = await setup()
    expect(getEventAvailabilitySummary).toHaveBeenCalledWith('season-1', 'event-1', false)
  })

  it('reuses BFF bootstrap summary without redundant fetch (PERF-13)', async () => {
    const getEventAvailabilitySummary = vi.fn()
    await TestBed.configureTestingModule({
      imports: [EventDisposTab, NoopAnimationsModule],
      providers: [
        AvailabilityPersistService,
        {
          provide: AvailabilityApiService,
          useValue: {
            getEventAvailabilitySummary,
            setMyAvailability: vi.fn(),
            setParticipantAvailability: vi.fn(),
          },
        },
        {
          provide: MemberProfileApiService,
          useValue: { getPreferredRoles: vi.fn() },
        },
        {
          provide: ProductAnalyticsService,
          useValue: {
            captureAvailabilityFirstSubmission: vi.fn(),
            eventContext: vi.fn().mockReturnValue({}),
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EventDisposTab)
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('seasonSlug', 'saison-test')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('troupeSlug', 'troupe-test')
    fixture.componentRef.setInput('event', {
      id: 'event-1',
      title: 'Match',
      startsAt: '2030-06-15T18:00:00Z',
      templateType: 'cabaret',
      roleSlots: ROLE_TEMPLATES.cabaret,
      archived: false,
      availabilityOpenedAt: '2030-01-01T00:00:00Z',
    })
    fixture.componentRef.setInput('currentUserId', 'user-1')
    fixture.componentRef.setInput('bootstrapSummary', mockBootstrapSummaryWithoutChances)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    expect(fixture.nativeElement.querySelector('app-availability-poll')).not.toBeNull()
  })

  it('loads summary from API when bootstrapSummary is absent (PERF-13)', async () => {
    const getEventAvailabilitySummary = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: mockBootstrapSummaryWithoutChances,
    })
    await TestBed.configureTestingModule({
      imports: [EventDisposTab, NoopAnimationsModule],
      providers: [
        AvailabilityPersistService,
        {
          provide: AvailabilityApiService,
          useValue: {
            getEventAvailabilitySummary,
            setMyAvailability: vi.fn(),
            setParticipantAvailability: vi.fn(),
          },
        },
        {
          provide: MemberProfileApiService,
          useValue: { getPreferredRoles: vi.fn() },
        },
        {
          provide: ProductAnalyticsService,
          useValue: {
            captureAvailabilityFirstSubmission: vi.fn(),
            eventContext: vi.fn().mockReturnValue({}),
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(EventDisposTab)
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('seasonSlug', 'saison-test')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('troupeSlug', 'troupe-test')
    fixture.componentRef.setInput('event', {
      id: 'event-1',
      title: 'Match',
      startsAt: '2030-06-15T18:00:00Z',
      templateType: 'cabaret',
      roleSlots: ROLE_TEMPLATES.cabaret,
      archived: false,
      availabilityOpenedAt: '2030-01-01T00:00:00Z',
    })
    fixture.componentRef.setInput('currentUserId', 'user-1')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(getEventAvailabilitySummary).toHaveBeenCalledWith('season-1', 'event-1', false)
    expect(fixture.nativeElement.querySelector('app-availability-poll')).not.toBeNull()
  })

  it('does not show Rappel dispos button for organizer when unknown participants exist', async () => {
    const { fixture } = await setup(true)
    fixture.componentRef.setInput('canManageComposition', true)
    fixture.componentRef.setInput('event', {
      id: 'event-1',
      slug: 'event-slug',
      title: 'Match',
      startsAt: '2030-06-15T18:00:00Z',
      templateType: 'cabaret',
      roleSlots: ROLE_TEMPLATES.cabaret,
      archived: false,
      availabilityOpenedAt: '2030-01-01T00:00:00Z',
    })
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).not.toContain('Rappel dispos')
  })
})
