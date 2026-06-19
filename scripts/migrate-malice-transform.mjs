#!/usr/bin/env node

/**
 * MIG-2 / MIG-4 transform — V1 raw dump → V2 load.sql + manifest.json + rejects.json.
 *
 * ADR-0016 §Decision.3/4: produce the authoritative V1→V2 mapping manifest that
 * MIG-3 consumes. MIG-4 adds `category=deplacements` for V1 `templateType=deplacement`
 * and idempotent `troupe_categories` glossaire in load.sql. Pure logic lives in
 * scripts/v1/maliceEventsManifest.js; this CLI only wires file I/O.
 * Nothing here writes to a database (see :load).
 *
 * Inputs:
 *   --raw=<path>            raw.json from migrate-malice-extract.mjs (required)
 *   --season-v2=<uuid>      target V2 season UUID (required)
 *   --participants=<path>   JSON array of V2 season_participants for that season:
 *                           [{ seasonParticipantId|id, userId|user_id, normalizedEmail|normalized_email }]
 *                           (export it from Neon — see docs runbook). Without it,
 *                           every player is reported as a reject (events still load).
 *   --default-time=HH:mm    local time for date-only V1 events (default 19:00)
 *   --out-dir=<path>        where to write outputs (default: dirname of --raw)
 *
 * Usage:
 *   npm run migrate:malice:transform -- --raw=export/malice/<ts>/raw.json \
 *     --season-v2=<UUID> --participants=export/malice/<ts>/participants.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import {
  buildEventsLoadSql,
  buildManifest,
  transformEvents,
} from './v1/maliceEventsManifest.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function parseArgs() {
  const args = process.argv.slice(2)
  const result = {
    raw: null,
    seasonV2: null,
    participants: null,
    defaultTime: undefined,
    outDir: null,
  }
  for (const arg of args) {
    if (arg.startsWith('--raw=')) result.raw = arg.slice(6).trim()
    else if (arg.startsWith('--season-v2=')) result.seasonV2 = arg.slice(12).trim()
    else if (arg.startsWith('--participants=')) result.participants = arg.slice(15).trim()
    else if (arg.startsWith('--default-time=')) result.defaultTime = arg.slice(15).trim()
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
  npm run migrate:malice:transform -- --raw=PATH --season-v2=UUID [options]

Options:
  --raw=PATH            raw.json from migrate:malice:extract (required)
  --season-v2=UUID      target V2 season UUID (required)
  --participants=PATH   JSON array of V2 season_participants for that season
  --default-time=HH:mm  local time for V1 date-only events (default 19:00)
  --out-dir=PATH        output dir (default: dirname of --raw)

Outputs (in out-dir): load.sql, manifest.json, rejects.json`)
}

/** Normalize a participants record from either camelCase or Neon snake_case. */
function normalizeParticipant(row) {
  return {
    seasonParticipantId: row.seasonParticipantId ?? row.id ?? null,
    userId: row.userId ?? row.user_id ?? null,
    normalizedEmail: row.normalizedEmail ?? row.normalized_email ?? row.email ?? '',
  }
}

function loadParticipants(path) {
  if (!path) return []
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed.participants) ? parsed.participants : []
  return rows.map(normalizeParticipant).filter((p) => p.seasonParticipantId)
}

function main() {
  const { raw, seasonV2, participants, defaultTime, outDir } = parseArgs()
  if (!raw || !seasonV2) {
    printHelp()
    process.exit(1)
  }

  const dump = JSON.parse(readFileSync(raw, 'utf8'))
  const targetDir = outDir || dirname(raw)
  const participantRows = loadParticipants(participants)

  const { events, rejects: eventRejects } = transformEvents(dump.events || [], {
    seasonV2Id: seasonV2,
    ...(defaultTime ? { defaultTime } : {}),
  })

  const sql = buildEventsLoadSql(events)
  const { manifest, rejects } = buildManifest({
    v1SeasonId: dump.v1SeasonId,
    seasonV2Id: seasonV2,
    v1Players: dump.players || [],
    participants: participantRows,
    v2Events: events,
    eventRejects,
  })

  const sqlPath = join(targetDir, 'load.sql')
  const manifestPath = join(targetDir, 'manifest.json')
  const rejectsPath = join(targetDir, 'rejects.json')

  writeFileSync(sqlPath, sql, 'utf8')
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  writeFileSync(
    rejectsPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), count: rejects.length, rejects }, null, 2)}\n`,
    'utf8',
  )

  console.error(
    `Wrote:\n  ${sqlPath} (${events.length} events, deplacements=${manifest.counts.deplacements}, active=${manifest.counts.deplacementsActive})\n  ${manifestPath} ` +
      `(players=${manifest.counts.players}, events=${manifest.counts.events}, deplacements=${manifest.counts.deplacements}, deplacementsActive=${manifest.counts.deplacementsActive})\n  ${rejectsPath} (${rejects.length} reject(s))`,
  )
  if (participantRows.length === 0) {
    console.error(
      '\n⚠️  No --participants provided: all players are rejects. Export season_participants from Neon first.',
    )
  }
  console.error(`\nNext: npm run migrate:malice:load -- --sql=${sqlPath} (dry-run by default)`)
}

main()
