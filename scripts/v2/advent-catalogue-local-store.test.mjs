import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createLocalPortraitStore} from './advent-catalogue-local-store.mjs';
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
const other=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNg+M/wHwAEAQH/cetH5QAAAABJRU5ErkJggg==','base64');
test('private immutable creation, idempotent retry and divergent-object refusal',async()=>{
 const dir=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'avent-store-')));const store=createLocalPortraitStore(dir), portrait={ref:'fiction.png',bytes:image};
 try {
  assert.equal((await store.inspect([portrait]))[0].status,'addition');
  await store.stagePortraits([portrait],[{ref:'fiction.png',status:'addition'}]);
  assert.equal((await store.inspect([portrait]))[0].status,'unchanged');
  await store.stagePortraits([portrait],[{ref:'fiction.png',status:'unchanged'}]);
  assert.equal((await store.inspect([{...portrait,bytes:other}]))[0].status,'divergence');
  await assert.rejects(store.stagePortraits([{...portrait,bytes:other}],[{ref:'fiction.png',status:'addition'}]));
  assert.deepEqual(await fs.readFile(path.join(dir,'fiction.png')),image);
  assert.deepEqual(await fs.readdir(dir),['fiction.png']);
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});
test('rejects public directories and non-PNG files',async()=>{
 const dir=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'avent-store-')));const store=createLocalPortraitStore(dir);
 try {await assert.rejects(store.inspect([{ref:'x.png',bytes:Buffer.from('not an image')}]));await fs.chmod(dir,0o755);await assert.rejects(store.verify());}
 finally {await fs.rm(dir,{recursive:true,force:true});}
});
