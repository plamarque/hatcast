import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('./advent-catalogue-sync.mjs',import.meta.url));
test('refuses production, staging, unknown targets and noninteractive runs without disclosing secrets',()=>{
 for(const target of ['production','staging','unknown','development']) {
  const run=spawnSync(process.execPath,[script,target,'1'],{encoding:'utf8',env:{...process.env,ADVENT_DATABASE_URL:'postgres://fiction:secret@x/db',NEON_API_KEY:'private-token'}});
  assert.equal(run.status,1);assert.doesNotMatch(run.stdout+run.stderr,/secret|private-token/);assert.match(run.stderr,/refusée ou interrompue/);
 }
});
