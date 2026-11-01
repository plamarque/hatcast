const fail=()=>{throw Error('Cloud Run target verification failed')};
const SERVICE='projects/impro-selector/locations/europe-west9/services/hatcast-v2-dev';
const PRODUCTION_SERVICE='projects/impro-selector/locations/europe-west1/services/hatcast-v2';
const BUCKET='impro-selector-avent-content-private';
// Only Neon endpoint pooler aliases are equivalent; keep every other host label.
function neonEndpoint(host) {
  const match=/^(ep-[a-z0-9]+(?:-[a-z0-9]+)*)\.((?:[a-z0-9-]+\.)*neon\.tech)$/.exec(host||'');
  if(!match)fail();
  const endpoint=match[1].endsWith('-pooler')?match[1].slice(0,-7):match[1];
  if(!endpoint||endpoint==='ep')fail();
  return `${endpoint}.${match[2]}`;
}
// Cloud Run may return short revision IDs in trafficStatuses and omit default false fields.
function revisionName(service, ref) {
  if (typeof ref !== 'string') fail();
  const prefix = `${service}/revisions/`;
  const id = ref.startsWith(prefix) ? ref.slice(prefix.length) : ref;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(id)) fail();
  return `${prefix}${id}`;
}
function isReconciled(value) { return value === undefined || value === false; }
// Requires permission to read the service, revision and existing project IAM policy. Explicit configurations that cannot be compared are refused.
export async function verifyDevelopmentBinding({client,databaseHost,databaseName,environment='development',bucketName=BUCKET,portraitRefs=[]}) {
  if(!['development','staging','production'].includes(environment) || !/^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(bucketName||'') || bucketName!==BUCKET)fail();
  const serviceName=environment==='development'?SERVICE:environment==='staging'?'projects/impro-selector/locations/europe-west9/services/hatcast-v2-staging':PRODUCTION_SERVICE;
  if (!databaseName || !databaseHost || databaseHost.split('.')[0].endsWith('-pooler') || neonEndpoint(databaseHost)!==databaseHost) fail();
  const service=(await client.request({url:`https://run.googleapis.com/v2/${serviceName}`})).data;
  const traffic=service.trafficStatuses;
  if(service.name!==serviceName||!isReconciled(service.reconciling)||!service.etag||service.generation!==service.observedGeneration||
     !service.latestReadyRevision||
     !Array.isArray(traffic)||traffic.length!==1||traffic[0].percent!==100||revisionName(serviceName,traffic[0].revision)!==revisionName(serviceName,service.latestReadyRevision))fail();
  {
    const staging='projects/impro-selector/locations/europe-west9/services/hatcast-v2-staging';
    const others=[SERVICE,staging,PRODUCTION_SERVICE].filter(name=>name!==serviceName);
    for(const other of others) {
      const otherService=(await client.request({url:`https://run.googleapis.com/v2/${other}`})).data;
      if(otherService.name!==other||!isReconciled(otherService.reconciling)||!otherService.etag||!otherService.latestReadyRevision||otherService.generation!==otherService.observedGeneration||!Array.isArray(otherService.trafficStatuses)||otherService.trafficStatuses.length!==1||otherService.trafficStatuses[0].percent!==100||revisionName(other,otherService.trafficStatuses[0].revision)!==revisionName(other,otherService.latestReadyRevision))fail();
      const otherRevision=otherService.latestReadyRevision.startsWith('projects/')?otherService.latestReadyRevision:`${other}/revisions/${otherService.latestReadyRevision}`;
      if(!otherRevision.startsWith(`${other}/revisions/`))fail();
      const otherData=(await client.request({url:`https://run.googleapis.com/v2/${otherRevision}`})).data;
      const env=otherData.containers?.[0]?.env;
      const databases=env?.filter(e=>e.name==='HATCAST_DATASOURCE_URL');
      if(otherData.name!==otherRevision||!isReconciled(otherData.reconciling)||otherData.containers?.length!==1)fail();
      if(databases?.length!==1||typeof databases[0].value!=='string'||databases[0].valueSource||!databases[0].value.startsWith('jdbc:postgresql://'))fail();
      const otherDb=new URL(databases[0].value.slice(5));
      if(neonEndpoint(otherDb.hostname)===databaseHost && decodeURIComponent(otherDb.pathname.slice(1))===databaseName)fail();
      const again=(await client.request({url:`https://run.googleapis.com/v2/${other}`})).data;
      if(again.etag!==otherService.etag||!isReconciled(again.reconciling))fail();
    }
  }
  const revName=service.latestReadyRevision.startsWith('projects/')?service.latestReadyRevision:`${serviceName}/revisions/${service.latestReadyRevision}`;
  if(!revName.startsWith(`${serviceName}/revisions/`))fail();
  const revision=(await client.request({url:`https://run.googleapis.com/v2/${revName}`})).data;
  if(revision.name!==revName||!isReconciled(revision.reconciling)||!Array.isArray(revision.containers)||revision.containers.length!==1||
     !/^[^@\s]+@(?:[^@\s]+\.iam|developer)\.gserviceaccount\.com$/.test(revision.serviceAccount||''))fail();
  const env=revision.containers[0].env;if(!Array.isArray(env))fail();
  function value(name){const found=env.filter(e=>e.name===name);if(found.length!==1||typeof found[0].value!=='string'||found[0].valueSource)fail();return found[0].value;}
  // This status concerns only the active runtime, not database preparation.
  const buckets=env.filter(e=>e.name==='HATCAST_ADVENT_PRIVATE_PORTRAIT_BUCKET');
  const layouts=env.filter(e=>e.name==='HATCAST_ADVENT_PORTRAIT_LAYOUT');
  const explicitBucket=buckets.length===1 && typeof buckets[0].value==='string' && !buckets[0].valueSource && buckets[0].value===bucketName;
  const layout=layouts.length===1 && !layouts[0].valueSource ? layouts[0].value : undefined;
  const runtimeCompatible=(layout==='portraits-v1' && explicitBucket) || (layout==='portraits-default-v2' && (buckets.length===0 || explicitBucket));
  const jdbc=value('HATCAST_DATASOURCE_URL');if(!jdbc.startsWith('jdbc:postgresql://'))fail();
  const runtime=new URL(jdbc.slice(5));
  if(neonEndpoint(runtime.hostname)!==databaseHost||decodeURIComponent(runtime.pathname.slice(1))!==databaseName)fail();
  // Check the existing project role; never grant or modify it here. A binding
  // proves configuration, not absence of inherited denies or runtime failures.
  if(!Array.isArray(portraitRefs))fail();
  for(const ref of portraitRefs)if(!/^[A-Za-z0-9_-]+\.png$/.test(ref)||ref.length>255)fail();
  const policy=(await client.request({method:'POST',url:'https://cloudresourcemanager.googleapis.com/v3/projects/impro-selector:getIamPolicy',data:{options:{requestedPolicyVersion:3}}})).data;
  if(!Array.isArray(policy.bindings)||!policy.bindings.some(b=>b.role==='roles/editor'&&!b.condition&&Array.isArray(b.members)&&b.members.includes(`serviceAccount:${revision.serviceAccount}`)))fail();
  const again=(await client.request({url:`https://run.googleapis.com/v2/${serviceName}`})).data;
  if(again.etag!==service.etag||!isReconciled(again.reconciling))fail();
  return {revision:revName,bucket:bucketName,serviceAccount:revision.serviceAccount,runtimeCompatible};
}
