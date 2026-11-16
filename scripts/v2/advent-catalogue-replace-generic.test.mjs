import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GAME_TABLES,isLegacyGeneric,replaceGeneric} from './advent-catalogue-replace-generic.mjs';
const row={quiz_day:17,character_key:'new',display_name:'New',portrait_ref:'new.png',statement_0:'a',statement_1:'b',statement_2:'c',false_choice:1,explanation:null};
const reviewed={reservations:[{quiz_day:17,character_key:null,display_name:'Lutin du 17 décembre',portrait_ref:null}],quizzes:[{quiz_day:17,display_name:'Lutin du 17 décembre',portrait_ref:null,statement_0:'old',statement_1:'b',statement_2:'c',false_choice:0,explanation:null,story_0:null,story_1:null,story_2:null}]};
function db({stale=false,activity=false,failUpdate=false}={}) {
 const calls=[];return {calls,query:async(sql)=>{calls.push(sql);
  if(sql.startsWith('SELECT quiz_day,character_key')) return {rows:stale?[]:reviewed.reservations};
  if(sql.startsWith('SELECT quiz_day,display_name')) return {rows:reviewed.quizzes};
  if(sql.startsWith('SELECT 1 FROM')) return {rows:activity?[{}]:[]};
  if(sql.startsWith('UPDATE advent_quizzes')&&failUpdate) throw Error('synthetic');
  return {rows:[],rowCount:1};
 }};
}
test('recognises only the exact unbound generic identity',()=>{
 assert.equal(isLegacyGeneric(reviewed,17),true);
 assert.equal(isLegacyGeneric({...reviewed,reservations:[{...reviewed.reservations[0],character_key:'real'}]},17),false);
 assert.equal(isLegacyGeneric({...reviewed,quizzes:[{...reviewed.quizzes[0],portrait_ref:'real.png'}]},17),false);
});
test('locks game state and atomically updates both rows',async()=>{
 const client=db();await replaceGeneric(client,'development',row,reviewed);
 assert.match(client.calls.find(x=>x.startsWith('LOCK TABLE')), /advent_member_answers/);
 assert.equal(client.calls.filter(x=>x.startsWith('SELECT 1 FROM')).length,GAME_TABLES.length);
 assert.equal(client.calls.at(-1),'COMMIT');
});
test('stale review, activity and failure roll back',async()=>{
 for(const options of [{stale:true},{activity:true},{failUpdate:true}]) {
  const client=db(options);await assert.rejects(replaceGeneric(client,'development',row,reviewed));
  assert.equal(client.calls.at(-1),'ROLLBACK');
 }
});
test('wrong targets refuse before beginning a transaction',async()=>{
 for(const env of ['production','staging','local']) {const client=db();await assert.rejects(replaceGeneric(client,env,row,reviewed));assert.deepEqual(client.calls,[]);}
});
