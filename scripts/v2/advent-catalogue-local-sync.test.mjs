import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('./advent-catalogue-local-sync.mjs',import.meta.url));
test('local entry point refuses other targets and noninteractive access without credentials in output',()=>{
 for(const target of ['production','staging','unknown','local']) {
  const result=spawnSync(process.execPath,[script,target,'1'],{encoding:'utf8',env:{...process.env,ADVENT_OPERATOR_SERVICE_ACCOUNT:'PRIVATE-TOKEN'}});
  assert.equal(result.status,1);assert.doesNotMatch(result.stdout+result.stderr,/PRIVATE-TOKEN/);assert.match(result.stderr,/refusée ou interrompue/);
 }
});
