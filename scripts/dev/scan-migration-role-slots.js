#!/usr/bin/env node
/**
 * Scan a malice load.sql for role_slots that exceed V2 limits.
 * Usage: node scripts/dev/scan-migration-role-slots.js [path/to/load.sql]
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const MAX = 100
const ROLE_KEYS = new Set([
  'player',
  'volunteer',
  'mc',
  'dj',
  'referee',
  'assistant_referee',
  'lighting',
  'coach',
  'stage_manager',
])

const sqlPath =
  process.argv[2] ||
  resolve(repoRoot, 'export/malice-runs/2026-05-29T10-46-23-517Z/artifacts/2026-05-29T10-46-34-212Z/load.sql')

let sql
try {
  sql = readFileSync(sqlPath, 'utf8')
} catch (e) {
  console.error(`Cannot read ${sqlPath}:`, e.message)
  process.exit(1)
}

const issues = []
const jsonRe = /'(\{[^']*\})',\s*'[a-z0-9-]+'/gi

for (const line of sql.split('\n')) {
  if (!line.includes('INSERT INTO events')) continue
  const slugMatch = line.match(/,\s*'([a-z0-9-]+)',\s*(TRUE|FALSE)/i)
  const titleMatch = line.match(/VALUES \([^,]+,[^,]+,\s*'((?:[^']|'')*)'/)
  const slug = slugMatch?.[1] ?? '?'
  const title = titleMatch?.[1]?.replace(/''/g, "'") ?? '?'

  if (line.includes(", '{}',") || line.includes(", '{}',")) {
    issues.push({ slug, title, issue: 'EMPTY_JSON {}' })
    continue
  }

  const jsonMatch = jsonRe.exec(line)
  jsonRe.lastIndex = 0
  if (!jsonMatch) continue

  let slots
  try {
    slots = JSON.parse(jsonMatch[1])
  } catch {
    issues.push({ slug, title, issue: 'INVALID_JSON' })
    continue
  }

  for (const [key, count] of Object.entries(slots)) {
    if (!ROLE_KEYS.has(key)) {
      issues.push({ slug, title, issue: `UNKNOWN_ROLE ${key}` })
    }
    if (typeof count !== 'number' || count < 0 || count > MAX) {
      issues.push({ slug, title, issue: `OUT_OF_RANGE ${key}=${count} (max ${MAX})` })
    }
  }
}

console.log(`Scan: ${sqlPath}`)
if (issues.length === 0) {
  console.log('OK — no role_slots issues found.')
} else {
  console.log(`Found ${issues.length} issue(s):`)
  for (const i of issues) {
    console.log(`- [${i.slug}] ${i.title}: ${i.issue}`)
  }
  process.exit(1)
}
