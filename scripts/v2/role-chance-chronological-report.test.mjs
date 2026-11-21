import {test} from 'node:test';
import assert from 'node:assert/strict';
import {report,replayRoleTimeline,ALLOWED_SEASON_ID as seasonId} from './role-chance-chronological-report.mjs';
const e='event', id='participant';
const sample=()=>({seasonId,events:[{id:e,seasonId,title:'Spectacle',assignedRoles:['player']}],identities:[{id,user_id:'user',display_name:'A',seasonId}],audits:[
 {event_id:e,action_type:'EVENT_CREATED',occurred_at:'2026-09-01T10:00:00Z',after_json:{roleSlots:{player:1}}},
 {event_id:e,action_type:'AVAILABILITY_CREATED',occurred_at:'2026-09-02T10:00:00Z',subject_user_id:'user',after_json:{status:'available',roleKeys:['player']}},
 {event_id:e,action_type:'SLOT_ASSIGNED',occurred_at:'2026-09-03T10:00:00Z',after_json:{participantId:id,roleKey:'player',slotIndex:0},metadata_json:{roleKey:'player',slotIndex:0}},
]});
test('scoped selected draft is included but no estimate is authorised to write',()=>{const r=report(sample(),seasonId);assert.equal(r.roles.length,1);assert.equal(r.roles[0].estimates[0].values[0].estimatedPercent,100);assert.equal(r.roles[0].authorisedForWrite,false)});
test('requires explicit authorised season and rejects out-of-season evidence',()=>{let s=sample();assert.throws(()=>report(s,'other'));s.events[0].seasonId='other';assert.throws(()=>report(s,seasonId));s=sample();s.audits[0].event_id='outside';assert.throws(()=>report(s,seasonId));s=sample();s.identities[0].seasonId='other';assert.throws(()=>report(s,seasonId));});
test('orders real decision chronology even when input is out of order',()=>{let s=sample();s.audits.reverse();assert.equal(report(s,seasonId).roles[0].estimates[0].values[0].estimatedPercent,100)});
test('does not choose silently between same-time same-type decisions',()=>{let s=sample();s.audits.push({...s.audits[2]});const role=report(s,seasonId).roles[0];assert.ok(role.issues.includes('decision_audit_ambiguous'));assert.deepEqual(role.estimates,[])});
test('rejects duplicate identity mappings rather than choosing arbitrarily',()=>{let s=sample();s.identities.push({...s.identities[0],id:'other'});assert.throws(()=>report(s,seasonId),/Ambiguous participant/)});
test('allows the same user to have separately scoped season and event identities',()=>{let s=sample();s.identities.push({id:'guest',user_id:'user',eventId:'event',display_name:'Guest',seasonId});assert.equal(report(s,seasonId).roles[0].estimates[0].values[0].participantId,'participant')});

test('the replay retains earlier draw candidates and updates only the later manual selection',()=>{const candidates=[{participantId:'a',name:'A',pastValidatedCount:0},{participantId:'b',name:'B',pastValidatedCount:0}];const ds=[{eventId:e,role:'player',decision:'COMPOSITION_DRAW_COMPLETED',at:'1',required:1,candidates,unknowns:[]},{eventId:e,role:'player',decision:'SLOT_ASSIGNED',at:'2',estimateV1:[{...candidates[1],estimatedPercent:70}],unknowns:[]}];const audits=[{event_id:e,action_type:'COMPOSITION_DRAW_COMPLETED',occurred_at:'1',before_json:{assignmentsByRole:{}},after_json:{assignmentsByRole:{player:[{slotIndex:0,participantId:'a'}]}}},{event_id:e,action_type:'SLOT_ASSIGNED',occurred_at:'2',after_json:{participantId:'b'}}];const out=replayRoleTimeline(ds,audits,e,'player');assert.deepEqual(out.map(v=>[v.participantId,v.estimatedPercent,v.origin]),[['a',50,'draw'],['b',70,'manual']])});

test('the first manual selection records the full candidate pool',()=>{const ds=[{eventId:e,role:'player',decision:'SLOT_ASSIGNED',at:'1',estimateV1:[{participantId:'a',estimatedPercent:50},{participantId:'b',estimatedPercent:50}],unknowns:[]}];const audits=[{event_id:e,action_type:'SLOT_ASSIGNED',occurred_at:'1',after_json:{participantId:'a'}}];assert.deepEqual(replayRoleTimeline(ds,audits,e,'player').map(v=>v.participantId),['a','b'])});
