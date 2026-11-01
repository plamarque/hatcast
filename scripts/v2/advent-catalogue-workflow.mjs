import { createHash, timingSafeEqual } from 'node:crypto';
import { compareQuizzes } from './advent-catalogue-compare.mjs';

// Adapters are responsible for independently verified identities, rights, privacy,
// immutable portrait creation and generation-pinned reads. Never expose this module
// as an operator interface until those guarantees have been established.
export class WorkflowRefused extends Error {
  constructor() { super('Synchronization refused; compare again and resolve privately'); this.name = 'WorkflowRefused'; }
}
function digest(value) { return createHash('sha256').update(value).digest('hex'); }
function snapshotFingerprint(snapshot) {
  if (!snapshot || typeof snapshot.generation !== 'string' || !snapshot.generation || !Array.isArray(snapshot.rows) || !Array.isArray(snapshot.portraits)) throw new WorkflowRefused();
  const portraits = snapshot.portraits.map(p => {
    if (typeof p.ref !== 'string' || !Buffer.isBuffer(p.bytes) || !p.bytes.length || typeof p.generation !== 'string' || !p.generation) throw new WorkflowRefused();
    return { ref: p.ref, generation: p.generation, digest: digest(p.bytes) };
  }).sort((a,b)=>a.ref.localeCompare(b.ref));
  if (new Set(portraits.map(p=>p.ref)).size !== portraits.length) throw new WorkflowRefused();
  const refs = [...new Set(snapshot.rows.map(row=>row.portrait_ref))].sort();
  if (JSON.stringify(refs) !== JSON.stringify(portraits.map(p=>p.ref).sort())) throw new WorkflowRefused();
  return digest(JSON.stringify({generation:snapshot.generation,rows:snapshot.rows,portraits}));
}
function assertComparison(plan, target) {
  if (!target || typeof target.identity !== 'string' || !target.identity || !Array.isArray(target.rows) || !Array.isArray(target.portraits)) throw new WorkflowRefused();
  const statuses = compareQuizzes(plan.snapshot.rows,target.rows);
  if (target.portraits.some(p=>!['addition','unchanged','divergence'].includes(p.status))) throw new WorkflowRefused();
  const refs = [...new Set(plan.snapshot.rows.map(r=>r.portrait_ref))].sort();
  const portraitRefs = target.portraits.map(p=>p.ref).sort();
  if (JSON.stringify(refs) !== JSON.stringify(portraitRefs)) throw new WorkflowRefused();
  return {identity:target.identity,statuses,portraits:target.portraits.map(p=>({ref:p.ref,status:p.status})).sort((a,b)=>a.ref.localeCompare(b.ref))};
}
export async function compareWorkflow(source, target, days) {
  try {
    await source.verify(); await target.verify(false);
    const snapshot = await source.snapshot(days);
    const sourceFingerprint = snapshotFingerprint(snapshot);
    const inspected = await target.inspect(snapshot);
    const comparison = assertComparison({snapshot}, inspected);
    const expectedPrevious = inspected.rows.filter(row=>comparison.statuses.some(item=>item.day===row.quiz_day && item.status==='divergence'));
    // Private in-memory plan; the fingerprint and portrait refs are never printed.
    return {days:[...days], sourceFingerprint, snapshot, comparison, expectedPrevious};
  } catch { throw new WorkflowRefused(); }
}
export async function applyWorkflow(source, target, plan, replacementDays = []) {
  let holds,targetHolds;
  try {
    await source.verify(true); await target.verify(true);
    const snapshot = await source.snapshot(plan.days);
    const currentFingerprint = snapshotFingerprint(snapshot);
    if (currentFingerprint.length !== plan.sourceFingerprint.length || !timingSafeEqual(Buffer.from(currentFingerprint),Buffer.from(plan.sourceFingerprint))) throw new WorkflowRefused();
    const comparison = assertComparison({snapshot}, await target.inspect(snapshot));
    const divergences=comparison.statuses.filter(s=>s.status==='divergence').map(s=>s.day).sort((a,b)=>a-b);
    if (JSON.stringify(comparison) !== JSON.stringify(plan.comparison) ||
        JSON.stringify([...replacementDays].sort((a,b)=>a-b))!==JSON.stringify(divergences) ||
        comparison.portraits.some(p=>p.status==='divergence')) throw new WorkflowRefused();
    // Conditional temporary object holds prevent cooperative concurrent catalogue
    // editors from replacing selected source generations until commit finishes.
    holds=await source.acquire(snapshot);
    await holds.verify();
    if(target.sharedPortraits === true) {
      if(comparison.portraits.some(p=>p.status!=='unchanged')) throw new WorkflowRefused();
    } else {
      await target.stagePortraits(snapshot.portraits,comparison.portraits);
      targetHolds=await target.acquirePortraits(snapshot.portraits);
    }
    const latest = await source.snapshot(plan.days);
    if (snapshotFingerprint(latest) !== currentFingerprint) throw new WorkflowRefused();
    await source.verify(true); await target.verify(true); await holds.verify(); if(targetHolds)await targetHolds.verify();
    const finalTarget = await target.inspect(snapshot);
    if (finalTarget.identity !== plan.comparison.identity) throw new WorkflowRefused();
    return await target.insert(snapshot.rows,comparison.statuses,plan.expectedPrevious);
  } catch { throw new WorkflowRefused(); }
  finally {let failed=false;for(const lock of [targetHolds,holds])if(lock){try {await lock.release();}catch{failed=true;}}if(failed)throw new WorkflowRefused();}
}
