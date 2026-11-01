import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGcsSource} from './advent-catalogue-gcs-source.mjs';
const principal='synthetic@project.iam.gserviceaccount.com';
function fixture() {
 const catalog=Buffer.from(JSON.stringify({schema_version:1,year:2026,index_base:0,quizzes:Array.from({length:24},(_,i)=>({day:i+1,character_id:`fiction-${i}`,kind:'contribution',name:'Synthetic',portrait:{type:'bucket-object',object:'portraits/fiction.png'},statements:['One','Two','Three'],false_statement_index:2,reveal:null}))}));
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
 const state={publicAccessPrevention:'enforced',uniform:true,project:'123',permissions:true,catalogueGeneration:'1',portraitGeneration:'2',changed:false};
 const bucket={getMetadata:async()=>[{name:'impro-selector-avent-content-private',projectNumber:state.project,iamConfiguration:{publicAccessPrevention:state.publicAccessPrevention,uniformBucketLevelAccess:{enabled:state.uniform}}}],iam:{testPermissions:async()=>[{'storage.objects.get':state.permissions}]},file:(name,options)=>({getMetadata:async()=>[{generation:name.startsWith('catalogue/')?state.catalogueGeneration:state.portraitGeneration,size:name.startsWith('catalogue/')?catalog.length:image.length}],download:async()=>{if(state.changed)state.catalogueGeneration='3';return [name.startsWith('catalogue/')?catalog:image]}})};
 const auth={getCredentials:async()=>({client_email:principal}),getClient:async()=>({request:async()=>({data:{projectId:'impro-selector',name:'projects/123'}})})};
 return {state,source:createGcsSource({storage:{bucket:()=>bucket},auth,expectedPrincipal:principal})};
}
test('verifies source and reads selected content pinned to generations',async()=>{
 const {source}=fixture();await source.verify();const snapshot=await source.snapshot([1]);assert.equal(snapshot.generation,'1');assert.equal(snapshot.portraits[0].generation,'2');assert.equal(snapshot.rows.length,1);
});
test('refuses unverifiable privacy, ownership, permissions and changed generation',async()=>{
 for(const mutate of [s=>s.publicAccessPrevention='inherited',s=>s.uniform=false,s=>s.project='999',s=>s.permissions=false]) {const {state,source}=fixture();mutate(state);await assert.rejects(source.verify());}
 const {state,source}=fixture();state.changed=true;await assert.rejects(source.snapshot([1]));
});
test('holds selected source generations until release and respects preconditions',async()=>{
 const records=new Map([['catalogue/avent-2026.json',{generation:'1',metageneration:'1',metadata:{},temporaryHold:false}],['portraits/fiction.png',{generation:'2',metageneration:'1',metadata:{},temporaryHold:false}]]);
 const bucket={file:name=>({getMetadata:async()=>[{...records.get(name),metadata:{...records.get(name).metadata}}],setMetadata:async(update,options)=>{const old=records.get(name);if(options.ifGenerationMatch!==old.generation||options.ifMetagenerationMatch!==old.metageneration)throw Error('precondition');const metadata={...update.metadata};for(const k of Object.keys(metadata))if(metadata[k]===null)delete metadata[k];const next={...old,...update,metadata,metageneration:String(Number(old.metageneration)+1)};records.set(name,next);return [next]}})};
 const source=createGcsSource({storage:{bucket:()=>bucket},auth:{},expectedPrincipal:principal});
 const snapshot={generation:'1',portraits:[{ref:'fiction.png',generation:'2'}]};
 const hold=await source.acquire(snapshot);assert.equal(records.get('catalogue/avent-2026.json').temporaryHold,true);await hold.verify();
 await assert.rejects(source.acquire(snapshot));await hold.release();assert.equal(records.get('catalogue/avent-2026.json').temporaryHold,false);assert.equal(records.get('portraits/fiction.png').temporaryHold,false);
 records.get('catalogue/avent-2026.json').generation='3';await assert.rejects(source.acquire(snapshot));
});

test('verifies a named user ADC through the authenticated identity endpoint', async()=>{
 const user='synthetic@example.test';
 const state={email:user,email_verified:'true',sub:'synthetic-user-id',grant:true,token:'synthetic-test-token',failIdentity:false};
 const bucket={getMetadata:async()=>[{name:'impro-selector-avent-content-private',projectNumber:'123',iamConfiguration:{publicAccessPrevention:'enforced',uniformBucketLevelAccess:{enabled:true}}}],iam:{testPermissions:async()=>[{'storage.objects.get':state.grant}]}};
 const client={getAccessToken:async()=>({token:state.token}),request:async(options)=>{if(options.url==='https://oauth2.googleapis.com/tokeninfo'){assert.equal(options.method,'POST');assert.equal(options.headers['Content-Type'],'application/x-www-form-urlencoded');assert.equal(new URLSearchParams(options.data).get('access_token'),state.token);if(state.failIdentity)throw Error(state.token);return {data:{email:state.email,email_verified:state.email_verified,sub:state.sub}};}return {data:{projectId:'impro-selector',name:'projects/123'}};}};
 const auth={getCredentials:async()=>({}),getClient:async()=>client};
 const source=createGcsSource({storage:{bucket:()=>bucket},auth,expectedPrincipal:user});
 await source.verify();
 state.email='different@example.test';await assert.rejects(source.verify());state.email=user;
 state.email_verified='false';await assert.rejects(source.verify());state.email_verified='true';
 state.sub='';await assert.rejects(source.verify());state.sub='synthetic-user-id';
 state.grant=false;await assert.rejects(source.verify());state.grant=true;
 state.token='';await assert.rejects(source.verify());state.token='synthetic-test-token';
 state.failIdentity=true;await assert.rejects(source.verify(),e=>!String(e).includes(state.token));
});

test('lost hold response cleans up only its own matching generation',async()=>{
 for(const mode of ['ours','other-owner','other-generation']) {
  let meta={generation:'1',metageneration:'1',metadata:{},temporaryHold:false};let releases=0;
  const bucket={file:()=>({getMetadata:async()=>[{...meta,metadata:{...meta.metadata}}],setMetadata:async(update,options)=>{
   assert.equal(options.ifGenerationMatch,meta.generation);assert.equal(options.ifMetagenerationMatch,meta.metageneration);
   if(update.temporaryHold){meta={...meta,...update,metageneration:'2'};if(mode==='other-owner')meta.metadata={hatcast_avent_sync_lock:'someone-else'};if(mode==='other-generation')meta.generation='2';throw Error('response lost');}
   releases++;meta={...meta,...update,metageneration:'3'};return [meta];
  }})};
  const source=createGcsSource({storage:{bucket:()=>bucket},auth:{},expectedPrincipal:principal});
  await assert.rejects(source.acquire({generation:'1',portraits:[]}));
  assert.equal(releases,mode==='ours'?1:0);assert.equal(meta.temporaryHold,mode!=='ours');
 }
});
