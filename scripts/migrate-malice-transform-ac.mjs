#!/usr/bin/env node

/**
 * MIG-3 transform — V1 availability + casts → load-ac.sql + rejects-ac.json.
 *
 * Consumes raw.json (with availability + casts from extract) and manifest.json
 * from MIG-2. Pure logic in scripts/v1/maliceAvailabilityCompositions.js.
 *
 * Usage:
 *   npm run migrate:malice:transform:ac -- \
 *     --raw=export/malice/<ts>/raw.json \
 *     --manifest=export/malice/<ts>/manifest.json
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { transformAvailabilityCompositions } from './v1/maliceAvailabilityCompositions.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseArgs() {
  const args = process.argv.slice(2)
  const result = { raw: null, manifest: null, outDir: null }
  for (const arg of args) {
    if (arg.startsWith('--raw=')) result.raw = arg.slice(6).trim()
    else if (arg.startsWith('--manifest=')) result.manifest = arg.slice(11).trim()
    else if (arg.startsWith('--out-dir=')) result.outDir = arg.slice(10).trim()
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return result
}

function printHelp() {
  console.log(`Usage:
  npm run migrate:malice:transform:ac -- --raw=PATH --manifest=PATH [options]

Options:
  --raw=PATH         raw.json from migrate:malice:extract (required)
  --manifest=PATH    manifest.json from migrate:malice:transform (required)
  --out-dir=PATH     output dir (default: dirname of --raw)

Outputs (in out-dir): load-ac.sql, rejects-ac.json`)
}

/** Read + parse a JSON file with an actionable error message. */
function readJson(label, path) {
  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch (err) {
    throw new Error(`Cannot read ${label} file "${path}": ${err.message}`)
  }
  try {
    return JSON.parse(text)
  } catch (err) {
    throw new Error(`Invalid JSON in ${label} file "${path}": ${err.message}`)
  }
}

function main() {
  const { raw, manifest, outDir } = parseArgs()
  if (!raw || !manifest) {
    printHelp()
    process.exit(1)
  }

  const dump = readJson('--raw', raw)
  const manifestDoc = readJson('--manifest', manifest)
  const targetDir = outDir || dirname(raw)

  const availabilityRecords = Array.isArray(dump.availability) ? dump.availability : []
  const casts =
    Array.isArray(dump.casts) || (dump.casts && typeof dump.casts === 'object') ? dump.casts : []
  const castsEmpty = Array.isArray(casts) ? casts.length === 0 : Object.keys(casts).length === 0
  if (availabilityRecords.length === 0 && castsEmpty) {
    console.error(
      '❌ raw.json has no availability or casts (or they are malformed). Re-run migrate:malice:extract with a current extract script.',
    )
    process.exit(1)
  }

  const result = transformAvailabilityCompositions({
    availabilityRecords,
    casts,
    manifest: manifestDoc,
  })

  mkdirSync(targetDir, { recursive: true })
  const sqlPath = join(targetDir, 'load-ac.sql')
  const rejectsPath = join(targetDir, 'rejects-ac.json')

  writeFileSync(sqlPath, result.sql, 'utf8')
  writeFileSync(
    rejectsPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: result.rejects.length,
        counts: result.counts,
        rejects: result.rejects,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  console.error(
    `Wrote:\n  ${sqlPath} (availability=${result.counts.availability}, compositions=${result.counts.compositions}, ` +
      `slots=${result.counts.slots}, declines=${result.counts.declines})\n  ${rejectsPath} (${result.rejects.length} reject(s))`,
  )
  console.error(
    `\nNext: npm run migrate:malice:load -- --sql=${join(targetDir, 'load.sql')} --sql=${sqlPath} (dry-run by default)`,
  )
}

try {
  main()
} catch (err) {
  console.error(err.message || err)
  process.exit(1)
}
