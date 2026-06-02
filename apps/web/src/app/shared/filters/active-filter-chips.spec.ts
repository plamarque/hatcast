import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ActiveFilterChips } from './active-filter-chips'

describe('ActiveFilterChips', () => {
  let fixture: ComponentFixture<ActiveFilterChips>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveFilterChips, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(ActiveFilterChips)
    fixture.detectChanges()
  })

  it('renders nothing when chips are empty', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="active-filter-chips"]')).toBeNull()
  })

  it('renders removable chips and Tout effacer', () => {
    fixture.componentRef.setInput('chips', [
      { dimensionKey: 'troupe', label: 'La BIM' },
      { dimensionKey: 'season', label: 'Saison 2025-26' },
    ])
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="active-filter-chips"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('La BIM')
    expect(fixture.nativeElement.textContent).toContain('Tout effacer')
  })

  it('emits removeDimension and clearAll', () => {
    fixture.componentRef.setInput('chips', [{ dimensionKey: 'troupe', label: 'La BIM' }])
    fixture.detectChanges()

    const removeSpy = vi.fn()
    const clearSpy = vi.fn()
    fixture.componentInstance.removeDimension.subscribe(removeSpy)
    fixture.componentInstance.clearAll.subscribe(clearSpy)

    fixture.componentInstance['onRemove']('troupe')
    fixture.componentInstance['onClearAll']()

    expect(removeSpy).toHaveBeenCalledWith('troupe')
    expect(clearSpy).toHaveBeenCalled()
  })
})
