import { describe, expect, it } from 'vitest'

import type { UserAgendaParticipationFilters } from '../../core/agenda/user-agenda-api.service'
import {
  aggregateSelectionLabel,
  buildAgendaFilterChips,
  buildAgendaHubDimensions,
  buildSeasonFilterChips,
  buildSeasonHubDimensions,
  filterEventPickerVisibleOptions,
  participantHubSummary,
  resolveAgendaPanelSeason,
  resolveApiParticipantId,
} from './filter-builders'
import type { EventPickerOption } from './filter.types'

const filters: UserAgendaParticipationFilters = {
  troupes: [
    { id: 'troupe-a', name: 'Troupe A', slug: 'troupe-a' },
    { id: 'troupe-b', name: 'Troupe B', slug: 'troupe-b' },
  ],
  seasons: [
    { id: 'season-a1', title: 'Saison A1', slug: 'saison-a1', troupeId: 'troupe-a' },
    { id: 'season-b1', title: 'Saison B1', slug: 'saison-b1', troupeId: 'troupe-b' },
  ],
}

describe('filter-builders', () => {
  it('builds agenda hub dimensions with summaries', () => {
    const dimensions = buildAgendaHubDimensions(filters, 'troupe-a', 'season-a1')
    expect(dimensions).toHaveLength(2)
    expect(dimensions[0]?.summary).toBe('Troupe A')
    expect(dimensions[1]?.summary).toBe('Saison A1')
  })

  it('resolveAgendaPanelSeason drops season from another troupe', () => {
    expect(resolveAgendaPanelSeason(filters, 'troupe-b', 'season-a1')).toBeNull()
    expect(resolveAgendaPanelSeason(filters, 'troupe-b', 'season-b1')).toBe('season-b1')
    expect(resolveAgendaPanelSeason(filters, 'troupe-b', null)).toBeNull()
  })

  it('builds agenda chips for active troupe and season', () => {
    const chips = buildAgendaFilterChips(filters, 'troupe-a', 'season-a1')
    expect(chips).toHaveLength(2)
    expect(chips[0]?.label).toBe('Troupe A')
    expect(chips[1]?.label).toBe('Saison A1')
  })

  it('aggregateSelectionLabel formats multi-select chips', () => {
    const options = [
      { id: 'p1', label: 'Alice' },
      { id: 'p2', label: 'Bob' },
    ]
    expect(aggregateSelectionLabel([], options, 'membres')).toBeNull()
    expect(aggregateSelectionLabel(['p1'], options, 'membres')).toBe('Alice')
    expect(aggregateSelectionLabel(['p1', 'p2'], options, 'membres')).toBe('Alice, Bob')
    expect(aggregateSelectionLabel(['p1', 'p2', 'p3'], options, 'membres')).toBe('3 membres')
  })

  it('participantHubSummary defaults to tous les participants', () => {
    expect(
      participantHubSummary([], [
        { id: null, label: 'Tous' },
        { id: 'p1', label: 'Alice' },
      ]),
    ).toBe('Tous les participants')
  })

  it('builds season chips including category aggregate', () => {
    const chips = buildSeasonFilterChips({
      participantOptions: [{ id: null, label: 'Tous' }, { id: 'p1', label: 'Alice' }],
      selectedParticipantIds: ['p1'],
      eventOptions: [{ id: 'e1', title: 'Gala' }],
      selectedEventIds: ['e1'],
      statsCategoryFilter: { kind: 'selected', slugs: ['principal', 'deplacements'] },
      categoryLabels: { deplacements: 'Déplacements' },
    })
    expect(chips.map((c) => c.label)).toEqual(['Alice', 'Gala', '2 catégories'])
  })

  it('resolveApiParticipantId returns single id only', () => {
    expect(resolveApiParticipantId([])).toBeNull()
    expect(resolveApiParticipantId(['p1'])).toBe('p1')
    expect(resolveApiParticipantId(['p1', 'p2'])).toBeNull()
  })

  it('buildSeasonHubDimensions includes spectacle when eventOptions empty', () => {
    const dimensions = buildSeasonHubDimensions({
      view: 'agenda',
      participantOptions: [{ id: null, label: 'Tous' }],
      selectedParticipantIds: [],
      eventOptions: [],
      selectedEventIds: [],
      statsCategoryFilter: { kind: 'all' },
      categoryLabels: {},
      categoryGlossarySlugs: [],
    })
    expect(dimensions.map((d) => d.key)).toContain('spectacle')
  })

  it('filterEventPickerVisibleOptions suit la matrice V1 GridBoard', () => {
    const now = new Date('2024-06-15T12:00:00.000Z')
    const options: EventPickerOption[] = [
      { id: '1', title: 'Futur', startsAt: '2024-06-20', archived: false, past: false },
      { id: '2', title: 'Passé', startsAt: '2024-06-10', archived: false, past: true },
      { id: '3', title: 'Inactif futur', startsAt: '2024-06-20', archived: true, past: false },
      { id: '4', title: 'Inactif passé', startsAt: '2024-06-10', archived: true, past: true },
    ]
    expect(filterEventPickerVisibleOptions(options, false, false, now).map((o) => o.id)).toEqual([
      '1',
    ])
    expect(filterEventPickerVisibleOptions(options, true, false, now).map((o) => o.id)).toEqual([
      '2',
      '4',
    ])
    expect(filterEventPickerVisibleOptions(options, false, true, now).map((o) => o.id)).toEqual([
      '3',
      '4',
    ])
    expect(filterEventPickerVisibleOptions(options, true, true, now).map((o) => o.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
    ])
  })
})
