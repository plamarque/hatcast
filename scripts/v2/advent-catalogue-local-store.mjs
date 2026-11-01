import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {validatePng} from './advent-catalogue-png.mjs';
const fail=()=>{throw Error('Private portrait storage refused')};
const validRef=ref=>typeof ref==='string' && /^[A-Za-z0-9_-]+\.png$/.test(ref) && ref.length<=255;
export function createLocalPortraitStore(directory) {
  async function verify() {
    const real=await fs.realpath(directory), stat=await fs.lstat(directory);
    if (real!==path.resolve(directory)||!stat.isDirectory()||stat.isSymbolicLink()||stat.uid!==process.getuid()||(stat.mode&0o077)) fail();
  }
  async function read(ref) {
    if(!validRef(ref)) fail();
    let handle;
    try {
      handle=await fs.open(path.join(directory,ref),fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
      const stat=await handle.stat();
      if(!stat.isFile()||stat.uid!==process.getuid()||(stat.mode&0o077)||stat.size>5_000_000) fail();
      const bytes=await handle.readFile();validatePng(bytes);return bytes;
    } catch(e) {if(e.code==='ENOENT')return null;throw e;} finally {await handle?.close();}
  }
  async function inspect(portraits) {
    await verify();const statuses=[];
    for(const p of portraits) {
      validatePng(p.bytes);const existing=await read(p.ref);
      statuses.push({ref:p.ref,status:existing===null?'addition':existing.equals(p.bytes)?'unchanged':'divergence'});
    }
    return statuses;
  }
  async function stagePortraits(portraits,statuses) {
    await verify();
    if(portraits.length!==statuses.length) fail();
    for(const p of portraits) {
      validatePng(p.bytes);if(!validRef(p.ref)||!statuses.some(s=>s.ref===p.ref&&['addition','unchanged'].includes(s.status)))fail();
      const existing=await read(p.ref);
      if(existing!==null) {if(!existing.equals(p.bytes))fail();continue;}
      let handle; const temp=path.join(directory,`.advent-stage-${randomBytes(16).toString('hex')}`);
      try {
        handle=await fs.open(temp,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_NOFOLLOW,0o600);
        await handle.writeFile(p.bytes);await handle.sync();await handle.close();handle=null;
        try {await fs.link(temp,path.join(directory,p.ref));}
        catch(e) {if(e.code!=='EEXIST')throw e;const concurrent=await read(p.ref);if(!concurrent?.equals(p.bytes))fail();}
      } finally {await handle?.close();await fs.unlink(temp).catch(()=>{});}
      const stored=await read(p.ref);if(!stored?.equals(p.bytes))fail();
    }
  }
  return {verify,inspect,stagePortraits};
}
