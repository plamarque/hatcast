import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGcsPortraitStore} from './advent-catalogue-gcs-store.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
const other=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNg+M/wHwAEAQH/cetH5QAAAABJRU5ErkJggg==','base64');
function fixture() {
 const state={bytes:null,permission:true,publicAccessPrevention:'enforced',binding:true,precondition:null};
 const bucket={getMetadata:async()=>[{name:'synthetic-private',projectNumber:'123',iamConfiguration:{publicAccessPrevention:state.publicAccessPrevention,uniformBucketLevelAccess:{enabled:true}}}],iam:{testPermissions:async keys=>[Object.fromEntries(keys.map(k=>[k,state.permission]))]},file:()=>({getMetadata:async()=>{if(!state.bytes)throw Object.assign(Error('missing'),{code:404});return [{generation:'1',size:String(state.bytes.length)}]},download:async()=>[state.bytes],save:async(bytes,options)=>{state.precondition=options.preconditionOpts;if(state.bytes)throw Object.assign(Error('conflict'),{code:412});state.bytes=Buffer.from(bytes)}})};
 const store=createGcsPortraitStore({storage:{bucket:()=>bucket},bucketName:'synthetic-private',projectNumber:'123',verifyBinding:async()=>{if(!state.binding)throw Error('denied')}});
 return {state,store};
}
test('shared bucket verification requires private access and update permission',async()=>{
 const f=fixture();assert.deepEqual(Object.keys(f.store),['verify']);await f.store.verify(true);f.state.permission=false;await assert.rejects(f.store.verify(true));f.state.permission=true;f.state.publicAccessPrevention='inherited';await assert.rejects(f.store.verify(true));f.state.publicAccessPrevention='enforced';f.state.binding=false;await assert.rejects(f.store.verify(true));
});
