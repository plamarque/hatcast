import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {applyLocalBonus,openH2} from './advent-catalogue-local-apply.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
const jar=process.env.ADVENT_H2_JAR;
test('isolated H2 target preserves daily data and detects divergent bonus',async()=>{
 assert(jar,'ADVENT_H2_JAR is required for this integration test');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'hatcast-bonus-test-'));await fs.chmod(dir,0o700);
 const root=await fs.realpath(dir),database=path.join(root,'database'),portraits=path.join(root,'portraits'),sql=path.join(root,'setup.sql');await fs.mkdir(portraits,{mode:0o700});
 const row={quiz_day:1,character_key:'extra:fixture',display_name:'Fictif',portrait_ref:'fixture.png',statement_0:'A',statement_1:'B',statement_2:'C',false_choice:1,explanation:null,story_0:null,story_1:null,story_2:null};
 const snapshot={generation:'1',rows:[row],portraits:[{ref:'fixture.png',bytes:png,generation:'1'}]};
 try {
  await fs.writeFile(sql,`CREATE TABLE advent_member_lock (id INT PRIMARY KEY); INSERT INTO advent_member_lock VALUES (1); CREATE TABLE advent_character_reservations (quiz_day INT PRIMARY KEY,character_key VARCHAR(255)); CREATE TABLE advent_bonus_quizzes (quiz_day INT PRIMARY KEY,character_key VARCHAR(255) UNIQUE,display_name TEXT,portrait_ref TEXT,statement_0 TEXT,statement_1 TEXT,statement_2 TEXT,false_choice INT,explanation TEXT,story_0 TEXT,story_1 TEXT,story_2 TEXT); CREATE TABLE advent_quizzes (quiz_day INT PRIMARY KEY,display_name TEXT,portrait_ref TEXT,statement_0 TEXT,statement_1 TEXT,statement_2 TEXT,false_choice INT,explanation TEXT,story_0 TEXT,story_1 TEXT,story_2 TEXT); INSERT INTO advent_quizzes VALUES (1,'Daily',NULL,'D','E','F',0,NULL,NULL,NULL,NULL); CREATE TABLE advent_member_answers (marker VARCHAR(20)); INSERT INTO advent_member_answers VALUES ('preserved');`);
  execFileSync('java',['-cp',jar,'org.h2.tools.RunScript','-url',`jdbc:h2:file:${database};MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`,'-user','sa','-script',sql]);await fs.chmod(`${database}.mv.db`,0o600);
  const source={verify:async()=>{},snapshot:async()=>snapshot,acquire:async()=>({verify:async()=>{},release:async()=>{}})};
  const args={source,days:[1],database,portraitDir:portraits,jar,confirm:async()=> 'APPLIQUER bonus 1',write:()=>{}};
  assert.equal(await applyLocalBonus(args),'applied');
  const db=await openH2(database,jar);try{const daily=await db.query('CHECK\t1'),bonus=await db.query('BONUS_CHECK\t1');assert(daily.startsWith('ROW\tRGFpbHk='));assert(bonus.startsWith('ROW\tZXh0cmE6Zml4dHVyZQ=='));}finally{await db.close();}
  assert.equal(await applyLocalBonus(args),'applied');
  const ordinary=await openH2(database,jar);try {
   const encode=value=>value===null?'-':Buffer.from(String(value)).toString('base64');
   await assert.rejects(ordinary.query(['CHARACTER',2,...['extra:fixture','Daily','fixture.png','A','B','C',1,null,null,null,null].map(encode),'-'].join('\t')));
  } finally {await ordinary.close();}
  const changed={...row,character_key:'extra:other'};
  await assert.rejects(applyLocalBonus({...args,source:{...source,snapshot:async()=>({...snapshot,rows:[changed]})}}));
  let swapped=false;
  const changingSource={...source,verify:async forWrite=>{if(forWrite&&!swapped){swapped=true;await fs.rename(`${database}.mv.db`,`${database}.saved`);await fs.copyFile(`${database}.saved`,`${database}.mv.db`);await fs.chmod(`${database}.mv.db`,0o600);}}};
  await assert.rejects(applyLocalBonus({...args,source:changingSource}));assert(swapped);
  const output=execFileSync('java',['-cp',jar,'org.h2.tools.Shell','-url',`jdbc:h2:file:${database};MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`,'-user','sa','-sql','SELECT marker FROM advent_member_answers'],{encoding:'utf8'});assert.match(output,/preserved/);
 } finally {await fs.rm(root,{recursive:true,force:true});}
});
