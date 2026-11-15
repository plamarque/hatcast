#!/usr/bin/env node
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {open} from 'node:fs/promises';
import {writeFileSync} from 'node:fs';
import {constants} from 'node:fs';
import {stdin,stdout} from 'node:process';
import {createInterface} from 'node:readline/promises';
import {createGcsSource} from './advent-catalogue-gcs-source.mjs';
import {prepareExtra,applyExtra,parseSafeJson} from './advent-catalogue-extra.mjs';
const require=createRequire(import.meta.url);
const refuse=()=>{throw Error('Capture refused');};
async function readPrivate(path,limit) {
  const f=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW);
  try {
    const stat=await f.stat();
    if (!stat.isFile() || stat.uid!==process.getuid() || (stat.mode & 0o077)!==0 || stat.size>limit) refuse();
    return await f.readFile();
  } finally { await f.close(); }
}
async function main(){
  if (process.argv.length!==4 || !stdin.isTTY || !stdout.isTTY || !process.env.ADVENT_OPERATOR_PRINCIPAL) refuse();
  const entryBytes=await readPrivate(process.argv[2],2_000_000);
  const entry=parseSafeJson(entryBytes);
  const portrait=await readPrivate(process.argv[3],5_000_000);
  const {GoogleAuth}=require('google-auth-library'),{Storage}=require('@google-cloud/storage');
  const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
  const storage=new Storage({authClient:await auth.getClient(),projectId:'impro-selector'});
  const source=createGcsSource({storage,auth,expectedPrincipal:process.env.ADVENT_OPERATOR_PRINCIPAL});
  const bucket=storage.bucket('impro-selector-avent-content-private');
  async function verify(){
    await source.verify(true);
    const [p]=await bucket.iam.testPermissions(['storage.objects.get','storage.objects.create','storage.objects.update']);
    if (!['storage.objects.get','storage.objects.create','storage.objects.update'].every(x=>p[x]===true)) refuse();
  }
  await verify();
  const plan=await prepareExtra(bucket,entry,portrait);
  const digest=createHash('sha256').update(plan.outputBytes).update(plan.portraitBytes).digest('hex');
  const phrase=`CAPTURER ${digest.slice(0,16)}`;
  writeFileSync('/dev/tty', `\nUnique ajout au catalogue privé (à relire) :\n${JSON.stringify(entry,null,2)}\n`);
  console.log(`Contribution préparée ; génération source ${plan.sourceGeneration} ; condensat ${digest}. Relire les fichiers privés et vérifier les textes et le portrait avant confirmation.`);
  const prompt=createInterface({input:stdin,output:stdout});let answer;
  try {answer=await prompt.question(`Pour publier ce plan, saisir ${phrase} : `);} finally {prompt.close();}
  if (answer!==phrase) refuse();
  if (!(await readPrivate(process.argv[2],2_000_000)).equals(entryBytes) || !(await readPrivate(process.argv[3],5_000_000)).equals(portrait)) refuse();
  await verify();
  const result=await applyExtra(bucket,plan);
  console.log(`Catalogue privé vérifié ; génération ${result.generation}. Aucune base synchronisée.`);
}
main().catch(()=>{console.error('Capture refusée ou interrompue. Vérifier le catalogue et le portrait avant toute reprise.');process.exitCode=1;});
