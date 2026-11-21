/**
 * Diagnostic only: replay a single explicitly scoped season from a private JSON export.
 * No database connection and no writes to application data. Every numerical result is
 * a V1 estimate; this program does not authorise or prepare migration writes.
 */
import fs from 'node:fs';
import { replay } from './role-chance-chronological.mjs';
import { scenarios } from './role-chance-chronological-scenarios.mjs';
import { selectDecision } from './role-chance-chronological-decision-selector.mjs';

export const ALLOWED_SEASON_ID = '2fad6340-eec5-43b5-a6d2-a575f3153ea7';
const COMMON_ASSUMPTIONS = [
  'Estimated using V1; the historical formula is not proven.',
  'Candidate eligibility, membership and participation status are inferred from available records.',
  'Tied timestamps have no proven order; source order is used solely to calculate scenarios.',
  'Decision identification and subsequent unchanged draws may be ambiguous.',
  'The analysis starts from the supplied audit history; missing prior events are not inferred.',
];

export function report(input, seasonId) {
  if (seasonId !== ALLOWED_SEASON_ID || input?.seasonId !== seasonId) throw new Error('Explicit authorised season and matching input season are required.');
  if (![input.events, input.audits, input.identities].every(Array.isArray)) throw new Error('Events, audits and identities must be arrays.');
  const eventIds = new Set();
  for (const event of input.events) {
    if (!event.id || event.seasonId !== seasonId || eventIds.has(event.id)) throw new Error('Unexpected, duplicate, or out-of-season event.');
    eventIds.add(event.id);
  }
  if (input.audits.some(a => !eventIds.has(a.event_id) || !a.occurred_at || !Number.isFinite(Date.parse(a.occurred_at)))) throw new Error('Audit outside target season or invalid timestamp.');
  if (input.identities.some(i => !i.id || i.seasonId !== seasonId)) throw new Error('Identity outside target season or missing identity.');
  const knownIds = new Set();
  const users = new Set();
  for (const i of input.identities) {
    const scopedUser = i.user_id ? `${i.eventId||'season'}:${i.user_id}` : null;
    if (knownIds.has(i.id) || (scopedUser && users.has(scopedUser)) || (i.eventId && !eventIds.has(i.eventId))) throw new Error('Ambiguous participant identity.');
    knownIds.add(i.id); if (scopedUser) users.add(scopedUser);
  }
  // Stable source order is an explicit hypothesis for equal timestamps, not proof.
  const ordered = input.audits.map((item,index)=>({item,index})).sort((a,b)=>Date.parse(a.item.occurred_at)-Date.parse(b.item.occurred_at)||a.index-b.index).map(x=>x.item);
  const reconstructed = replay(ordered, input.identities);
  const result = [];
  for (const event of input.events) {
    // Include roles from both existing selection and present candidates, including draft.
    const roles = [...new Set([...(event.assignedRoles||[]),...reconstructed.decisions.filter(x=>x.eventId===event.id).map(x=>x.role)])];
    for (const role of roles) {
      const selected = selectDecision(reconstructed.decisions, ordered, event.id, role);
      const decision = selected.selected;
      const matching = decision ? ordered.filter(x=>x.event_id===event.id&&x.occurred_at===decision.at&&x.action_type===decision.decision) : [];
      const issues = [...new Set([...(decision?.unknowns||[]),...selected.uncertainties,...(matching.length>1?['decision_audit_ambiguous']:[])])];
      // Ambiguous matching audits must never silently pick one for a scenario.
      const estimates = matching.length===1 ? scenarios(decision, matching[0]) : [];
      result.push({eventId:event.id, eventTitle:event.title, role, decisionAt:decision?.at??null,
        decisionType:decision?.decision??null, estimates, issues,
        eligibility:'exploratory_only', authorisedForWrite:false});
    }
  }
  return {seasonId, assumptions:COMMON_ASSUMPTIONS, gaps:reconstructed.gaps, roles:result};
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  if (process.argv.length !== 4) throw new Error('Usage: node role-chance-chronological-report.mjs <season-id> <private-input.json>');
  const input=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(report(input,process.argv[2]),null,2)+'\n');
}
