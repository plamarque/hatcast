import { describe, expect, it } from 'vitest'

import type { TroupeMemberAdmin } from '../../core/troupes/troupe-api.service'
import { filterTroupeMemberSuggestions } from './participant-member-suggestions'

const member = (
  id: string,
  displayName: string,
  userId: string,
  email: string | null = `${id}@example.com`,
): TroupeMemberAdmin => ({
  id,
  userId,
  userSlug: id,
  email,
  displayName,
  status: 'ACTIVE',
  baselineRole: 'MEMBER',
  createdAt: '',
  updatedAt: '',
})

describe('filterTroupeMemberSuggestions', () => {
  const members = [
    member('m-1', 'Alice', 'u-1'),
    member('m-2', 'Piotrix Bot', 'u-2', 'piotrix@example.com'),
    member('m-3', 'Carol', 'u-3', 'INACTIVE' as unknown as string),
  ]

  it('returns nothing until the user types a query', () => {
    expect(filterTroupeMemberSuggestions(members, '', new Set())).toEqual([])
  })

  it('filters by display name or email', () => {
    expect(
      filterTroupeMemberSuggestions(members, 'Pio', new Set()).map((m) => m.displayName),
    ).toEqual(['Piotrix Bot'])
  })

  it('excludes active roster user ids', () => {
    expect(
      filterTroupeMemberSuggestions(members, 'Pio', new Set(['u-2'])).map((m) => m.displayName),
    ).toEqual([])
  })

  it('excludes normalized display names', () => {
    expect(
      filterTroupeMemberSuggestions(members, 'Ali', new Set(), new Set(['alice'])).map(
        (m) => m.displayName,
      ),
    ).toEqual([])
  })

  it('ignores inactive memberships', () => {
    const inactive = member('m-3', 'Carol', 'u-3')
    inactive.status = 'INACTIVE'
    expect(
      filterTroupeMemberSuggestions([inactive], 'Car', new Set()).map((m) => m.displayName),
    ).toEqual([])
  })

  it('caps suggestions at eight members', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      member(`m-${i}`, `Member ${i}`, `u-${i}`, `member${i}@example.com`),
    )
    expect(
      filterTroupeMemberSuggestions(many, 'member', new Set()).map((m) => m.displayName),
    ).toHaveLength(8)
  })
})
