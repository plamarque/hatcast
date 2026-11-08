export async function inspectSelectedContent(client, rows) {
 const days=rows.map(r=>r.quiz_day),keys=rows.map(r=>r.character_key);
 const reservations=await client.query('SELECT quiz_day,character_key,display_name,portrait_ref FROM advent_character_reservations WHERE quiz_day=ANY($1::int[]) OR character_key=ANY($2::text[]) ORDER BY quiz_day',[days,keys]);
 const quizzes=await client.query('SELECT quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation,story_0,story_1,story_2 FROM advent_quizzes WHERE quiz_day=ANY($1::int[]) ORDER BY quiz_day',[days]);
 return {reservations:reservations.rows,quizzes:quizzes.rows};
}
// Private transaction primitive; caller must verify and authorize the target first.
// A legacy reservation is bound only if its existing name and portrait agree.
export async function applySelectedContent(client, rows, operation, reviewed) {
 if (!['character','quiz'].includes(operation) || !Array.isArray(rows) || !rows.length ||
     rows.some(r=>!Number.isInteger(r.quiz_day)||r.quiz_day<1||r.quiz_day>24||typeof r.character_key!=='string'||!r.character_key) ||
     new Set(rows.map(r=>r.quiz_day)).size!==rows.length || new Set(rows.map(r=>r.character_key)).size!==rows.length) throw Error('Content operation refused');
 let begun=false;
 try {
  await client.query('BEGIN');begun=true;
  for(const table of ['advent_member_lock','advent_test_clock']) {
   const lock=await client.query(`SELECT id FROM ${table} WHERE id=1 FOR UPDATE`);if(lock.rowCount!==1)throw Error();
  }
  await client.query('LOCK TABLE advent_character_reservations, advent_quizzes IN SHARE ROW EXCLUSIVE MODE');
  if(reviewed && JSON.stringify(await inspectSelectedContent(client,rows))!==JSON.stringify(reviewed))throw Error();
  for(const row of rows) {
   const same=await client.query('SELECT quiz_day,character_key,display_name,portrait_ref FROM advent_character_reservations WHERE quiz_day=$1 OR character_key=$2',[row.quiz_day,row.character_key]);
   if(same.rows.some(r=>r.quiz_day!==row.quiz_day || (r.character_key!==null && r.character_key!==row.character_key)))throw Error();
   const previous=same.rows[0];
   if(previous && previous.character_key===null && (previous.display_name!==row.display_name || previous.portrait_ref!==row.portrait_ref))throw Error();
   if(operation==='character') {
    if(previous) await client.query('UPDATE advent_character_reservations SET character_key=$2,display_name=$3,portrait_ref=$4 WHERE quiz_day=$1',[row.quiz_day,row.character_key,row.display_name,row.portrait_ref]);
    else await client.query('INSERT INTO advent_character_reservations (quiz_day,character_key,display_name,portrait_ref) VALUES ($1,$2,$3,$4)',[row.quiz_day,row.character_key,row.display_name,row.portrait_ref]);
    await client.query('UPDATE advent_quizzes SET display_name=$2,portrait_ref=$3,content_revision=content_revision+1 WHERE quiz_day=$1',[row.quiz_day,row.display_name,row.portrait_ref]);
   } else {
    if(!previous || row.statement_0==null || row.statement_1==null || row.statement_2==null || row.false_choice==null)throw Error();
    if(previous.character_key===null) await client.query('UPDATE advent_character_reservations SET character_key=$2 WHERE quiz_day=$1',[row.quiz_day,row.character_key]);
    await client.query(`INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation,story_0,story_1,story_2)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (quiz_day) DO UPDATE SET content_revision=advent_quizzes.content_revision+1,statement_0=EXCLUDED.statement_0,statement_1=EXCLUDED.statement_1,statement_2=EXCLUDED.statement_2,false_choice=EXCLUDED.false_choice,explanation=EXCLUDED.explanation,story_0=CASE WHEN $12 THEN EXCLUDED.story_0 ELSE advent_quizzes.story_0 END,story_1=CASE WHEN $12 THEN EXCLUDED.story_1 ELSE advent_quizzes.story_1 END,story_2=CASE WHEN $12 THEN EXCLUDED.story_2 ELSE advent_quizzes.story_2 END`,
     [row.quiz_day,previous.display_name,previous.portrait_ref,row.statement_0,row.statement_1,row.statement_2,row.false_choice,row.explanation,row.story_0 ?? null,row.story_1 ?? null,row.story_2 ?? null,row.story_0 !== undefined]);
   }
  }
  await client.query('COMMIT');begun=false;
 } catch {if(begun)try{await client.query('ROLLBACK')}catch{};throw Error('Content operation refused or interrupted');}
}
