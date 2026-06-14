#!/usr/bin/env node
/**
 * Patches line 2 of apps/web/public/version.txt according to HATCAST_VERSION_CHANNEL.
 * Used at Docker/CI build time so deployed artifacts reflect the target environment
 * without amending the git commit (OPS-5 prod tag constraint).
 *
 * Channels: production | staging | development | local
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VERSION_TXT = join(__dirname, '..', 'public', 'version.txt')

const CHANNEL = process.env.HATCAST_VERSION_CHANNEL?.trim()
if (!CHANNEL) {
  console.error('HATCAST_VERSION_CHANNEL est requis (production|staging|development|local).')
  process.exit(1)
}

const BUILD_LINES = {
  production: (date) => `Production build - ${date}`,
  staging: (date) => `Staging RC build - ${date}`,
  development: (date) => `Development build - ${date}`,
  local: (date) => `Local build - ${date}`,
}

const buildLineFor = BUILD_LINES[CHANNEL]
if (!buildLineFor) {
  console.error(`Canal version.txt inconnu : ${CHANNEL}`)
  process.exit(1)
}

let text
try {
  text = readFileSync(VERSION_TXT, 'utf8')
} catch {
  console.error(`Impossible de lire ${VERSION_TXT}`)
  process.exit(1)
}

const lines = text.split(/\r?\n/)
if (!lines[0]?.trim()) {
  console.error('version.txt : ligne 1 (semver) manquante.')
  process.exit(1)
}

const existingDate = (() => {
  const match = /^[^:]+:\s*-\s*(.+)$/.exec(lines[1]?.trim() ?? '')
  if (match?.[1]) {
    return match[1]
  }
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
})()

lines[1] = buildLineFor(existingDate)
writeFileSync(VERSION_TXT, `${lines.join('\n').replace(/\n?$/, '')}\n`, 'utf8')
console.log(`version.txt ligne 2 → ${lines[1]}`)
