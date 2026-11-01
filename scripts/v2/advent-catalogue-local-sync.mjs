#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {stdin,stdout} from 'node:process';
import {createInterface} from 'node:readline/promises';
import {createGcsSource} from './advent-catalogue-gcs-source.mjs';
import {applyLocal,deleteLocalDays,applyLocalContent} from './advent-catalogue-local-apply.mjs';
const require=createRequire(import.meta.url);
const refuse=()=>{throw Error('Local synchronization refused')};
async function main(){
 const operation=['character','quiz','delete'].includes(process.argv[2])?process.argv[2]:null,deletion=operation==='delete',offset=operation?1:0;
 if(!operation||process.argv.length!==4+offset||process.argv[2+offset]!=='local'||!stdin.isTTY||!stdout.isTTY)refuse();
 const days=process.argv[3+offset].split(',').map(s=>/^([1-9]|1[0-9]|2[0-4])$/.test(s)?Number(s):NaN);
 if(days.some(Number.isNaN)||new Set(days).size!==days.length)refuse();
 const root=await fs.realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'));
 const local=path.join(root,'.local'),dbdir=path.join(local,'hatcast-offline'),portraitDir=path.join(local,'hatcast-avent-test');
 for(const dir of [local,dbdir,portraitDir]) {const stat=await fs.lstat(dir);if(!stat.isDirectory()||stat.isSymbolicLink()||await fs.realpath(dir)!==dir||stat.uid!==process.getuid()||(stat.mode&0o077))refuse();}
 const database=path.join(dbdir,'hatcast'),stat=await fs.lstat(`${database}.mv.db`);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==process.getuid()||(stat.mode&0o077)||await fs.realpath(`${database}.mv.db`)!==`${database}.mv.db`)refuse();
 const jar=await fs.realpath(process.env.ADVENT_H2_JAR||'');if(!jar.endsWith('.jar')||!(await fs.stat(jar)).isFile())refuse();
 if(deletion){await deleteLocalDays({days,database,jar,write:s=>console.log(s),confirm:async phrase=>{const prompt=createInterface({input:stdin,output:stdout});try{return await prompt.question(`Pour supprimer les jours et leurs parties, saisir ${phrase} : `);}finally{prompt.close();}}});return;}
 const principal=process.env.ADVENT_OPERATOR_PRINCIPAL || process.env.ADVENT_OPERATOR_SERVICE_ACCOUNT;if(!principal)refuse();
 const {GoogleAuth}=require('google-auth-library'),{Storage}=require('@google-cloud/storage');
 const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}),google=await auth.getClient(),storage=new Storage({authClient:google});
 const source=createGcsSource({storage,auth,expectedPrincipal:principal});
 if(operation){await applyLocalContent({source,days,operation,database,portraitDir,jar,write:s=>console.log(s),confirm:async phrase=>{const prompt=createInterface({input:stdin,output:stdout});try{return await prompt.question(`Pour appliquer, saisir ${phrase} : `);}finally{prompt.close();}}});return;}
 await applyLocal({source,days,database,portraitDir,jar,write:s=>console.log(s),confirmReplacement:async days=>{const prompt=createInterface({input:stdin,output:stdout});try{return await prompt.question(`Pour remplacer les jours divergents, saisir REMPLACER ${days.join(',')} : `);}finally{prompt.close();}},confirm:async()=>{const prompt=createInterface({input:stdin,output:stdout});try{return await prompt.question('Pour appliquer ce plan local, saisir APPLIQUER : ');}finally{prompt.close();}}});
}
main().catch(()=>{console.error('Synchronisation locale refusée ou interrompue ; conserver les portraits et refaire la comparaison. Vérifier les protections temporaires de source selon la procédure.');process.exitCode=1;});
