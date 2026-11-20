import { TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { ROLE_TEMPLATES } from '../../core/events/event-types'
import { ChanceBreakdownService } from '../composition/chance-breakdown.service'
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
      gender: 'female' as const,
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
    expect(fixture.nativeElement.querySelector('.availability-tous__partial-warning')?.getAttribute('aria-label')).toBe('Certaines chances sont estimées : elles n’ont pas été capturées au tirage.')
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

  it('shows chance breakdown trigger when explainability enabled', async () => {
    const open = vi.fn()
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
      providers: [{ provide: ChanceBreakdownService, useValue: { open } }],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', mockSummary)
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('eventId', 'event-1')
    fixture.componentRef.setInput('explainabilityEnabled', true)
    fixture.detectChanges()

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="composition-draw-segment-p1"]',
    ) as HTMLButtonElement
    expect(trigger).toBeTruthy()
    trigger.click()
    expect(open).toHaveBeenCalled()
  })

  it('renders a published selection without a detail control and preserves other candidates', async () => {
    const open = vi.fn()
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
      providers: [{ provide: ChanceBreakdownService, useValue: { open } }],
    }).compileComponents()
    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', {
      ...mockSummary,
      roles: [{ ...mockSummary.roles[0], candidates: [
        { participantId: 'p1', displayName: 'Patrice', chancePercent: 37, selectionChanceAt: '2026-01-02T12:00:00Z', publishedAssignment: true, isCandidate: false },
        { participantId: 'p2', displayName: 'Alex', chancePercent: 63 },
      ] }],
    })
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('eventId', 'event-1')
    fixture.componentRef.setInput('explainabilityEnabled', true)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('(1/5)')
    const selected = fixture.nativeElement.querySelector('[data-testid="composition-draw-segment-p1"]') as HTMLButtonElement
    const other = fixture.nativeElement.querySelector('[data-testid="composition-draw-segment-p2"]') as HTMLButtonElement
    expect(selected.title).toContain('37 %')
    selected.click()
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ participantId: 'p1' }))
    other.click()
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ participantId: 'p2' }))
  })

  it('opens only the selected person when every role photograph value is missing', async () => {
    const open = vi.fn()
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
      providers: [{ provide: ChanceBreakdownService, useValue: { open } }],
    }).compileComponents()
    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', { ...mockSummary, roles: [{ ...mockSummary.roles[0], candidates: [
      { participantId: 'p1', displayName: 'Patrice', chancePercent: null, publishedAssignment: true },
      { participantId: 'p2', displayName: 'Alex', chancePercent: null },
    ] }] })
    fixture.componentRef.setInput('chanceSource', 'baseline')
    fixture.componentRef.setInput('seasonId', 'season-1')
    fixture.componentRef.setInput('eventId', 'event-1')
    fixture.componentRef.setInput('explainabilityEnabled', true)
    fixture.detectChanges()
    const [selected, other] = Array.from(fixture.nativeElement.querySelectorAll('.recorded-missing')) as HTMLButtonElement[]
    expect(selected.disabled).toBe(false)
    expect(other.disabled).toBe(true)
    selected.click()
    other.click()
    expect(open).toHaveBeenCalledOnce()
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ participantId: 'p1', roleKey: 'player' }))
  })

  it('shows the date of the common role photograph', async () => {
    await TestBed.configureTestingModule({ imports: [AvailabilityTousPanel, NoopAnimationsModule] }).compileComponents()
    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', { ...mockSummary, roles: [{ ...mockSummary.roles[0], chanceSnapshotAt: '2026-01-02T12:00:00Z' }] })
    fixture.componentRef.setInput('chanceSource', 'baseline')
    fixture.componentRef.setInput('explainabilityEnabled', true)
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Capture des chances du 02/01/2026')
    expect(fixture.nativeElement.textContent).not.toContain('La capture ne couvre pas tous les candidats affichés.')
    fixture.componentRef.setInput('summary', { ...mockSummary, roles: [{ ...mockSummary.roles[0], chanceSnapshotAt: '2026-01-02T12:00:00Z', candidates: [{ participantId: 'p1', displayName: 'Patrice', chancePercent: null, publishedAssignment: true }] }] })
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('La capture ne couvre pas tous les candidats affichés.')
  })

  it('does not render recorded evidence when chance access is disabled', async () => {
    await TestBed.configureTestingModule({ imports: [AvailabilityTousPanel, NoopAnimationsModule] }).compileComponents()
    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', { ...mockSummary, roles: [{ ...mockSummary.roles[0], candidates: [
      { participantId: 'p1', displayName: 'Patrice', chancePercent: 37, selectionChanceAt: '2026-01-02T12:00:00Z', publishedAssignment: true },
    ] }] })
    fixture.componentRef.setInput('explainabilityEnabled', false)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-availability-recorded-candidates')).toBeNull()
    expect(fixture.nativeElement.textContent).not.toContain('37 %')
    expect(fixture.nativeElement.textContent).not.toContain('02/01/2026')
  })

  it('renders pool bar for role candidates when explainability enabled', async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityTousPanel, NoopAnimationsModule],
    }).compileComponents()

    const fixture = TestBed.createComponent(AvailabilityTousPanel)
    fixture.componentRef.setInput('summary', mockSummary)
    fixture.componentRef.setInput('explainabilityEnabled', true)
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="availability-tous-pool"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('app-composition-pool-preview')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Patrice')
  })
})
