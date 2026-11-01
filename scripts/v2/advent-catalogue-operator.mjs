import {randomBytes} from 'node:crypto';
import {compareWorkflow,applyWorkflow} from './advent-catalogue-workflow.mjs';

// The plan stays in memory: neither source content nor fingerprints are printed.
export async function runOperator(source,target,days,{write,confirm,authorizeProduction,describeTarget,beforeApply=async()=>{},environment='development'}) {
  const plan=await compareWorkflow(source,target,days);
  write(`Cible vérifiée : ${environment}. Résumé privé sans contenu :`);
  if(describeTarget)write(describeTarget(plan.comparison.identity));
  for(const item of plan.comparison.statuses)write(`Jour ${item.day} : ${item.status}`);
  write(`Portraits : ${plan.comparison.portraits.filter(p=>p.status==='addition').length} à créer, ${plan.comparison.portraits.filter(p=>p.status==='unchanged').length} identiques.`);
  const daysToReplace=plan.comparison.statuses.filter(p=>p.status==='divergence').map(p=>p.day).sort((a,b)=>a-b);
  const portraitConflicts=plan.comparison.portraits.filter(p=>p.status==='divergence').length;
  if(portraitConflicts){write('Conflit de portrait. Résoudre confidentiellement puis refaire la comparaison ; aucune modification.');return 'conflict';}
  const phrase=daysToReplace.length ? `REMPLACER ${daysToReplace.join(',')}` : 'APPLIQUER';
  if(await confirm(phrase)!==phrase){write('Application annulée ; aucune modification effectuée.');return 'cancelled';}
  if(environment==='production') {
    if(typeof authorizeProduction!=='function')throw Error('Production authorization required');
    const code=randomBytes(12).toString('hex');
    const authorization=`AUTORISER PRODUCTION ${code}`;
    if(await authorizeProduction(authorization)!==authorization){write('Autorisation de production refusée ; aucune modification.');return 'cancelled';}
  }
  await beforeApply();
  await applyWorkflow(source,target,plan,daysToReplace);
  write('Synchronisation terminée. Refaire une comparaison pour vérifier les états.');
  return 'applied';
}

// Separate read-only route: it has no apply callback or write-capable target methods.
export async function compareProduction(source,target,days,write) {
 const plan=await compareWorkflow(source,target,days);
 write('Cible vérifiée : production. Comparaison en lecture seule :');
 for(const item of plan.comparison.statuses)write(`Jour ${item.day} : ${item.status}`);
 for(const status of ['addition','unchanged','divergence'])write(`Portraits ${status} : ${plan.comparison.portraits.filter(p=>p.status===status).length}`);
 return 'compared';
}
