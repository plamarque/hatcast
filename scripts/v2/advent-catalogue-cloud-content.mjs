import {createHash,randomBytes} from 'node:crypto';
import {storyChanges} from './advent-catalogue-compare.mjs';
import {inspectSelectedContent,applySelectedContent} from './advent-catalogue-reservations.mjs';
const refuse=()=>{throw Error('Content operation refused')};
export async function runCloudContent({source,store,db,days,operation,environment,ask,write}) {
      await source.verify();await store.verify(false);
      const snapshot=await source.snapshot(days,operation);
      if(operation==='quiz'&&snapshot.rows.some(r=>r.statement_0===null))refuse();
      const fingerprint=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
      const sourceHash=fingerprint(snapshot),reviewed=await inspectSelectedContent(db,snapshot.rows);
      for(const row of snapshot.rows){
        const existing=reviewed.reservations.find(r=>r.quiz_day===row.quiz_day);
        if(reviewed.reservations.some(r=>r.character_key===row.character_key&&r.quiz_day!==row.quiz_day) || (existing?.character_key && existing.character_key!==row.character_key) || (operation==='quiz'&&!existing))refuse();
        const quiz=reviewed.quizzes.find(q=>q.quiz_day===row.quiz_day);
        const fields=operation==='character'?['character_key','display_name','portrait_ref']:['statement_0','statement_1','statement_2','false_choice','explanation','story_0','story_1','story_2'];
        const previous=operation==='character'?existing:quiz;
        const status=!previous?'addition':fields.every(field=>(field.startsWith('story_') && row[field]===undefined) || previous[field]===row[field])?'unchanged':'divergence';
        write(`Jour ${row.quiz_day} : ${status}`);
        if(operation==='quiz') for(const change of storyChanges(row,quiz)) write(change);
      }
      const phrase=`APPLIQUER ${operation} ${[...days].sort((a,b)=>a-b).join(',')}`;
      if(await ask(`Cible ${environment} : saisir ${phrase} : `)!==phrase)refuse();
      if(environment==='production'){
        const authorization=`AUTORISER PRODUCTION ${randomBytes(12).toString('hex')}`;
        if(await ask(`Autorisation distincte : saisir ${authorization} : `)!==authorization)refuse();
        await db.query('ROLLBACK');
      }
      const privileges=await db.query("SELECT has_table_privilege('advent_character_reservations','SELECT') AND has_table_privilege('advent_character_reservations','INSERT') AND has_table_privilege('advent_character_reservations','UPDATE') AND has_table_privilege('advent_quizzes','SELECT') AND has_table_privilege('advent_quizzes','INSERT') AND has_table_privilege('advent_quizzes','UPDATE') AS ok");
      if(privileges.rows[0]?.ok!==true)refuse();
      await source.verify(true);await store.verify(true);
      if(fingerprint(await source.snapshot(days,operation))!==sourceHash)refuse();
      let hold;
      try {
        hold=await source.acquire(snapshot);await hold.verify();
        await source.verify(true);await store.verify(true);
        if(fingerprint(await source.snapshot(days,operation))!==sourceHash)refuse();
        await hold.verify();await applySelectedContent(db,snapshot.rows,operation,reviewed);
      } finally {if(hold)await hold.release();}
      write('Synchronisation terminée.');return;
}
