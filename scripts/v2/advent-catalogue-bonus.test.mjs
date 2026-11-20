import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateBonusSelection,validateCatalogueDocument} from './advent-catalogue-validation.mjs';
import {runBonusContent} from './advent-catalogue-bonus.mjs';
const quiz=(day)=>({day,kind:'contribution',character_id:`normal:${day}`,name:'Fictional',portrait:{type:'bucket-object',object:`portraits/n${day}.png`},statements:['A','B','C'],false_statement_index:0,reveal:null});
const root=()=>({schema_version:1,year:2026,index_base:0,quizzes:Array.from({length:24},(_,i)=>quiz(i+1)),extra_contributions:[{...quiz(1),day:undefined,character_id:'extra:test',portrait:{type:'bucket-object',object:'portraits/extra.png'}}].map(({day,...q})=>q),bonus_assignments:[{day:7,character_id:'extra:test'}]});
test('selects only an explicitly assigned reserve contribution',()=>{const doc=root(),before=structuredClone(doc.quizzes);assert.equal(validateBonusSelection(doc,[7])[0].character_key,'extra:test');assert.deepEqual(doc.quizzes,before);assert.throws(()=>validateBonusSelection(doc,[8]));});
test('refuses duplicate day, duplicate identity and unknown assignment',()=>{for(const bad of [[{day:7,character_id:'extra:test'},{day:7,character_id:'extra:test'}],[{day:7,character_id:'extra:test'},{day:8,character_id:'extra:test'}],[{day:7,character_id:'missing'}]]){const doc=root();doc.bonus_assignments=bad;assert.throws(()=>validateCatalogueDocument(doc));}});
test('detects source drift before any target insertion',async()=>{
 const row=validateBonusSelection(root(),[7])[0],state={reads:0,queries:[]};
 const source={verify:async()=>{},snapshot:async()=>({generation:String(++state.reads),rows:[row],portraits:[]}),acquire:async()=>{throw Error('unexpected')}};
 const store={verify:async()=>{}},db={query:async sql=>{state.queries.push(sql);return {rows:[]}}};
 await assert.rejects(runBonusContent({source,store,db,days:[7],environment:'development',ask:async()=> 'APPLIQUER bonus 7',write:()=>{}}));
 assert.equal(state.queries.some(sql=>sql.startsWith('INSERT')),false);
});
test('refuses a divergent target before authorization',async()=>{
 const row=validateBonusSelection(root(),[7])[0],source={verify:async()=>{},snapshot:async()=>({generation:'1',rows:[row],portraits:[]})},store={verify:async()=>{}},db={query:async()=>({rows:[{...row,character_key:'other'}]})};let asked=false;
 await assert.rejects(runBonusContent({source,store,db,days:[7],environment:'development',ask:async()=>{asked=true},write:()=>{}}));assert.equal(asked,false);
});

test('private assignment rejects source generation drift without writing',async()=>{
 const {prepareAssignment,applyAssignment}=await import('./advent-catalogue-assignment.mjs')
 const doc=root();delete doc.bonus_assignments;let generation=1,bytes=Buffer.from(JSON.stringify(doc)),writes=0
 const bucket={file:(_name,options={})=>({getMetadata:async()=>[{generation:String(generation),size:String(bytes.length)}],download:async()=>{if(options.generation && String(generation)!==options.generation)throw Error('stale');return [Buffer.from(bytes)]},save:async(value,opts)=>{if(String(opts.preconditionOpts.ifGenerationMatch)!==String(generation))throw Error('stale');writes++;bytes=Buffer.from(value);generation++}})}
 const plan=await prepareAssignment(bucket,7,'extra:test');generation++
 await assert.rejects(applyAssignment(bucket,plan));assert.equal(writes,0)
})
test('private assignment retains every daily quiz',async()=>{
 const {prepareAssignment,applyAssignment}=await import('./advent-catalogue-assignment.mjs')
 const doc=root();delete doc.bonus_assignments;let generation=1,bytes=Buffer.from(JSON.stringify(doc))
 const bucket={file:(_name,options={})=>({getMetadata:async()=>[{generation:String(generation),size:String(bytes.length)}],download:async()=>{if(options.generation && String(generation)!==options.generation)throw Error('stale');return [Buffer.from(bytes)]},save:async(value,opts)=>{if(String(opts.preconditionOpts.ifGenerationMatch)!==String(generation))throw Error('stale');bytes=Buffer.from(value);generation++}})}
 await applyAssignment(bucket,await prepareAssignment(bucket,7,'extra:test'))
 const saved=JSON.parse(bytes);assert.deepEqual(saved.quizzes,doc.quizzes);assert.deepEqual(saved.bonus_assignments,[{day:7,character_id:'extra:test'}])
})

test('applies only the reviewed bonus on the explicitly verified target',async()=>{
 const row=validateBonusSelection(root(),[7])[0],snapshot={generation:'1',rows:[row],portraits:[]},calls=[]
 const source={verify:async write=>calls.push(`source:${!!write}`),snapshot:async()=>snapshot,acquire:async()=>({verify:async()=>calls.push('hold'),release:async()=>calls.push('release')})}
 const store={verify:async write=>calls.push(`target:${!!write}`)}
 const db={query:async(sql,values)=>{calls.push(sql);if(sql.startsWith('SELECT quiz_day'))return {rows:[]};if(sql.startsWith('INSERT')){assert.equal(values[0],7);assert.equal(values[1],'extra:test')}return {rows:[]}}}
 await runBonusContent({source,store,db,days:[7],environment:'development',ask:async()=> 'APPLIQUER bonus 7',write:()=>{}})
 assert.equal(calls.filter(x=>x.startsWith('INSERT')).length,1);assert(calls.includes('COMMIT'));assert(calls.includes('release'))
})
test('refuses a changed target comparison before insertion',async()=>{
 const row=validateBonusSelection(root(),[7])[0],snapshot={generation:'1',rows:[row],portraits:[]};let reads=0,inserted=false,rolledBack=false
 const source={verify:async()=>{},snapshot:async()=>snapshot,acquire:async()=>({verify:async()=>{},release:async()=>{}})},store={verify:async()=>{}}
 const db={query:async sql=>{if(sql.startsWith('SELECT quiz_day'))return {rows:++reads===1?[]:[{...row,character_key:'other'}]};if(sql.startsWith('INSERT'))inserted=true;if(sql==='ROLLBACK')rolledBack=true;return {rows:[]}}}
 await assert.rejects(runBonusContent({source,store,db,days:[7],environment:'development',ask:async()=> 'APPLIQUER bonus 7',write:()=>{}}));assert.equal(inserted,false);assert.equal(rolledBack,true)
})
