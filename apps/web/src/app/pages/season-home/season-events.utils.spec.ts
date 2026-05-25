import { describe, expect, it } from 'vitest'

import {
  filterEventsByIds,
  formatEventDateParts,
  formatEventStartLong,
  groupEventsByMonth,
} from './season-events.utils'
import type { EventResponse } from '../../core/events/event-api.service'
import { emptyRoleSlots } from '../../core/events/event-types'

function ev(id: string, startsAt: string, title = 'T'): EventResponse {
  return {
    id,
    seasonId: 's1',
    title,
    description: null,
    location: null,
    startsAt,
    archived: false,
    templateType: 'custom',
    roleSlots: emptyRoleSlots(),
    createdAt: '',
    updatedAt: '',
  }
}

describe('formatEventStartLong', () => {
  it('formats a French long date/time in Europe/Paris', () => {
    const formatted = formatEventStartLong('2026-05-12T17:00:00.000Z')
    expect(formatted).toMatch(/mai/i)
    expect(formatted).toMatch(/\d{1,2}/)
    expect(formatted).toMatch(/\d{2}:\d{2}/)
  })
})

describe('formatEventDateParts', () => {
  it('returns French weekday and day number', () => {
    const parts = formatEventDateParts('2026-05-12T19:00:00.000Z')
    expect(parts.dayNumber).toBeGreaterThan(0)
    expect(parts.dayName.length).toBeGreaterThan(2)
  })

  it('uses Europe/Paris by default for events close to UTC midnight', () => {
    const parts = formatEventDateParts('2026-05-31T22:30:00.000Z')
    expect(parts.dayNumber).toBe(1)
  })
})

describe('groupEventsByMonth', () => {
  it('sorts ascending and groups by month', () => {
    const groups = groupEventsByMonth([
      ev('2', '2026-06-15T19:00:00.000Z'),
      ev('1', '2026-05-10T19:00:00.000Z'),
      ev('3', '2026-05-20T19:00:00.000Z'),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0].events.map((e) => e.id)).toEqual(['1', '3'])
    expect(groups[1].events.map((e) => e.id)).toEqual(['2'])
    expect(groups[0].events[0].dayNumber).toBeGreaterThan(0)
    expect(groups[0].events[0].dayName).toBeTruthy()
  })

  it('groups months in Europe/Paris rather than browser-local UTC', () => {
    const groups = groupEventsByMonth([
      ev('late', '2026-05-31T22:30:00.000Z'),
    ])

    expect(groups[0].monthKey).toBe('2026-06')
    expect(groups[0].monthLabel).toContain('juin')
  })

  it('returns empty array for no events', () => {
    expect(groupEventsByMonth([])).toEqual([])
  })
})

describe('filterEventsByIds', () => {
  const events = [ev('a', '2026-05-01T12:00:00.000Z'), ev('b', '2026-06-01T12:00:00.000Z')]

  it('returns all when filter is null or empty', () => {
    expect(filterEventsByIds(events, null)).toHaveLength(2)
    expect(filterEventsByIds(events, [])).toHaveLength(2)
  })

  it('filters by selected ids', () => {
    expect(filterEventsByIds(events, ['b']).map((e) => e.id)).toEqual(['b'])
  })
})
