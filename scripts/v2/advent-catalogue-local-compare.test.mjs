import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('./advent-catalogue-local-compare.mjs', import.meta.url));
test('refuses apply and remote targets without exposing credentials', () => {
  for (const [command, uri] of [['apply','postgres://user:secret@127.0.0.1:5432/db'], ['compare','postgres://user:secret@example.invalid:5432/db']]) {
    const result=spawnSync(process.execPath,[script,command],{encoding:'utf8',env:{...process.env,ADVENT_DATABASE_URL:uri, ADVENT_CATALOGUE_FILE:'/tmp/missing', ADVENT_DAYS:'1',ADVENT_EXPECT_DATABASE:'db',ADVENT_EXPECT_ROLE:'user'}});
    assert.equal(result.status,1); assert.doesNotMatch(result.stderr+result.stdout,/secret|example\.invalid/);
    assert.match(result.stderr,/No mutation performed/);
  }
});
