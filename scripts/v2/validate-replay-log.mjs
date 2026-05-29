#!/usr/bin/env node

/**
 * Validate replay-log.jsonl gate (ADR-0016 §Decision.6, MIG-5).
 * Usage: node scripts/v2/validate-replay-log.mjs [--path=export/malice/replay-log.jsonl] [--min=3]
 */

import { readFileSync, existsSync } from 'fs'

function parseArgs(argv = process.argv.slice(2)) {
  let path = 'export/malice/replay-log.jsonl'
  let min = 3
  for (const arg of argv) {
    if (arg.startsWith('--path=')) path = arg.slice(7)
    else if (arg.startsWith('--min=')) min = Number(arg.slice(6))
  }
  return { path, min }
}

function main() {
  const { path, min } = parseArgs()
  if (!existsSync(path)) {
    console.error(`❌ Replay log not found: ${path}`)
    console.error(`   Run migrate:v2:run with --record-cycle after successful smoke tests.`)
    process.exit(1)
  }
  const lines = readFileSync(path, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const entries = []
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line))
    } catch (err) {
      console.error(`❌ Invalid JSONL line: ${err.message}`)
      process.exit(1)
    }
  }
  const passed = entries.filter((e) => e.smoke === 'pass')
  console.log(`Replay log: ${path}`)
  console.log(`  Total cycles: ${entries.length}`)
  console.log(`  Passed smoke: ${passed.length}`)
  if (passed.length < min) {
    console.error(`❌ Gate not met: need >= ${min} cycles with smoke=pass (got ${passed.length})`)
    process.exit(1)
  }
  console.log(`✅ Gate OK (>= ${min} successful cycles)`)
}

main()
