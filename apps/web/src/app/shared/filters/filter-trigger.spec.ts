import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FilterTrigger } from './filter-trigger'

describe('FilterTrigger', () => {
  let fixture: ComponentFixture<FilterTrigger>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterTrigger, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(FilterTrigger)
    fixture.detectChanges()
  })

  it('is hidden when visible is false', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).toBeNull()
  })

  it('shows filter_list icon with default aria-label', () => {
    fixture.componentRef.setInput('visible', true)
    fixture.detectChanges()

    const btn = fixture.nativeElement.querySelector('[data-testid="filter-trigger"]') as HTMLButtonElement
    expect(btn).not.toBeNull()
    expect(btn.getAttribute('aria-label')).toBe('Filtrer')
    expect(btn.textContent).toContain('filter_list')
  })

  it('uses active-count aria-label when filters are active', () => {
    fixture.componentRef.setInput('visible', true)
    fixture.componentRef.setInput('activeCount', 2)
    fixture.detectChanges()

    const btn = fixture.nativeElement.querySelector('[data-testid="filter-trigger"]') as HTMLButtonElement
    expect(btn.getAttribute('aria-label')).toBe('Filtrer, 2 critères actifs')
  })

  it('emits open on click', () => {
    fixture.componentRef.setInput('visible', true)
    fixture.detectChanges()

    const handler = vi.fn()
    fixture.componentInstance.open.subscribe(handler)
    fixture.componentInstance['onOpen']()
    expect(handler).toHaveBeenCalled()
  })
})
