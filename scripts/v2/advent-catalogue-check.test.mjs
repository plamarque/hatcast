import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkReadiness} from './advent-catalogue-check.mjs';
function fixture(){
 const calls=[];let rows=[{ok:true},{n:'13'},{member:'1',test:'1'}];
 return {calls,rows,options:{environment:'staging',write:line=>calls.push(line),source:{verify:async x=>calls.push(['source',x]),verifyCatalogue:async()=>calls.push('metadata'),snapshot:async()=>{throw Error('content must not be read')}},store:{verify:async x=>calls.push(['store',x])},db:{query:async sql=>{assert.match(sql,/^SELECT /);calls.push('query');return {rows:[rows.shift()]};}}}};
}
test('readiness checks permissions and schema without reading contributions',async()=>{const f=fixture();await checkReadiness(f.options);assert.deepEqual(f.calls.slice(0,3),[['source',true],'metadata',['store',true]]);assert.equal(f.calls.filter(x=>x==='query').length,3)});
test('readiness refuses missing rights, migration, or lock',async()=>{for(const [index,row] of [[0,{ok:false}],[1,{n:'12'}],[2,{member:'0',test:'1'}]]){const f=fixture();f.rows[index]=row;await assert.rejects(checkReadiness(f.options));}});
