/**
 * Unit tests for selector display logic (ViewHeader multi-select).
 * Mirrors displayText and eventDisplayText computed from ViewHeader.vue.
 */
import { describe, it, expect } from 'vitest'

function getPlayerDisplayText(selectedPlayerIds, players, selectedPlayer) {
  const ids = selectedPlayerIds
  if (ids && ids.length > 1) {
    const names = ids
      .map(id => players?.find(p => p.id === id)?.name)
      .filter(Boolean)
    if (names.length > 0) {
      return names.length <= 2 ? names.join(', ') : `${names.length} participants`
    }
  }
  if (selectedPlayer) return selectedPlayer.name
  return 'Tous'
}

function getEventDisplayText(selectedEventIds, events, selectedEvent) {
  const ids = selectedEventIds
  if (ids && ids.length > 1) {
    const titles = ids
      .map(id => events?.find(e => e.id === id)?.title)
      .filter(Boolean)
    if (titles.length > 0) {
      return titles.length <= 2 ? titles.join(', ') : `${titles.length} événements`
    }
  }
  if (selectedEvent) return selectedEvent.title
  return 'Tous'
}

describe('Selector display text (multi-select)', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' }
  ]

  const events = [
    { id: 'e1', title: 'Spectacle A', date: '2025-03-01' },
    { id: 'e2', title: 'Spectacle B', date: '2025-03-15' },
    { id: 'e3', title: 'Spectacle C', date: '2025-04-01' }
  ]

  describe('getPlayerDisplayText', () => {
    it('returns "Tous" when no selection', () => {
      expect(getPlayerDisplayText(null, players, null)).toBe('Tous')
      expect(getPlayerDisplayText([], players, null)).toBe('Tous')
    })

    it('returns single player name when selectedPlayer given', () => {
      expect(getPlayerDisplayText(null, players, { id: 'p1', name: 'Alice' })).toBe('Alice')
    })

    it('returns "2 participants" when 2+ ids and more than 2 selected', () => {
      expect(getPlayerDisplayText(['p1', 'p2', 'p3'], players, null)).toBe('3 participants')
    })

    it('returns comma-separated names when 2 selected via ids', () => {
      expect(getPlayerDisplayText(['p1', 'p2'], players, null)).toBe('Alice, Bob')
    })

    it('returns single name via selectedPlayer when ids has 1 (parent passes selectedPlayer)', () => {
      expect(getPlayerDisplayText(['p1'], players, { id: 'p1', name: 'Alice' })).toBe('Alice')
    })
  })

  describe('getEventDisplayText', () => {
    it('returns "Tous" when no selection', () => {
      expect(getEventDisplayText(null, events, null)).toBe('Tous')
      expect(getEventDisplayText([], events, null)).toBe('Tous')
    })

    it('returns single event title when selectedEvent given', () => {
      expect(getEventDisplayText(null, events, { id: 'e1', title: 'Spectacle A' })).toBe('Spectacle A')
    })

    it('returns "N événements" when more than 2 selected', () => {
      expect(getEventDisplayText(['e1', 'e2', 'e3'], events, null)).toBe('3 événements')
    })

    it('returns comma-separated titles when 2 selected via ids', () => {
      expect(getEventDisplayText(['e1', 'e2'], events, null)).toBe('Spectacle A, Spectacle B')
    })

    it('returns single title via selectedEvent when ids has 1', () => {
      expect(getEventDisplayText(['e1'], events, { id: 'e1', title: 'Spectacle A' })).toBe('Spectacle A')
    })
  })
})
