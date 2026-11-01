import {test,after} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {spawn,spawnSync} from 'node:child_process';import {once} from 'node:events';import {createInterface} from 'node:readline';import {fileURLToPath} from 'node:url';
import {applyLocal,deleteLocalDays,applyLocalContent} from './advent-catalogue-local-apply.mjs';
const jar=process.env.ADVENT_H2_JAR;if(!jar)throw Error('ADVENT_H2_JAR required');
const temp=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'advent-h2-integration-')));await fs.chmod(temp,0o700);
const fixture=fileURLToPath(new URL('./AdventLocalH2Fixture.java',import.meta.url));
const compile=spawnSync('javac',['-d',temp,fixture]);if(compile.status!==0)throw Error('fixture compilation failed');
const cp=`${temp}${path.delimiter}${jar}`;const migrations=fileURLToPath(new URL('../../services/api/src/main/resources/db/migration',import.meta.url));let serial=0;
async function setup(){const dir=path.join(temp,`case${serial++}`);await fs.mkdir(dir,{mode:0o700});const db=path.join(dir,'db');const p=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',db,'init',migrations]);assert.equal(p.status,0);return {dir,db};}
function source(){let generation='1';const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');return {verify:async()=>{},snapshot:async()=>({generation,rows:[{quiz_day:1,display_name:'Fiction',portrait_ref:'fiction.png',statement_0:'one',statement_1:'two',statement_2:'three',false_choice:2,explanation:null}],portraits:[{ref:'fiction.png',generation,bytes:png}]}),acquire:async()=>({verify:async()=>{},release:async()=>{}}),change:()=>generation='2'}};
function opts(f){return {source:source(),days:[1],database:f.db,portraitDir:f.dir,jar,write:()=>{},confirm:async()=> 'APPLIQUER'};}
function count(db){const p=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',db,'count'],{encoding:'utf8'});assert.equal(p.status,0);return Number(p.stdout.trim());}
test('H2 insert and retry use a content-addressed private portrait',async()=>{const f=await setup(),o=opts(f);assert.equal(await applyLocal(o),'applied');assert.equal(count(f.db),1);assert.equal(await applyLocal(o),'applied');assert.equal(count(f.db),1);const files=await fs.readdir(f.dir);assert.equal(files.filter(x=>/^[a-f0-9]{64}\.png$/.test(x)).length,1)});
test('another JVM holding the database refuses the operator before confirmation',async()=>{const f=await setup(),p=spawn('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'hold'],{stdio:['pipe','pipe','ignore']});const lines=createInterface({input:p.stdout})[Symbol.asyncIterator]();assert.equal((await lines.next()).value,'READY');const o=opts(f);let asked=false;o.confirm=async()=>{asked=true;return 'APPLIQUER'};try{await assert.rejects(applyLocal(o));assert.equal(asked,false)}finally{p.stdin.end('x');await once(p,'exit')}assert.equal(count(f.db),0)});
test('changed source after review refuses before database writes',async()=>{const f=await setup(),o=opts(f);o.confirm=async()=>{o.source.change();return 'APPLIQUER'};await assert.rejects(applyLocal(o));assert.equal(count(f.db),0)});
after(async()=>{await fs.rm(temp,{recursive:true,force:true})});
test('a changed portrait before commit rolls back the whole H2 transaction',async()=>{
 const f=await setup(),o=opts(f);let checks=0;
 o.source.acquire=async()=>({verify:async()=>{if(++checks===2){const file=(await fs.readdir(f.dir)).find(x=>/^[a-f0-9]{64}\.png$/.test(x));assert.ok(file);await fs.writeFile(path.join(f.dir,file),Buffer.from('fictional-corruption'));}},release:async()=>{}});
 await assert.rejects(applyLocal(o));assert.equal(count(f.db),0);
});
test('the H2 lock stays held while the operator reviews',async()=>{
 const f=await setup(),o=opts(f);o.confirm=async()=>{const p=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'count'],{encoding:'utf8'});assert.notEqual(p.status,0);return 'APPLIQUER'};
 assert.equal(await applyLocal(o),'applied');assert.equal(count(f.db),1);
});
test('existing game activity and divergent quiz content refuse without changing the database',async()=>{
 for(const mode of ['activity','conflict']){const f=await setup(),p=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,mode]);assert.equal(p.status,0);const o=opts(f);
 if(mode==='activity')await assert.rejects(applyLocal(o));else assert.equal(await applyLocal(o),'conflict');
 assert.equal(count(f.db),mode==='conflict'?1:0);}
});
test('activity on a later day rolls back earlier staged quiz insertion',async()=>{
 const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'activity','2']).status,0);const o=opts(f),original=o.source.snapshot;o.days=[1,2];o.source.snapshot=async()=>{const s=await original();s.rows.push({...s.rows[0],quiz_day:2});return s};
 await assert.rejects(applyLocal(o));assert.equal(count(f.db),0);
});

test('explicit local replacement checks activity and preserves the old row on refusal',async()=>{
 for(const active of [false,true]){const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'conflict']).status,0);if(active)assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'activity']).status,0);const o=opts(f);o.confirmReplacement=async days=>`REMPLACER ${days.join(',')}`;if(active)await assert.rejects(applyLocal(o));else assert.equal(await applyLocal(o),'applied');const p=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'name'],{encoding:'utf8'});assert.equal(p.stdout.trim(),active?'other':'Fiction');}
});
test('local replacement requires the exact day-specific approval',async()=>{const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'conflict']).status,0);const o=opts(f);o.confirmReplacement=async()=> 'REMPLACER 2';assert.equal(await applyLocal(o),'conflict');const p=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'name'],{encoding:'utf8'});assert.equal(p.stdout.trim(),'other');});

test('explicit H2 deletion removes a divergent day and its activity while retaining portraits',async()=>{
 const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'conflict']).status,0);assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'activity']).status,0);
 const marker=path.join(f.dir,'fiction.png');await fs.writeFile(marker,'fiction');
 const options={days:[1],database:f.db,jar,write:()=>{},confirm:async()=> 'NO'};
 assert.equal(await deleteLocalDays(options),'cancelled');assert.equal(count(f.db),1);
 options.confirm=async phrase=>phrase;assert.equal(await deleteLocalDays(options),'deleted');assert.equal(count(f.db),0);assert.equal(await fs.readFile(marker,'utf8'),'fiction');
});

test('H2 reserves a character before its quiz and refuses a move',async()=>{
 const f=await setup(),s=source(),original=s.snapshot;
 s.snapshot=async (_days,operation)=>{const v=await original();v.rows[0].character_key='fiction-id';if(operation==='character'){v.rows[0].statement_0=null;v.rows[0].statement_1=null;v.rows[0].statement_2=null;v.rows[0].false_choice=null;}if(operation==='quiz')v.portraits=[];return v;};
 const o={source:s,days:[1],operation:'character',database:f.db,portraitDir:f.dir,jar,write:()=>{},confirm:async phrase=>phrase};
 assert.equal(await applyLocalContent(o),'applied');assert.equal(count(f.db),0);
 o.operation='quiz';assert.equal(await applyLocalContent(o),'applied');assert.equal(count(f.db),1);
 const before=s.snapshot;s.snapshot=async(...args)=>{const v=await before(...args);v.rows[0].quiz_day=2;return v};o.operation='character';o.days=[2];await assert.rejects(applyLocalContent(o));assert.equal(count(f.db),1);
});

test('H2 deletion recalculates streak and bonuses on retained days',async()=>{
 const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'score-seed']).status,0);
 await deleteLocalDays({days:[11],database:f.db,jar,write:()=>{},confirm:async p=>p});
 const result=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'score-check'],{encoding:'utf8'});assert.equal(result.status,0);assert.equal(result.stdout,'10:0,12:0,13:2,streak:3');
});

test('H2 replaces deleted test fixtures including linked identities',async()=>{
 const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'legacy-fixture']).status,0);
 const del={days:[1],database:f.db,jar,write:()=>{},confirm:async p=>p};await deleteLocalDays(del);
 let marker=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'deleted-count'],{encoding:'utf8'});assert.equal(marker.stdout.trim(),'1');
 const src=source(),snapshot=src.snapshot;src.snapshot=async (_days,operation)=>{const v=await snapshot();v.rows[0].character_key='fiction-validated-id';if(operation==='character'){v.rows[0].statement_0=null;v.rows[0].statement_1=null;v.rows[0].statement_2=null;v.rows[0].false_choice=null}if(operation==='quiz')v.portraits=[];return v};
 const options={source:src,days:[1],operation:'character',database:f.db,portraitDir:f.dir,jar,write:()=>{},confirm:async p=>p};
 assert.equal(await applyLocalContent(options),'applied');marker=spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'deleted-count'],{encoding:'utf8'});assert.equal(marker.stdout.trim(),'0');options.operation='quiz';assert.equal(await applyLocalContent(options),'applied');assert.equal(count(f.db),1);
 await deleteLocalDays(del);options.operation='character';const original=src.snapshot;src.snapshot=async(...a)=>{const v=await original(...a);v.rows[0].character_key='different-identity';return v};assert.equal(await applyLocalContent(options),'applied');options.operation='quiz';assert.equal(await applyLocalContent(options),'applied');assert.equal(count(f.db),1);
});

test('legacy local portrait bytes bind successfully for independent character and quiz operations',async()=>{
 for(const operation of ['character','quiz']){
  const f=await setup();assert.equal(spawnSync('java',['-cp',cp,'AdventLocalH2Fixture',f.db,'legacy-valid']).status,0);
  const src=source(),original=src.snapshot;src.snapshot=async(_days,op)=>{const v=await original();v.rows[0].character_key='fiction-id';if(op==='quiz')v.portraits=[];return v};
  const img=(await original()).portraits[0].bytes;await fs.writeFile(path.join(f.dir,'fiction.png'),img);
  assert.equal(await applyLocalContent({source:src,days:[1],operation,database:f.db,portraitDir:f.dir,jar,write:()=>{},confirm:async p=>p}),'applied');
 }
});
