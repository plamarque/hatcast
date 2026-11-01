import {randomUUID} from 'node:crypto';
const fail=()=>{throw Error('Private object hold refused')};
export async function acquireGcsHolds(bucket,objects) {
    const owner=randomUUID(), held=[];
    async function release() {
      let failed=false;
      for(const lock of [...held].reverse()) {
        try {
          const file=bucket.file(lock.name),[meta]=await file.getMetadata();
          if(lock.uncertain && (String(meta.generation)!==lock.generation || meta.temporaryHold!==true || meta.metadata?.hatcast_avent_sync_lock!==owner)) continue;
          if(String(meta.generation)!==lock.generation || (!lock.uncertain && String(meta.metageneration)!==lock.metageneration) || !/^\d+$/.test(String(meta.metageneration)) || meta.temporaryHold!==true || meta.metadata?.hatcast_avent_sync_lock!==owner) {failed=true;continue;}
          await file.setMetadata({temporaryHold:false,metadata:{...meta.metadata,hatcast_avent_sync_lock:null}},{ifGenerationMatch:lock.generation,ifMetagenerationMatch:String(meta.metageneration)});
        } catch {failed=true;}
      }
      if(failed)fail();
    }
    async function verifyHeld() {
      for(const lock of held) {
        const [meta]=await bucket.file(lock.name).getMetadata();
        if(String(meta.generation)!==lock.generation||String(meta.metageneration)!==lock.metageneration||meta.temporaryHold!==true||meta.metadata?.hatcast_avent_sync_lock!==owner)fail();
      }
    }
    try {
      for(const object of objects) {
        const file=bucket.file(object.name),[meta]=await file.getMetadata();
        if(String(meta.generation)!==object.generation||!/^\d+$/.test(String(meta.metageneration))||meta.temporaryHold===true||meta.eventBasedHold===true||meta.metadata?.hatcast_avent_sync_lock)fail();
        const lock={name:object.name,generation:object.generation,uncertain:true};
        held.push(lock);
        const [updated]=await file.setMetadata({temporaryHold:true,metadata:{...meta.metadata,hatcast_avent_sync_lock:owner}},{ifGenerationMatch:object.generation,ifMetagenerationMatch:String(meta.metageneration)});
        if(String(updated.generation)!==object.generation||!/^\d+$/.test(String(updated.metageneration))||updated.temporaryHold!==true||updated.metadata?.hatcast_avent_sync_lock!==owner)fail();
        lock.metageneration=String(updated.metageneration);lock.uncertain=false;
      }
      await verifyHeld();return {verify:verifyHeld,release};
    } catch(e) {await release().catch(()=>{});throw e;}
  }
