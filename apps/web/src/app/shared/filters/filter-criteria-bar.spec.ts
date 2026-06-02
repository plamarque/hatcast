import { ComponentFixture, TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FilterCriteriaBar } from './filter-criteria-bar'

describe('FilterCriteriaBar', () => {
  let fixture: ComponentFixture<FilterCriteriaBar>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterCriteriaBar],
    }).compileComponents()

    fixture = TestBed.createComponent(FilterCriteriaBar)
    fixture.componentRef.setInput('dimensions', [
      { key: 'participant', icon: 'person', title: 'Participants', summary: '3 participants' },
      { key: 'spectacle', icon: 'event', title: 'Spectacles', summary: 'Tous' },
    ])
    fixture.detectChanges()
  })

  it('renders dimension labels without summary redundancy', () => {
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="filter-criteria-bar"]')).toBeTruthy()
    expect(el.textContent).toContain('Participants')
    expect(el.textContent).not.toContain('Tous')
  })

  it('shows value chip only for active dimensions', () => {
    fixture.componentRef.setInput('chips', [
      { dimensionKey: 'participant', label: '3 participants' },
    ])
    fixture.detectChanges()

    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('3 participants')
    const chips = el.querySelectorAll('mat-chip')
    expect(chips.length).toBe(1)
    expect(el.querySelector('[data-testid="filter-clear-all"]')).toBeTruthy()
  })

  it('emits openDimension when dimension label is clicked', () => {
    const spy = vi.fn()
    fixture.componentInstance.openDimension.subscribe(spy)

    const btn = fixture.nativeElement.querySelector(
      '[data-testid="filter-criteria-participant"] .filter-criteria-bar__dimension',
    ) as HTMLButtonElement
    btn.click()

    expect(spy).toHaveBeenCalledWith('participant')
  })
})
