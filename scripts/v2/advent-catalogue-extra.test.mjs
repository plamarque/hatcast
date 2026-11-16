import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareExtra,applyExtra} from './advent-catalogue-extra.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
const entry=()=>({kind:'contribution',character_id:'extra:test',name:'Test',portrait:{type:'bucket-object',object:'portraits/extra.png'},statements:['A','B','C'],false_statement_index:1,reveal:'Result',stories:['One\n\nTwo',null,'Three'],desired_date:'2026-12-26'});
function fixture(){
 const quizzes=Array.from({length:24},(_,i)=>({day:i+1,kind:'contribution',character_id:`day:${i}`,name:'Test',portrait:{type:'bucket-object',object:'portraits/existing.png'},statements:['A','B','C'],false_statement_index:1,reveal:null}));
 const data=Buffer.from(JSON.stringify({schema_version:1,year:2026,index_base:0,quizzes}));
 const records=new Map([['catalogue/avent-2026.json',{gen:1,bytes:data}],['portraits/existing.png',{gen:1,bytes:png}]]);
 const state={corruptReread:false,writes:[]};
 const bucket={file:(name,options={})=>({
  getMetadata:async()=>{const r=records.get(name);if(!r)throw Error('missing');return [{generation:String(r.gen),size:String(r.bytes.length)}]},
  download:async()=>{const r=records.get(name);if(!r || (options.generation && String(r.gen)!==String(options.generation)))throw Error('generation');return [state.corruptReread && name.startsWith('catalogue/') && r.gen>1 ? Buffer.from(r.bytes.toString().replace('extra:test','extra:TEST')) : Buffer.from(r.bytes)]},
  exists:async()=>[records.has(name)],
  save:async(bytes,opts)=>{const old=records.get(name),expected=String(opts.preconditionOpts.ifGenerationMatch);if((!old && expected!=='0')||(old && String(old.gen)!==expected))throw Error('precondition');records.set(name,{gen:(old?.gen??0)+1,bytes:Buffer.from(bytes)});state.writes.push(name)}
 })};
 const acquire=async(_bucket,objects)=>({verify:async()=>{for(const o of objects)if(String(records.get(o.name)?.gen)!==o.generation)throw Error('hold');},release:async()=>{}});
 return {bucket,records,state,quizzes,acquire};
}
test('captures extra with exact stories and preserves all 24 days',async()=>{const f=fixture(),e=entry(),plan=await prepareExtra(f.bucket,e,png);await applyExtra(f.bucket,plan,{acquire:f.acquire});const root=JSON.parse(f.records.get('catalogue/avent-2026.json').bytes);assert.deepEqual(root.quizzes,f.quizzes);assert.deepEqual(root.extra_contributions,[e]);assert.deepEqual(f.records.get(e.portrait.object).bytes,png);});
test('rejects catalogue drift before applying and never writes',async()=>{const f=fixture(),p=await prepareExtra(f.bucket,entry(),png);f.records.get('catalogue/avent-2026.json').gen++;await assert.rejects(applyExtra(f.bucket,p,{acquire:f.acquire}));assert.deepEqual(f.state.writes,[]);});
test('rejects conflicting portrait and concurrent portrait creation',async()=>{const f=fixture();f.records.set('portraits/extra.png',{gen:1,bytes:Buffer.from('different')});await assert.rejects(prepareExtra(f.bucket,entry(),png));const g=fixture(),p=await prepareExtra(g.bucket,entry(),png);g.records.set('portraits/extra.png',{gen:1,bytes:Buffer.from('different')});await assert.rejects(applyExtra(g.bucket,p,{acquire:g.acquire}));assert.deepEqual(g.state.writes,[]);});
test('rejects oversized content before any writes',async()=>{const f=fixture(),e=entry();e.stories=['X'.repeat(2_000_000),null,null];await assert.rejects(prepareExtra(f.bucket,e,png));assert.deepEqual(f.state.writes,[]);});
test('detects a mismatched catalogue reread',async()=>{const f=fixture(),p=await prepareExtra(f.bucket,entry(),png);f.state.corruptReread=true;await assert.rejects(applyExtra(f.bucket,p,{acquire:f.acquire}));});
test('catalogue precondition protects against a write during portrait creation',async()=>{const f=fixture(),p=await prepareExtra(f.bucket,entry(),png),original=f.bucket.file;f.bucket.file=(name,options)=>{const file=original(name,options);if(name==='portraits/extra.png'){const save=file.save;file.save=async(...args)=>{await save(...args);f.records.get('catalogue/avent-2026.json').gen++;};}return file;};await assert.rejects(applyExtra(f.bucket,p,{acquire:f.acquire}));assert.equal(f.records.get('catalogue/avent-2026.json').gen,2);});

test('rejects unsafe numeric values before rewriting catalogue',async()=>{const f=fixture(),record=f.records.get('catalogue/avent-2026.json');record.bytes=Buffer.from(record.bytes.toString().replace('"year":2026','"future":9007199254740993,"year":2026'));await assert.rejects(prepareExtra(f.bucket,entry(),png));assert.deepEqual(f.state.writes,[]);});
test('protects all existing and newly selected portraits through publication',async()=>{const f=fixture(),p=await prepareExtra(f.bucket,entry(),png);const acquire=async(_bucket,objects)=>{assert.deepEqual(objects.map(x=>x.name).sort(),['portraits/existing.png','portraits/extra.png']);return {verify:async()=>{throw Error('changed')},release:async()=>{}}};await assert.rejects(applyExtra(f.bucket,p,{acquire}));assert.equal(f.records.get('catalogue/avent-2026.json').gen,1);});

test('rejects lossy JSON encodings before any writes',async()=>{
 for(const injected of ['"future":1.0000000000000001,','"future":1e-400,','"future":1,"future":2,','"future":1,"fu\\u0074ure":2,']){const f=fixture(),r=f.records.get('catalogue/avent-2026.json');r.bytes=Buffer.from(r.bytes.toString().replace('"year":2026',injected+'"year":2026'));await assert.rejects(prepareExtra(f.bucket,entry(),png));assert.deepEqual(f.state.writes,[]);}
 const f=fixture(),r=f.records.get('catalogue/avent-2026.json');const bytes=r.bytes;const pos=bytes.indexOf(Buffer.from('"year"'));r.bytes=Buffer.concat([bytes.subarray(0,pos),Buffer.from([0xff]),bytes.subarray(pos)]);await assert.rejects(prepareExtra(f.bucket,entry(),png));assert.deepEqual(f.state.writes,[]);
});
