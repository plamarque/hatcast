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
