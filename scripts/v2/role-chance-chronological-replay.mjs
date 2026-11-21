/** Chronological replay, development only. Runs in one serializable transaction.
 * Estimates are separate from observations, retain assumptions and never modify
 * assignments or individual chances. No application notification code is used.
 */
import {report, ALLOWED_SEASON_ID} from './role-chance-chronological-report.mjs';
import {inferSelectionOrigins} from './role-chance-selection-origin.mjs';
export const DEVELOPMENT_BRANCH = 'br-wandering-fire-al69qlxl';
export const DEVELOPMENT_HOSTS = new Set(['ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech', 'ep-weathered-fog-al1law06-pooler.c-3.eu-central-1.aws.neon.tech']);
export function targetError(branch, version) {
 if (branch !== DEVELOPMENT_BRANCH) return 'Refus : cible différente de la branche development autorisée.';
 if (version !== '90') return 'Refus : migration V90 absente ou différente.';
 return null;
}
export function validateDevelopmentUrl(uri) {
 if (!uri) throw new Error('NEON_DEVELOPMENT_URL requis.');
 let parsed; try { parsed = new URL(uri); } catch { throw new Error('Refus : URL development invalide.'); }
 if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !DEVELOPMENT_HOSTS.has(parsed.hostname)) throw new Error('Refus : hôte différent de development autorisé.');
 return uri;
}

const asIso = value => value instanceof Date ? value.toISOString() : value;
const asJson = value => typeof value === 'string' ? JSON.parse(value) : value;
const different = (estimated, observed) => {
 const map = new Map(estimated.map(x=>[x.participantId,x.estimatedPercent]));
 return map.size !== observed.length || observed.some(x=>map.get(x.participant_id)!==x.chance_percent);
};
const blocking = new Set(['decision_audit_ambiguous','later_draw_may_have_redrawn_same_role_without_change','changed_slots_with_same_participants_may_be_reordering','no_attested_selection','same_timestamp_order_unresolved','event_history_inconsistent','history_order_ambiguous','assignment_order_ambiguous']);
export function assessRole(role) {
 if (role.estimates.length !== 1) return {writable:false,reason:'no_unique_scenario'};
 const e=role.estimates[0];
 if (!e.values.length || e.missingSelected?.length || role.issues.some(x=>blocking.has(x))) return {writable:false,reason:'essential_evidence_missing_or_ambiguous'};
 if (e.values.some(x=>!x.participantId || !Number.isInteger(x.estimatedPercent) || x.estimatedPercent<0 || x.estimatedPercent>100) || new Set(e.values.map(x=>x.participantId)).size!==e.values.length) return {writable:false,reason:'invalid_estimated_values'};
 return {writable:true,scenario:e};
}

export function mergeObservedManual(values, individual, people) {
 const byPerson=new Map(values.map(v=>[v.participantId,v]));
 for(const item of individual){
  const id=item.season_participant_id || item.event_participant_id;
  const at=asIso(item.selection_chance_at), previous=byPerson.get(id);
  if(!id || !at || item.selection_chance_source!=='manual') continue;
  const actual=Date.parse(at), simulated=Date.parse(previous?.estimatedAt);
  // The slot timestamp is taken just before the audit row is recorded.
  const sameManual=previous?.origin==='manual' && Math.abs(actual-simulated)<=2000;
  if(!previous || actual>simulated || sameManual) {
   const person=people.find(p=>p.id===id);
   byPerson.set(id,{participantId:id,name:person?.display_name||null,estimatedPercent:item.selection_chance_percent,estimatedAt:at,origin:'observed_manual'});
  }
 }
 return [...byPerson.values()];
}

export async function runChronologicalReplay(client,seasonId) {
 if (seasonId!==ALLOWED_SEASON_ID) throw new Error('Refus : seule la saison explicitement autorisée est admise.');
 await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
 try {
  const identity=await client.query("SELECT current_setting('neon.branch_id', true) branch, (SELECT version FROM flyway_schema_history WHERE success ORDER BY installed_rank DESC LIMIT 1) version");
  const error=targetError(identity.rows[0]?.branch,identity.rows[0]?.version);if(error)throw new Error(error);
  const events=(await client.query(`SELECT e.id,e.title,e.season_id,c.validated_at,
       COALESCE(array_agg(DISTINCT s.role_key) FILTER (WHERE s.season_participant_id IS NOT NULL OR s.event_participant_id IS NOT NULL),ARRAY[]::varchar[]) assigned_roles
     FROM events e LEFT JOIN event_compositions c ON c.event_id=e.id LEFT JOIN event_composition_slots s ON s.event_id=e.id
     WHERE e.season_id=$1 GROUP BY e.id,c.validated_at ORDER BY e.id`,[seasonId])).rows;
  // Lock same composition rows used by draw before reading audit state.
  await client.query('SELECT c.event_id FROM event_compositions c JOIN events e ON e.id=c.event_id WHERE e.season_id=$1 ORDER BY c.event_id FOR UPDATE OF c',[seasonId]);
  const participants=(await client.query('SELECT id,display_name,user_id FROM season_participants WHERE season_id=$1 ORDER BY id',[seasonId])).rows;
  const guests=(await client.query('SELECT p.id,p.display_name,p.user_id,p.event_id FROM event_participants p JOIN events e ON e.id=p.event_id WHERE e.season_id=$1 ORDER BY p.id',[seasonId])).rows;
  const audits=(await client.query(`SELECT a.id,a.event_id,a.action_type,a.occurred_at,a.subject_user_id,a.subject_season_participant_id,a.subject_event_participant_id,a.before_json,a.after_json,a.metadata_json
     FROM audit_events a JOIN events e ON e.id=a.event_id WHERE e.season_id=$1 ORDER BY a.occurred_at,a.id`,[seasonId])).rows;
  const input={seasonId,events:events.map(e=>({id:e.id,title:e.title,seasonId,assignedRoles:e.assigned_roles||[]})),identities:[...participants.map(i=>({...i,seasonId})),...guests.map(i=>({...i,eventId:i.event_id,seasonId}))],audits:audits.map(a=>({...a,occurred_at:asIso(a.occurred_at),before_json:asJson(a.before_json),after_json:asJson(a.after_json),metadata_json:asJson(a.metadata_json)}))};
  const selectionSlots=(await client.query(`SELECT s.event_id,s.role_key,s.slot_index,s.season_participant_id,s.event_participant_id,s.selection_chance_source
   FROM event_composition_slots s JOIN events e ON e.id=s.event_id WHERE e.season_id=$1 AND (s.season_participant_id IS NOT NULL OR s.event_participant_id IS NOT NULL)`,[seasonId])).rows;
  const selectionOrigins=inferSelectionOrigins(input.audits,selectionSlots);
  for(const item of selectionOrigins.filter(x=>x.provenance==='reconstructed')) await client.query(`INSERT INTO event_selection_origin_reconstructions(event_id,role_key,slot_index,participant_id,origin,evidence_at)
   VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(event_id,role_key,slot_index) DO UPDATE SET participant_id=EXCLUDED.participant_id,origin=EXCLUDED.origin,evidence_at=EXCLUDED.evidence_at`,[item.eventId,item.role,item.slotIndex,item.participantId,item.origin,item.evidenceAt]);
  const diagnostic=report(input,seasonId);const targets=new Set(events.filter(e=>e.validated_at || e.assigned_roles?.length).map(e=>e.id));
  const results=[];
  for(const role of diagnostic.roles.filter(r=>targets.has(r.eventId))) {
   const observed=(await client.query('SELECT captured_at FROM event_role_chance_baselines WHERE event_id=$1 AND role_key=$2',[role.eventId,role.role])).rows[0];
   const individual=(await client.query('SELECT season_participant_id,event_participant_id,selection_chance_percent,selection_chance_at,selection_chance_source FROM event_composition_slots WHERE event_id=$1 AND role_key=$2 AND selection_chance_percent IS NOT NULL',[role.eventId,role.role])).rows;
   const base={eventId:role.eventId,title:role.eventTitle,role:role.role,decisionAt:role.decisionAt,decisionType:role.decisionType,issues:role.issues,individualChances:individual};
   const assessment=assessRole(role);
   if(!assessment.writable){results.push({...base,result:observed?.captured_at?'observed_preserved':'unavailable',reason:assessment.reason});continue;}
   const values=mergeObservedManual(assessment.scenario.values,individual,[...participants,...guests]);
   const nearby=(await client.query(`SELECT participant_id,chance_percent,snapshotted_at FROM event_draw_chance_snapshots
     WHERE event_id=$1 AND role_key=$2 AND abs(extract(epoch FROM (snapshotted_at-$3::timestamptz)))<3 ORDER BY participant_id`,[role.eventId,role.role,role.decisionAt])).rows;
   const comparison={nearbyOpeningSnapshots:nearby,openingSnapshotDiffers:nearby.length?different(values,nearby):null,note:'Opening snapshots can precede cross-role exclusions; individual selection chances are separate.'};
   if(observed?.captured_at){const entries=(await client.query('SELECT participant_id,chance_percent FROM event_role_chance_baseline_entries WHERE event_id=$1 AND role_key=$2 ORDER BY participant_id',[role.eventId,role.role])).rows;results.push({...base,comparison,result:'observed_preserved',existingEntries:entries,differs:different(values,entries)});continue;}
   const evidence=JSON.stringify({decisionAt:role.decisionAt,decisionType:role.decisionType,mode:assessment.scenario.mode,individualSources:values.map(v=>({participantId:v.participantId,at:v.estimatedAt,origin:v.origin})),issues:role.issues,comparison});
   const assumptions=JSON.stringify({general:diagnostic.assumptions,scenario:assessment.scenario.issues||[],gaps:diagnostic.gaps.filter(g=>g.event===role.eventId)});
   const inserted=await client.query('INSERT INTO event_role_chance_reconstructions(event_id,role_key,estimated_at,evidence,assumptions) VALUES($1,$2,$3,$4,$5) ON CONFLICT(event_id,role_key) DO NOTHING RETURNING event_id',[role.eventId,role.role,role.decisionAt,evidence,assumptions]);
   if(!inserted.rowCount){const entries=(await client.query('SELECT participant_id,chance_percent FROM event_role_chance_reconstruction_entries WHERE event_id=$1 AND role_key=$2 ORDER BY participant_id',[role.eventId,role.role])).rows;results.push({...base,comparison,result:'existing_preserved',existingEntries:entries,differs:different(values,entries)});continue;}
   for(const item of values)await client.query('INSERT INTO event_role_chance_reconstruction_entries(event_id,role_key,participant_id,chance_percent) VALUES($1,$2,$3,$4)',[role.eventId,role.role,item.participantId,item.estimatedPercent]);
   results.push({...base,comparison,result:'reconstructed',estimatedEntries:values});
  }
  await client.query('COMMIT');return {target:{environment:'development',branchId:DEVELOPMENT_BRANCH,schemaVersion:identity.rows[0].version},seasonId,selectionOrigins,assumptions:diagnostic.assumptions,gaps:diagnostic.gaps,results};
 } catch(error){await client.query('ROLLBACK');throw error;}
}

if(process.argv[1]&&import.meta.url===new URL(process.argv[1],'file:').href){
 const seasonId=process.env.HATCAST_REPLAY_SEASON_ID,uri=process.env.NEON_DEVELOPMENT_URL;
 if(seasonId!==ALLOWED_SEASON_ID)throw new Error('Refus : saison non autorisée.');
 validateDevelopmentUrl(uri);
 const {default:pg}=await import('pg');const client=new pg.Client({connectionString:uri});
 try{await client.connect();console.log(JSON.stringify(await runChronologicalReplay(client,seasonId),null,2));}finally{await client.end();}
}
