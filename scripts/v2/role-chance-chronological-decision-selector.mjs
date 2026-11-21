/** First documented selection, superseded only by a later observed changed draw of that role.
 * Unchanged role at a subsequent draw is ambiguous: it could have been targeted and selected identically.
 */
export function selectDecision(decisions,draws,eventId,role){
 const list=decisions.filter(d=>d.eventId===eventId&&d.role===role).sort((a,b)=>a.at.localeCompare(b.at));
 if(!list.length)return {selected:null,uncertainties:['no_attested_selection']};
 let selected=list[0];for(const d of list.slice(1))if(d.decision==='COMPOSITION_DRAW_COMPLETED')selected=d;
 const uncertainties=[];
 for(const draw of draws.filter(a=>a.event_id===eventId&&a.action_type==='COMPOSITION_DRAW_COMPLETED'&&a.occurred_at>=selected.at)){
  const before=draw.before_json?.assignmentsByRole?.[role]||[],after=draw.after_json?.assignmentsByRole?.[role]||[];
  if(before.length&&JSON.stringify(before)===JSON.stringify(after)&&draw.occurred_at>selected.at)uncertainties.push('later_draw_may_have_redrawn_same_role_without_change');
  const beforeSet=before.map(x=>x.participantId).sort().join(','),afterSet=after.map(x=>x.participantId).sort().join(',');
  if(draw.occurred_at===selected.at&&before.length&&beforeSet===afterSet&&JSON.stringify(before)!==JSON.stringify(after))uncertainties.push('changed_slots_with_same_participants_may_be_reordering');
 }
 return {selected,uncertainties:[...new Set(uncertainties)]};
}
