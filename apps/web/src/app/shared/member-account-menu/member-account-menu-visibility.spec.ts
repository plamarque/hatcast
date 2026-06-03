import { describe, expect, it } from 'vitest'

import {
  shouldShowAccountChrome,
  shouldShowAccountMenuLogout,
} from './member-account-menu-visibility'

describe('member-account-menu-visibility', () => {
  describe('shouldShowAccountChrome', () => {
    it('is true on agenda', () => {
      expect(shouldShowAccountChrome('/agenda')).toBe(true)
    })

    it('is false on compte and child tab routes', () => {
      expect(shouldShowAccountChrome('/compte')).toBe(false)
      expect(shouldShowAccountChrome('/compte/securite')).toBe(false)
      expect(shouldShowAccountChrome('/compte/notifications')).toBe(false)
    })

    it('is false on connexion', () => {
      expect(shouldShowAccountChrome('/connexion')).toBe(false)
    })
  })

  describe('shouldShowAccountMenuLogout', () => {
    it('is false on event detail', () => {
      expect(shouldShowAccountMenuLogout('/saison/ligue/event/ev-1')).toBe(false)
    })

    it('is false on season admin participants', () => {
      expect(shouldShowAccountMenuLogout('/saison/ligue/admin/participants')).toBe(false)
    })

    it('is true on agenda', () => {
      expect(shouldShowAccountMenuLogout('/agenda')).toBe(true)
    })
  })
})
