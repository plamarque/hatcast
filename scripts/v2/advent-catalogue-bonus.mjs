import {createHash,randomBytes} from 'node:crypto';
const refuse=()=>{throw Error('Bonus operation refused')};
const fields=['quiz_day','character_key','display_name','portrait_ref','statement_0','statement_1','statement_2','false_choice','explanation','story_0','story_1','story_2'];
const fingerprint=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const same=(a,b)=>fields.every(key=>(a[key]??null)===(b[key]??null));
async function inspect(db,days) {
  return (await db.query(`SELECT ${fields.join(', ')} FROM advent_bonus_quizzes WHERE quiz_day=ANY($1::int[]) ORDER BY quiz_day`,[days])).rows;
}
// Only inserts new assignments; a divergent assignment requires a separate reconciliation.
export async function runBonusContent({source,store,db,days,environment,ask,write}) {
  await source.verify(); await store.verify(false);
  const snapshot=await source.snapshot(days,'bonus');
  const reviewed=await inspect(db,days);
  const keys=snapshot.rows.map(row=>row.character_key);
  const conflicts=async()=> (await db.query("SELECT character_key FROM advent_character_reservations WHERE character_key=ANY($1::text[]) UNION ALL SELECT character_key FROM advent_bonus_quizzes WHERE character_key=ANY($1::text[]) AND NOT (quiz_day=ANY($2::int[]))",[keys,days])).rows;
  if((await conflicts()).length)refuse();
  for(const row of snapshot.rows) {
    const old=reviewed.find(item=>item.quiz_day===row.quiz_day);
    if(old && !same(old,row)) refuse();
    write(`Jour ${row.quiz_day} : ${old?'inchangé':'ajout du bonus'}`);
  }
  const phrase=`APPLIQUER bonus ${[...days].sort((a,b)=>a-b).join(',')}`;
  if(await ask(`Cible ${environment} : saisir ${phrase} : `)!==phrase)refuse();
  if(environment==='production') {
    const authorization=`AUTORISER PRODUCTION ${randomBytes(12).toString('hex')}`;
    if(await ask(`Autorisation distincte : saisir ${authorization} : `)!==authorization)refuse();
    await db.query('ROLLBACK');
  }
  await source.verify(true); await store.verify(true);
  if(fingerprint(await source.snapshot(days,'bonus'))!==fingerprint(snapshot))refuse();
  let hold;
  try {
    hold=await source.acquire(snapshot); await hold.verify();
    await source.verify(true); await store.verify(true);
    if(fingerprint(await source.snapshot(days,'bonus'))!==fingerprint(snapshot))refuse();
    await db.query('BEGIN');
    try {
      await db.query('SELECT id FROM advent_member_lock WHERE id=1 FOR UPDATE');
      if(fingerprint(await inspect(db,days))!==fingerprint(reviewed) || (await conflicts()).length)refuse();
      for(const row of snapshot.rows) if(!reviewed.some(item=>item.quiz_day===row.quiz_day)) {
        const placeholders=fields.map((_,i)=>`$${i+1}`).join(', ');
        await db.query(`INSERT INTO advent_bonus_quizzes (${fields.join(', ')}) VALUES (${placeholders})`,fields.map(field=>row[field]??null));
      }
      await hold.verify(); await db.query('COMMIT');
    } catch(error) {await db.query('ROLLBACK'); throw error;}
  } finally {if(hold)await hold.release();}
  write('Affectations bonus vérifiées.');
}
