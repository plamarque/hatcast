import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createLocalPortraitStore} from './advent-catalogue-local-store.mjs';
import {compareQuizzes} from './advent-catalogue-compare.mjs';
const fail=()=>{throw Error('Local synchronization refused')};
const digest=b=>createHash('sha256').update(b).digest('hex');
const encode=x=>x===null?'-':Buffer.from(String(x)).toString('base64');
const decode=x=>x==='-'?null:Buffer.from(x,'base64').toString();
const cols=['display_name','portrait_ref','statement_0','statement_1','statement_2','false_choice','explanation'];
function materialize(s) {
 if(!s||typeof s.generation!=='string'||!s.generation||!Array.isArray(s.rows)||!Array.isArray(s.portraits))fail();
 const mapped=new Map();const portraits=[];
 for(const p of s.portraits){if(!p.generation||!Buffer.isBuffer(p.bytes)||!p.bytes.length||mapped.has(p.ref))fail();const ref=`${digest(p.bytes)}.png`;mapped.set(p.ref,ref);if(!portraits.some(q=>q.ref===ref))portraits.push({ref,bytes:p.bytes});}
 const rows=s.rows.map(r=>{const ref=mapped.get(r.portrait_ref);if(!ref)fail();return {...r,portrait_ref:ref}});
 const fingerprint=digest(JSON.stringify({generation:s.generation,rows:s.rows,portraits:s.portraits.map(p=>({ref:p.ref,generation:p.generation,digest:digest(p.bytes)}))}));
 return {rows,portraits,fingerprint};
}
async function run(cmd,args,options={}) {const p=spawn(cmd,args,{...options,stdio:'ignore'});const [code]=await once(p,'exit');if(code!==0)fail();}
export async function openH2(database,jar) {
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'hatcast-h2-'));await fs.chmod(temp,0o700);
 const source=fileURLToPath(new URL('./AdventLocalH2.java',import.meta.url));
 try {
  await run('javac',['-d',temp,source]);
  const child=spawn('java',['-cp',`${temp}${path.delimiter}${jar}`,'AdventLocalH2',database],{stdio:['pipe','pipe','ignore']});
  const lines=createInterface({input:child.stdout,crlfDelay:Infinity})[Symbol.asyncIterator]();
  async function receive(){const r=await lines.next();if(r.done)fail();return r.value;}
  if(await receive()!=='READY')fail();
  return {query:async line=>{child.stdin.write(line+'\n');return receive();},close:async()=>{child.stdin.end();if(child.exitCode===null){child.kill();await once(child,'exit').catch(()=>{});}await fs.rm(temp,{recursive:true,force:true});}};
 } catch(e){await fs.rm(temp,{recursive:true,force:true});throw e;}
}
// `source` is the generation-verified GCS source. Exclusivity is cooperative:
// do not change the private local portrait directory until the session ends.
export async function applyLocal({source,days,database,portraitDir,jar,confirm,confirmReplacement,write}) {
 let db,hold;
 try {
  const store=createLocalPortraitStore(portraitDir);await store.verify();
  await source.verify();db=await openH2(database,jar);
  const snapshot=await source.snapshot(days),selected=materialize(snapshot),existing=[];
  for(const row of selected.rows){const reply=await db.query(`CHECK\t${row.quiz_day}`);if(reply==='ABSENT')continue;const p=reply.split('\t');if(p.length!==8||p[0]!=='ROW')fail();const target={quiz_day:row.quiz_day};cols.forEach((c,i)=>target[c]=decode(p[i+1]));target.false_choice=Number(target.false_choice);existing.push(target);}
  const statuses=compareQuizzes(selected.rows,existing),portraits=await store.inspect(selected.portraits);
  for(const item of statuses)write(`Jour ${item.day} : ${item.status}`);
  if(portraits.some(p=>p.status==='divergence')){write('Conflit : aucune modification.');return 'conflict';}
  const replacements=statuses.filter(s=>s.status==='divergence').map(s=>s.day).sort((a,b)=>a-b);
  if(replacements.length && (!confirmReplacement || await confirmReplacement(replacements)!==`REMPLACER ${replacements.join(',')}`)){write('Conflit : aucune modification.');return 'conflict';}
  if(await confirm()!=='APPLIQUER'){write('Application annulée.');return 'cancelled';}
  await source.verify(true);const refreshed=materialize(await source.snapshot(days));if(refreshed.fingerprint!==selected.fingerprint)fail();
  hold=await source.acquire(snapshot);await hold.verify();await store.stagePortraits(selected.portraits,portraits);
  const after=await store.inspect(selected.portraits);if(after.some(p=>p.status!=='unchanged'))fail();
  if(materialize(await source.snapshot(days)).fingerprint!==selected.fingerprint)fail();await hold.verify();
  for(let i=0;i<selected.rows.length;i++)if(statuses[i].status==='addition'){
    const row=selected.rows[i],reply=await db.query(['ADD',row.quiz_day,...cols.map(c=>encode(row[c]))].join('\t'));if(reply!=='OK')fail();
  }
  for(const day of replacements){const row=selected.rows.find(r=>r.quiz_day===day),old=existing.find(r=>r.quiz_day===day);if(!row||!old)fail();const reply=await db.query(['REPLACE',day,...cols.map(c=>encode(row[c])),...cols.map(c=>encode(old[c]))].join('\t'));if(reply!=='OK')fail();}
  if((await store.inspect(selected.portraits)).some(p=>p.status!=='unchanged'))fail();await hold.verify();
  if(await db.query('COMMIT')!=='COMMITTED')fail();write('Synchronisation locale terminée.');return 'applied';
 } catch {throw Error('Synchronisation locale refusée ou interrompue');}
 finally {let releaseFailed=false;if(hold)try{await hold.release();}catch{releaseFailed=true;}if(db)await db.close();if(releaseFailed)throw Error('Synchronisation locale interrompue ; vérifier la protection temporaire de source');}
}

// The H2 connection remains exclusively owned until commit or rollback.
export async function deleteLocalDays({days,database,jar,confirm,write}) {
 if (!Array.isArray(days) || !days.length || days.some(d=>!Number.isInteger(d)||d<1||d>24) || new Set(days).size!==days.length) fail();
 let db;
 try {
  db=await openH2(database,jar);
  const phrase=`SUPPRIMER local ${[...days].sort((a,b)=>a-b).join(',')}`;
  if(await confirm(phrase)!==phrase) return 'cancelled';
  if(await db.query(['DELETE',...days].join('\t'))!=='OK')fail();
  if(await db.query('COMMIT')!=='COMMITTED')fail();
  write('Suppression ciblée locale terminée ; source et portraits conservés.');
  return 'deleted';
 } catch {throw Error('Suppression locale refusée ou interrompue');}
 finally {if(db)await db.close();}
}

export async function applyLocalContent({source,days,operation,database,portraitDir,jar,confirm,write}) {
 if(!['character','quiz'].includes(operation))fail();
 let db,hold;
 try {
  const store=createLocalPortraitStore(portraitDir);await store.verify();await source.verify();db=await openH2(database,jar);
  let snap=await source.snapshot(days,operation);
  const reservations=new Map();
  for(const row of snap.rows){const reply=await db.query(`RESERVATION\t${row.quiz_day}`);if(reply!=='ABSENT'&&!reply.startsWith('ROW\t'))fail();reservations.set(row.quiz_day,reply);}
  let snapshotOperation=operation;
  if(operation==='quiz'&&[...reservations.values()].some(r=>r.startsWith('ROW\t-\t'))){const full=await source.snapshot(days,'character');if(full.generation!==snap.generation||JSON.stringify(full.rows)!==JSON.stringify(snap.rows))fail();snap=full;snapshotOperation='character';}
  const fingerprint=x=>digest(JSON.stringify({generation:x.generation,rows:x.rows,portraits:x.portraits.map(p=>({ref:p.ref,generation:p.generation,digest:digest(p.bytes)}))}));
  const before=fingerprint(snap);
  const selected=operation==='character'?materialize(snap).rows:snap.rows;
  const verifiedLegacy=new Set();
  for(const row of selected){
   const reply=reservations.get(row.quiz_day);
   if(reply!=='ABSENT'&&!reply.startsWith('ROW\t'))fail();
   if(operation==='quiz'&&reply==='ABSENT')fail();
   if(operation==='quiz'&&row.statement_0==null)fail();
   const previous=reply==='ABSENT'?null:reply.split('\t').slice(1).map(decode);
   if(previous && previous[0]!==null && previous[0]!==row.character_key)fail();
   if(previous && previous[0]===null){
    const original=snap.rows.find(item=>item.quiz_day===row.quiz_day);const image=snap.portraits.find(item=>item.ref===original.portrait_ref);
    if(!image||previous[1]!==row.display_name||!/^[-A-Za-z0-9_]+\.png$/.test(previous[2]||''))fail();
    const file=path.join(portraitDir,previous[2]);const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink()||digest(await fs.readFile(file))!==digest(image.bytes))fail();
    verifiedLegacy.add(row.quiz_day);
   }
   let status=previous?'divergence':'addition';
   if(operation==='character' && previous && previous[0]===row.character_key && previous[1]===row.display_name && previous[2]===row.portrait_ref)status='unchanged';
   if(operation==='quiz') {const quiz=await db.query(`CHECK\t${row.quiz_day}`);if(quiz==='ABSENT')status='addition';else {const parts=quiz.split('\t').slice(1).map(decode);status=[row.statement_0,row.statement_1,row.statement_2,String(row.false_choice),row.explanation].every((v,i)=>v===parts[i+2])?'unchanged':'divergence';}}
   write(`Jour ${row.quiz_day} : ${status}`);
  }
  const phrase=`APPLIQUER ${operation} ${[...days].sort((a,b)=>a-b).join(',')}`;
  if(await confirm(phrase)!==phrase)return 'cancelled';
  await source.verify(true);if(fingerprint(await source.snapshot(days,snapshotOperation))!==before)fail();
  hold=await source.acquire(snap);await hold.verify();
  if(operation==='character'){const items=materialize(snap).portraits;const states=await store.inspect(items);if(states.some(x=>x.status==='divergence'))fail();await store.stagePortraits(items,states);if((await store.inspect(items)).some(x=>x.status!=='unchanged'))fail();}
  if(fingerprint(await source.snapshot(days,snapshotOperation))!==before)fail();await hold.verify();
  for(const row of selected){const values=[row.character_key,row.display_name,row.portrait_ref,row.statement_0,row.statement_1,row.statement_2,row.false_choice,row.explanation];if(await db.query([operation.toUpperCase(),row.quiz_day,...values.map(encode),verifiedLegacy.has(row.quiz_day)?'VERIFIED':'-'].join('\t'))!=='OK')fail();}
  if(await db.query('COMMIT')!=='COMMITTED')fail();write('Synchronisation locale terminée.');return 'applied';
 } catch {throw Error('Synchronisation locale refusée ou interrompue');}
 finally {let failed=false;if(hold)try{await hold.release()}catch{failed=true}if(db)await db.close();if(failed)throw Error('Protection temporaire à vérifier');}
}
