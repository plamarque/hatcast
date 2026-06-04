/**
 * Derive smoke/load expectations from the current migration artifacts (live V1 export).
 * Avoids stale thresholds in migrate.config.json.
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/**
 * @param {string} artifactDir export/malice/<ts> or run artifacts folder
 * @param {{ requireAc?: boolean }} [options]
 */
export function deriveExpectedCounts(artifactDir, { requireAc = false } = {}) {
  if (!artifactDir || !existsSync(artifactDir)) {
    throw new Error(`artifactDir not found: ${artifactDir}`)
  }

  const manifestPath = join(artifactDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    throw new Error(`manifest.json missing under ${artifactDir}`)
  }
  const manifest = readJson(manifestPath)

  const events =
    manifest.counts?.events ??
    (Array.isArray(manifest.events) ? manifest.events.length : 0)

  const rejectsMig2Path = join(artifactDir, 'rejects.json')
  let rejectsMig2 = 0
  if (existsSync(rejectsMig2Path)) {
    const rej = readJson(rejectsMig2Path)
    rejectsMig2 = rej.count ?? rej.rejects?.length ?? 0
  }

  const rejectsAcPath = join(artifactDir, 'rejects-ac.json')
  let acCounts = { availability: 0, compositions: 0, slots: 0, declines: 0 }
  let rejectsMig3 = 0
  if (existsSync(rejectsAcPath)) {
    const ac = readJson(rejectsAcPath)
    acCounts = {
      availability: ac.counts?.availability ?? 0,
      compositions: ac.counts?.compositions ?? 0,
      slots: ac.counts?.slots ?? 0,
      declines: ac.counts?.declines ?? 0,
    }
    rejectsMig3 = ac.count ?? ac.rejects?.length ?? 0
  } else if (requireAc) {
    throw new Error(`rejects-ac.json missing under ${artifactDir} — run transform:ac (b5) first`)
  }

  return {
    events,
    availability: acCounts.availability,
    compositions: acCounts.compositions,
    slots: acCounts.slots,
    declines: acCounts.declines,
    rejectsMig2,
    rejectsMig3,
    deplacements: manifest.counts?.deplacements ?? 0,
    players: manifest.counts?.players ?? 0,
  }
}
