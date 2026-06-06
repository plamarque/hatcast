import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FilterPanelService } from '../../shared/filters/filter-panel.service'
import { SeasonViewToolbar } from './season-view-toolbar'

describe('SeasonViewToolbar', () => {
  let fixture: ComponentFixture<SeasonViewToolbar>
  let filterPanel: {
    openParticipantPicker: ReturnType<typeof vi.fn>
    openEventPicker: ReturnType<typeof vi.fn>
    openCategoriesPicker: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    filterPanel = {
      openParticipantPicker: vi.fn().mockResolvedValue(undefined),
      openEventPicker: vi.fn().mockResolvedValue(undefined),
      openCategoriesPicker: vi.fn().mockResolvedValue(undefined),
    }

    await TestBed.configureTestingModule({
      imports: [SeasonViewToolbar],
      providers: [
        provideRouter([]),
        { provide: FilterPanelService, useValue: filterPanel },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(SeasonViewToolbar)
    fixture.componentRef.setInput('seasonView', 'agenda')
    fixture.detectChanges()
  })

  it('shows filter trigger in right cluster when filterTriggerVisible is true', () => {
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger-column"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="filter-trigger"]')).toBeTruthy()
  })

  it('hides inline filter pulldowns', () => {
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.componentRef.setInput('participantOptions', [
      { id: null, label: 'Tous' },
      { id: 'p1', label: 'Alice' },
    ])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('mat-menu')).toBeNull()
  })

  it('does not show export on history view toolbar', () => {
    fixture.componentRef.setInput('seasonView', 'history')
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).not.toContain('Exporter')
  })

  it('renders agenda, history and statistics toggles', () => {
    const el = fixture.nativeElement as HTMLElement
    const toggles = el.querySelectorAll('mat-button-toggle')
    expect(toggles.length).toBe(3)
    expect(el.textContent).toContain('Agenda')
    expect(el.textContent).toContain('Historique')
    expect(el.textContent).toContain('Statistiques')
  })

  it('hides Historique for AGENDA_ONLY guest workspace', () => {
    fixture.componentRef.setInput('agendaOnlyGuest', true)
    fixture.componentRef.setInput('partialGuestWorkspace', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Agenda')
    expect(el.textContent).not.toContain('Historique')
    expect(el.textContent).not.toContain('Statistiques')
  })

  it('shows Agenda and Historique but hides Stats for EVENTS_ONLY guest workspace', () => {
    fixture.componentRef.setInput('agendaOnlyGuest', false)
    fixture.componentRef.setInput('partialGuestWorkspace', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).toContain('Agenda')
    expect(el.textContent).toContain('Historique')
    expect(el.textContent).not.toContain('Statistiques')
  })

  it('shows details on stats view without export button', () => {
    fixture.componentRef.setInput('seasonView', 'stats')
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.textContent).not.toContain('Exporter')
    expect(el.textContent).toContain('Détails')
  })

  it('toggles compact criteria bar from trigger without modal hub', () => {
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.componentRef.setInput('participantOptions', [
      { id: null, label: 'Tous' },
      { id: 'p1', label: 'Alice' },
    ])
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="filter-criteria-bar"]')).toBeNull()

    fixture.componentInstance['toggleCriteriaPanel']()
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="filter-criteria-bar"]')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Participants')
  })

  it('shows collapsed chips row when participant is selected and panel is closed', () => {
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.componentRef.setInput('participantOptions', [
      { id: null, label: 'Tous' },
      { id: 'p1', label: 'Alice' },
    ])
    fixture.componentRef.setInput('selectedParticipantIds', ['p1'])
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="filter-criteria-bar"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="season-toolbar-chips-row"]')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Alice')
    expect(fixture.nativeElement.textContent).toContain('Tout effacer')
  })

  it('toggles criteria panel closed when filter trigger is clicked again', () => {
    fixture.componentRef.setInput('filterTriggerVisible', true)
    fixture.detectChanges()

    fixture.componentInstance['toggleCriteriaPanel']()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[data-testid="filter-criteria-bar"]')).toBeTruthy()

    fixture.componentInstance['toggleCriteriaPanel']()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[data-testid="filter-criteria-bar"]')).toBeNull()
  })

  it('does not render scope admin menu in toolbar', () => {
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-scope-admin-menu')).toBeNull()
  })
})
