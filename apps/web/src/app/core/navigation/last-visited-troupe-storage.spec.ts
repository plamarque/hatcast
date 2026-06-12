import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  clearLastVisitedTroupeSlug,
  getLastVisitedTroupeSlug,
  rememberLastVisitedTroupeSlug,
} from './last-visited-troupe-storage'

describe('lastVisitedTroupeStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing stored', () => {
    expect(getLastVisitedTroupeSlug()).toBeNull()
  })

  it('stores and reads slug', () => {
    rememberLastVisitedTroupeSlug('malice')

    expect(getLastVisitedTroupeSlug()).toBe('malice')
    expect(localStorage.getItem('lastVisitedTroupeSlug')).toBe('malice')
  })

  it('clears slug', () => {
    rememberLastVisitedTroupeSlug('malice')
    clearLastVisitedTroupeSlug()

    expect(getLastVisitedTroupeSlug()).toBeNull()
    expect(localStorage.getItem('lastVisitedTroupeSlug')).toBeNull()
  })

  it('ignores blank slug', () => {
    rememberLastVisitedTroupeSlug('   ')
    expect(getLastVisitedTroupeSlug()).toBeNull()
  })
})
