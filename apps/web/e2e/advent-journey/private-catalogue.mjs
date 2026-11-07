// Read-only catalogue preparation. All files written below belong in a private temporary directory.
import fs from 'node:fs/promises'
import path from 'node:path'
import {createRequire} from 'node:module'
import {createGcsSource} from '../../../../scripts/v2/advent-catalogue-gcs-source.mjs'
import {validateCatalogue} from '../../../../scripts/v2/advent-catalogue-validation.mjs'
const require = createRequire(import.meta.url)
const fail = () => { throw new Error('Private catalogue preparation refused') }
const quote = value => value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`
async function main() {
  const root = process.env.ADVENT_JOURNEY_PRIVATE_DIR
  const principal = process.env.ADVENT_OPERATOR_PRINCIPAL
  if (!root || !path.isAbsolute(root) || !principal) fail()
  const st = await fs.lstat(root)
  if (!st.isDirectory() || st.isSymbolicLink() || st.uid !== process.getuid() || (st.mode & 0o077)!==0 || await fs.realpath(root)!==root) fail()
  const {GoogleAuth} = require('google-auth-library')
  const {Storage} = require('@google-cloud/storage')
  const auth = new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']})
  const storage = new Storage({authClient:auth})
  const source = createGcsSource({storage,auth,expectedPrincipal:principal})
  await source.verify()
  const file = storage.bucket('impro-selector-avent-content-private').file('catalogue/avent-2026.json')
  const [meta] = await file.getMetadata()
  if (!/^\d+$/.test(String(meta.generation)) || !/^\d+$/.test(String(meta.size)) || Number(meta.size)>2_000_000) fail()
  const [bytes] = await storage.bucket('impro-selector-avent-content-private').file('catalogue/avent-2026.json',{generation:String(meta.generation)}).download()
  if (bytes.length !== Number(meta.size)) fail()
  const catalogue = JSON.parse(bytes.toString('utf8'))
  const official = (catalogue.quizzes || []).filter(q => q.kind === 'contribution' && q.portrait?.type === 'bucket-object' && Array.isArray(q.statements) && q.statements.length === 3 && Number.isInteger(q.false_statement_index)).map(q=>q.day).sort((a,b)=>a-b)
  if (!official.length) fail()
  validateCatalogue(catalogue,official)
  // Verifies all selected portraits and rejects changes in the source generation.
  const snapshot = await source.snapshot(official)
  if (snapshot.generation !== String(meta.generation)) fail()
  const rows = snapshot.rows
  if (rows.some(r => r.false_choice == null || [r.statement_0,r.statement_1,r.statement_2].some(v => !v))) fail()
  const cols=['quiz_day','display_name','portrait_ref','statement_0','statement_1','statement_2','false_choice','explanation']
  const sql=rows.map(r=>`INSERT INTO advent_quizzes (${cols.join(',')}) VALUES (${cols.map(c=>quote(r[c])).join(',')});`)
  // This check fails the Flyway migration if the disposable H2 database does not contain exactly the selected days.
  sql.push('CREATE TABLE advent_journey_preflight (valid INTEGER NOT NULL CHECK (valid = 1));')
  sql.push(`INSERT INTO advent_journey_preflight SELECT CASE WHEN COUNT(*) = ${rows.length} AND SUM(CASE WHEN quiz_day IN (${official.join(',')}) THEN 1 ELSE 0 END) = ${rows.length} THEN 1 ELSE 0 END FROM advent_quizzes;`)
  const fixture=path.join(root,'fixtures'); await fs.mkdir(fixture,{mode:0o700})
  await fs.writeFile(path.join(fixture,'V999__advent_journey_private.sql'),sql.join('\n')+'\n',{mode:0o600,flag:'wx'})
  await fs.writeFile(path.join(root,'portrait-refs.txt'), rows.map(r=>r.portrait_ref).join('\n')+'\n', {mode:0o600,flag:'wx'})
  const expectations=Object.fromEntries(rows.map(r=>[r.quiz_day,{falseChoice:r.false_choice,statements:[r.statement_0,r.statement_1,r.statement_2],explanation:r.explanation}]))
  await fs.writeFile(path.join(root,'expectations.json'),JSON.stringify(expectations),{mode:0o600,flag:'wx'})
  const missing=Array.from({length:24},(_,i)=>i+1).filter(day=>!official.includes(day))
  console.log(`Official complete days: ${official.join(', ')}`)
  console.log(`Unavailable or non-official days: ${missing.join(', ') || 'none'}`)
  console.log('Private catalogue and portraits read successfully; API runtime portrait access is not yet verified.')
}
main().catch(()=>{console.error('Private catalogue preparation failed; no private content was logged.');process.exitCode=1})
