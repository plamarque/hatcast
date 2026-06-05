import { describe, expect, it } from 'vitest'

import { drawSelectionStatusLabel, effectiveMemberGender } from './member-gender'

describe('effectiveMemberGender', () => {
  it('defaults absent or empty values to non_specified', () => {
    expect(effectiveMemberGender(undefined)).toBe('non_specified')
    expect(effectiveMemberGender(null)).toBe('non_specified')
    expect(effectiveMemberGender('')).toBe('non_specified')
    expect(effectiveMemberGender('   ')).toBe('non_specified')
  })

  it('accepts wire values and V1 hyphen form', () => {
    expect(effectiveMemberGender('male')).toBe('male')
    expect(effectiveMemberGender('female')).toBe('female')
    expect(effectiveMemberGender('non_specified')).toBe('non_specified')
    expect(effectiveMemberGender('non-specified')).toBe('non_specified')
  })

  it('falls back to non_specified for unknown values', () => {
    expect(effectiveMemberGender('unknown')).toBe('non_specified')
  })
})

describe('drawSelectionStatusLabel', () => {
  it('returns gendered prefixes for draw animation', () => {
    expect(drawSelectionStatusLabel('male')).toBe('Sélectionné')
    expect(drawSelectionStatusLabel('female')).toBe('Sélectionnée')
    expect(drawSelectionStatusLabel('non_specified')).toBe('Sélectionné·e')
    expect(drawSelectionStatusLabel(null)).toBe('Sélectionné·e')
  })
})
