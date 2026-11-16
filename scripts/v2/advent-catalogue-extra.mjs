import {validateCatalogueDocument} from './advent-catalogue-validation.mjs';
import {validatePng} from './advent-catalogue-png.mjs';
import {acquireGcsHolds} from './advent-catalogue-gcs-holds.mjs';

const LIMIT=2_000_000, IMAGE_LIMIT=5_000_000;
const fail=()=>{throw new Error('Private catalogue capture refused');};
const number=value=>/^\d+$/.test(String(value));
export function parseSafeJson(bytes) {
  const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  let i=0;
  const ws=()=>{while (/[\x20\t\r\n]/.test(text[i] ?? '') && i<text.length) i++;};
  function str() {
    if (text[i++]!=='"') fail(); const start=i-1;
    while (i<text.length) {
      const c=text[i++];
      if (c==='"') return JSON.parse(text.slice(start,i));
      if (c==='\\') { if (i>=text.length) fail(); i++; }
      else if (c.charCodeAt(0)<32) fail();
    }
    fail();
  }
  function value() {
    ws();const c=text[i];
    if (c==='"') {str();return;}
    if (c==='{') {
      i++;ws();const keys=new Set();if(text[i]==='}'){i++;return;}
      while(true) {ws();const key=str();if(keys.has(key))fail();keys.add(key);ws();if(text[i++]!==':')fail();value();ws();const sep=text[i++];if(sep==='}')return;if(sep!==',')fail();}
    }
    if (c==='[') {
      i++;ws();if(text[i]===']'){i++;return;}
      while(true) {value();ws();const sep=text[i++];if(sep===']')return;if(sep!==',')fail();}
    }
    for(const literal of ['true','false','null']) if(text.startsWith(literal,i)){i+=literal.length;return;}
    const match=text.slice(i).match(/^-?(?:0|[1-9]\d*)/);
    if(!match || !Number.isSafeInteger(Number(match[0])))fail();
    i+=match[0].length;
  }
  value();ws();if(i!==text.length)fail();
  return JSON.parse(text);
}
async function readObject(bucket,name,limit) {
  const [meta]=await bucket.file(name).getMetadata();
  if (!number(meta.generation) || !number(meta.size) || Number(meta.size)>limit) fail();
  const generation=String(meta.generation);
  const [bytes]=await bucket.file(name,{generation}).download();
  if (!Buffer.isBuffer(bytes) || bytes.length!==Number(meta.size)) fail();
  return {generation,bytes};
}

// The caller verifies bucket identity and effective permissions before each phase.
export async function prepareExtra(bucket, entry, portraitBytes) {
  if (!Buffer.isBuffer(portraitBytes) || portraitBytes.length>IMAGE_LIMIT) fail();
  validatePng(portraitBytes);
  const source=await readObject(bucket,'catalogue/avent-2026.json',LIMIT);
  const root=parseSafeJson(source.bytes);
  validateCatalogueDocument(root);
  const before=structuredClone(root);
  if (root.extra_contributions === undefined) root.extra_contributions=[];
  root.extra_contributions.push(structuredClone(entry));
  validateCatalogueDocument(root);
  const encoded=Buffer.from(JSON.stringify(root,null,2)+'\n');
  if (encoded.length>LIMIT) fail();
  const checked=structuredClone(root); checked.extra_contributions.pop();
  if (before.extra_contributions === undefined) delete checked.extra_contributions;
  if (JSON.stringify(checked)!==JSON.stringify(before)) fail();
  const name=entry.portrait.object;
  const portraits=[];
  for (const ref of new Set([...before.quizzes,...(before.extra_contributions??[])].filter(q=>q.portrait?.type==='bucket-object').map(q=>q.portrait.object))) {
    const existing=await readObject(bucket,ref,IMAGE_LIMIT); validatePng(existing.bytes); portraits.push({name:ref,generation:existing.generation});
  }
  const portrait=bucket.file(name);
  const [exists]=await portrait.exists();
  let portraitGeneration=null;
  if (exists) {
    const image=await readObject(bucket,name,IMAGE_LIMIT);
    if (!image.bytes.equals(portraitBytes)) fail();
    portraitGeneration=image.generation;
  }
  const [latest]=await bucket.file('catalogue/avent-2026.json').getMetadata();
  if (String(latest.generation)!==source.generation) fail();
  return {sourceGeneration:source.generation,sourceBytes:source.bytes,outputBytes:encoded,portraitName:name,portraitBytes:Buffer.from(portraitBytes),portraitGeneration,portraits};
}

export async function applyExtra(bucket, plan, {acquire=acquireGcsHolds}={}) {
  const source=await readObject(bucket,'catalogue/avent-2026.json',LIMIT);
  if (source.generation!==plan.sourceGeneration || !source.bytes.equals(plan.sourceBytes)) fail();
  const portrait=bucket.file(plan.portraitName);
  if (plan.portraitGeneration===null) {
    await portrait.save(plan.portraitBytes,{resumable:false,contentType:'image/png',preconditionOpts:{ifGenerationMatch:0}});
  } else {
    const current=await readObject(bucket,plan.portraitName,IMAGE_LIMIT);
    if (current.generation!==plan.portraitGeneration || !current.bytes.equals(plan.portraitBytes)) fail();
  }
  const verified=await readObject(bucket,plan.portraitName,IMAGE_LIMIT);
  if (!verified.bytes.equals(plan.portraitBytes)) fail();
  validatePng(verified.bytes);
  const parsed=parseSafeJson(plan.outputBytes); validateCatalogueDocument(parsed);
  if (plan.outputBytes.length>LIMIT) fail();
  const refs=new Map(plan.portraits.map(p=>[p.name,p.generation]));
  if (refs.has(plan.portraitName) && refs.get(plan.portraitName)!==verified.generation) fail();
  refs.set(plan.portraitName,verified.generation);
  const hold=await acquire(bucket,[...refs].map(([name,generation])=>({name,generation})));
  try {
    await hold.verify();
    await bucket.file('catalogue/avent-2026.json').save(plan.outputBytes,{resumable:false,contentType:'application/json',preconditionOpts:{ifGenerationMatch:plan.sourceGeneration}});
    const result=await readObject(bucket,'catalogue/avent-2026.json',LIMIT);
    if (!result.bytes.equals(plan.outputBytes)) fail();
    validateCatalogueDocument(parseSafeJson(result.bytes));
    await hold.verify();
    return {generation:result.generation};
  } finally { await hold.release(); }
}
