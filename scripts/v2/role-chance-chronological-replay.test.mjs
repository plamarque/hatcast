import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runChronologicalReplay,assessRole,validateDevelopmentUrl,DEVELOPMENT_BRANCH} from './role-chance-chronological-replay.mjs';
import {ALLOWED_SEASON_ID as seasonId} from './role-chance-chronological-report.mjs';
const a=(type,date,extra={})=>({id:type,event_id:'event',action_type:type,occurred_at:date,...extra});
function client({branch=DEVELOPMENT_BRANCH,observed=false,existing=false,invalidSelection=false}={}){
 const calls=[];const audits=[a('EVENT_CREATED','2026-09-01T10:00:00Z',{after_json:JSON.stringify({roleSlots:{player:1}})}),a('AVAILABILITY_CREATED','2026-09-02T10:00:00Z',{subject_user_id:'u',after_json:JSON.stringify({status:'available',roleKeys:['player']})}),a('SLOT_ASSIGNED','2026-09-03T10:00:00Z',{after_json:JSON.stringify({participantId:invalidSelection?'unknown':'p',roleKey:'player',slotIndex:0}),metadata_json:JSON.stringify({roleKey:'player',slotIndex:0})})];
 return {calls,async query(sql,params){calls.push({sql,params});
  if(sql.includes('current_setting'))return {rows:[{branch,version:'89'}]};
  if(sql.includes('COALESCE(array_agg'))return {rows:[{id:'event',title:'Exemple',season_id:seasonId,validated_at:null,assigned_roles:['player']}]};
  if(sql.startsWith('SELECT id,display_name,user_id FROM season_participants'))return {rows:[{id:'p',user_id:'u',display_name:'A'}]};
  if(sql.startsWith('SELECT p.id,p.display_name'))return {rows:[]};
  if(sql.startsWith('SELECT a.id,a.event_id'))return {rows:audits};
  if(sql.startsWith('SELECT captured_at'))return {rows:observed?[{captured_at:'2026-01-01'}]:[]};
  if(sql.startsWith('SELECT season_participant_id'))return {rows:[{selection_chance_percent:73}]};
  if(sql.startsWith('SELECT participant_id,chance_percent'))return {rows:[]};
  if(sql.startsWith('INSERT INTO event_role_chance_reconstructions'))return {rowCount:existing?0:1,rows:[]};
  return {rows:[]};
 }};
}
test('rejects an unapproved season before starting a transaction',async()=>{let c=client();await assert.rejects(runChronologicalReplay(c,'wrong'),/saison/);assert.equal(c.calls.length,0)});
test('rejects production before any evidence query or data writes',async()=>{let c=client({branch:'production'});await assert.rejects(runChronologicalReplay(c,seasonId),/cible/);assert.equal(c.calls.at(-1).sql,'ROLLBACK');assert.ok(!c.calls.some(x=>x.sql.startsWith('INSERT')))});
test('development preserves individual evidence and creates one separate reconstruction',async()=>{let c=client();let r=await runChronologicalReplay(c,seasonId);assert.equal(r.results[0].result,'reconstructed');assert.equal(r.results[0].individualChances[0].selection_chance_percent,73);assert.equal(c.calls.filter(x=>x.sql.startsWith('INSERT INTO event_role_chance_reconstruction_entries')).length,1);assert.equal(c.calls.at(-1).sql,'COMMIT');assert.ok(c.calls.find(x=>x.sql.includes('FOR UPDATE OF c')))});
test('observed capture and existing reconstruction are never overwritten',async()=>{for(const options of [{observed:true},{existing:true}]){let c=client(options),r=await runChronologicalReplay(c,seasonId);assert.equal(r.results[0].result,options.observed?'observed_preserved':'existing_preserved');assert.ok(!c.calls.some(x=>x.sql.startsWith('INSERT INTO event_role_chance_reconstruction_entries')))}});
test('missing selected participant is reported and never written',async()=>{let c=client({invalidSelection:true}),r=await runChronologicalReplay(c,seasonId);assert.equal(r.results[0].result,'unavailable');assert.ok(!c.calls.some(x=>x.sql.startsWith('INSERT')))});
test('a decision with multiple alternative scenarios is not silently chosen',()=>{assert.equal(assessRole({estimates:[{},{}],issues:[]}).writable,false)});
test('ties affecting a decision or inconsistent availability block persistence',()=>{const base={estimates:[{values:[{participantId:'p',estimatedPercent:50}],missingSelected:[]}],issues:[]};assert.equal(assessRole({...base,issues:['same_timestamp_order_unresolved']}).writable,false);assert.equal(assessRole({...base,issues:['event_history_inconsistent']}).writable,false)});
test('conflicting earlier history and assignment ordering block persistence',()=>{const base={estimates:[{values:[{participantId:'p',estimatedPercent:50}],missingSelected:[]}],issues:[]};for(const issue of ['history_order_ambiguous','assignment_order_ambiguous'])assert.equal(assessRole({...base,issues:[issue]}).writable,false)});

test('development URL accepts only the expected Neon host and postgres scheme',()=>{for(const h of ['ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech','ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech'])assert.ok(validateDevelopmentUrl('postgresql://user:pass@'+h+'/neondb'));for(const u of [undefined,'invalid','https://ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech','postgresql://user@ep-cold-poetry-al3m3lxk.c-3.eu-central-1.aws.neon.tech/db','postgresql://user@ep-plain-mode-al95cugr.c-3.eu-central-1.aws.neon.tech/db'])assert.throws(()=>validateDevelopmentUrl(u),/Refus|requis/)});
test('rejects staging and incorrect migration before reading evidence',async()=>{for(const branch of ['br-solitary-tree-alshbj8i','br-misty-shadow-algk3uc4']){const c=client({branch});await assert.rejects(runChronologicalReplay(c,seasonId),/cible/);assert.ok(!c.calls.some(x=>x.sql.startsWith('INSERT')))}const c=client();const query=c.query.bind(c);c.query=async(sql,args)=>sql.includes('current_setting')?{rows:[{branch:DEVELOPMENT_BRANCH,version:'88'}]}:query(sql,args);await assert.rejects(runChronologicalReplay(c,seasonId),/V89/);assert.ok(!c.calls.some(x=>x.sql.startsWith('INSERT')))});
