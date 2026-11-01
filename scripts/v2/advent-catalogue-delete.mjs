// Internal transaction primitive. Callers must independently verify the target and
// obtain a separate explicit confirmation before invoking this function.
export async function deleteTestDays(client, environment, days) {
  if (!['development', 'staging'].includes(environment) || !Array.isArray(days) || !days.length ||
      days.some(day => !Number.isInteger(day) || day < 1 || day > 24) || new Set(days).size !== days.length) {
    throw new Error('Test deletion refused');
  }
  let transaction = false;
  try {
    await client.query('BEGIN'); transaction = true;
    // Both runtime games serialize on these rows, including attempts and confirms.
    for (const table of ['advent_member_lock', 'advent_test_clock']) {
      const lock = await client.query(`SELECT id FROM ${table} WHERE id = 1 FOR UPDATE`);
      if (lock.rowCount !== 1) throw new Error('Missing game lock');
    }
    const affected = await client.query('SELECT DISTINCT user_id FROM advent_test_answers WHERE quiz_day = ANY($1::int[])', [days]);
    for (const table of ['advent_member_attempts','advent_member_generations','advent_member_replays','advent_member_answers',
      'advent_test_attempts','advent_test_generations','advent_test_replays','advent_test_answers',
      'advent_offline_content_conflicts','advent_member_demo_quizzes','advent_quizzes']) {
      await client.query(`DELETE FROM ${table} WHERE quiz_day = ANY($1::int[])`, [days]);
    }
    // The target reservation is removed; the canonical catalogue remains unchanged.
    await client.query('DELETE FROM advent_character_reservations WHERE quiz_day = ANY($1::int[])', [days]);
    // The legacy game stores bonuses and streaks; recompute from retained answers.
    // The member game computes these from its retained answers at read time.
    for (const {user_id: user} of affected.rows) {
      const answers = await client.query('SELECT quiz_day, choice, correct_choice FROM advent_test_answers WHERE user_id = $1 ORDER BY quiz_day', [user]);
      let streak = 0;
      for (const answer of answers.rows) {
        streak = answer.choice === answer.correct_choice ? streak + 1 : 0;
        await client.query('UPDATE advent_test_answers SET bonus_points = $1 WHERE user_id = $2 AND quiz_day = $3', [streak > 0 && streak % 3 === 0 ? 2 : 0, user, answer.quiz_day]);
      }
      await client.query('INSERT INTO advent_test_member_state (user_id, correct_streak) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET correct_streak = EXCLUDED.correct_streak', [user, streak]);
    }
    await client.query('COMMIT'); transaction = false;
  } catch {
    if (transaction) { try { await client.query('ROLLBACK'); } catch { /* uncertain connection; retry after inspection */ } }
    throw new Error('Test deletion refused or interrupted');
  }
}
