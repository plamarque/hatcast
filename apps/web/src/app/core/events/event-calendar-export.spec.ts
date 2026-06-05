import { describe, expect, it } from 'vitest'

import {
  buildCalendarDescription,
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildIcsUid,
  buildOutlookCalendarUrl,
  computeCalendarEndInstant,
  escapeIcsText,
  foldIcsLine,
  formatIcsUtcInstant,
  isEventPastForCalendar,
  sanitizeIcsFilename,
} from './event-calendar-export'

const context = {
  origin: 'https://hatcast.app',
  troupeSlug: 'improbots',
  seasonSlug: '2025-2026',
}

const baseEvent = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  slug: 'spectacle-du-15',
  title: 'Cabaret du samedi',
  description: 'Une soirée impro',
  location: 'Théâtre ABC, Paris',
  startsAt: '2026-07-15T17:00:00.000Z',
  templateType: 'cabaret',
}

describe('event-calendar-export', () => {
  describe('escapeIcsText', () => {
    it('escapes RFC 5545 special characters', () => {
      expect(escapeIcsText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne')
    })
  })

  describe('foldIcsLine', () => {
    it('folds lines longer than 75 octets with CRLF + space', () => {
      const long = 'a'.repeat(80)
      const folded = foldIcsLine(long)
      expect(folded).toContain('\r\n ')
      const firstLine = folded.split('\r\n')[0]
      expect(new TextEncoder().encode(firstLine).length).toBeLessThanOrEqual(75)
    })

    it('does not split UTF-8 multibyte sequences', () => {
      const line = 'é'.repeat(40)
      const folded = foldIcsLine(line)
      expect(folded.replace(/\r\n /g, '')).toBe(line)
    })
  })

  describe('computeCalendarEndInstant (+4h DST)', () => {
    it('adds 4 hours during summer (DST Europe context — instant UTC)', () => {
      const end = computeCalendarEndInstant('2026-07-15T17:00:00.000Z')
      expect(end.toISOString()).toBe('2026-07-15T21:00:00.000Z')
    })

    it('adds 4 hours during winter', () => {
      const end = computeCalendarEndInstant('2026-01-15T18:00:00.000Z')
      expect(end.toISOString()).toBe('2026-01-15T22:00:00.000Z')
    })

    it('crosses midnight boundary', () => {
      const end = computeCalendarEndInstant('2026-03-01T22:30:00.000Z')
      expect(end.toISOString()).toBe('2026-03-02T02:30:00.000Z')
    })
  })

  describe('formatIcsUtcInstant', () => {
    it('formats UTC with Z suffix', () => {
      expect(formatIcsUtcInstant(new Date('2026-07-15T17:00:00.000Z'))).toBe(
        '20260715T170000Z',
      )
    })
  })

  describe('buildIcsUid / PRODID', () => {
    it('uses event UUID and origin hostname', () => {
      expect(buildIcsUid(baseEvent.id, context.origin)).toBe(
        `${baseEvent.id}@hatcast.app`,
      )
    })

    it('includes V2 PRODID and no X-ALT-DESC', () => {
      const ics = buildIcsContent(baseEvent, context)
      expect(ics).toContain('PRODID:-//HatCast//V2//FR')
      expect(ics).not.toContain('X-ALT-DESC')
      expect(ics).not.toContain('@impropick.com')
      expect(ics).toContain(`UID:${baseEvent.id}@hatcast.app`)
    })
  })

  describe('buildIcsContent', () => {
    it('includes DTSTART/DTEND in UTC with Z suffix', () => {
      const ics = buildIcsContent(baseEvent, context)
      expect(ics).toContain('DTSTART:20260715T170000Z')
      expect(ics).toContain('DTEND:20260715T210000Z')
    })

    it('omits confirmed team from description', () => {
      const ics = buildIcsContent(baseEvent, context)
      expect(ics).not.toMatch(/ÉQUIPE CONFIRMÉE/i)
      expect(ics).toContain('Type :')
      expect(ics).toContain('/saison/improbots/2025-2026/event/spectacle-du-15')
    })

    it('escapes location in ICS', () => {
      const ics = buildIcsContent(
        { ...baseEvent, location: 'Salle; A, B' },
        context,
      )
      expect(ics).toContain('LOCATION:Salle\\; A\\, B')
    })
  })

  describe('buildCalendarDescription', () => {
    it('builds canonical event URL via buildEventUrls', () => {
      const desc = buildCalendarDescription(baseEvent, context)
      expect(desc).toContain('https://hatcast.app/saison/improbots/2025-2026/event/spectacle-du-15')
      expect(desc).toContain('Type :')
    })
  })

  describe('buildGoogleCalendarUrl', () => {
    it('uses UTC instants in dates param', () => {
      const url = buildGoogleCalendarUrl(baseEvent, context)
      expect(url).toContain('calendar.google.com')
      expect(url).toContain('dates=20260715T170000Z%2F20260715T210000Z')
    })
  })

  describe('buildOutlookCalendarUrl', () => {
    it('uses ISO instants for startdt/enddt', () => {
      const url = buildOutlookCalendarUrl(baseEvent, context)
      expect(url).toContain('outlook.live.com')
      expect(url).toContain('startdt=2026-07-15T17%3A00%3A00.000Z')
      expect(url).toContain('enddt=2026-07-15T21%3A00%3A00.000Z')
    })
  })

  describe('sanitizeIcsFilename', () => {
    it('sanitizes title and uses date prefix from startsAt', () => {
      expect(sanitizeIcsFilename('Mon show !', '2026-07-15T17:00:00.000Z')).toBe(
        'Mon_show__2026-07-15.ics',
      )
    })
  })

  describe('isEventPastForCalendar', () => {
    it('returns true when startsAt is before now', () => {
      expect(
        isEventPastForCalendar('2020-01-01T12:00:00.000Z', new Date('2026-01-01T00:00:00.000Z')),
      ).toBe(true)
    })

    it('returns false for future events', () => {
      expect(
        isEventPastForCalendar('2030-01-01T12:00:00.000Z', new Date('2026-01-01T00:00:00.000Z')),
      ).toBe(false)
    })
  })
})
