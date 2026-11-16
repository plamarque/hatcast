import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runCloudContent} from './advent-catalogue-cloud-content.mjs';
test('production comparison needs only read access before confirmation',async()=>{
 const calls=[],messages=[];let asked=false;
 const db={query:async sql=>{calls.push(sql);if(sql.includes('has_table_privilege'))throw Error('write privilege checked early');return {rows:[]}}};
 const source={verify:async()=>{},snapshot:async()=>({generation:'1',rows:[{quiz_day:1,character_key:'fiction',statement_0:'a',statement_1:'b',statement_2:'c',false_choice:0}],portraits:[]})};
 const store={verify:async()=>{}};
 await assert.rejects(runCloudContent({source,store,db,days:[1],operation:'character',environment:'production',write:s=>messages.push(s),ask:async()=>{asked=true;return 'REFUS'}}));
 assert.equal(asked,true);assert.match(messages.join(' '),/Jour 1 : addition/);assert.equal(calls.some(sql=>sql.includes('has_table_privilege')),false);
});

test('quiz plan describes ordered story operations before confirmation without content',async()=>{
 const messages=[], old={quiz_day:1,statement_0:'a',statement_1:'b',statement_2:'c',false_choice:0,explanation:null,story_0:'PRIVATE-OLD',story_1:'PRIVATE-OLD2',story_2:null};
 const row={...old,character_key:'fiction',story_0:null,story_1:'PRIVATE-NEW',story_2:'PRIVATE-ADDED'};
 const db={query:async sql=>({rows:sql.includes('advent_character_reservations')?[{quiz_day:1,character_key:'fiction'}]:[old]})};
 const source={verify:async()=>{},snapshot:async()=>({generation:'1',rows:[row],portraits:[]})};
 await assert.rejects(runCloudContent({source,store:{verify:async()=>{}},db,days:[1],operation:'quiz',environment:'development',write:s=>messages.push(s),ask:async()=>{
  assert.deepEqual(messages.slice(1),['Jour 1 : récit choix 1 : suppression','Jour 1 : récit choix 2 : modification','Jour 1 : récit choix 3 : ajout']);return 'REFUS';
 }}));
 assert.doesNotMatch(messages.join(' '),/PRIVATE/);
});


test('divergent quiz requires a separate day-specific replacement confirmation',async()=>{
 const old={quiz_day:1,statement_0:'old',statement_1:'b',statement_2:'c',false_choice:0,explanation:null,story_0:null,story_1:null,story_2:null};
 const row={...old,character_key:'fiction',statement_0:'new'};const prompts=[];
 const db={query:async sql=>({rows:sql.includes('advent_character_reservations')?[{quiz_day:1,character_key:'fiction'}]:[old]})};
 const source={verify:async()=>{},snapshot:async()=>({generation:'1',rows:[row],portraits:[]})};
 await assert.rejects(runCloudContent({source,store:{verify:async()=>{}},db,days:[1],operation:'quiz',environment:'development',write:()=>{},ask:async prompt=>{prompts.push(prompt);return 'APPLIQUER quiz 1'}}));
 assert.equal(prompts.length,1);assert.match(prompts[0],/REMPLACER 1/);
});

test('generic replacement refuses a non-development target before reading',async()=>{
 let touched=false;
 await assert.rejects(runCloudContent({source:{verify:async()=>{touched=true}},store:{},db:{},days:[17],operation:'replace-generic',environment:'staging',reviewPrivate:()=>{},ask:async()=>'',write:()=>{}}));
 assert.equal(touched,false);
});
test('generic replacement requires private quiz review and explicit attestation',async()=>{
 const reservation={quiz_day:17,character_key:null,display_name:'Lutin du 17 décembre',portrait_ref:null};
 const old={quiz_day:17,display_name:reservation.display_name,portrait_ref:null,statement_0:'PRIVATE',statement_1:'b',statement_2:'c',false_choice:0,explanation:null,story_0:null,story_1:null,story_2:null,content_revision:0};
 const row={quiz_day:17,character_key:'new',display_name:'New',portrait_ref:'new.png',statement_0:'a',statement_1:'b',statement_2:'c',false_choice:0};
 const output=[];let privateReview,queries=0;
 const db={query:async sql=>{queries++;return {rows:sql.includes('advent_character_reservations')?[reservation]:[old]}}};
 await assert.rejects(runCloudContent({source:{verify:async()=>{},snapshot:async()=>({rows:[row]})},store:{verify:async()=>{}},db,days:[17],operation:'replace-generic',environment:'development',reviewPrivate:value=>{privateReview=value},ask:async()=>'',write:value=>output.push(value)}));
 assert.equal(privateReview,old);assert.doesNotMatch(output.join(' '),/PRIVATE/);assert.equal(queries,2);
});

test('generic replacement validates and holds the portrait with the catalogue',async()=>{
 const day=17, name='Lutin du 17 décembre';
 const oldReservation={quiz_day:day,character_key:null,display_name:name,portrait_ref:null};
 const oldQuiz={quiz_day:day,display_name:name,portrait_ref:null,statement_0:'old',statement_1:'b',statement_2:'c',false_choice:0,explanation:null,story_0:null,story_1:null,story_2:null,content_revision:0};
 const row={quiz_day:day,character_key:'new',display_name:'New',portrait_ref:'new.png',statement_0:'a',statement_1:'b',statement_2:'c',false_choice:1,explanation:null,story_0:null,story_1:null,story_2:null};
 const snapshot={generation:'4',rows:[row],portraits:[{ref:'new.png',generation:'8',bytes:Buffer.from('image')}]};
 const operations=[];let held,committed=false,released=false;
 const source={verify:async()=>{},snapshot:async(_days,operation)=>{operations.push(operation);return snapshot},acquire:async value=>{held=value;return {verify:async()=>{},release:async()=>{released=true}}}};
 const db={query:async sql=>{
  if(committed && sql.startsWith('SELECT quiz_day,'))assert.equal(released,false);
  if(sql.includes('has_table_privilege'))return {rows:[{ok:true}]};
  if(sql.startsWith('SELECT quiz_day,character_key'))return {rows:[committed?{quiz_day:day,character_key:row.character_key,display_name:row.display_name,portrait_ref:row.portrait_ref}:oldReservation]};
  if(sql.startsWith('SELECT quiz_day,display_name'))return {rows:[committed?{...row,content_revision:1}:oldQuiz]};
  if(sql.startsWith('SELECT 1 FROM'))return {rows:[]};
  if(sql==='COMMIT')committed=true;
  return {rows:[],rowCount:1};
 }};
 await runCloudContent({source,store:{verify:async()=>{}},db,days:[day],operation:'replace-generic',environment:'development',reviewPrivate:()=>{},ask:async prompt=>prompt.includes('J AI VERIFIE')?'J AI VERIFIE LE QUIZ FICTIF 17':'APPLIQUER replace-generic 17',write:()=>{}});
 assert.deepEqual(operations,['character','character','character']);
 assert.equal(held,snapshot);assert.equal(held.portraits[0].generation,'8');assert.equal(released,true);
});
