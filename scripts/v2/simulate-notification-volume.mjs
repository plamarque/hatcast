#!/usr/bin/env node

/**
 * Replay V1 season export → simulated V2 notification volume (push + email units).
 *
 * Input: export/malice/<ts>/raw.json from `npm run migrate:malice:extract`
 *
 * Usage:
 *   npm run simulate:notification-volume -- --raw=export/malice/<ts>/raw.json
 *   npm run simulate:notification-volume -- --raw=... --prefs=scripts/v2/notification-volume/default-preferences.json
 *   npm run simulate:notification-volume -- --raw=... --push-global=on --output=json > report.json
 *
 * Override preferences JSON to re-test model / default settings changes.
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { formatTextReport } from './notification-volume/stats.js'
import {
  loadPreferences,
  simulateNotificationVolume,
} from './notification-volume/simulator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const DEFAULT_PREFS = join(REPO_ROOT, 'v2', 'notification-volume', 'default-preferences.json')

function parseArgs(argv = process.argv.slice(2)) {
  /** @type {Record<string, string|boolean|null>} */
  const out = {
    raw: null,
    prefs: DEFAULT_PREFS,
    output: 'text',
    pushGlobal: null,
    includeScheduledJobs: true,
    writeDeliveries: null,
  }
  for (const arg of argv) {
    if (arg.startsWith('--raw=')) out.raw = arg.slice(6).trim()
    else if (arg.startsWith('--prefs=')) out.prefs = arg.slice(8).trim()
    else if (arg.startsWith('--output=')) out.output = arg.slice(9).trim()
    else if (arg.startsWith('--push-global=')) out.pushGlobal = arg.slice(14).trim()
    else if (arg === '--no-scheduled-jobs') out.includeScheduledJobs = false
    else if (arg.startsWith('--write-deliveries=')) out.writeDeliveries = arg.slice(19).trim()
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return out
}

function printHelp() {
  console.log(`Usage:
  npm run simulate:notification-volume -- --raw=export/malice/<ts>/raw.json [options]

Options:
  --raw=PATH                 raw.json from migrate:malice:extract (required)
  --prefs=PATH               notification preferences JSON (default: scripts/v2/notification-volume/default-preferences.json)
  --push-global=on|off       override pushGlobalEnabled in prefs file
  --output=text|json         stdout format (default: text)
  --no-scheduled-jobs        skip SLA / compo incomplète cron simulation
  --write-deliveries=PATH    optional JSONL audit of every simulated delivery unit
  -h, --help                 this message`)
}

function main() {
  const args = parseArgs()
  if (!args.raw) {
    printHelp()
    process.exit(1)
  }

  const preferences = loadPreferences(String(args.prefs))
  if (args.pushGlobal === 'on') preferences.pushGlobalEnabled = true
  if (args.pushGlobal === 'off') preferences.pushGlobalEnabled = false

  const rawJson = JSON.parse(readFileSync(String(args.raw), 'utf8'))
  const result = simulateNotificationVolume(rawJson, {
    preferences,
    includeScheduledJobs: args.includeScheduledJobs !== false,
  })

  if (args.writeDeliveries) {
    const lines = result.deliveries.map((d) => JSON.stringify(d)).join('\n')
    writeFileSync(String(args.writeDeliveries), `${lines}\n`, 'utf8')
  }

  if (args.output === 'json') {
    const { deliveries, ...rest } = result
    console.log(JSON.stringify(rest, null, 2))
    return
  }

  const text = formatTextReport(result.report, {
    seasonName: result.model.seasonName,
    v1SeasonId: result.model.v1SeasonId,
    source: args.raw,
    assumptions: result.assumptions,
  })
  console.log(text)
}

main()
