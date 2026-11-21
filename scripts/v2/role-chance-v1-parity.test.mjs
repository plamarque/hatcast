import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { v1Chances } from './role-chance-chronological.mjs';

// Shared synthetic fixtures are also consumed by RoleChanceV1ParityTest in Kotlin.
// Run both tests when changing the replay or the production V1 calculation.
const cases = JSON.parse(fs.readFileSync(new URL('../../services/api/src/test/resources/draw/role-chance-v1-parity.json', import.meta.url)));
test('replay matches shared V1 fixtures across accented names and ties', () => {
  assert.ok(cases.length >= 200);
  for (const [index, fixture] of cases.entries()) {
    const input = fixture.candidates.map(c => ({ ...c, pastValidatedCount: c.pastSelectionCount }));
    const result = new Map(v1Chances(input, fixture.places).map(c => [c.participantId, c.estimatedPercent]));
    for (const c of fixture.candidates) assert.equal(result.get(c.participantId), c.expected, `case ${index}, ${c.name}`);
  }
});
