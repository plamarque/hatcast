import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'

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

  it('shows agenda filters when agenda is active', () => {
    fixture.componentRef.setInput('showAgendaFilters', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Tous')
    expect(el.textContent).not.toContain('Exporter')
  })

  it('shows history filters and export when history is active', () => {
    fixture.componentRef.setInput('seasonView', 'history')
    fixture.componentRef.setInput('showHistoryFilters', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Exporter')
  })

  it('renders agenda, history and statistics toggles', () => {
    const el = fixture.nativeElement as HTMLElement
    const toggles = el.querySelectorAll('mat-button-toggle')
    expect(toggles.length).toBe(3)
    expect(el.textContent).toContain('Agenda')
    expect(el.textContent).toContain('Historique')
    expect(el.textContent).toContain('Statistiques')
  })

  it('shows statistics filters, export and masquer when stats is active', () => {
    fixture.componentRef.setInput('seasonView', 'stats')
    fixture.componentRef.setInput('showStatsFilters', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Exporter')
    expect(el.textContent).toContain('Détails')
  })

  it('shows groupes de spectacles filter trigger on stats view', () => {
    fixture.componentRef.setInput('seasonView', 'stats')
    fixture.componentRef.setInput('showStatsFilters', true)
    fixture.componentRef.setInput('statsEquityCompartments', { kind: 'all' })
    fixture.componentRef.setInput('equityGlossarySlugs', ['deplacements'])
    fixture.componentRef.setInput('equityTagLabels', { deplacements: 'Déplacements' })
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Tous les spectacles')
    expect(el.querySelector('[aria-label="Filtrer par groupes de spectacles"]')).toBeTruthy()
  })
})
