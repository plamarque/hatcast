import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import { deriveExpectedCounts } from './expected-counts.mjs'

describe('deriveExpectedCounts', () => {
  it('reads events from manifest and AC counts from rejects-ac.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hatcast-mig-'))
    writeFileSync(
      join(dir, 'manifest.json'),
      JSON.stringify({ counts: { events: 55, deplacements: 7, players: 12 }, events: [] }),
    )
    writeFileSync(join(dir, 'rejects.json'), JSON.stringify({ count: 0, rejects: [] }))
    writeFileSync(
      join(dir, 'rejects-ac.json'),
      JSON.stringify({
        count: 1,
        counts: { availability: 1230, compositions: 33, slots: 300, declines: 40 },
        rejects: [{}],
      }),
    )

    const expected = deriveExpectedCounts(dir)
    assert.equal(expected.events, 55)
    assert.equal(expected.compositions, 33)
    assert.equal(expected.availability, 1230)
    assert.equal(expected.rejectsMig3, 1)
  })
})
