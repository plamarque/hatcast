import {createHash,randomBytes} from 'node:crypto';
import {storyChanges} from './advent-catalogue-compare.mjs';
import {inspectSelectedContent,applySelectedContent} from './advent-catalogue-reservations.mjs';
import {GAME_TABLES,isLegacyGeneric,replaceGeneric} from './advent-catalogue-replace-generic.mjs';
const refuse=()=>{throw Error('Content operation refused')};
export async function runCloudContent({source,store,db,days,operation,environment,ask,write,reviewPrivate}) {
      const replacing=operation==='replace-generic';
      if(replacing && (environment!=='development' || days.length!==1 || typeof reviewPrivate!=='function'))refuse();
      await source.verify();await store.verify(false);
      const snapshot=await source.snapshot(days,replacing?'character':operation);
      if((operation==='quiz'||replacing)&&snapshot.rows.some(r=>r.statement_0===null))refuse();
      const fingerprint=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
      const sourceHash=fingerprint(snapshot),reviewed=await inspectSelectedContent(db,snapshot.rows);
      if(replacing) {
        const row=snapshot.rows[0], day=days[0];
        if(snapshot.rows.length!==1 || row.quiz_day!==day || !isLegacyGeneric(reviewed,day))refuse();
        reviewPrivate(reviewed.quizzes[0]);
        const phrase=`J AI VERIFIE LE QUIZ FICTIF ${day}`;
        if(await ask(`Après examen privé et vérification de son origine fictive et de ses éventuelles modifications, saisir ${phrase} : `)!==phrase)refuse();
      }
      const replacements=[];
      for(const row of replacing?[]:snapshot.rows){
        const existing=reviewed.reservations.find(r=>r.quiz_day===row.quiz_day);
        if(reviewed.reservations.some(r=>r.character_key===row.character_key&&r.quiz_day!==row.quiz_day) || (existing?.character_key && existing.character_key!==row.character_key) || (operation==='quiz'&&!existing))refuse();
        const quiz=reviewed.quizzes.find(q=>q.quiz_day===row.quiz_day);
        const fields=operation==='character'?['character_key','display_name','portrait_ref']:['statement_0','statement_1','statement_2','false_choice','explanation','story_0','story_1','story_2'];
        const previous=operation==='character'?existing:quiz;
        const status=!previous?'addition':fields.every(field=>(field.startsWith('story_') && row[field]===undefined) || previous[field]===row[field])?'unchanged':'divergence';
        write(`Jour ${row.quiz_day} : ${status}`);
        if(operation==='quiz' && status==='divergence')replacements.push(row.quiz_day);
        if(operation==='quiz') for(const change of storyChanges(row,quiz)) write(change);
      }
      if(replacements.length){const replace=`REMPLACER ${replacements.sort((a,b)=>a-b).join(',')}`;if(await ask(`Contenu divergent : saisir ${replace} : `)!==replace)refuse();}
      const phrase=`APPLIQUER ${operation} ${[...days].sort((a,b)=>a-b).join(',')}`;
      if(await ask(`Cible ${environment} : saisir ${phrase} : `)!==phrase)refuse();
      if(environment==='production'){
        const authorization=`AUTORISER PRODUCTION ${randomBytes(12).toString('hex')}`;
        if(await ask(`Autorisation distincte : saisir ${authorization} : `)!==authorization)refuse();
        await db.query('ROLLBACK');
      }
      const privileges=await db.query("SELECT has_table_privilege('advent_character_reservations','SELECT') AND has_table_privilege('advent_character_reservations','INSERT') AND has_table_privilege('advent_character_reservations','UPDATE') AND has_table_privilege('advent_quizzes','SELECT') AND has_table_privilege('advent_quizzes','INSERT') AND has_table_privilege('advent_quizzes','UPDATE') AS ok");
      if(privileges.rows[0]?.ok!==true)refuse();
      if(replacing) {
        const rights=await db.query("SELECT bool_and(has_table_privilege(name,'SELECT') AND has_table_privilege(name,'UPDATE')) AS ok FROM unnest($1::text[]) AS name",[[...GAME_TABLES,'advent_member_lock','advent_test_clock']]);
        if(rights.rows[0]?.ok!==true)refuse();
      }
      await source.verify(true);await store.verify(true);
      if(fingerprint(await source.snapshot(days,replacing?'character':operation))!==sourceHash)refuse();
      let hold;
      try {
        hold=await source.acquire(snapshot);await hold.verify();
        await source.verify(true);await store.verify(true);
        if(fingerprint(await source.snapshot(days,replacing?'character':operation))!==sourceHash)refuse();
        await hold.verify();
        if(replacing) await replaceGeneric(db,environment,snapshot.rows[0],reviewed);
        else await applySelectedContent(db,snapshot.rows,operation,reviewed);
      if(replacing) {
        const row=snapshot.rows[0], after=await inspectSelectedContent(db,[row]);
        const reservation=after.reservations.length===1 && ['quiz_day','character_key','display_name','portrait_ref'].every(k=>after.reservations[0][k]===row[k]);
        const quizFields=['quiz_day','display_name','portrait_ref','statement_0','statement_1','statement_2','false_choice','explanation','story_0','story_1','story_2'];
        const quiz=after.quizzes.length===1 && quizFields.every(k=>after.quizzes[0][k]===(row[k]??null));
        if(!reservation || !quiz || BigInt(after.quizzes[0].content_revision)!==BigInt(reviewed.quizzes[0].content_revision)+1n)refuse();
        write('Réservation et quiz vérifiés séparément.');
      }
      } finally {if(hold)await hold.release();}
      write('Synchronisation terminée.');return;
}
