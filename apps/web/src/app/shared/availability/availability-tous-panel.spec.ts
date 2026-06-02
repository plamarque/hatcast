import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it } from 'vitest'

import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { AvailabilityTousPanel } from './availability-tous-panel'

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

describe('AvailabilityTousPanel', () => {
  it('shows estimated hint when chanceSource is estimated', async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', mockSummary)
    fixture.componentRef.setInput('chanceSource', 'estimated')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain(
      '⚠️ Pourcentages au moment du tirage estimés.',
    )
  })

  it('shows snapshot hint when chanceSource is snapshot', async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', mockSummary)
    fixture.componentRef.setInput('chanceSource', 'snapshot')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain(
      'ℹ️ Pourcentages capturés au moment du tirage.',
    )
  })

  it('shows per-role warning when role has partial estimated chances', async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', {
      ...mockSummary,
      roles: [
        {
          ...mockSummary.roles[0],
          hasPartialEstimatedChances: true,
        },
      ],
    })
    fixture.componentRef.setInput('chanceSource', 'snapshot')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain(
      'ℹ️ Pourcentages capturés au moment du tirage.',
    )
    expect(fixture.nativeElement.querySelector('.availability-tous__partial-warning')).toBeTruthy()
  })

  it('hides chance hint for live source', async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', mockSummary)
    fixture.componentRef.setInput('chanceSource', 'live')
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).not.toContain('au moment du tirage')
  })
})
