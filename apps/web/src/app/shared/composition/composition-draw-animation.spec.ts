import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { describe, expect, it, vi } from 'vitest'

import { CompositionDrawAnimation } from './composition-draw-animation'

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
    expect(fixture.nativeElement.textContent).toContain('Sélection en cours')
  })

  it('shows preparing message when preparing input is true', () => {
    fixture.componentRef.setInput('preparing', true)
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain('Nous préparons le tirage au sort')
    expect(fixture.nativeElement.querySelector('.composition-draw-animation__bar')).toBeNull()
  })

  it('emits finished after play animation delay', () => {
    const finished = vi.fn()
    fixture.componentInstance.finished.subscribe(finished)
    fixture.componentInstance.play()
    vi.advanceTimersByTime(950)
    expect(finished).toHaveBeenCalled()
  })
})
