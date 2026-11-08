import { compareQuizzes } from './advent-catalogue-compare.mjs';

const columns = ['quiz_day', 'display_name', 'portrait_ref', 'statement_0', 'statement_1', 'statement_2', 'false_choice', 'explanation', 'story_0', 'story_1', 'story_2'];
const gameTables = ['advent_member_answers', 'advent_member_attempts', 'advent_member_generations', 'advent_member_replays', 'advent_test_answers', 'advent_test_attempts', 'advent_test_generations', 'advent_test_replays'];
export class SynchronizationConflict extends Error {
  constructor() { super('Synchronization stopped; compare again and resolve the conflict privately'); this.name = 'SynchronizationConflict'; }
}

// This function assumes callers already authenticated and verified both source and target.
// Never expose database exceptions: they can contain SQL parameters or target identifiers.
export async function insertReviewedQuizzes(client, selected, reviewed, expectedPrevious = []) {
  if (!selected.length || selected.length !== reviewed.length || selected.some((q, i) => q.quiz_day !== reviewed[i].day) ||
      reviewed.some(r => !['addition', 'unchanged', 'divergence'].includes(r.status)) ||
      reviewed.filter(r=>r.status==='divergence').length !== expectedPrevious.length ||
      new Set(expectedPrevious.map(r=>r.quiz_day)).size !== expectedPrevious.length) throw new SynchronizationConflict();
  let started = false;
  try {
    await client.query('BEGIN'); started = true;
    // Serialize target content and all day-specific game writes, including paths outside the member lock.
    await client.query(`LOCK TABLE advent_quizzes, ${gameTables.join(', ')} IN SHARE MODE`);
    const current = await client.query(`SELECT ${columns.join(', ')} FROM advent_quizzes WHERE quiz_day = ANY($1::int[])`, [selected.map(q => q.quiz_day)]);
    const fresh = compareQuizzes(selected, current.rows);
    if (fresh.some((r, i) => r.status !== reviewed[i].status)) throw new SynchronizationConflict();
    const additions = selected.filter((_, i) => fresh[i].status === 'addition');
    const replacements = selected.filter((_, i) => fresh[i].status === 'divergence');
    if (expectedPrevious.some(old => !replacements.some(row=>row.quiz_day===old.quiz_day)) ||
        compareQuizzes(expectedPrevious,current.rows).some(item=>item.status!=='unchanged')) throw new SynchronizationConflict();
    if (additions.length || replacements.length) {
      const days = [...additions,...replacements].map(q => q.quiz_day);
      const activitySql = gameTables.map(table => `SELECT quiz_day FROM ${table} WHERE quiz_day = ANY($1::int[])`).join(' UNION ALL ');
      const activity = await client.query(`SELECT 1 FROM (${activitySql}) activity LIMIT 1`, [days]);
      if (activity.rowCount) throw new SynchronizationConflict();
      for (const row of replacements) {
        const previous=current.rows.find(q=>q.quiz_day===row.quiz_day);
        const updated=await client.query(`UPDATE advent_quizzes SET display_name=$2, portrait_ref=$3, statement_0=$4, statement_1=$5, statement_2=$6, false_choice=$7, explanation=$8, story_0=$9, story_1=$10, story_2=$11, content_revision=content_revision+1 WHERE quiz_day=$1`,columns.map(c=>row[c] === undefined ? previous[c] : row[c]));
        if(updated.rowCount!==1)throw new SynchronizationConflict();
      }
      for (const row of additions) {
        const inserted = await client.query(`INSERT INTO advent_quizzes (${columns.join(', ')}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`, columns.map(c => row[c]));
        if (inserted.rowCount !== 1) throw new SynchronizationConflict();
      }
    }
    await client.query('COMMIT'); started = false;
    return fresh;
  } catch {
    if (started) { try { await client.query('ROLLBACK'); } catch { /* connection may have failed */ } }
    throw new SynchronizationConflict();
  }
}
