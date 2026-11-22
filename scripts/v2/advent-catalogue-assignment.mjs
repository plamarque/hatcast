import {parseSafeJson} from './advent-catalogue-extra.mjs';
import {validateCatalogueDocument} from './advent-catalogue-validation.mjs';
const name='catalogue/avent-2026.json', limit=2_000_000;
const refuse=()=>{throw Error('Assignment refused')};
async function read(bucket) {
 const [meta]=await bucket.file(name).getMetadata();
 if(!/^\d+$/.test(String(meta.generation))||!/^\d+$/.test(String(meta.size))||Number(meta.size)>limit)refuse();
 const generation=String(meta.generation),[bytes]=await bucket.file(name,{generation}).download();
 if(!Buffer.isBuffer(bytes)||bytes.length!==Number(meta.size))refuse();
 return {generation,bytes};
}
export async function prepareAssignment(bucket,day,characterId) {
 if(!Number.isInteger(day)||day<1||day>24||typeof characterId!=='string')refuse();
 const source=await read(bucket),root=parseSafeJson(source.bytes);validateCatalogueDocument(root);
 if(!(root.extra_contributions??[]).some(q=>q.character_id===characterId))refuse();
 if((root.bonus_assignments??[]).some(a=>a.day===day||a.character_id===characterId))refuse();
 root.bonus_assignments??=[];root.bonus_assignments.push({day,character_id:characterId});validateCatalogueDocument(root);
 const output=Buffer.from(JSON.stringify(root,null,2)+'\n');if(output.length>limit)refuse();
 const current=await read(bucket);if(current.generation!==source.generation||!current.bytes.equals(source.bytes))refuse();
 return {generation:source.generation,source:source.bytes,output};
}
export async function applyAssignment(bucket,plan) {
 const before=await read(bucket);if(before.generation!==plan.generation||!before.bytes.equals(plan.source))refuse();
 validateCatalogueDocument(parseSafeJson(plan.output));
 await bucket.file(name).save(plan.output,{resumable:false,contentType:'application/json',preconditionOpts:{ifGenerationMatch:plan.generation}});
 const after=await read(bucket);if(!after.bytes.equals(plan.output))refuse();
 return {generation:after.generation};
}
