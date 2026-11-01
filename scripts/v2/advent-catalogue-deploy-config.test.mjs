import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

test('each deployment uses the shared bucket even with an obsolete preview setting',()=>{
 const workflow=readFileSync(new URL('../../.github/workflows/deploy-v2-cloud-run.yml',import.meta.url),'utf8');
 assert(!workflow.includes('vars.HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET'));
 assert(!/append_env\s+["']?HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET\b/.test(workflow));
 const start=workflow.indexOf('          for key in ADVENT_TROUPE_ID ADVENT_EXCLUDED_USER_IDS; do');
 const end=workflow.indexOf('          append_env JAVA_TOOL_OPTIONS',start);
 assert(start>=0 && end>start);
 const block=workflow.slice(start,end);
 for(const environment of ['development','staging','production']) {
  const result=spawnSync('bash',['-c',`append_env() { printf '%s=%s\\n' "$1" "$2"; }\n${block}`],{encoding:'utf8',env:{...process.env,TARGET_ENV:environment,ADVENT_PRIVATE_PORTRAIT_BUCKET:'impro-selector-avent-preview-private',ADVENT_TROUPE_ID:'00000000-0000-0000-0000-000000000001',ADVENT_EXCLUDED_USER_IDS:'00000000-0000-0000-0000-000000000002,00000000-0000-0000-0000-000000000003',ADVENT_CLOCK_OFFSET_SECONDS:'3600'}});
  assert.equal(result.status,0,result.stderr);
  const entries=result.stdout.trim().split('\n');
  assert.equal(entries.filter(e=>e.startsWith('HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET=')).length, 0);
  assert(entries.includes('HATCAST_ADVENT_PORTRAIT_LAYOUT=portraits-default-v2'));
  assert(entries.includes('HATCAST_ADVENT_TROUPE_ID=00000000-0000-0000-0000-000000000001'));
  assert(entries.includes('HATCAST_ADVENT_EXCLUDED_USER_IDS=00000000-0000-0000-0000-000000000002,00000000-0000-0000-0000-000000000003'));
  const offsets=entries.filter(e=>e.startsWith('HATCAST_ADVENT_CLOCK_OFFSET_SECONDS='));
  assert.deepEqual(offsets,environment==='development'?['HATCAST_ADVENT_CLOCK_OFFSET_SECONDS=3600']:[]);
 }
});
