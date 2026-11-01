#!/usr/bin/env node
// Read-only diagnostic. A local file is not proof of the canonical cloud generation.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { validateCatalogue } from './advent-catalogue-validation.mjs';
import { compareQuizzes } from './advent-catalogue-compare.mjs';
const require = createRequire(import.meta.url);

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== 'compare') throw Error();
  const days = (process.env.ADVENT_DAYS || '').split(',').map(s => /^([1-9]|1[0-9]|2[0-4])$/.test(s) ? Number(s) : NaN);
  const inputPath = process.env.ADVENT_CATALOGUE_FILE;
  const uri = new URL(process.env.ADVENT_DATABASE_URL || '');
  if (!inputPath || !['postgres:', 'postgresql:'].includes(uri.protocol) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(uri.hostname) || !uri.port ||
      !process.env.ADVENT_EXPECT_DATABASE || !process.env.ADVENT_EXPECT_ROLE) throw Error();
  const real = await fs.realpath(inputPath);
  const repo = await fs.realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'));
  if (real === repo || real.startsWith(repo + path.sep)) throw Error();
  const stat = await fs.lstat(inputPath), dir = await fs.stat(path.dirname(real));
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() || (stat.mode & 0o077) ||
      dir.uid !== process.getuid() || (dir.mode & 0o077) || stat.size > 2_000_000) throw Error();
  const selected = validateCatalogue(JSON.parse(await fs.readFile(real, 'utf8')), days);
  const { Client } = require('pg');
  const db = new Client({ connectionString: uri.toString(), connectionTimeoutMillis: 5000 });
  try {
    await db.connect();
    const identity = (await db.query('SELECT current_database() AS db, current_user AS role, inet_server_addr()::text AS address')).rows[0];
    if (identity.db !== process.env.ADVENT_EXPECT_DATABASE || identity.role !== process.env.ADVENT_EXPECT_ROLE ||
        !['127.0.0.1/32', '127.0.0.1', '::1/128', '::1'].includes(identity.address)) throw Error();
    await db.query('BEGIN READ ONLY');
    const result = await db.query('SELECT quiz_day, display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation FROM advent_quizzes WHERE quiz_day = ANY($1::int[])', [days]);
    await db.query('COMMIT');
    console.log('READ-ONLY diagnostic: local snapshot and portrait access are not verified; not an apply plan.');
    for (const item of compareQuizzes(selected, result.rows)) console.log(`Day ${item.day}: ${item.status}`);
  } finally { await db.end().catch(() => {}); }
}
main().catch(() => { console.error('Diagnostic refused or failed; verify private file, selection, connection and target identity. No mutation performed.'); process.exitCode = 1; });
