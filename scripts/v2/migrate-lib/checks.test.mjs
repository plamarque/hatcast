import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  assertEqual,
  assertMax,
  assertMin,
  assertParticipantsShape,
  summarizeImport,
} from './checks.mjs'

describe('migrate-lib checks', () => {
  it('assertEqual throws on mismatch', () => {
    assert.throws(() => assertEqual('events', 54, 55), /expected 55/)
  })

  it('assertMin respects tolerance', () => {
    assertMin('availability', 1225, 1226, 2)
    assert.throws(() => assertMin('availability', 1220, 1226, 2), /expected >=/)
  })

  it('assertMax rejects excess rejects', () => {
    assertMax('rejects', 0, 0)
    assert.throws(() => assertMax('rejects', 3, 2), /expected <=/)
  })

  it('assertParticipantsShape validates keys', () => {
    assertParticipantsShape([
      { seasonParticipantId: 'a', userId: 'b', normalizedEmail: 'c@example.com' },
    ])
    assert.throws(() => assertParticipantsShape([]), /non-empty/)
  })

  it('summarizeImport reads summary block', () => {
    const s = summarizeImport({ summary: { success: 31, skipped: 0, error: 0 } })
    assert.deepEqual(s, { success: 31, skipped: 0, error: 0 })
  })
})
