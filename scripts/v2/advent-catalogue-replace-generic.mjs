import {inspectSelectedContent} from './advent-catalogue-reservations.mjs';

// All tables with day-specific game data; the locks also prevent concurrent inserts
// by clients that do not cooperate with the two runtime game-control locks.
export const GAME_TABLES = ['advent_member_attempts','advent_member_generations','advent_member_replays','advent_member_answers',
 'advent_test_attempts','advent_test_generations','advent_test_replays','advent_test_answers',
 'advent_offline_content_conflicts','advent_member_demo_quizzes','advent_reminder_attempts'];

export function isLegacyGeneric(reviewed, day) {
 const r=reviewed?.reservations, q=reviewed?.quizzes;
 if (!Array.isArray(r)||!Array.isArray(q)||r.length!==1||q.length!==1) return false;
 const name=`Lutin du ${day} décembre`;
 return r[0].quiz_day===day && r[0].character_key===null && r[0].display_name===name && r[0].portrait_ref===null &&
  q[0].quiz_day===day && q[0].display_name===name && q[0].portrait_ref===null;
}

// Caller must verify the development binding, hold the source generations and
// obtain a separate review of the existing quiz before calling this primitive.
export async function replaceGeneric(client, environment, row, reviewed) {
 if(environment!=='development'||!Number.isInteger(row?.quiz_day)||row.quiz_day<1||row.quiz_day>24||
  typeof row.character_key!=='string'||!row.character_key||!row.display_name||!row.portrait_ref||
  [row.statement_0,row.statement_1,row.statement_2].some(x=>typeof x!=='string'||!x)||
  !Number.isInteger(row.false_choice)||row.false_choice<0||row.false_choice>2||!isLegacyGeneric(reviewed,row.quiz_day)) throw Error('Replacement refused');
 let begun=false;
 try {
  await client.query('BEGIN');begun=true;
  for(const table of ['advent_member_lock','advent_test_clock']) {
   const lock=await client.query(`SELECT id FROM ${table} WHERE id=1 FOR UPDATE`);
   if(lock.rowCount!==1)throw Error();
  }
  await client.query(`LOCK TABLE advent_character_reservations, advent_quizzes, ${GAME_TABLES.join(', ')} IN SHARE ROW EXCLUSIVE MODE`);
  if(JSON.stringify(await inspectSelectedContent(client,[row]))!==JSON.stringify(reviewed))throw Error();
  for(const table of GAME_TABLES) {
   const result=await client.query(`SELECT 1 FROM ${table} WHERE quiz_day=$1 LIMIT 1`,[row.quiz_day]);
   if(result.rows.length)throw Error();
  }
  const reservation=await client.query('UPDATE advent_character_reservations SET character_key=$2,display_name=$3,portrait_ref=$4 WHERE quiz_day=$1',[row.quiz_day,row.character_key,row.display_name,row.portrait_ref]);
  if(reservation.rowCount!==1)throw Error();
  const quiz=await client.query(`UPDATE advent_quizzes SET display_name=$2,portrait_ref=$3,statement_0=$4,statement_1=$5,statement_2=$6,false_choice=$7,explanation=$8,story_0=$9,story_1=$10,story_2=$11,content_revision=content_revision+1 WHERE quiz_day=$1`,
   [row.quiz_day,row.display_name,row.portrait_ref,row.statement_0,row.statement_1,row.statement_2,row.false_choice,row.explanation,row.story_0??null,row.story_1??null,row.story_2??null]);
  if(quiz.rowCount!==1)throw Error();
  await client.query('COMMIT');begun=false;
 } catch {if(begun)try{await client.query('ROLLBACK')}catch{};throw Error('Replacement refused or interrupted');}
}
