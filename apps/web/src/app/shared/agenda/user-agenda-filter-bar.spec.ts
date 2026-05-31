import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserAgendaParticipationFilters } from '../../core/agenda/user-agenda-api.service'
import { UserAgendaFilterBar } from './user-agenda-filter-bar'

describe('UserAgendaFilterBar', () => {
  let fixture: ComponentFixture<UserAgendaFilterBar>

  const filters: UserAgendaParticipationFilters = {
    troupes: [
      { id: 'troupe-a', name: 'Troupe A', slug: 'troupe-a' },
      { id: 'troupe-b', name: 'Troupe B', slug: 'troupe-b' },
    ],
    seasons: [
      { id: 'season-a1', title: 'Saison A1', slug: 'saison-a1', troupeId: 'troupe-a' },
      { id: 'season-a2', title: 'Saison A2', slug: 'saison-a2', troupeId: 'troupe-a' },
      { id: 'season-b1', title: 'Saison B1', slug: 'saison-b1', troupeId: 'troupe-b' },
    ],
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAgendaFilterBar, NoopAnimationsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(UserAgendaFilterBar)
    fixture.componentRef.setInput('participationFilters', filters)
    fixture.detectChanges()
  })

  it('affiche les libellés par défaut et masque Effacer filtres sans sélection', () => {
    const text = fixture.nativeElement.textContent
    expect(text).toContain('Toutes les troupes')
    expect(text).toContain('Toutes les saisons')
    expect(fixture.nativeElement.querySelector('[data-testid="agenda-clear-filters"]')).toBeNull()
  })

  it('affiche Effacer filtres quand un filtre est actif', () => {
    fixture.componentRef.setInput('selectedTroupeId', 'troupe-a')
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('[data-testid="agenda-clear-filters"]')).not.toBeNull()
    expect(fixture.nativeElement.textContent).toContain('Troupe A')
  })

  it('émet troupeChange au choix d’une troupe', () => {
    const handler = vi.fn()
    fixture.componentInstance.troupeChange.subscribe(handler)

    fixture.componentInstance['selectTroupe'](filters.troupes[0])
    expect(handler).toHaveBeenCalledWith('troupe-a')
  })

  it('émet clearFilters au clic Effacer filtres', () => {
    fixture.componentRef.setInput('selectedSeasonId', 'season-b1')
    fixture.detectChanges()

    const handler = vi.fn()
    fixture.componentInstance.clearFilters.subscribe(handler)
    fixture.componentInstance['onClear']()
    expect(handler).toHaveBeenCalled()
  })

  it('restreint les saisons au menu quand une troupe est sélectionnée', () => {
    fixture.componentRef.setInput('selectedTroupeId', 'troupe-b')
    fixture.detectChanges()

    const scoped = fixture.componentInstance['scopedSeasons']()
    expect(scoped).toHaveLength(1)
    expect(scoped[0].id).toBe('season-b1')
  })

  it('affiche un libellé explicite pour une saison hors scope', () => {
    fixture.componentRef.setInput('selectedSeasonId', 'season-b1')
    fixture.detectChanges()

    expect(fixture.componentInstance['seasonLabel']()).toBe('Saison B1')
  })
})
