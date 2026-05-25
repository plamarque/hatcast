import { describe, expect, it } from 'vitest'

import { isValidSlug, slugifyTitle, UUID_IN_PATH_REGEX } from './url-slug'

describe('url-slug', () => {
  it('slugifyTitle normalizes accents', () => {
    expect(slugifyTitle('Cabaret de rentrée')).toBe('cabaret-de-rentree')
  })

  it('isValidSlug accepts hyphenated lowercase ids', () => {
    expect(isValidSlug('match-futur')).toBe(true)
    expect(isValidSlug('Bad Slug')).toBe(false)
    expect(isValidSlug('c0000002-0000-4000-8000-000000000002')).toBe(false)
  })

  it('UUID_IN_PATH_REGEX matches standard uuids', () => {
    expect(UUID_IN_PATH_REGEX.test('c0000002-0000-4000-8000-000000000002')).toBe(true)
    expect(UUID_IN_PATH_REGEX.test('match-futur')).toBe(false)
  })
})
