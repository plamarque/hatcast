import {acquireGcsHolds} from './advent-catalogue-gcs-holds.mjs';
import {validatePng} from './advent-catalogue-png.mjs';
import {validateCatalogue} from './advent-catalogue-validation.mjs';
const SOURCE_BUCKET='impro-selector-avent-content-private';
const SOURCE_OBJECT='catalogue/avent-2026.json';
const fail=()=>{throw Error('Private source verification failed')};
function generation(meta,limit) {
  if (!meta || !/^\d+$/.test(String(meta.generation)) || !/^\d+$/.test(String(meta.size)) || Number(meta.size)>limit) fail();
  return String(meta.generation);
}
// The effective ADC principal must be independently identified and match the expected operator.
export function createGcsSource({storage,auth,expectedPrincipal}) {
  const bucket=storage.bucket(SOURCE_BUCKET);
  async function verify(forWrite=false) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(expectedPrincipal || '')) fail();
    const credentials=await auth.getCredentials();
    const client=await auth.getClient();
    if (credentials.client_email) {
      if (!/^[^@\s]+@[^@\s]+\.iam\.gserviceaccount\.com$/.test(credentials.client_email) || credentials.client_email !== expectedPrincipal) fail();
    } else {
      const access=await client.getAccessToken();
      const token=typeof access==='string'?access:access?.token;
      if (typeof token!=='string' || !token) fail();
      // Use the request body for the bearer token; never include it in a URL or error.
      let profile;
      try {
        profile=(await client.request({url:'https://oauth2.googleapis.com/tokeninfo',method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},data:new URLSearchParams({access_token:token}).toString()})).data;
      } catch { fail(); }
      if (!profile || ![true,'true'].includes(profile.email_verified) || typeof profile.sub !== 'string' || !profile.sub || profile.email !== expectedPrincipal) fail();
    }
    const project=(await client.request({url:'https://cloudresourcemanager.googleapis.com/v3/projects/impro-selector'})).data;
    const [meta]=await bucket.getMetadata();
    if (project.projectId !== 'impro-selector' || !/^projects\/\d+$/.test(project.name || '') ||
        String(meta.projectNumber) !== project.name.split('/')[1] || meta.name !== SOURCE_BUCKET ||
        meta.iamConfiguration?.publicAccessPrevention !== 'enforced' || meta.iamConfiguration?.uniformBucketLevelAccess?.enabled !== true) fail();
    const needed=forWrite?['storage.objects.get','storage.objects.update']:['storage.objects.get'];
    const [permissions]=await bucket.iam.testPermissions(needed);
    if (needed.some(permission=>permissions[permission]!==true)) fail();
  }
  async function readVersion(name,limit) {
    const file=bucket.file(name);
    const [meta]=await file.getMetadata(); const gen=generation(meta,limit);
    const [bytes]=await bucket.file(name,{generation:gen}).download();
    if (!Buffer.isBuffer(bytes) || bytes.length !== Number(meta.size)) fail();
    const [latest]=await file.getMetadata(); if (generation(latest,limit)!==gen) fail();
    return {bytes,generation:gen};
  }
  async function verifyCatalogue() {
    const [metadata]=await bucket.file(SOURCE_OBJECT).getMetadata();
    generation(metadata,2_000_000);
  }
  async function snapshot(days, operation) {
    const catalogue=await readVersion(SOURCE_OBJECT,2_000_000);
    const rows=validateCatalogue(JSON.parse(catalogue.bytes.toString('utf8')),days);
    const portraits=[];
    for(const ref of operation==='quiz' ? [] : [...new Set(rows.map(row=>row.portrait_ref))]) {
      const image=await readVersion(`portraits/${ref}`,5_000_000);
      validatePng(image.bytes);
      portraits.push({ref,bytes:image.bytes,generation:image.generation});
    }
    const [latest]=await bucket.file(SOURCE_OBJECT).getMetadata();
    if (generation(latest,2_000_000)!==catalogue.generation) fail();
    return {generation:catalogue.generation,rows,portraits};
  }
  async function acquire(snapshot) {
    return acquireGcsHolds(bucket,[{name:SOURCE_OBJECT,generation:snapshot.generation},...snapshot.portraits.map(p=>({name:`portraits/${p.ref}`,generation:p.generation}))]);
  }
  return {verify,verifyCatalogue,snapshot,acquire};
}
