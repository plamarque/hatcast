import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyNeonDevelopment} from './advent-catalogue-neon-verification.mjs';
const project='twilight-tree-11908937';
const targets={development:['br-wandering-fire-al69qlxl','ep-weathered-fog-al1law06'],staging:['br-solitary-tree-alshbj8i','ep-plain-mode-al95cugr'],production:['br-misty-shadow-algk3uc4','ep-cold-poetry-al3m3lxk']};
function fixture(environment='development',apiKey=undefined){
 const [branchId,endpointId]=targets[environment],host=`${endpointId}.eu.neon.tech`;
 const state={project_id:project,branch_id:branchId,endpoint_id:endpointId,permissions:true,branch:{id:branchId,name:environment,primary:environment==='production'},endpoint:{id:endpointId,branch_id:branchId,host,type:'read_write'},statements:[]};
 const client={host,connection:{stream:{authorized:true,servername:host}},query:async sql=>{state.statements.push(sql);return sql.includes('current_database')?{rows:[{db:'synthetic',role:'fiction',recovery:false,quiz_ok:state.permissions}]}:sql.includes('neon.project_id')?{rowCount:1,rows:[{project_id:state.project_id,branch_id:state.branch_id,endpoint_id:state.endpoint_id}]}:{rows:[{ok:state.permissions}]}}};
 const options={environment,databaseUrl:`postgres://fiction:secret@${host}/synthetic?sslmode=verify-full`,projectId:project,branchId,apiKey,client,fetchImpl:async url=>{if(!apiKey)throw Error('API must not be called');return {ok:true,json:async()=>url.includes('/branches/')?{branch:state.branch}:{endpoint:state.endpoint}}}};
 return {state,options};
}
test('all three pinned targets verify intrinsically with or without an API key',async()=>{
 for(const environment of Object.keys(targets))for(const apiKey of [undefined,'synthetic']){
  const f=fixture(environment,apiKey);assert.equal((await verifyNeonDevelopment(f.options)).endpointId,targets[environment][1]);assert(f.state.statements.some(s=>s.includes('neon.project_id')));
 }
});
test('refuses every cross-environment branch and endpoint confusion',async()=>{
 for(const environment of Object.keys(targets))for(const other of Object.keys(targets))if(environment!==other){
  let f=fixture(environment);f.options.branchId=targets[other][0];await assert.rejects(verifyNeonDevelopment(f.options));
  f=fixture(environment);f.options.databaseUrl=f.options.databaseUrl.replace(targets[environment][1],targets[other][1]);await assert.rejects(verifyNeonDevelopment(f.options));
  for(const key of ['branch_id','endpoint_id']){f=fixture(environment);f.state[key]=targets[other][key==='branch_id'?0:1];await assert.rejects(verifyNeonDevelopment(f.options));}
 }
});
test('rejects changed identities and TLS or permissions for every target',async()=>{
 for(const environment of Object.keys(targets))for(const change of [f=>f.options.projectId='other-project',f=>f.state.project_id='other-project',f=>f.state.branch_id='br-changed',f=>f.state.endpoint_id='ep-changed',f=>f.options.client.connection.stream.authorized=false,f=>f.options.client.connection.stream.servername='wrong',f=>f.options.databaseUrl=f.options.databaseUrl.replace('verify-full','require'),f=>f.options.databaseUrl=f.options.databaseUrl.replace('.eu.neon.tech','-pooler.eu.neon.tech'),f=>f.state.permissions=false]){const f=fixture(environment);change(f);await assert.rejects(verifyNeonDevelopment(f.options));}
});
test('API metadata when supplied must also match pinned branch and endpoint',async()=>{
 for(const environment of Object.keys(targets))for(const change of [f=>f.state.branch.name='other',f=>f.state.branch.primary=!f.state.branch.primary,f=>f.state.endpoint.branch_id='br-other',f=>f.state.endpoint.host='other',f=>f.state.project_id='other']){const f=fixture(environment,'synthetic');change(f);await assert.rejects(verifyNeonDevelopment(f.options));}
});
test('production comparison is read-only and apply requires write and game state permissions',async()=>{
 const read=fixture('production');await verifyNeonDevelopment(read.options);assert.equal(read.state.statements.length,2);assert.doesNotMatch(read.state.statements[0],/INSERT|UPDATE/);
 const write=fixture('production');write.options.forWrite=true;await verifyNeonDevelopment(write.options);assert.match(write.state.statements[0],/INSERT/);assert.match(write.state.statements[0],/UPDATE/);assert(write.state.statements.some(s=>s.includes('bool_and')));
});
