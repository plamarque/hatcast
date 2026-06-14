import { describe, expect, it, vi } from 'vitest'

import type { UserAgendaItem } from '../agenda/user-agenda-api.service'
import {
  ACTION_HORIZON_DAYS,
  addCalendarDaysToKey,
  calendarDateKeyInTimeZone,
  deriveAvailabilityActions,
  deriveSeasonGlanceQueryParams,
  deriveSeasonGlanceQueryParamsFromInbox,
  enrichAgendaCardFields,
  inboxActionUrgencyTier,
  isSoonAction,
  isWithinCalendarDaysFromNow,
  pickNextEvent,
  relativeDayLabel,
  resolveLastVisitedSeasonGlanceIds,
} from './member-home-todo.utils'

const TZ = 'Europe/Paris'

function item(
  id: string,
  startsAt: string,
  status: UserAgendaItem['myAvailabilityStatus'] = 'unknown',
  ids: { troupeId?: string; seasonId?: string } = {},
): UserAgendaItem {
  return {
    eventId: id,
    eventSlug: id,
    title: `Event ${id}`,
    startsAt,
    location: null,
    troupeId: ids.troupeId ?? 'troupe-1',
    troupeName: 'La BIM',
    troupeSlug: 'la-bim',
    seasonId: ids.seasonId ?? 'league-1',
    seasonSlug: 'ligue-2026',
    seasonTitle: 'Ligue 2026',
    myAvailabilityStatus: status,
  }
}

describe('member-home-todo.utils', () => {
  const now = new Date('2026-05-27T12:00:00+02:00')

  it('calendarDateKeyInTimeZone uses Paris wall date', () => {
    expect(calendarDateKeyInTimeZone(new Date('2026-05-26T23:30:00Z'), TZ)).toBe('2026-05-27')
  })

  it('addCalendarDaysToKey includes day 30 and excludes day 31', () => {
    const nowKey = calendarDateKeyInTimeZone(now, TZ)
    expect(addCalendarDaysToKey(nowKey, ACTION_HORIZON_DAYS)).toBe('2026-06-26')
    expect(addCalendarDaysToKey(nowKey, ACTION_HORIZON_DAYS + 1)).toBe('2026-06-27')
  })

  it('isWithinCalendarDaysFromNow includes horizon boundary', () => {
    expect(isWithinCalendarDaysFromNow('2026-06-26T08:00:00+02:00', now, 30, TZ)).toBe(true)
    expect(isWithinCalendarDaysFromNow('2026-06-27T08:00:00+02:00', now, 30, TZ)).toBe(false)
    expect(isWithinCalendarDaysFromNow('2026-05-25T10:00:00+02:00', now, 30, TZ)).toBe(false)
  })

  it('deriveAvailabilityActions keeps unknown within 30 days sorted by startsAt', () => {
    const items = [
      item('late', '2026-06-20T18:00:00+02:00'),
      item('early', '2026-05-28T18:00:00+02:00'),
      item('far', '2026-07-01T18:00:00+02:00'),
      item('known', '2026-06-01T18:00:00+02:00', 'available'),
    ]
    const actions = deriveAvailabilityActions(items, now, TZ)
    expect(actions.map((a) => a.eventId)).toEqual(['early', 'late'])
  })

  it('isSoonAction is true within 7 Paris calendar days', () => {
    expect(isSoonAction('2026-06-03T10:00:00+02:00', now, 7, TZ)).toBe(true)
    expect(isSoonAction('2026-06-04T10:00:00+02:00', now, 7, TZ)).toBe(false)
  })

  it('relativeDayLabel returns concrete day labels within the soon window', () => {
    expect(relativeDayLabel('2026-05-27T20:00:00+02:00', now, TZ)).toBe("Aujourd'hui")
    expect(relativeDayLabel('2026-05-28T20:00:00+02:00', now, TZ)).toBe('Demain')
    expect(relativeDayLabel('2026-05-30T20:00:00+02:00', now, TZ)).toBe('Dans 3 j')
    expect(relativeDayLabel('2026-06-03T20:00:00+02:00', now, TZ)).toBe('Dans 7 j')
    expect(relativeDayLabel('2026-06-04T20:00:00+02:00', now, TZ)).toBeNull()
    expect(relativeDayLabel('2026-05-25T20:00:00+02:00', now, TZ)).toBeNull()
  })

  it('inboxActionUrgencyTier maps calendar offset to urgent, soon, normal', () => {
    expect(inboxActionUrgencyTier('2026-05-27T20:00:00+02:00', now, TZ)).toBe('urgent')
    expect(inboxActionUrgencyTier('2026-05-28T20:00:00+02:00', now, TZ)).toBe('urgent')
    expect(inboxActionUrgencyTier('2026-05-30T20:00:00+02:00', now, TZ)).toBe('soon')
    expect(inboxActionUrgencyTier('2026-06-03T20:00:00+02:00', now, TZ)).toBe('soon')
    expect(inboxActionUrgencyTier('2026-06-04T20:00:00+02:00', now, TZ)).toBe('normal')
  })

  it('pickNextEvent returns earliest even when input is unsorted', () => {
    const items = [
      item('b', '2026-06-10T18:00:00+02:00'),
      item('a', '2026-06-01T18:00:00+02:00'),
    ]
    expect(pickNextEvent(items)?.eventId).toBe('a')
    expect(pickNextEvent([])).toBeNull()
  })

  it('enrichAgendaCardFields adds date parts', () => {
    const enriched = enrichAgendaCardFields(item('x', '2026-05-28T18:00:00+02:00'))
    expect(enriched.dayNumber).toBeGreaterThan(0)
    expect(enriched.dayName.length).toBeGreaterThan(0)
  })

  it('deriveSeasonGlanceQueryParams prefers lastVisitedSeason ids', () => {
    const items = [
      item('a', '2026-06-01T18:00:00+02:00', 'available', {
        troupeId: 'troupe-agenda',
        seasonId: 'league-agenda',
      }),
    ]
    expect(
      deriveSeasonGlanceQueryParams(items, {
        troupeId: 'troupe-stored',
        seasonId: 'league-stored',
      }),
    ).toEqual({ troupeId: 'troupe-stored', seasonId: 'league-stored' })
  })

  it('deriveSeasonGlanceQueryParams falls back to first agenda row, not earliest event', () => {
    const items = [
      item('later', '2026-06-10T18:00:00+02:00', 'available', {
        troupeId: 'troupe-first-row',
        seasonId: 'league-first-row',
      }),
      item('earlier', '2026-06-01T18:00:00+02:00', 'available', {
        troupeId: 'troupe-earliest',
        seasonId: 'league-earliest',
      }),
    ]
    expect(deriveSeasonGlanceQueryParams(items, null)).toEqual({
      troupeId: 'troupe-first-row',
      seasonId: 'league-first-row',
    })
  })

  it('deriveSeasonGlanceQueryParams returns empty when no ids available', () => {
    expect(deriveSeasonGlanceQueryParams([], null)).toEqual({})
  })

  it('deriveSeasonGlanceQueryParamsFromInbox uses inbox hints when lastVisited absent', () => {
    expect(
      deriveSeasonGlanceQueryParamsFromInbox(
        { lastSeasonSlug: 'ligue-x', seasonGlanceQuery: { troupeId: 't-inbox', seasonId: 'l-inbox' } },
        null,
      ),
    ).toEqual({ troupeId: 't-inbox', seasonId: 'l-inbox' })
  })

  it('resolveLastVisitedSeasonGlanceIds returns ids when season resolves', async () => {
    localStorage.setItem('lastVisitedSeason', 'festibask')
    const resolver = {
      resolveSeasonSlug: vi.fn().mockResolvedValue({
        kind: 'resolved',
        troupe: { id: 'troupe-x' },
        season: { id: 'league-y' },
      }),
    }

    await expect(resolveLastVisitedSeasonGlanceIds(resolver as never)).resolves.toEqual({
      troupeId: 'troupe-x',
      seasonId: 'league-y',
    })
  })
})
