import { describe, expect, it } from 'vitest'

import { ROLE_KEYS } from '../../core/events/event-types'
import {
  getRoleLabel,
  ROLE_LABELS_BY_GENDER,
  ROLE_LABELS_PLURAL_BY_GENDER,
  ROLE_LABELS_SINGULAR,
  roleLabelSingular,
} from './event-roles'

describe('getRoleLabel', () => {
  for (const roleKey of ROLE_KEYS) {
    describe(roleKey, () => {
      for (const gender of ['male', 'female', 'non_specified'] as const) {
        it(`singular ${gender} matches normative table`, () => {
          expect(getRoleLabel(roleKey, gender, false)).toBe(
            ROLE_LABELS_BY_GENDER[gender][roleKey],
          )
        })

        it(`plural ${gender} matches normative table`, () => {
          expect(getRoleLabel(roleKey, gender, true)).toBe(
            ROLE_LABELS_PLURAL_BY_GENDER[gender][roleKey],
          )
        })
      }
    })
  }

  it('normalizes unknown gender to inclusive singular', () => {
    expect(getRoleLabel('player', null)).toBe('Comédien·ne')
    expect(getRoleLabel('player', 'invalid')).toBe('Comédien·ne')
    expect(getRoleLabel('player', 'non-specified')).toBe('Comédien·ne')
  })

  it('uses masculine player label for male', () => {
    expect(getRoleLabel('player', 'male')).toBe('Comédien')
    expect(getRoleLabel('player', 'male', true)).toBe('Comédiens')
  })

  it('uses feminine player label for female', () => {
    expect(getRoleLabel('player', 'female')).toBe('Comédienne')
    expect(getRoleLabel('player', 'female', true)).toBe('Comédiennes')
  })

  it('roleLabelSingular stays inclusive baseline', () => {
    expect(roleLabelSingular('player')).toBe(ROLE_LABELS_SINGULAR.player)
    expect(roleLabelSingular('assistant_referee')).toBe('Assistant.e')
  })
})
