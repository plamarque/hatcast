import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyDevelopmentBinding} from './advent-catalogue-cloudrun-binding.mjs';
const serviceName='projects/impro-selector/locations/europe-west9/services/hatcast-v2-dev', rev=`${serviceName}/revisions/fictional-1`;
function fixture(){
 const state={service:{name:serviceName,reconciling:false,etag:'1',generation:'1',observedGeneration:'1',latestReadyRevision:rev,latestCreatedRevision:rev,trafficStatuses:[{revision:rev,percent:100}]},revision:{name:rev,reconciling:false,serviceAccount:'runtime@project.iam.gserviceaccount.com',containers:[{env:[{name:'HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET',value:'impro-selector-avent-content-private'},{name:'HATCAST_ADVENT_PORTRAIT_LAYOUT',value:'portraits-v1'},{name:'HATCAST_DATASOURCE_URL',value:'jdbc:postgresql://ep-fiction.neon.tech:5432/synthetic'}]}]},access:true};
 const prod='projects/impro-selector/locations/europe-west1/services/hatcast-v2',prodRev=`${prod}/revisions/fictional-prod`;
 const production={name:prod,reconciling:false,etag:'2',generation:'1',observedGeneration:'1',latestReadyRevision:prodRev,latestCreatedRevision:prodRev,trafficStatuses:[{revision:prodRev,percent:100}]};
 const productionRevision={name:prodRev,reconciling:false,containers:[{env:[{name:'HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET',value:'private-prod'},{name:'HATCAST_ADVENT_PORTRAIT_LAYOUT',value:'portraits-v1'},{name:'HATCAST_DATASOURCE_URL',value:'jdbc:postgresql://ep-prod.neon.tech/synthetic'}]}]};
 const staging='projects/impro-selector/locations/europe-west9/services/hatcast-v2-staging',stageRev=`${staging}/revisions/fictional-stage`;
 const stage={name:staging,reconciling:false,etag:'3',generation:'1',observedGeneration:'1',latestReadyRevision:stageRev,latestCreatedRevision:stageRev,trafficStatuses:[{revision:stageRev,percent:100}]};
 const stageRevision={name:stageRev,reconciling:false,containers:[{env:[{name:'HATCAST_DATASOURCE_URL',value:'jdbc:postgresql://ep-stage.neon.tech/synthetic'}]}]};
 state.productionRevision=productionRevision;state.stageRevision=stageRevision;
 const client={request:async req=>({data:req.url.includes(':getIamPolicy')?{bindings:state.access?[{role:'roles/editor',members:['serviceAccount:runtime@project.iam.gserviceaccount.com']}]:[]}: req.url.endsWith('fictional-stage')?stageRevision:req.url.endsWith(staging)?stage:req.url.endsWith('fictional-prod')?productionRevision:req.url.endsWith(prod)?production:req.url.endsWith('fictional-1')?state.revision:state.service})};
 return {state,options:{client,portraitRefs:['fiction.png'],databaseHost:'ep-fiction.neon.tech',databaseName:'synthetic',fetchImpl:async()=>({ok:true,json:async()=>({permissions:state.access?['storage.objects.get']:[]})})}};
}
test('verifies active development revision, database binding and runtime access',async()=>{const f=fixture();assert.equal((await verifyDevelopmentBinding(f.options)).revision,rev)});
test('refuses split traffic, changed revision, wrong database, bucket and inaccessible runtime',async()=>{
 for(const mutate of [s=>s.service.trafficStatuses[0].percent=50,s=>s.service.latestCreatedRevision='other',s=>s.revision.containers[0].env[0].value='other',s=>s.revision.containers[0].env[2].value='jdbc:postgresql://wrong.neon.tech/synthetic',s=>s.access=false]) {const f=fixture();mutate(f.state);await assert.rejects(verifyDevelopmentBinding(f.options));}
});
test('staging verifies independently resolved databases while sharing storage',async()=>{
 const prefix='projects/impro-selector/locations/europe-west9/services/';
 const records={};
 function add(name,host,bucket){const service=name==='hatcast-v2'?`projects/impro-selector/locations/europe-west1/services/${name}`:`${prefix}${name}`,revision=`${service}/revisions/v1`;records[service]={name:service,reconciling:false,etag:'1',generation:'1',observedGeneration:'1',latestReadyRevision:revision,latestCreatedRevision:revision,trafficStatuses:[{revision,percent:100}]};records[revision]={name:revision,reconciling:false,serviceAccount:'runtime@project.iam.gserviceaccount.com',containers:[{env:[{name:'HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET',value:bucket},{name:'HATCAST_ADVENT_PORTRAIT_LAYOUT',value:'portraits-v1'},{name:'HATCAST_DATASOURCE_URL',value:`jdbc:postgresql://${host}/synthetic`}]}]};}
 add('hatcast-v2-staging','ep-staging.neon.tech','impro-selector-avent-content-private');add('hatcast-v2-dev','ep-dev.neon.tech','private-dev');add('hatcast-v2','ep-prod.neon.tech','impro-selector-avent-content-private');
 const options={environment:'staging',bucketName:'impro-selector-avent-content-private',databaseHost:'ep-staging.neon.tech',databaseName:'synthetic',client:{request:async req=>({data:req.url.includes(':getIamPolicy')?{bindings:[{role:'roles/editor',members:['serviceAccount:runtime@project.iam.gserviceaccount.com']}]}:records[req.url.split('/v2/')[1]]})},fetchImpl:async()=>({ok:true,json:async()=>({permissions:['storage.objects.get']})})};
 assert.equal((await verifyDevelopmentBinding(options)).bucket,'impro-selector-avent-content-private');
 const prod=records['projects/impro-selector/locations/europe-west1/services/hatcast-v2/revisions/v1'];prod.containers[0].env[0].value='impro-selector-avent-content-private';await verifyDevelopmentBinding(options);
 prod.containers[0].env[0].value='impro-selector-avent-content-private';prod.containers[0].env[2].value='jdbc:postgresql://ep-staging.neon.tech/synthetic';await assert.rejects(verifyDevelopmentBinding(options));
 prod.containers[0].env[2].value='jdbc:postgresql://ep-prod.neon.tech/synthetic';prod.containers[0].env.shift();await verifyDevelopmentBinding(options);
});
test('production comparison binds to production while keeping databases distinct',async()=>{
 const prefix='projects/impro-selector/locations/europe-west9/services/',records={};
 function add(name,host,bucket){const service=name==='hatcast-v2'?`projects/impro-selector/locations/europe-west1/services/${name}`:`${prefix}${name}`,revision=`${service}/revisions/v1`;records[service]={name:service,reconciling:false,etag:'1',generation:'1',observedGeneration:'1',latestReadyRevision:revision,latestCreatedRevision:revision,trafficStatuses:[{revision,percent:100}]};records[revision]={name:revision,reconciling:false,serviceAccount:'runtime@project.iam.gserviceaccount.com',containers:[{env:[{name:'HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET',value:bucket},{name:'HATCAST_ADVENT_PORTRAIT_LAYOUT',value:'portraits-v1'},{name:'HATCAST_DATASOURCE_URL',value:`jdbc:postgresql://${host}/synthetic`}]}]};}
 add('hatcast-v2-staging','ep-staging.neon.tech','impro-selector-avent-content-private');add('hatcast-v2-dev','ep-dev.neon.tech','private-dev');add('hatcast-v2','ep-prod.neon.tech','impro-selector-avent-content-private');
 const options={environment:'production',bucketName:'impro-selector-avent-content-private',databaseHost:'ep-prod.neon.tech',databaseName:'synthetic',client:{request:async req=>({data:req.url.includes(':getIamPolicy')?{bindings:[{role:'roles/editor',members:['serviceAccount:runtime@project.iam.gserviceaccount.com']}]}:records[req.url.split('/v2/')[1]]})},fetchImpl:async()=>({ok:true,json:async()=>({permissions:['storage.objects.get']})})};
 assert.equal((await verifyDevelopmentBinding(options)).bucket,'impro-selector-avent-content-private');records[`${prefix}hatcast-v2-dev/revisions/v1`].containers[0].env[0].value='impro-selector-avent-content-private';await verifyDevelopmentBinding(options);
});
test('refuses an absent or secret-backed target bucket',async()=>{
 for(const replacement of [undefined,{name:'HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET',valueSource:{secretKeyRef:{secret:'hidden',version:'latest'}}}]) {
  const f=fixture();const env=f.state.revision.containers[0].env;if(replacement)env[0]=replacement;else env.shift();
  await assert.rejects(verifyDevelopmentBinding(f.options));
 }
});
test('accepts only the matching pooler alias of the verified direct Neon endpoint',async()=>{
 const f=fixture();f.options.databaseHost='ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech';
 const env=f.state.revision.containers[0].env;
 env[2].value='jdbc:postgresql://ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech/synthetic';
 assert.equal((await verifyDevelopmentBinding(f.options)).revision,rev);
 for(const host of ['ep-other-pooler.c-3.eu-central-1.aws.neon.tech','ep-weathered-fog-al1law06-pooler.c-3.us-east-1.aws.neon.tech','ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech.example.test']){
  env[2].value=`jdbc:postgresql://${host}/synthetic`;await assert.rejects(verifyDevelopmentBinding(f.options));
 }
 f.options.databaseHost='ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech';
 env[2].value='jdbc:postgresql://ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech/synthetic';
 await assert.rejects(verifyDevelopmentBinding(f.options));
});

test('development refuses same database via direct or pooler aliases in either other environment',async()=>{
 for(const key of ['productionRevision','stageRevision']) for(const host of ['ep-fiction.neon.tech','ep-fiction-pooler.neon.tech']) {
  const f=fixture();f.state[key].containers[0].env.find(e=>e.name==='HATCAST_DATASOURCE_URL').value=`jdbc:postgresql://${host}/synthetic`;
  await assert.rejects(verifyDevelopmentBinding(f.options));
 }
 const f=fixture();delete f.state.stageRevision.containers[0].env[0].value;await assert.rejects(verifyDevelopmentBinding(f.options));
});

test('requires the existing unconditional project editor binding',async()=>{
 const f=fixture(),base=f.options.client.request;
 for(const bindings of [[],[{role:'roles/editor',members:['serviceAccount:other@project.iam.gserviceaccount.com']}],[{role:'roles/editor',members:['serviceAccount:runtime@project.iam.gserviceaccount.com'],condition:{expression:'true'}}]]) {
  f.options.client.request=async req=>req.url.includes(':getIamPolicy')?{data:{bindings}}:base(req);
  await assert.rejects(verifyDevelopmentBinding(f.options));
 }
});

test('refuses a revision without the prefixed portrait layout marker',async()=>{
 const f=fixture();f.state.revision.containers[0].env=f.state.revision.containers[0].env.filter(e=>e.name!=='HATCAST_ADVENT_PORTRAIT_LAYOUT');
 await assert.rejects(verifyDevelopmentBinding(f.options));
});


test('accepts actual Cloud Run v2 omitted false fields and short traffic revision IDs',async()=>{
 const f=fixture(),base=f.options.client.request;
 f.state.revision.serviceAccount='123456789-compute@developer.gserviceaccount.com';
 f.options.client.request=async req=>{
  if(req.url.includes(':getIamPolicy'))return {data:{bindings:[{role:'roles/editor',members:['serviceAccount:123456789-compute@developer.gserviceaccount.com']}]}};
  const result=structuredClone(await base(req)),x=result.data;
  delete x.reconciling;
  if(x.trafficStatuses)for(const traffic of x.trafficStatuses)traffic.revision=traffic.revision.split('/').pop();
  return result;
 };
 assert.equal((await verifyDevelopmentBinding(f.options)).revision,rev);
});

test('rejects reconciling services and traffic on a different short revision',async()=>{
 for(const mutate of [s=>s.service.reconciling=true,s=>s.service.trafficStatuses[0].revision='other-revision',s=>s.revision.reconciling=true]) {
  const f=fixture();mutate(f.state);await assert.rejects(verifyDevelopmentBinding(f.options));
 }
});
