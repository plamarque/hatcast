import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { describe, expect, it } from 'vitest'

import { SeasonViewToolbar } from './season-view-toolbar'

describe('SeasonViewToolbar', () => {
  let fixture: ComponentFixture<SeasonViewToolbar>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonViewToolbar],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(SeasonViewToolbar)
    fixture.componentRef.setInput('seasonView', 'agenda')
    fixture.detectChanges()
  })

  it('shows participant and event filters when agenda is active', () => {
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('.season-toolbar__filters')).toBeTruthy()
  })

  it('hides filters when history view is selected', () => {
    fixture.componentRef.setInput('seasonView', 'history')
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('.season-toolbar__filters')).toBeFalsy()
  })

  it('renders agenda and history toggles', () => {
    const el = fixture.nativeElement as HTMLElement
    const toggles = el.querySelectorAll('mat-button-toggle')
    expect(toggles.length).toBe(2)
    expect(el.textContent).toContain('Agenda')
    expect(el.textContent).toContain('Historique')
  })
})
