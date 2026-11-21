import {v1Chances} from './role-chance-chronological.mjs';
export const ORDER=['referee','dj','mc','player','assistant_referee','coach','stage_manager','lighting','volunteer'];
const unchanged=(b,a)=>b.every(x=>a.some(y=>x.slotIndex===y.slotIndex&&x.participantId===y.participantId));
export function scenarios(d,a){
 if(!d||!Number.isInteger(d.required)||d.required<=0)return [];
 if(d.decision!=='COMPOSITION_DRAW_COMPLETED')return d.estimateV1?.length?[{mode:'sélection manuelle',values:d.estimateV1,issues:d.unknowns}]:[];
 const before=a?.before_json?.assignmentsByRole??{},after=a?.after_json?.assignmentsByRole??{}, old=before[d.role]??[],end=after[d.role]??[];
 const retained=unchanged(old,end), fullOld=old.length>=d.required;
 const modes=[];
 if(retained&&old.length>0&&old.length<d.required)modes.push('compléter les places libres');
 if(fullOld)modes.push('retirer le rôle en entier');
 if(!old.length&&modes.length===0)modes.push('premier tirage');
 const index=ORDER.indexOf(d.role); const other=[...ORDER.slice(0,index).flatMap(r=>after[r]??[]),...ORDER.slice(index+1).flatMap(r=>before[r]??[])];
 const changed=end.filter(x=>!old.some(b=>b.slotIndex===x.slotIndex&&b.participantId===x.participantId));
 return modes.map(mode=>{
  const excluded=new Set(other.map(x=>x.participantId)); if(mode==='compléter les places libres')for(const x of old)excluded.add(x.participantId);
  const pool=d.candidates.filter(c=>!excluded.has(c.participantId));
  const missing=changed.filter(x=>!pool.some(c=>c.participantId===x.participantId)).map(x=>x.participantId);
  // Reconstruct the complete role reference; the actual draw pool is checked separately.
  const values=d.candidates.length?v1Chances(d.candidates,d.required):[];
  return {mode,values,issues:[...d.unknowns,...(missing.length?['selected_not_in_scenario_pool']:[])],missingSelected:missing};
 });
}
