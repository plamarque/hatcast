#!/usr/bin/env node

/**
 * Script de replay des tirages - compare les algorithmes sur l'historique d'une saison
 *
 * Usage:
 *   node scripts/replay-season.js --season=SEASON_ID [--algorithm=default|bruno|bruno2|all] [--runs=50] [--output=./replay-output]
 */

import dotenv from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

import { loadSeasonData } from './replay/loadSeasonData.js'
import { runReplayForAlgorithm } from './replay/replayRunner.js'
import { computeAllMetrics } from './replay/metrics.js'

function parseArgs() {
  const args = process.argv.slice(2)
  const result = {
    season: null,
    algorithm: 'all',
    runs: 1,
    output: join(__dirname, 'replay', 'output')
  }

  for (const arg of args) {
    if (arg.startsWith('--season=')) {
      result.season = arg.slice(9)
    } else if (arg.startsWith('--algorithm=')) {
      result.algorithm = arg.slice(12)
    } else if (arg.startsWith('--runs=')) {
      result.runs = Math.max(1, parseInt(arg.slice(7), 10) || 1)
    } else if (arg.startsWith('--output=')) {
      result.output = arg.slice(9)
    }
  }

  return result
}

function aggregateMetrics(metricsList) {
  if (metricsList.length === 0) return null

  const keys = ['consecutivePlays', 'participationStdDev', 'uniquePairs']
  const aggregated = {}

  for (const key of keys) {
    const values = metricsList.map(m => m[key]).filter(v => typeof v === 'number')
    if (values.length === 0) {
      aggregated[key] = { avg: 0, min: 0, max: 0 }
    } else {
      const sum = values.reduce((a, b) => a + b, 0)
      aggregated[key] = {
        avg: Math.round(sum / values.length * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values)
      }
    }
  }

  return aggregated
}

async function main() {
  const { season, algorithm, runs, output } = parseArgs()

  if (!season) {
    console.error('Usage: node scripts/replay-season.js --season=SEASON_ID [--algorithm=default|bruno|bruno2|all] [--runs=50] [--output=./replay-output]')
    process.exit(1)
  }

  const algorithmsToRun = algorithm === 'all' ? ['default', 'bruno', 'bruno2'] : [algorithm]
  if (!['default', 'bruno', 'bruno2'].includes(algorithm) && algorithm !== 'all') {
    console.error('--algorithm must be default, bruno, bruno2, or all')
    process.exit(1)
  }

  console.log(`Loading season ${season}...`)
  const { events, players, availability, casts: realCasts } = await loadSeasonData(season)
  console.log(`Loaded: ${events.length} events, ${players.length} players`)

  const eventsOrdered = events

  const realMetrics = computeAllMetrics(realCasts, eventsOrdered, players)
  console.log('Real casts metrics:', realMetrics.consecutivePlays, 'consecutive,', realMetrics.uniquePairs, 'unique pairs')

  const results = {
    seasonId: season,
    timestamp: new Date().toISOString(),
    runs,
    algorithms: algorithmsToRun,
    real: {
      consecutivePlays: realMetrics.consecutivePlays,
      participationStdDev: realMetrics.participationStdDev,
      uniquePairs: realMetrics.uniquePairs,
      perPlayerParticipations: realMetrics.perPlayerParticipations
    },
    simulated: {}
  }

  for (const algo of algorithmsToRun) {
    console.log(`Running ${algo} x${runs}...`)
    const metricsList = []
    let sampleCasts = null

    for (let r = 0; r < runs; r++) {
      const simulatedCasts = runReplayForAlgorithm(events, players, availability, realCasts, algo)
      const m = computeAllMetrics(simulatedCasts, eventsOrdered, players)
      metricsList.push(m)
      if (r === 0) sampleCasts = simulatedCasts
    }

    const aggregated = aggregateMetrics(metricsList)
    results.simulated[algo] = {
      ...aggregated,
      sampleCasts
    }
    console.log(`  ${algo}: consecutive=${aggregated.consecutivePlays.avg}, pairs=${aggregated.uniquePairs.avg}`)
  }

  mkdirSync(output, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outPath = join(output, `replay-${season}-${timestamp}.json`)
  writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8')
  console.log(`Output written to ${outPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
