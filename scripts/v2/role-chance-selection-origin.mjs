/** Infer current slot origins only from ordered, unambiguous audit evidence. */
export function inferSelectionOrigins(audits, slots) {
 const state=new Map();
 const key=(event,role,index)=>`${event}|${role}|${index}`;
 const counts=new Map();
 for(const a of audits){if(a.action_type==='COMPOSITION_LIFECYCLE_CHANGED')continue;const k=`${a.event_id}|${a.occurred_at}`;counts.set(k,(counts.get(k)||0)+1)}
 for(const a of audits){
  const before=a.before_json||{},after=a.after_json||{},meta=a.metadata_json||{};
  if(a.action_type==='SLOT_ASSIGNED'){
   const role=meta.roleKey||after.roleKey, index=meta.slotIndex??after.slotIndex, id=after.participantId||after.seasonParticipantId||after.eventParticipantId;
   if(role==null||index==null||!id) continue;
   const beforeId=before.participantId||before.seasonParticipantId||before.eventParticipantId;
   if(beforeId===id) continue;
   state.set(key(a.event_id,role,index),{participantId:id,origin:counts.get(`${a.event_id}|${a.occurred_at}`)>1?'unknown':'manual',at:a.occurred_at});
  } else if(a.action_type==='SLOT_CLEARED'||a.action_type==='SLOT_DELETED'){
   const role=meta.roleKey||before.roleKey,index=meta.slotIndex??before.slotIndex;
   if(role!=null&&index!=null){
    state.delete(key(a.event_id,role,index));
    if(a.action_type==='SLOT_DELETED' && meta.outsideModel!==true){
     const prefix=`${a.event_id}|${role}|`;
     const moved=[...state.entries()].filter(([k])=>k.startsWith(prefix)&&Number(k.slice(prefix.length))>index).sort((a,b)=>Number(a[0].slice(prefix.length))-Number(b[0].slice(prefix.length)));
     for(const [k,value] of moved){state.delete(k);state.set(key(a.event_id,role,Number(k.slice(prefix.length))-1),value)}
    }
   }
  } else if(a.action_type==='COMPOSITION_DRAW_COMPLETED'){
   for(const [role, entries] of Object.entries(after.assignmentsByRole||{}))for(const entry of entries||[]){
    const k=key(a.event_id,role,entry.slotIndex),old=(before.assignmentsByRole?.[role]||[]).find(x=>x.slotIndex===entry.slotIndex);
    const previous=state.get(k),changed=!old||old.participantId!==entry.participantId;
    const ambiguous=counts.get(`${a.event_id}|${a.occurred_at}`)>1;
    state.set(k,{participantId:entry.participantId,origin:!ambiguous&&(changed||(previous?.participantId===entry.participantId&&previous.origin==='draw'))?'draw':'unknown',at:a.occurred_at});
   }
   // Removed roles/slots cannot carry their former selection forward.
   for(const [role,entries] of Object.entries(before.assignmentsByRole||{}))for(const entry of entries||[]){
    if(!(after.assignmentsByRole?.[role]||[]).some(x=>x.slotIndex===entry.slotIndex))state.delete(key(a.event_id,role,entry.slotIndex));
   }
  }
 }
 return slots.map(slot=>{const id=slot.season_participant_id||slot.event_participant_id,found=state.get(key(slot.event_id,slot.role_key,slot.slot_index));
  const observed=['manual','draw'].includes(slot.selection_chance_source)?slot.selection_chance_source:null;
  return {eventId:slot.event_id,role:slot.role_key,slotIndex:slot.slot_index,participantId:id,origin:observed|| (found?.participantId===id?found.origin:'unknown'),provenance:observed?'observed':'reconstructed',evidenceAt:observed?null:(found?.participantId===id?found.at:null)};
 });
}
