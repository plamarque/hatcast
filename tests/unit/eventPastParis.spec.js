/**
 * @see src/utils/eventPastParis.js — jour civil Europe/Paris
 */
import { describe, it, expect } from 'vitest'
import { isEventPastParis, endOfEventParisDay } from '../../src/utils/eventPastParis.js'

describe('isEventPastParis', () => {
  it('YYYY-MM-DD : visible toute la journée du 9 avril à Paris (midi)', () => {
    const now = new Date('2025-04-09T12:00:00+02:00')
    expect(isEventPastParis('2025-04-09', now)).toBe(false)
  })

  it('YYYY-MM-DD : passé après minuit le lendemain à Paris', () => {
    const now = new Date('2025-04-10T00:00:01+02:00')
    expect(isEventPastParis('2025-04-09', now)).toBe(true)
  })

  it('fin de journée Paris : encore non passé à 23:59:00 locale', () => {
    const now = new Date('2025-04-09T23:59:00+02:00')
    expect(isEventPastParis('2025-04-09', now)).toBe(false)
  })

  it('sans date : jamais considéré passé', () => {
    expect(isEventPastParis(null, new Date())).toBe(false)
    expect(isEventPastParis(undefined, new Date())).toBe(false)
  })
})

describe('endOfEventParisDay (DST)', () => {
  it('retourne une DateTime valide le jour du passage à l’heure d’été (UE)', () => {
    const end = endOfEventParisDay('2025-03-30')
    expect(end).not.toBeNull()
    expect(end.isValid).toBe(true)
    expect(end.zoneName).toBe('Europe/Paris')
  })
})
