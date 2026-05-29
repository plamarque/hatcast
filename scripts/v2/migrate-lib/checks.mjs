/**
 * Assertions for migration pipeline steps.
 */

export function assertMin(name, actual, expected, tolerance = 0) {
  if (actual < expected - tolerance) {
    throw new Error(`${name}: expected >= ${expected - tolerance}, got ${actual}`)
  }
}

export function assertMax(name, actual, expected) {
  if (actual > expected) {
    throw new Error(`${name}: expected <= ${expected}, got ${actual}`)
  }
}

export function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`)
  }
}

export function assertParticipantsShape(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('participants.json must be a non-empty array')
  }
  const keys = Object.keys(rows[0])
  for (const k of ['seasonParticipantId', 'userId', 'normalizedEmail']) {
    if (!keys.includes(k)) {
      throw new Error(`participants row missing key ${k} (got ${keys.join(', ')})`)
    }
  }
}

export function summarizeImport(result) {
  const summary = result?.summary ?? result
  return {
    success: summary.success ?? 0,
    skipped: summary.skipped ?? 0,
    error: summary.error ?? 0,
  }
}
