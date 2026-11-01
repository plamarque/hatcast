#!/usr/bin/env node
import {createRequire} from 'node:module';
import {stdin,stdout} from 'node:process';
import {createInterface} from 'node:readline/promises';
import {createGcsSource} from './advent-catalogue-gcs-source.mjs';
import {createGcsPortraitStore} from './advent-catalogue-gcs-store.mjs';
import {verifyNeonDevelopment} from './advent-catalogue-neon-verification.mjs';
import {verifyDevelopmentBinding} from './advent-catalogue-cloudrun-binding.mjs';
import {runOperator,compareProduction} from './advent-catalogue-operator.mjs';
import {insertReviewedQuizzes} from './advent-catalogue-database.mjs';
import {deleteTestDays} from './advent-catalogue-delete.mjs';
import {runCloudContent} from './advent-catalogue-cloud-content.mjs';
const require=createRequire(import.meta.url);
const refuse=()=>{throw Error('Synchronization refused')};
async function main() {
  // Production requires a second, plan-specific interactive authorization.
  const operation=['character','quiz','delete'].includes(process.argv[2])?process.argv[2]:null;
  const deletion=operation==='delete';
  const offset=operation?1:0;
  if(!operation||process.argv.length!==4+offset||!['development','staging','production'].includes(process.argv[2+offset])||!stdin.isTTY||!stdout.isTTY)refuse();
  const environment=process.argv[2+offset];
  if(deletion && environment==='production')refuse();
  const bucketName='impro-selector-avent-content-private';
  if(!bucketName)refuse();
  const days=process.argv[3+offset].split(',').map(s=>/^([1-9]|1[0-9]|2[0-4])$/.test(s)?Number(s):NaN);
  if(days.some(Number.isNaN)||new Set(days).size!==days.length)refuse();
  const {ADVENT_DATABASE_URL,ADVENT_NEON_PROJECT,ADVENT_NEON_BRANCH,NEON_API_KEY,ADVENT_OPERATOR_SERVICE_ACCOUNT,ADVENT_OPERATOR_PRINCIPAL}=process.env;
  const principal=ADVENT_OPERATOR_PRINCIPAL || ADVENT_OPERATOR_SERVICE_ACCOUNT;
  if(!ADVENT_DATABASE_URL||!ADVENT_NEON_PROJECT||!ADVENT_NEON_BRANCH||!principal)refuse();
  const uri=new URL(ADVENT_DATABASE_URL);
  if(!['postgres:','postgresql:'].includes(uri.protocol)||!/^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/.test(uri.hostname)||uri.searchParams.getAll('sslmode').length!==1||uri.searchParams.get('sslmode')!=='verify-full'||[...uri.searchParams.keys()].some(k=>k!=='sslmode'))refuse();
  const {GoogleAuth}=require('google-auth-library'),{Storage}=require('@google-cloud/storage'),{Client}=require('pg');
  const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
  const google=await auth.getClient(),storage=new Storage({authClient:auth});
  const project=(await google.request({url:'https://cloudresourcemanager.googleapis.com/v3/projects/impro-selector'})).data;
  if(project.projectId!=='impro-selector'||!/^projects\/\d+$/.test(project.name||''))refuse();
  const source=createGcsSource({storage,auth,expectedPrincipal:principal});
  const db=new Client({connectionString:ADVENT_DATABASE_URL,connectionTimeoutMillis:10000});
  try {
    await db.connect();if(environment==='production')await db.query('BEGIN READ ONLY');let identity;
    async function verifyBinding(forWrite=false,portraitRefs=[],requireExisting=false) {
      const neon=await verifyNeonDevelopment({databaseUrl:ADVENT_DATABASE_URL,projectId:ADVENT_NEON_PROJECT,branchId:ADVENT_NEON_BRANCH,apiKey:NEON_API_KEY,client:db,environment,forWrite});
      const run=await verifyDevelopmentBinding({client:google,databaseHost:neon.host,databaseName:neon.database,environment,bucketName,portraitRefs,requireExisting});
      identity=JSON.stringify({neon,run});
    }
    const store=createGcsPortraitStore({storage,bucketName,projectNumber:project.name.split('/')[1],verifyBinding});
    async function ask(question){const prompt=createInterface({input:stdin,output:stdout});try{return await prompt.question(question);}finally{prompt.close();}}
    if(deletion) {
      await source.verify();await store.verify(true);
      const tables=['advent_member_attempts','advent_member_generations','advent_member_replays','advent_member_answers','advent_test_attempts','advent_test_generations','advent_test_replays','advent_test_answers','advent_offline_content_conflicts','advent_member_demo_quizzes','advent_quizzes','advent_character_reservations'];
      const rights=await db.query("SELECT bool_and(has_table_privilege(name,'SELECT') AND has_table_privilege(name,'DELETE')) AS ok FROM unnest($1::text[]) AS name",[tables]);
      const state=await db.query("SELECT (has_table_privilege('advent_test_member_state','SELECT') AND has_table_privilege('advent_test_member_state','INSERT') AND has_table_privilege('advent_test_member_state','UPDATE')) AND has_table_privilege('advent_test_answers','UPDATE') AS ok");
      if(rights.rows[0]?.ok!==true || state.rows[0]?.ok!==true)refuse();
      const phrase=`SUPPRIMER ${environment} ${[...days].sort((a,b)=>a-b).join(',')}`;
      if(await ask(`Suppression définitive des jours sélectionnés et de leurs parties sur ${environment}. Saisir ${phrase} : `)!==phrase)refuse();
      await store.verify(true);
      await deleteTestDays(db,environment,days);
      console.log('Suppression ciblée terminée ; source et portraits conservés.');
      return;
    }
    if(operation) {await runCloudContent({source,store,db,days,operation,environment,ask,write:line=>console.log(line)});return;}
    const target={sharedPortraits:true,verify:forWrite=>store.verify(forWrite),inspect:async snapshot=>({identity,rows:(await db.query('SELECT quiz_day, display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation FROM advent_quizzes WHERE quiz_day=ANY($1::int[])',[snapshot.rows.map(row=>row.quiz_day)])).rows,portraits:snapshot.portraits.map(p=>({ref:p.ref,status:'unchanged'}))}),insert:(rows,reviewed,previous)=>insertReviewedQuizzes(db,rows,reviewed,previous)};
    await runOperator(source,target,days,{environment,write:line=>console.log(line),
      describeTarget:identity=>{const value=JSON.parse(identity);return `Projet Neon : ${value.neon.projectId} ; branche : ${value.neon.branchId} ; révision : ${value.run.revision} ; bucket : ${value.run.bucket}`;},
      beforeApply:async()=>{if(environment==='production')await db.query('ROLLBACK');},
      authorizeProduction:async phrase=>ask(`Autorisation distincte pour ce plan de production : saisir ${phrase} : `),confirm:async phrase=>{
      return ask(`Pour appliquer ce plan à ${environment}, saisir ${phrase} : `);
    }});
  } finally {await db.end().catch(()=>{});}
}
main().catch(()=>{console.error('Opération refusée ou interrompue. Refaire la comparaison ; préserver les objets existants. Si une protection temporaire de source subsiste, consulter la procédure privée de reprise.');process.exitCode=1;});
