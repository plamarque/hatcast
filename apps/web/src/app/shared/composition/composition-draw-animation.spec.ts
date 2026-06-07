import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { candidateCountLabel, CompositionDrawAnimation } from './composition-draw-animation'

describe('candidateCountLabel', () => {
  it('formats singular and plural', () => {
    expect(candidateCountLabel(1)).toBe('1 candidat')
    expect(candidateCountLabel(8)).toBe('8 candidats')
  })
})

describe('CompositionDrawAnimation', () => {
  let fixture: ComponentFixture<CompositionDrawAnimation>

  beforeEach(async () => {
    vi.useFakeTimers()
    await TestBed.configureTestingModule({
      imports: [CompositionDrawAnimation, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(CompositionDrawAnimation)
    fixture.componentRef.setInput('step', {
      roleKey: 'player',
      slotIndex: 0,
      candidates: [
        {
          participantId: 'a',
          displayName: 'Alice',
          chancePercent: 60,
          weight: 2,
        },
        {
          participantId: 'b',
          displayName: 'Bob',
          chancePercent: 40,
          weight: 1,
        },
      ],
      selectedParticipantId: 'a',
      randomValue: 0.5,
      totalWeight: 3,
    })
    fixture.componentRef.setInput('stepIndex', 0)
    fixture.componentRef.setInput('totalSteps', 1)
    fixture.detectChanges()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders proportional segment labels', () => {
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('Bob')
    expect(fixture.nativeElement.textContent).not.toContain('pas encore validée')
  })

  it('shows preparing message when preparing input is true', () => {
    fixture.componentRef.setInput('preparing', true)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Nous préparons le tirage au sort')
    expect(fixture.nativeElement.querySelector('.composition-draw-animation__bar')).toBeNull()
  })

  it('shows gender-aware selection prefix for female winner', () => {
    fixture.componentRef.setInput('step', {
      roleKey: 'player',
      slotIndex: 0,
      candidates: [
        {
          participantId: 'a',
          displayName: 'Alice',
          chancePercent: 100,
          weight: 1,
          gender: 'female',
        },
      ],
      selectedParticipantId: 'a',
      randomValue: 0.5,
      totalWeight: 1,
    })
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Sélectionnée : Alice')
  })

  it('shows inclusive selection prefix when gender is unknown', () => {
    fixture.componentRef.setInput('step', {
      roleKey: 'player',
      slotIndex: 0,
      candidates: [
        {
          participantId: 'a',
          displayName: 'Alex',
          chancePercent: 100,
          weight: 1,
        },
      ],
      selectedParticipantId: 'a',
      randomValue: 0.5,
      totalWeight: 1,
    })
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Sélectionné·e : Alex')
  })

  it('emits finished after play animation delay', () => {
    const finished = vi.fn()
    fixture.componentInstance.finished.subscribe(finished)
    fixture.componentInstance.play()
    vi.advanceTimersByTime(950)
    expect(finished).toHaveBeenCalled()
  })

  it('preview mode orders segments by chance percent descending', () => {
    fixture.componentRef.setInput('mode', 'preview')
    fixture.componentRef.setInput('step', null)
    fixture.componentRef.setInput('previewPool', [
      {
        participantId: 'low',
        displayName: 'Marco',
        chancePercent: 6,
        weight: 1,
      },
      {
        participantId: 'high',
        displayName: 'Camille',
        chancePercent: 42,
        weight: 3,
      },
    ])
    fixture.detectChanges()

    const labels = [
      ...fixture.nativeElement.querySelectorAll('.composition-draw-animation__segment-label'),
    ].map((el: Element) => el.textContent?.trim())
    expect(labels).toEqual(['Camille', 'Marco'])
    expect(fixture.nativeElement.textContent).toContain('2 candidats')

    const segments = [
      ...fixture.nativeElement.querySelectorAll('.composition-draw-animation__segment'),
    ] as HTMLElement[]
    expect(segments[0]?.classList.contains('composition-draw-animation__segment--chance-orange')).toBe(
      true,
    )
    expect(segments[1]?.classList.contains('composition-draw-animation__segment--chance-red')).toBe(
      true,
    )
    expect(segments[0]?.style.background).toContain('linear-gradient')
    expect(segments[1]?.style.background).toContain('linear-gradient')
    expect(segments[0]?.style.background).not.toBe(segments[1]?.style.background)
    expect(Number.parseFloat(segments[0]?.style.width)).toBeGreaterThan(
      Number.parseFloat(segments[1]?.style.width),
    )
  })

  it('preview mode sizes segments by chance percent not draw weight', () => {
    fixture.componentRef.setInput('mode', 'preview')
    fixture.componentRef.setInput('step', null)
    fixture.componentRef.setInput('previewPool', [
      {
        participantId: 'a',
        displayName: 'Patrice',
        chancePercent: 100,
        weight: 5,
      },
      {
        participantId: 'b',
        displayName: 'Marco',
        chancePercent: 100,
        weight: 1,
      },
      {
        participantId: 'c',
        displayName: 'Léa',
        chancePercent: 100,
        weight: 5,
      },
    ])
    fixture.detectChanges()

    const segments = [
      ...fixture.nativeElement.querySelectorAll('.composition-draw-animation__segment'),
    ] as HTMLElement[]
    expect(segments).toHaveLength(3)
    const widths = segments.map((segment) => Number.parseFloat(segment.style.width))
    expect(widths[0]).toBeCloseTo(widths[1]!, 5)
    expect(widths[1]).toBeCloseTo(widths[2]!, 5)
  })

  it('wrap mode uses proportional flex-basis with flow layout', () => {
    fixture.componentRef.setInput('mode', 'preview')
    fixture.componentRef.setInput('step', null)
    fixture.componentRef.setInput('wrapSegments', true)
    fixture.componentRef.setInput('previewPool', [
      { participantId: 'a', displayName: 'Alice', chancePercent: 50, weight: 1 },
      { participantId: 'b', displayName: 'Bob', chancePercent: 30, weight: 1 },
      { participantId: 'c', displayName: 'Camille', chancePercent: 20, weight: 1 },
    ])
    fixture.detectChanges()

    const bar = fixture.nativeElement.querySelector('.composition-draw-animation__bar--flow')
    expect(bar).toBeTruthy()
    const segments = [
      ...fixture.nativeElement.querySelectorAll('.composition-draw-animation__segment--flow'),
    ] as HTMLElement[]
    expect(segments).toHaveLength(3)
    expect(segments[0]?.style.flex).toBe('0 1 50%')
    expect(segments[1]?.style.flex).toBe('0 1 30%')
    expect(segments[2]?.style.flex).toBe('0 1 20%')
  })

  it('embedded wrap mode renders avatars in pool segments', () => {
    fixture.componentRef.setInput('mode', 'preview')
    fixture.componentRef.setInput('embedded', true)
    fixture.componentRef.setInput('wrapSegments', true)
    fixture.componentRef.setInput('step', null)
    fixture.componentRef.setInput('previewPool', [
      {
        participantId: 'a',
        displayName: 'Patrice',
        chancePercent: 40,
        weight: 1,
        avatarUrl: 'https://example.com/a.jpg',
        gender: 'male',
      },
    ])
    fixture.detectChanges()

    const avatar = fixture.nativeElement.querySelector('app-user-avatar')
    expect(avatar).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Patrice')
  })

  it('preview mode renders tap segments and emits segmentTap', () => {
    const segmentTap = vi.fn()
    fixture.componentRef.setInput('mode', 'preview')
    fixture.componentRef.setInput('step', null)
    fixture.componentRef.setInput('previewPool', [
      {
        participantId: 'a',
        displayName: 'Alice',
        chancePercent: 60,
        weight: 2,
      },
    ])
    fixture.detectChanges()
    fixture.componentInstance.segmentTap.subscribe(segmentTap)

    const segment = fixture.nativeElement.querySelector(
      '[data-testid="composition-draw-segment-a"]',
    ) as HTMLButtonElement
    expect(segment).toBeTruthy()
    segment.click()
    expect(segmentTap).toHaveBeenCalledWith({ participantId: 'a', chancePercent: 60 })
  })
})
