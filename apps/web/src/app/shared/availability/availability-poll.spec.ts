import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { AvailabilityPoll } from './availability-poll'
import { AvailabilityPersistService } from './availability-persist.service'

const mockSummary = {
  eventId: 'event-1',
  roleSlots: ROLE_TEMPLATES.cabaret,
  participants: [
    {
      participantId: 'p1',
      userId: 'user-1',
      displayName: 'Patrice',
      avatarUrl: null,
      status: 'unknown' as const,
      roleKeys: [],
      comment: null,
    },
    {
      participantId: 'p2',
      userId: 'user-2',
      displayName: 'Alex',
      avatarUrl: null,
      status: 'available' as const,
      roleKeys: ['player'],
      comment: null,
    },
  ],
  roles: [
    {
      roleKey: 'player',
      requiredCount: 12,
      candidates: [
        { participantId: 'p2', displayName: 'Alex', avatarUrl: null, chancePercent: null },
      ],
    },
    {
      roleKey: 'volunteer',
      requiredCount: 4,
      candidates: [],
    },
  ],
}

async function setupPoll(options: {
  subjectId?: string
  proxyMode?: boolean
  readOnly?: boolean
  initialStatus?: 'available' | 'unavailable' | 'unknown'
  initialRoleKeys?: string[]
} = {}) {
  const setMyAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available', roleKeys: ['player'], comment: null },
  })
  const setParticipantAvailability = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { status: 'available', roleKeys: ['player'], comment: null },
  })
  const getEventAvailabilitySummary = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      ...mockSummary,
      roles: mockSummary.roles.map((role) => ({
        ...role,
        candidates: role.candidates.map((c) => ({ ...c, chancePercent: 50 })),
      })),
      chanceSource: 'estimated' as const,
    },
  })

  await TestBed.configureTestingModule({
    imports: [AvailabilityPoll, NoopAnimationsModule],
    providers: [
      AvailabilityPersistService,
      {
        provide: AvailabilityApiService,
        useValue: { setMyAvailability, setParticipantAvailability, getEventAvailabilitySummary },
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

  const subjectId = options.subjectId ?? 'p1'
  const subject = {
    ...mockSummary.participants.find((p) => p.participantId === subjectId)!,
    status: options.initialStatus ?? mockSummary.participants.find((p) => p.participantId === subjectId)!.status,
    roleKeys: options.initialRoleKeys ?? mockSummary.participants.find((p) => p.participantId === subjectId)!.roleKeys,
  }

  const fixture = TestBed.createComponent(AvailabilityPoll)
  fixture.componentRef.setInput('seasonId', 'season-1')
  fixture.componentRef.setInput('eventId', 'event-1')
  fixture.componentRef.setInput('troupeId', 'troupe-1')
  fixture.componentRef.setInput('roleSlots', ROLE_TEMPLATES.cabaret)
  fixture.componentRef.setInput('summary', mockSummary)
  fixture.componentRef.setInput('subject', subject)
  fixture.componentRef.setInput('readOnly', options.readOnly ?? false)
  fixture.componentRef.setInput('proxyMode', options.proxyMode ?? false)
  fixture.componentRef.setInput('archived', false)
  fixture.componentRef.setInput('explainabilityEnabled', true)
  fixture.componentRef.setInput('currentUserId', 'user-1')
  fixture.detectChanges()
  await fixture.whenStable()
  fixture.detectChanges()

  return { fixture, setMyAvailability, setParticipantAvailability, getEventAvailabilitySummary }
}

describe('AvailabilityPoll', () => {
  it('renders poll rows without Moi/Tous toggle', async () => {
    const { fixture } = await setupPoll()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Pas disponible')
    expect(el.textContent).toContain('Comédien·ne')
    expect(el.textContent).not.toContain('Moi')
    expect(el.textContent).not.toContain('Tous')
  })

  it('saves vote immediately when checking a role', async () => {
    const { fixture, setMyAvailability } = await setupPoll()
    const comp = fixture.componentInstance as unknown as {
      onRoleToggle: (roleKey: string, checked: boolean) => Promise<void>
    }
    await comp.onRoleToggle('player', true)
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({ status: 'available', roleKeys: ['player'] }),
    )
  })

  it('checks only the toggled role on first vote', async () => {
    const { fixture, setMyAvailability } = await setupPoll({
      initialStatus: 'unknown',
      initialRoleKeys: [],
    })
    fixture.componentRef.setInput('roleSlots', ROLE_TEMPLATES.cabaret)
    fixture.detectChanges()

    const comp = fixture.componentInstance as unknown as {
      onRoleToggle: (roleKey: string, checked: boolean) => Promise<void>
    }
    await comp.onRoleToggle('dj', true)
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({ status: 'available', roleKeys: ['dj'] }),
    )
  })

  it('sets unavailable when checking Indispo', async () => {
    const { fixture, setMyAvailability } = await setupPoll({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })
    const comp = fixture.componentInstance as unknown as {
      onUnavailableToggle: (checked: boolean) => Promise<void>
    }
    await comp.onUnavailableToggle(true)
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({ status: 'unavailable', roleKeys: [] }),
    )
  })

  it('checking a role while Indispo clears unavailable status', async () => {
    const { fixture, setMyAvailability } = await setupPoll({
      initialStatus: 'unavailable',
      initialRoleKeys: [],
    })
    const comp = fixture.componentInstance as unknown as {
      onRoleToggle: (roleKey: string, checked: boolean) => Promise<void>
      rolesDisabled: () => boolean
    }
    expect(comp.rolesDisabled()).toBe(false)
    await comp.onRoleToggle('player', true)
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({ status: 'available', roleKeys: ['player'] }),
    )
  })

  it('uses proxy API when proxyMode is true', async () => {
    const { fixture, setParticipantAvailability, setMyAvailability } = await setupPoll({
      subjectId: 'p2',
      proxyMode: true,
    })
    const comp = fixture.componentInstance as unknown as {
      onRoleToggle: (roleKey: string, checked: boolean) => Promise<void>
    }
    await comp.onRoleToggle('player', true)
    await fixture.whenStable()

    expect(setParticipantAvailability).toHaveBeenCalled()
    expect(setMyAvailability).not.toHaveBeenCalled()
  })

  it('caps gauge at 100 percent for overflow candidates', async () => {
    const { fixture } = await setupPoll()
    const comp = fixture.componentInstance as unknown as {
      roleFillPercent: (roleKey: string) => number
      roleCounterText: (roleKey: string) => string
    }
    expect(comp.roleFillPercent('player')).toBe(8)
    expect(comp.roleCounterText('player')).toBe('1/12')
  })

  it('loads chances lazily on first pool expand', async () => {
    const { fixture, getEventAvailabilitySummary } = await setupPoll()
    const comp = fixture.componentInstance as unknown as {
      onPoolTrigger: (rowKey: string) => Promise<void>
    }
    await comp.onPoolTrigger('role:player')
    await fixture.whenStable()

    expect(getEventAvailabilitySummary).toHaveBeenCalledWith('season-1', 'event-1', true)
  })

  it('shows pool skeleton while chances load on expand (PERF-13)', async () => {
    let resolveSummary: (value: unknown) => void = () => {}
    const summaryPromise = new Promise((resolve) => {
      resolveSummary = resolve
    })
    const getEventAvailabilitySummary = vi.fn().mockReturnValue(summaryPromise)

    await TestBed.configureTestingModule({
      imports: [AvailabilityPoll, NoopAnimationsModule],
      providers: [
        AvailabilityPersistService,
        {
          provide: AvailabilityApiService,
          useValue: {
            setMyAvailability: vi.fn(),
            setParticipantAvailability: vi.fn(),
            getEventAvailabilitySummary,
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

    const fixture = TestBed.createComponent(AvailabilityPoll)
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('eventId', 'event-1')
    fixture.componentRef.setInput('troupeId', 'troupe-1')
    fixture.componentRef.setInput('roleSlots', ROLE_TEMPLATES.cabaret)
    fixture.componentRef.setInput('summary', mockSummary)
    fixture.componentRef.setInput('subject', mockSummary.participants[0])
    fixture.componentRef.setInput('explainabilityEnabled', true)
    fixture.componentRef.setInput('currentUserId', 'user-1')
    fixture.componentInstance.summaryPatch.subscribe((next) => {
      fixture.componentRef.setInput('summary', next)
    })
    fixture.detectChanges()

    const comp = fixture.componentInstance as unknown as {
      onPoolTrigger: (rowKey: string) => Promise<void>
      loadingChances: () => boolean
    }
    void comp.onPoolTrigger('role:player')
    fixture.detectChanges()

    expect(comp.loadingChances()).toBe(true)
    expect(fixture.nativeElement.querySelector('.poll-row__pool-loading')).toBeTruthy()
    expect(getEventAvailabilitySummary).toHaveBeenCalledWith('season-1', 'event-1', true)

    resolveSummary({
      ok: true,
      status: 200,
      data: {
        ...mockSummary,
        roles: mockSummary.roles.map((role) => ({
          ...role,
          candidates: role.candidates.map((c) => ({ ...c, chancePercent: 50 })),
        })),
        chanceSource: 'estimated' as const,
      },
    })
    await fixture.whenStable()
    fixture.detectChanges()

    expect(comp.loadingChances()).toBe(false)
    expect(fixture.nativeElement.querySelector('.poll-row__pool-loading')).toBeFalsy()
    expect(fixture.nativeElement.querySelector('app-composition-pool-preview')).toBeTruthy()
  })

  it('shows neutral pool without fake zero percent when explainability is disabled', async () => {
    const { fixture, getEventAvailabilitySummary } = await setupPoll()
    fixture.componentRef.setInput('explainabilityEnabled', false)
    fixture.detectChanges()

    const comp = fixture.componentInstance as unknown as {
      onPoolTrigger: (rowKey: string) => Promise<void>
      rolePoolShowNeutral: (roleKey: string) => boolean
      rolePoolShowChancePreview: (roleKey: string) => boolean
      poolSegments: (roleKey: string) => unknown[]
    }
    expect(comp.rolePoolShowNeutral('player')).toBe(true)
    expect(comp.rolePoolShowChancePreview('player')).toBe(false)
    expect(comp.poolSegments('player')).toEqual([])

    await comp.onPoolTrigger('role:player')
    await fixture.whenStable()
    fixture.detectChanges()

    expect(getEventAvailabilitySummary).not.toHaveBeenCalled()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('.poll-row__pool-neutral')).toBeTruthy()
    expect(el.querySelector('app-composition-pool-preview')).toBeFalsy()
  })

  it('saves comment without changing vote scope', async () => {
    const { fixture, setMyAvailability } = await setupPoll({
      initialStatus: 'available',
      initialRoleKeys: ['player'],
    })
    const comp = fixture.componentInstance as unknown as {
      onCommentInput: (value: string) => void
      saveComment: () => Promise<void>
    }
    comp.onCommentInput('Je serai en retard')
    await comp.saveComment()
    await fixture.whenStable()

    expect(setMyAvailability).toHaveBeenCalledWith(
      'season-1',
      'event-1',
      expect.objectContaining({
        comment: 'Je serai en retard',
        status: 'available',
        roleKeys: ['player'],
      }),
    )
  })
})
