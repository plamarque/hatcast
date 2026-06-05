import { describe, expect, it } from 'vitest'

import { buildGoogleMapsSearchUrl, buildWazeUrl } from './event-maps'

describe('event-maps', () => {
  describe('buildGoogleMapsSearchUrl', () => {
    it('builds HTTPS search URL with encoded query', () => {
      const url = buildGoogleMapsSearchUrl('Théâtre ABC, Paris')
      expect(url).toBe(
        'https://www.google.com/maps/search/?api=1&query=Th%C3%A9%C3%A2tre%20ABC%2C%20Paris',
      )
      expect(url.startsWith('https://')).toBe(true)
    })
  })

  describe('buildWazeUrl', () => {
    it('builds HTTPS Waze URL with encoded query', () => {
      const url = buildWazeUrl('Gare du Nord')
      expect(url).toBe('https://waze.com/ul?q=Gare%20du%20Nord')
      expect(url.startsWith('https://')).toBe(true)
    })
  })
})
