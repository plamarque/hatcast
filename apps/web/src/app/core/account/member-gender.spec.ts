import { describe, expect, it } from 'vitest'

import {
  drawPickPastParticipleLabel,
  drawSelectionStatusLabel,
  effectiveMemberGender,
  multiPlaceChanceTooltipCopy,
} from './member-gender'

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

describe('multiPlaceChanceTooltipCopy', () => {
  it('agrees past participle with known gender', () => {
    expect(
      multiPlaceChanceTooltipCopy({ viewingSelf: false, gender: 'female', placesCount: 5 }),
    ).toBe('Ce % reflète sa chance d’être prise une fois parmi les 5 places')
    expect(
      multiPlaceChanceTooltipCopy({ viewingSelf: true, gender: 'male', placesCount: 5 }),
    ).toBe('Ce % reflète ta chance d’être pris une fois parmi les 5 places')
  })

  it('avoids inclusive dot when gender is unknown', () => {
    expect(
      multiPlaceChanceTooltipCopy({ viewingSelf: false, gender: 'non_specified', placesCount: 5 }),
    ).toBe('Ce % reflète sa chance d’obtenir une place au tirage parmi les 5 places')
    expect(drawPickPastParticipleLabel('non_specified')).toBeNull()
  })
})
