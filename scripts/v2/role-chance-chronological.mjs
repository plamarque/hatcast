/** Audit replay. Unknowns remain explicit: events with equal timestamps are NOT strictly ordered. */
const ROLE_ORDER=['referee','dj','mc','player','assistant_referee','coach','stage_manager','lighting','volunteer'];
const coll=new Intl.Collator('fr',{sensitivity:'base'});
/** Formula V1 expected-removal approximation as implemented in production, not proof that it was selected historically. */
export function v1Chances(candidates, places) {
 const sorted=[...candidates].sort((a,b)=>coll.compare(a.name||'',b.name||'')),weights=sorted.map(x=>places/(1+x.pastValidatedCount)), total=weights.reduce((a,b)=>a+b,0);
 return sorted.map((x,i)=>{let p=0;if(places>=sorted.length)p=1;else if(total<=0||places<=0)p=0;else if(places===1)p=weights[i]/total;else if(weights.every(w=>Math.abs(w-weights[i])<.0001))p=places/sorted.length;else{let rem=sorted.map((_,j)=>j),t=total,not=1;for(let k=0;k<places;k++){if(rem.length<=1)break;not*=1-weights[i]/t;const others=rem.filter(j=>j!==i),otherTotal=t-weights[i];const removed=others.length&&otherTotal>0?others.reduce((a,j)=>a+(weights[j]/t)*weights[j],0):otherTotal/Math.max(1,others.length);t-=removed;if(others.length){let closest=others.reduce((a,b)=>Math.abs(weights[b]-removed)<Math.abs(weights[a]-removed)?b:a);rem=rem.filter(j=>j!==closest)}}p=Math.max(0,Math.min(1,1-not))}return {...x,estimatedPercent:Math.round(p*100)}});
}
export function replay(audits, identities) {
 const byId=new Map(identities.map(x=>[x.id,x]));
 const byUser = new Map(); for (const i of identities.filter(x=>x.user_id)) { const list=byUser.get(i.user_id)||[]; list.push(i); byUser.set(i.user_id,list); }
 function resolveIdentity(a) { const id=a.subject_season_participant_id||a.subject_event_participant_id; if(id){const i=byId.get(id);return i && (!i.eventId || i.eventId===a.event_id) ? i : null;} const matches=(byUser.get(a.subject_user_id)||[]).filter(i=>!i.eventId || i.eventId===a.event_id); const members=matches.filter(i=>!i.eventId); return members.length===1?members[0]:(matches.length===1?matches[0]:null); }
 const events=new Map(),results=[], gaps=[]; const get=id=>{if(!events.has(id))events.set(id,{config:{},availability:new Map(),uncertainVotes:new Set(),unresolvedIdentity:false,slots:new Map(),uncertainSlots:new Set(),uncertainLifecycle:false,validated:false});return events.get(id)};
 const atCount=new Map(),voteCounts=new Map(),slotCounts=new Map(),lifecycleCounts=new Map();for(const a of audits){if(a.action_type!=='COMPOSITION_LIFECYCLE_CHANGED')atCount.set(a.occurred_at,(atCount.get(a.occurred_at)||0)+1);if(a.action_type.startsWith('AVAILABILITY_')){const i=resolveIdentity(a);const k=[a.event_id,i?.id||'unresolved',a.occurred_at].join('|');voteCounts.set(k,(voteCounts.get(k)||0)+1)}if(a.action_type==='COMPOSITION_VALIDATED'||a.action_type==='COMPOSITION_UNLOCKED'){const k=[a.event_id,a.occurred_at].join('|');lifecycleCounts.set(k,(lifecycleCounts.get(k)||0)+1)}if(a.action_type.startsWith('SLOT_')||a.action_type.startsWith('PARTICIPATION_')){const b=a.before_json||{},v=a.after_json||{},m=a.metadata_json||{},role=m.roleKey||v.roleKey||b.roleKey,idx=m.slotIndex??v.slotIndex??b.slotIndex;if(role!=null&&idx!=null){const k=[a.event_id,role,idx,a.occurred_at].join('|');slotCounts.set(k,(slotCounts.get(k)||0)+1)}}}
 function applySlots(e,assignments){const previous=e.slots;const next=new Map();for(const [role,slots] of Object.entries(assignments||{}))for(const s of slots||[]){const key=role+':'+s.slotIndex,prior=previous.get(key);next.set(key,{role,participantId:s.participantId,status:prior?.participantId===s.participantId?prior.status:'UNKNOWN'});}e.slots=next;}
 // Reorder tied votes only when their before/after states establish one unique
 // chain from the known prior state. Never infer a sequence from UUID order.
 const resolvedVoteTies=new Set();
 function voteState(v){if(!v)return null;if(typeof v.status!=='string'||!Array.isArray(v.roleKeys))return undefined;return JSON.stringify([v.status,[...v.roleKeys].sort()]);}
 function uniqueVoteSequence(items,initial){
  if(items.length>7||initial===undefined)return null;
  const matches=[];
  function visit(pending,state,ordered){
   if(matches.length>1)return;
   if(!pending.length){matches.push(ordered);return;}
   for(let i=0;i<pending.length;i++){
    const a=pending[i],before=voteState(a.before_json),after=voteState(a.after_json);
    const valid=a.action_type==='AVAILABILITY_CREATED'?state===null&&after!==null&&after!==undefined:
      a.action_type==='AVAILABILITY_UPDATED'?before!==undefined&&before!==null&&state===before&&after!==null&&after!==undefined:
      a.action_type==='AVAILABILITY_DELETED'?before!==undefined&&before!==null&&state===before:false;
    if(!valid)continue;
    const next=a.action_type==='AVAILABILITY_DELETED'?null:after;
    visit(pending.filter((_,j)=>j!==i),next,[...ordered,a]);
   }
  }
  visit(items,initial,[]);return matches.length===1?matches[0]:null;
 }
 function* orderedAudits(){
  for(let i=0;i<audits.length;){let end=i+1;while(end<audits.length&&audits[end].occurred_at===audits[i].occurred_at)end++;
   const group=audits.slice(i,end),votes=new Map();
   for(let j=0;j<group.length;j++){const a=group[j];if(!a.action_type.startsWith('AVAILABILITY_'))continue;const identity=resolveIdentity(a);if(!identity)continue;const key=[a.event_id,identity.id,a.occurred_at].join('|'),entry=votes.get(key)||{indexes:[],event:a.event_id,id:identity.id};entry.indexes.push(j);votes.set(key,entry);}
   for(const [key,entry] of votes){if(entry.indexes.length<2)continue;const current=get(entry.event).availability.get(entry.id);const ordered=uniqueVoteSequence(entry.indexes.map(j=>group[j]),voteState(current));if(ordered){entry.indexes.forEach((j,n)=>{group[j]=ordered[n]});resolvedVoteTies.add(key)}}
   yield* group;i=end;
  }
 }
 for(const a of orderedAudits()){
const e=get(a.event_id),b=a.before_json||{},v=a.after_json||{},m=a.metadata_json||{}; const type=a.action_type;
  if(type==='EVENT_CREATED'){e.config={...v};continue} if(type==='EVENT_UPDATED'){Object.assign(e.config,v);continue}
  if(type.startsWith('AVAILABILITY_')){const identity=resolveIdentity(a);if(!identity){e.unresolvedIdentity=true;gaps.push({event:a.event_id,at:a.occurred_at,issue:'user_to_participant_unresolved'});continue}const prev=e.availability.get(identity.id);if(type!=='AVAILABILITY_CREATED'&&!prev)gaps.push({event:a.event_id,at:a.occurred_at,since:null,issue:'availability_prior_missing'});if(prev&&type!=='AVAILABILITY_CREATED'&&(prev.status!==b.status||JSON.stringify([...(prev.roleKeys||[])].sort())!==JSON.stringify([...(b.roleKeys||[])].sort())))gaps.push({event:a.event_id,at:a.occurred_at,since:prev.at||null,issue:'availability_before_mismatch'});const voteKey=[a.event_id,identity.id,a.occurred_at].join('|');const tied=(voteCounts.get(voteKey)||0)>1&&!resolvedVoteTies.has(voteKey);const afterComplete=type==='AVAILABILITY_DELETED'||(typeof v.status==='string'&&Array.isArray(v.roleKeys));if(tied||!afterComplete)e.uncertainVotes.add(identity.id);else e.uncertainVotes.delete(identity.id);if(type==='AVAILABILITY_DELETED')e.availability.delete(identity.id);else e.availability.set(identity.id,{status:v.status,roleKeys:v.roleKeys||[],at:a.occurred_at});continue}
  if(type==='COMPOSITION_VALIDATED'||type==='COMPOSITION_UNLOCKED'){e.uncertainLifecycle=(lifecycleCounts.get([a.event_id,a.occurred_at].join('|'))||0)>1;e.validated=!!v.validatedAt;continue}
  if(type==='COMPOSITION_DRAW_COMPLETED'||type==='SLOT_ASSIGNED'){
   const roles=type==='SLOT_ASSIGNED'?[m.roleKey||v.roleKey]:ROLE_ORDER.filter(role=>{const before=(b.assignmentsByRole||{})[role]||[],after=(v.assignmentsByRole||{})[role]||[]; return after.some(x=>!before.some(y=>y.slotIndex===x.slotIndex&&y.participantId===x.participantId))});
   for(const role of roles.filter(Boolean)){
    const pool=[];for(const [id,av] of e.availability)if(av.status==='available'&&(!av.roleKeys.length||av.roleKeys.includes(role))){let history=0;for(const [otherId,other] of events){if(otherId===a.event_id||!other.validated||other.config.archived)continue;const category=c=>c.category??(c.templateType==='deplacement'?'deplacements':'principal');if(category(other.config)!==category(e.config))continue;for(const s of other.slots.values())if(s.participantId===id&&s.role===role&&String(s.status).toUpperCase()!=='DECLINED')history++}pool.push({participantId:id,name:byId.get(id)?.display_name||null,pastValidatedCount:history})}
    const count=e.config.roleSlots?.[role]??null; let eligible=pool;
    if(type==='COMPOSITION_DRAW_COMPLETED'){const previous=ROLE_ORDER.slice(0,ROLE_ORDER.indexOf(role)).flatMap(r=>(v.assignmentsByRole?.[r]||[]).map(x=>x.participantId));eligible=eligible.filter(x=>!previous.includes(x.participantId))}
    else {const occupied=[...e.slots.values()].filter(x=>x.role===role).map(x=>x.participantId);eligible=eligible.filter(x=>!occupied.includes(x.participantId))}
    const beforeNonempty=type==='COMPOSITION_DRAW_COMPLETED'&&Object.values(b.assignmentsByRole||{}).some(x=>x.length);
    const selected=type==='COMPOSITION_DRAW_COMPLETED'?(v.assignmentsByRole?.[role]||[]).map(x=>x.participantId):[v.participantId||v.seasonParticipantId].filter(Boolean); const selectedMissing=selected.some(id=>!eligible.some(x=>x.participantId===id));const estimated=Number.isInteger(count)&&count>0&&eligible.length&&!beforeNonempty&&!selectedMissing?v1Chances(eligible,count):null;
    const eventStateUncertain=e.unresolvedIdentity||e.uncertainVotes.size>0;
    const category=c=>c.category??(c.templateType==='deplacement'?'deplacements':'principal');
    const historyOrderUncertain=[...events].some(([otherId,other])=>otherId!==a.event_id&&category(other.config)===category(e.config)&&(other.uncertainLifecycle||(other.validated&&other.uncertainSlots.size>0)));
    const ownSlotsUncertain=e.uncertainSlots.size>0;
    results.push({eventId:a.event_id,at:a.occurred_at,decision:type,role,required:count,candidates:pool,estimateV1:estimated,unknowns:['historical_formula_unattested','historical_roster_unverified','historical_slot_status_unverified','draw_exclusions_and_completeness_unverified',...(beforeNonempty?['preexisting_assignments_draw_mode_ambiguous']:[]),...(selectedMissing?['selected_not_in_rebuilt_pool']:[]),...(atCount.get(a.occurred_at)>1?['same_timestamp_order_unresolved']:[]),...(eventStateUncertain?['event_history_inconsistent']:[]),...(historyOrderUncertain?['history_order_ambiguous']:[]),...(ownSlotsUncertain?['assignment_order_ambiguous']:[])]});
   }
   if(type==='COMPOSITION_DRAW_COMPLETED'){applySlots(e,v.assignmentsByRole);continue}
  }
  if(type.startsWith('SLOT_')||type.startsWith('PARTICIPATION_')){const role=m.roleKey||v.roleKey||b.roleKey,idx=m.slotIndex??v.slotIndex??b.slotIndex;if(role!=null&&idx!=null){const slotKey=role+':'+idx,tie=(slotCounts.get([a.event_id,role,idx,a.occurred_at].join('|'))||0)>1;if(tie)e.uncertainSlots.add(slotKey);else e.uncertainSlots.delete(slotKey)}}
  if(type==='SLOT_ASSIGNED'||type==='SLOT_CLEARED'||type==='SLOT_DELETED'){let role=m.roleKey||v.roleKey||b.roleKey,idx=m.slotIndex??v.slotIndex??b.slotIndex;if(role!=null&&idx!=null){const key=role+':'+idx,p=v.participantId||v.seasonParticipantId;if(p)e.slots.set(key,{role,participantId:p,status:v.participationStatus||'UNKNOWN'});else e.slots.delete(key);
    if(type==='SLOT_DELETED'&&m.outsideModel!==true){const moved=[...e.slots.entries()].filter(([k,x])=>x.role===role&&Number(k.slice(role.length+1))>idx).sort((a,b)=>Number(a[0].slice(role.length+1))-Number(b[0].slice(role.length+1)));for(const [k,slot] of moved){const oldIndex=Number(k.slice(role.length+1));e.slots.delete(k);e.slots.set(role+':'+(oldIndex-1),slot)}const shifted=new Set();for(const k of e.uncertainSlots){if(!k.startsWith(role+':'))shifted.add(k);else{const n=Number(k.slice(role.length+1));if(n<idx)shifted.add(k);else if(n>idx)shifted.add(role+':'+(n-1))}}e.uncertainSlots=shifted}
   }continue}
  if(type.startsWith('PARTICIPATION_')){let key=(v.roleKey||b.roleKey)+':'+(v.slotIndex??b.slotIndex),slot=e.slots.get(key);if(slot)slot.status=v.participationStatus||'UNKNOWN'}
 }
 // A later before-state mismatch proves that an earlier interval is incomplete.
 // Invalidate affected past decisions; the complete after-state restores certainty for later ones.
 for(const d of results){const affected=gaps.some(g=>g.event===d.eventId&&['availability_prior_missing','availability_before_mismatch'].includes(g.issue)&&(!g.since||d.at>=g.since)&&d.at<=g.at);if(affected&&!d.unknowns.includes('event_history_inconsistent'))d.unknowns.push('event_history_inconsistent')}
 return {decisions:results,gaps,availabilityEvents:audits.filter(x=>x.action_type.startsWith('AVAILABILITY_')).length};
}
