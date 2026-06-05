import { describe, expect, it } from 'vitest'

import type { CompositionSlot } from './composition-api.service'
import { computeCompositionPlayerGenderParity } from './composition-player-gender-parity'

function playerSlot(
  slotIndex: number,
  participantId: string | null,
  participantGender?: CompositionSlot['participantGender'],
): CompositionSlot {
  return {
    roleKey: 'player',
    slotIndex,
    participantId,
    participantGender,
    participationStatus: 'pending',
  }
}

describe('computeCompositionPlayerGenderParity', () => {
  it('returns acceptable for 2F3H with all known genders', () => {
    const result = computeCompositionPlayerGenderParity([
      playerSlot(0, 'p-1', 'female'),
      playerSlot(1, 'p-2', 'female'),
      playerSlot(2, 'p-3', 'male'),
      playerSlot(3, 'p-4', 'male'),
      playerSlot(4, 'p-5', 'male'),
    ])
    expect(result).toEqual({
      f: 2,
      m: 3,
      u: 0,
      ecart: 1,
      score: 'acceptable',
      label: 'Mixité acceptable',
      detailLabel: '2 F · 3 H',
    })
  })

  it('returns bon for 2F2H with all known genders', () => {
    const result = computeCompositionPlayerGenderParity([
      playerSlot(0, 'p-1', 'female'),
      playerSlot(1, 'p-2', 'female'),
      playerSlot(2, 'p-3', 'male'),
      playerSlot(3, 'p-4', 'male'),
    ])
    expect(result).toEqual({
      f: 2,
      m: 2,
      u: 0,
      ecart: 0,
      score: 'bon',
      label: 'Mixité équilibrée',
      detailLabel: '2 F · 2 H',
    })
  })

  it('returns faible for 1F4H with all known genders', () => {
    const result = computeCompositionPlayerGenderParity([
      playerSlot(0, 'p-1', 'female'),
      playerSlot(1, 'p-2', 'male'),
      playerSlot(2, 'p-3', 'male'),
      playerSlot(3, 'p-4', 'male'),
      playerSlot(4, 'p-5', 'male'),
    ])
    expect(result).toEqual({
      f: 1,
      m: 4,
      u: 0,
      ecart: 3,
      score: 'faible',
      label: 'Mixité faible',
      detailLabel: '1 F · 4 H',
    })
  })

  it('returns null when one filled player has unknown gender', () => {
    expect(
      computeCompositionPlayerGenderParity([
        playerSlot(0, 'p-1', 'female'),
        playerSlot(1, 'p-2', 'female'),
        playerSlot(2, 'p-3', 'non_specified'),
      ]),
    ).toBeNull()
  })

  it('returns null when all filled players have unknown gender', () => {
    expect(
      computeCompositionPlayerGenderParity([
        playerSlot(0, 'p-1', 'non_specified'),
        playerSlot(1, 'p-2', 'non_specified'),
      ]),
    ).toBeNull()
  })

  it('returns null when only one known-gender player is filled', () => {
    expect(computeCompositionPlayerGenderParity([playerSlot(0, 'p-1', 'female')])).toBeNull()
  })

  it('ignores empty player slots and non-player roles', () => {
    expect(
      computeCompositionPlayerGenderParity([
        playerSlot(0, 'p-1', 'female'),
        playerSlot(1, null),
        {
          roleKey: 'dj',
          slotIndex: 0,
          participantId: 'p-dj',
          participantGender: 'male',
          participationStatus: 'pending',
        },
      ]),
    ).toBeNull()
  })
})
