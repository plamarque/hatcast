#!/usr/bin/env node
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {stdin,stdout} from 'node:process';
import {createInterface} from 'node:readline/promises';
import {createGcsSource} from './advent-catalogue-gcs-source.mjs';
import {prepareAssignment,applyAssignment} from './advent-catalogue-assignment.mjs';
const refuse=()=>{throw Error('Assignment refused')},require=createRequire(import.meta.url);
async function main(){
 if(process.argv.length!==3 || !stdin.isTTY || !stdout.isTTY || !/^([1-9]|1[0-9]|2[0-4])$/.test(process.argv[2]) || !process.env.ADVENT_OPERATOR_PRINCIPAL)refuse();
 const day=Number(process.argv[2]),prompt=createInterface({input:stdin,output:stdout});
 try {
  const characterId=await prompt.question('Identifiant privé de la contribution : ');
  const {GoogleAuth}=require('google-auth-library'),{Storage}=require('@google-cloud/storage');
  const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}),storage=new Storage({authClient:await auth.getClient(),projectId:'impro-selector'});
  const source=createGcsSource({storage,auth,expectedPrincipal:process.env.ADVENT_OPERATOR_PRINCIPAL}),bucket=storage.bucket('impro-selector-avent-content-private');
  await source.verify(true);const plan=await prepareAssignment(bucket,day,characterId);
  const digest=createHash('sha256').update(plan.output).digest('hex').slice(0,16),phrase=`AFFECTER ${day} ${digest}`;
  if(await prompt.question(`Affectation privée préparée pour le jour ${day}. Pour confirmer, saisir ${phrase} : `)!==phrase)refuse();
  await source.verify(true);const result=await applyAssignment(bucket,plan);
  console.log(`Affectation privée enregistrée, génération ${result.generation}. Aucune base synchronisée.`);
 } finally {prompt.close();}
}
main().catch(()=>{console.error('Affectation refusée ou interrompue ; refaire la comparaison avant reprise.');process.exitCode=1;});
