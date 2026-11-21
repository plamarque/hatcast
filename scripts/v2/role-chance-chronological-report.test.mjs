import {test} from 'node:test';
import assert from 'node:assert/strict';
import {report,ALLOWED_SEASON_ID as seasonId} from './role-chance-chronological-report.mjs';
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
