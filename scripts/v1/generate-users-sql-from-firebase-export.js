/**
 * Reads a Firebase Auth export (firebase auth:export users.json --format=json)
 * and prints SQL INSERT statements for the V2 Postgres `users` table.
 *
 * Usage:
 *   node scripts/v1/generate-users-sql-from-firebase-export.js --input=users.json --output=users.sql
 */

import { randomUUID } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'

function parseArgs() {
  const args = process.argv.slice(2)
  let input = null
  let output = null
  for (const arg of args) {
    if (arg.startsWith('--input=')) input = arg.slice(8)
    else if (arg.startsWith('--output=')) output = arg.slice(9)
  }
  if (!input) {
    console.error(
      'Usage: node scripts/v1/generate-users-sql-from-firebase-export.js --input=users.json [--output=users.sql]',
    )
    process.exit(1)
  }
  return { input, output }
}

function sqlString(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

function googleSubFromProviders(user) {
  const providers = user.providerUserInfo || []
  const google = providers.find((p) => p.providerId === 'google.com')
  return google?.rawId || google?.federatedId || null
}

/**
 * @param {object} exportJson
 */
export function buildUsersSql(exportJson) {
  const users = exportJson.users || []
  const now = new Date().toISOString()
  const lines = [
    '-- Generated from Firebase Auth export for V2 users pre-fill',
    '-- Applies only when email is not already present (case-insensitive).',
    'BEGIN;',
  ]

  const seenEmails = new Set()
  let count = 0

  for (const user of users) {
    const email = normalizeEmail(user.email)
    if (!email || !email.includes('@')) continue
    if (seenEmails.has(email)) continue
    seenEmails.add(email)

    const id = randomUUID()
    const idpUid = user.localId || null
    const googleSub = googleSubFromProviders(user)
    const displayName = (user.displayName || '').trim() || null

    lines.push(
      `INSERT INTO users (id, google_sub, idp_uid, email, display_name, created_at, updated_at)` +
        ` SELECT ${sqlString(id)}, ${sqlString(googleSub)}, ${sqlString(idpUid)}, ${sqlString(email)}, ${sqlString(displayName)}, ${sqlString(now)}, ${sqlString(now)}` +
        ` WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = ${sqlString(email)});`,
    )
    count++
  }

  lines.push('COMMIT;', `-- ${count} user row(s) generated`)
  return `${lines.join('\n')}\n`
}

function main() {
  const { input, output } = parseArgs()
  const raw = readFileSync(input, 'utf8')
  const json = JSON.parse(raw)
  const sql = buildUsersSql(json)
  if (output) {
    writeFileSync(output, sql, 'utf8')
    console.error(`Wrote SQL to ${output}`)
  } else {
    process.stdout.write(sql)
  }
}

import { pathToFileURL } from 'url'
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
