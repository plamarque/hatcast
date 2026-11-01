import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runOperator,compareProduction} from './advent-catalogue-operator.mjs';
const row={quiz_day:1,display_name:'PRIVATE-NAME',portrait_ref:'private.png',statement_0:'PRIVATE-A',statement_1:'PRIVATE-B',statement_2:'PRIVATE-C',false_choice:2,explanation:null};
function fixture() {
 const state={rows:[],portraits:[],writes:0,stage:0,output:[],questions:0};
 const source={verify:async()=>{},snapshot:async()=>({generation:'1',rows:[row],portraits:[{ref:row.portrait_ref,generation:'1',bytes:Buffer.from('private')}] }),acquire:async()=>({verify:async()=>{},release:async()=>{}})};
 const target={verify:async()=>{},inspect:async()=>({identity:'development',rows:state.rows,portraits:[{ref:row.portrait_ref,status:state.portraits.length?'unchanged':'addition'}]}),stagePortraits:async p=>{state.stage++;state.portraits=p},acquirePortraits:async()=>({verify:async()=>{},release:async()=>{}}),insert:async rows=>{state.writes++;state.rows=rows}};
 const options={write:line=>state.output.push(line),confirm:async()=>{state.questions++;return 'APPLIQUER'}};
 return {state,source,target,options};
}
test('operator compares, explicitly confirms, applies and retries idempotently without disclosing content',async()=>{
 const f=fixture();assert.equal(await runOperator(f.source,f.target,[1],f.options),'applied');
 assert.equal(f.state.writes,1);assert.equal(f.state.questions,1);
 assert.equal(await runOperator(f.source,f.target,[1],f.options),'applied');
 assert.doesNotMatch(f.state.output.join('\n'),/PRIVATE|private\.png/);
});
test('cancellation and divergence never stage or write',async()=>{
 for(const conflict of [false,true]){const f=fixture();if(conflict)f.state.rows=[{...row,false_choice:0}];else f.options.confirm=async()=>'';
 assert.equal(await runOperator(f.source,f.target,[1],f.options),'cancelled');
 assert.equal(f.state.stage,0);assert.equal(f.state.writes,0);if(conflict)assert.equal(f.state.questions,1);}
});
test('a change after review is refused before writing',async()=>{
 const f=fixture();f.options.confirm=async()=>{f.state.rows=[{...row,false_choice:0}];return 'APPLIQUER'};
 await assert.rejects(runOperator(f.source,f.target,[1],f.options));assert.equal(f.state.writes,0);assert.equal(f.state.stage,0);
});

test('replacement requires an exact day-specific confirmation and passes old content privately',async()=>{
 const f=fixture(),old={...row,false_choice:0};f.state.rows=[old];let previous;
 f.target.insert=async (rows,reviewed,expected)=>{previous=expected;f.state.writes++;f.state.rows=rows};
 f.options.confirm=async phrase=>{assert.equal(phrase,'REMPLACER 1');return phrase};
 assert.equal(await runOperator(f.source,f.target,[1],f.options),'applied');assert.deepEqual(previous,[old]);
 assert.doesNotMatch(f.state.output.join(' '),/PRIVATE|private\.png/);
});

test('production comparison remains read-only and prints no private content',async()=>{
 const f=fixture();f.target.stagePortraits=async()=>{throw Error('unexpected write')};f.target.insert=async()=>{throw Error('unexpected write')};
 assert.equal(await compareProduction(f.source,f.target,[1],line=>f.state.output.push(line)),'compared');
 assert.equal(f.state.writes,0);assert.equal(f.state.stage,0);assert.doesNotMatch(f.state.output.join(' '),/PRIVATE|private\.png/);
});
test('production write requires a separate plan-specific authorization after confirmation',async()=>{
 for(const permission of ['missing','denied','accepted']) {
  const f=fixture();f.options.environment='production';let authorized=false,before=false;
  if(permission!=='missing')f.options.authorizeProduction=async phrase=>{authorized=true;assert.match(phrase,/^AUTORISER PRODUCTION [a-f0-9]{24}$/);return permission==='accepted'?phrase:'no'};
  f.options.beforeApply=async()=>{before=true};
  if(permission==='missing')await assert.rejects(runOperator(f.source,f.target,[1],f.options));
  else assert.equal(await runOperator(f.source,f.target,[1],f.options),permission==='accepted'?'applied':'cancelled');
  assert.equal(f.state.writes,permission==='accepted'?1:0);assert.equal(before,permission==='accepted');assert.equal(authorized,permission!=='missing');
 }
});
