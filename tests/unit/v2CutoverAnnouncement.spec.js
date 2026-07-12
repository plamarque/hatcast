import { describe, it, expect } from 'vitest'
import {
  formatV2ProdUrlForDisplay,
  resolveCutoverAnnouncementEnabled,
  resolveV2ProdUrl,
} from '../../src/services/v2CutoverAnnouncement.js'

describe('v2CutoverAnnouncement', () => {
  describe('resolveCutoverAnnouncementEnabled', () => {
    it('enables cutover only for exact string true', () => {
      expect(resolveCutoverAnnouncementEnabled('true')).toBe(true)
    })

    it('disables cutover for false, absent, or other values', () => {
      expect(resolveCutoverAnnouncementEnabled('false')).toBe(false)
      expect(resolveCutoverAnnouncementEnabled(undefined)).toBe(false)
      expect(resolveCutoverAnnouncementEnabled('')).toBe(false)
      expect(resolveCutoverAnnouncementEnabled('TRUE')).toBe(false)
      expect(resolveCutoverAnnouncementEnabled('1')).toBe(false)
    })
  })

  describe('resolveV2ProdUrl', () => {
    it('uses default when env value is empty', () => {
      expect(resolveV2ProdUrl(undefined)).toBe('https://hatcast.app')
      expect(resolveV2ProdUrl('')).toBe('https://hatcast.app')
      expect(resolveV2ProdUrl('   ')).toBe('https://hatcast.app')
    })

    it('keeps explicit override', () => {
      expect(resolveV2ProdUrl('https://staging.example.test')).toBe('https://staging.example.test')
    })

    it('trims whitespace and adds https scheme when missing', () => {
      expect(resolveV2ProdUrl('  hatcast.app  ')).toBe('https://hatcast.app')
      expect(resolveV2ProdUrl('staging.example.test')).toBe('https://staging.example.test')
    })

    it('normalizes protocol-relative URLs', () => {
      expect(resolveV2ProdUrl('//hatcast.app')).toBe('https://hatcast.app')
    })
  })

  describe('formatV2ProdUrlForDisplay', () => {
    it('strips protocol and trailing slash', () => {
      expect(formatV2ProdUrlForDisplay('https://hatcast.app/')).toBe('hatcast.app')
      expect(formatV2ProdUrlForDisplay('http://hatcast.app')).toBe('hatcast.app')
      expect(formatV2ProdUrlForDisplay(undefined)).toBe('hatcast.app')
    })

    it('keeps custom host', () => {
      expect(formatV2ProdUrlForDisplay('https://staging.example.test/')).toBe('staging.example.test')
      expect(formatV2ProdUrlForDisplay('staging.example.test')).toBe('staging.example.test')
    })
  })
})
