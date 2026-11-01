import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

test('each deployment uses the shared bucket even with an obsolete preview setting',()=>{
 const workflow=readFileSync(new URL('../../.github/workflows/deploy-v2-cloud-run.yml',import.meta.url),'utf8');
 assert(!workflow.includes('vars.HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET'));
 const start=workflow.indexOf('          if [ "${TARGET_ENV}" = "development" ]; then');
 const end=workflow.indexOf('          append_env JAVA_TOOL_OPTIONS',start);
 assert(start>=0 && end>start);
 const block=workflow.slice(start,end);
 for(const environment of ['development','staging','production']) {
  const result=spawnSync('bash',['-c',`append_env() { printf '%s=%s\\n' "$1" "$2"; }\n${block}`],{encoding:'utf8',env:{...process.env,TARGET_ENV:environment,ADVENT_PRIVATE_PORTRAIT_BUCKET:'impro-selector-avent-preview-private'}});
  assert.equal(result.status,0,result.stderr);
  const entries=result.stdout.trim().split('\n');
  assert.equal(entries.filter(e=>e.startsWith('HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET=')).length, 0);
  assert(entries.includes('HATCAST_ADVENT_PORTRAIT_LAYOUT=portraits-default-v2'));
 }
});
