import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareWorkflow,applyWorkflow,WorkflowRefused} from './advent-catalogue-workflow.mjs';
const row={quiz_day:1,display_name:'Synthetic',portrait_ref:'fiction.png',statement_0:'One',statement_1:'Two',statement_2:'Three',false_choice:2,explanation:null};
function fixtures() {
 const state={generation:'1',portraitGeneration:'1',bytes:Buffer.from('fictional'),rows:[],portraits:[],inserts:0,stages:0};
 const source={verify:async()=>{},acquire:async()=>({verify:async()=>{},release:async()=>{}}),snapshot:async()=>({generation:state.generation,rows:[{...row}],portraits:[{ref:'fiction.png',generation:state.portraitGeneration,bytes:state.bytes}]})};
 const target={verify:async()=>{},inspect:async()=>({identity:'isolated',rows:state.rows,portraits:[{ref:'fiction.png',status:state.portraits.length?'unchanged':'addition'}]}),
  acquirePortraits:async()=>({verify:async()=>{},release:async()=>{}}),stagePortraits:async portraits=>{state.stages++;state.portraits=portraits;},insert:async rows=>{state.inserts++;state.rows=rows;return [{day:1,status:'addition'}]}};
 return {state,source,target};
}
test('comparison and explicit apply stage portraits before insertion',async()=>{
 const {state,source,target}=fixtures();const plan=await compareWorkflow(source,target,[1]);assert.equal(state.stages,0);assert.equal(state.inserts,0);
 await applyWorkflow(source,target,plan);assert.equal(state.stages,1);assert.equal(state.inserts,1);
});
test('changed source, target identity, divergent quiz and unsafe portrait refuse before staging',async()=>{
 for(const mutate of [f=>f.state.generation='2',f=>f.state.portraitGeneration='2',f=>f.state.rows=[{...row,false_choice:1}],f=>f.target.verify=async()=>{throw Error('private')},f=>f.target.inspect=async()=>({identity:'other',rows:[],portraits:[{ref:'fiction.png',status:'addition'}]})]) {
  const f=fixtures(),plan=await compareWorkflow(f.source,f.target,[1]);mutate(f);await assert.rejects(applyWorkflow(f.source,f.target,plan),WorkflowRefused);assert.equal(f.state.stages,0);assert.equal(f.state.inserts,0);
 }
});
test('source change or storage failure after staging never commits; fresh comparison permits retry',async()=>{
 for(const failure of ['source','storage']) {
  const f=fixtures(),plan=await compareWorkflow(f.source,f.target,[1]);const stage=f.target.stagePortraits;
  f.target.stagePortraits=async (...args)=>{await stage(...args);if(failure==='source')f.state.generation='2';else throw Error('private')};
  await assert.rejects(applyWorkflow(f.source,f.target,plan),WorkflowRefused);assert.equal(f.state.inserts,0);assert.equal(f.state.portraits.length,1);
  f.target.stagePortraits=stage;const retry=await compareWorkflow(f.source,f.target,[1]);await applyWorkflow(f.source,f.target,retry);assert.equal(f.state.inserts,1);
 }
});
test('reports a divergence but never stages or inserts',async()=>{
 const f=fixtures();f.state.rows=[{...row,false_choice:1}];const plan=await compareWorkflow(f.source,f.target,[1]);assert.equal(plan.comparison.statuses[0].status,'divergence');
 await assert.rejects(applyWorkflow(f.source,f.target,plan),WorkflowRefused);assert.equal(f.state.stages,0);assert.equal(f.state.inserts,0);
});
test('failed portrait hold or database commit releases acquired protections and hides details',async()=>{
 for(const failAt of ['hold','insert']) {
  const f=fixtures();let releasedSource=0,releasedTarget=0;
  f.source.acquire=async()=>({verify:async()=>{},release:async()=>{releasedSource++}});
  f.target.acquirePortraits=async()=>{if(failAt==='hold')throw Error('sensitive value');return {verify:async()=>{},release:async()=>{releasedTarget++}}};
  f.target.insert=async()=>{throw Error('sensitive value')};
  const plan=await compareWorkflow(f.source,f.target,[1]);
  await assert.rejects(applyWorkflow(f.source,f.target,plan),error=>error instanceof WorkflowRefused&&!error.message.includes('sensitive value'));
  assert.equal(releasedSource,1);assert.equal(releasedTarget,failAt==='insert'?1:0);
 }
});
test('a target binding change during staging refuses the database write',async()=>{
 const f=fixtures();let identity='isolated';const original=f.target.inspect;
 f.target.inspect=async snapshot=>({...await original(snapshot),identity});
 const stage=f.target.stagePortraits;f.target.stagePortraits=async (...args)=>{await stage(...args);identity='different'};
 const plan=await compareWorkflow(f.source,f.target,[1]);
 await assert.rejects(applyWorkflow(f.source,f.target,plan),WorkflowRefused);assert.equal(f.state.inserts,0);
});

test('shared source portraits are protected once without copies or duplicate holds',async()=>{
 const f=fixtures();f.target.sharedPortraits=true;f.state.portraits=[{}];
 f.target.stagePortraits=async()=>{throw Error('unexpected copy')};
 f.target.acquirePortraits=async()=>{throw Error('duplicate hold')};
 let holds=0,releases=0;f.source.acquire=async()=>{holds++;return {verify:async()=>{},release:async()=>{releases++}}};
 const plan=await compareWorkflow(f.source,f.target,[1]);await applyWorkflow(f.source,f.target,plan);
 assert.equal(holds,1);assert.equal(releases,1);assert.equal(f.state.inserts,1);
});
