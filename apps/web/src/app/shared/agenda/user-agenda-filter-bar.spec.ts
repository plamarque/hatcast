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
    leagues: [
      { id: 'league-a1', title: 'Ligue A1', slug: 'ligue-a1', troupeId: 'troupe-a' },
      { id: 'league-a2', title: 'Ligue A2', slug: 'ligue-a2', troupeId: 'troupe-a' },
      { id: 'league-b1', title: 'Ligue B1', slug: 'ligue-b1', troupeId: 'troupe-b' },
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
    expect(text).toContain('Tous les groupes')
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
    fixture.componentRef.setInput('selectedLeagueId', 'league-b1')
    fixture.detectChanges()

    const handler = vi.fn()
    fixture.componentInstance.clearFilters.subscribe(handler)
    fixture.componentInstance['onClear']()
    expect(handler).toHaveBeenCalled()
  })

  it('restreint les ligues au menu quand une troupe est sélectionnée', () => {
    fixture.componentRef.setInput('selectedTroupeId', 'troupe-b')
    fixture.detectChanges()

    const scoped = fixture.componentInstance['scopedLeagues']()
    expect(scoped).toHaveLength(1)
    expect(scoped[0].id).toBe('league-b1')
  })

  it('affiche un libellé explicite pour une ligue hors scope', () => {
    fixture.componentRef.setInput('selectedLeagueId', 'league-b1')
    fixture.detectChanges()

    expect(fixture.componentInstance['leagueLabel']()).toBe('Ligue B1')
  })
})
