const {Client} = require('pg');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
(async()=>{
 const {insertReviewedQuizzes} = await import('./advent-catalogue-database.mjs');
 const {runOperator} = await import('./advent-catalogue-operator.mjs');
 const {deleteTestDays} = await import('./advent-catalogue-delete.mjs');
 const {applySelectedContent,inspectSelectedContent} = await import('./advent-catalogue-reservations.mjs');
 const {replaceGeneric} = await import('./advent-catalogue-replace-generic.mjs');
 const {runCloudContent} = await import('./advent-catalogue-cloud-content.mjs');
 const {createLocalPortraitStore} = await import('./advent-catalogue-local-store.mjs');
 const config={host:'127.0.0.1',port:Number(process.env.ADVENT_TEST_PORT),user:'postgres',password:'fictional-test',database:'advent_catalogue_disposable'};
 const a=new Client(config), b=new Client(config); await a.connect(); await b.connect();
 try {
  await a.query('CREATE SCHEMA fixture'); await a.query('SET search_path TO fixture'); await b.query('SET search_path TO fixture');
  await a.query('CREATE TABLE users (id UUID PRIMARY KEY)');
  const migrations=path.resolve(__dirname,'../../services/api/src/main/resources/db/migration');
  for (const filename of fs.readdirSync(migrations).filter(f=>/^V(?:7[0-9]|8[0-5])__.*\.sql$/.test(f)).sort()) await a.query(fs.readFileSync(path.join(migrations,filename),'utf8'));
  await a.query("INSERT INTO users VALUES ('00000000-0000-0000-0000-000000000001')");
  const gameTables=['advent_test_clock','advent_test_clock_advances','advent_test_member_state','advent_test_answers','advent_test_attempts','advent_test_generations','advent_test_replays','advent_member_lock','advent_member_answers','advent_member_attempts','advent_member_generations','advent_member_replays','advent_member_demo_quizzes','advent_content_transition','advent_offline_content_conflicts'];
  async function snapshot() { const state={}; for(const table of gameTables) state[table]=(await a.query(`SELECT COALESCE(json_agg(t ORDER BY row_to_json(t)::text), '[]'::json) AS rows FROM ${table} t`)).rows[0].rows; return state; }
  const q=day=>({quiz_day:day,display_name:'Synthetic',portrait_ref:'synthetic.png',statement_0:'One',statement_1:'Two',statement_2:'Three',false_choice:2,explanation:null});
  await insertReviewedQuizzes(a,[q(1)],[{day:1,status:'addition'}]);
  await insertReviewedQuizzes(a,[q(1)],[{day:1,status:'unchanged'}]);
  await assert.rejects(insertReviewedQuizzes(a,[q(1)],[{day:1,status:'addition'}]));
  await a.query("INSERT INTO advent_member_answers (user_id,quiz_day,answer_id,choice,correct_choice,answered_at,reveal_at) VALUES ('00000000-0000-0000-0000-000000000001',3,'00000000-0000-0000-0000-000000000002',0,1,now(),now())");
  const old1=q(1), newer1={...q(1),statement_0:'Changed'};
  await assert.rejects(insertReviewedQuizzes(a,[newer1],[{day:1,status:'divergence'}]));
  await insertReviewedQuizzes(a,[newer1],[{day:1,status:'divergence'}],[old1]);
  await assert.rejects(insertReviewedQuizzes(a,[q(1)],[{day:1,status:'divergence'}],[old1]));
  const old3=q(3); await a.query('INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',Object.values(old3));
  await assert.rejects(insertReviewedQuizzes(a,[{...old3,statement_0:'Changed'}],[{day:3,status:'divergence'}],[old3]));
  // The optional ordered stories survive a legacy source update, including Unicode and paragraphs.
  const withStories={...q(14),story_0:'Premier été\n\nDeuxième paragraphe',story_1:null,story_2:'Troisième récit'};
  await insertReviewedQuizzes(a,[withStories],[{day:14,status:'addition'}]);
  const readStories=async day=>(await a.query('SELECT story_0,story_1,story_2 FROM advent_quizzes WHERE quiz_day=$1',[day])).rows[0];
  const originalStories={story_0:withStories.story_0,story_1:null,story_2:withStories.story_2};
  assert.deepEqual(await readStories(14),originalStories);
  const previous14=(await a.query('SELECT * FROM advent_quizzes WHERE quiz_day=14')).rows[0];
  const legacyUpdate={...q(14),statement_0:'Updated from legacy source'};
  await insertReviewedQuizzes(a,[legacyUpdate],[{day:14,status:'divergence'}],[previous14]);
  assert.deepEqual(await readStories(14),originalStories);
  const current14=(await a.query('SELECT * FROM advent_quizzes WHERE quiz_day=14')).rows[0];
  await assert.rejects(insertReviewedQuizzes(a,[{...legacyUpdate,story_0:null,story_1:null,story_2:withStories.story_2}],[{day:14,status:'divergence'}],[previous14]));
  assert.deepEqual(await readStories(14),originalStories);
  await insertReviewedQuizzes(a,[{...legacyUpdate,story_0:null,story_1:null,story_2:withStories.story_2}],[{day:14,status:'divergence'}],[current14]);
  assert.deepEqual(await readStories(14),{story_0:null,story_1:null,story_2:withStories.story_2});
  const stateBefore=await snapshot();
  await assert.rejects(insertReviewedQuizzes(a,[q(2),q(3)],[{day:2,status:'addition'},{day:3,status:'addition'}]));
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes')).rows[0].n,3);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_member_answers')).rows[0].n,1);
  await a.query(`CREATE FUNCTION fail_day_six() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.quiz_day = 6 THEN RAISE EXCEPTION 'synthetic failure'; END IF; RETURN NEW; END $$`);
  await a.query('CREATE TRIGGER fail_day_six BEFORE INSERT ON advent_quizzes FOR EACH ROW EXECUTE FUNCTION fail_day_six()');
  await assert.rejects(insertReviewedQuizzes(a,[q(5),q(6)],[{day:5,status:'addition'},{day:6,status:'addition'}]));
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day IN (5,6)')).rows[0].n,0);
  const results=await Promise.allSettled([insertReviewedQuizzes(a,[q(4)],[{day:4,status:'addition'}]),insertReviewedQuizzes(b,[q(4)],[{day:4,status:'addition'}])]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day=4')).rows[0].n,1);
  assert.deepEqual(await snapshot(),stateBefore);
  await a.query('BEGIN');
  await a.query("INSERT INTO advent_member_answers (user_id,quiz_day,answer_id,choice,correct_choice,answered_at,reveal_at) VALUES ('00000000-0000-0000-0000-000000000001',7,'00000000-0000-0000-0000-000000000003',0,1,now(),now())");
  const competing = insertReviewedQuizzes(b,[q(7)],[{day:7,status:'addition'}]);
  await a.query('COMMIT');
  await assert.rejects(competing);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day=7')).rows[0].n,0);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_member_answers WHERE quiz_day=7')).rows[0].n,1);
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'avent-flow-')));
  try {
   const store=createLocalPortraitStore(dir), bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==','base64');
   const source={verify:async()=>{},acquire:async()=>({verify:async()=>{},release:async()=>{}}),snapshot:async()=>({generation:'synthetic-1',rows:[q(8)],portraits:[{ref:'synthetic.png',generation:'synthetic-1',bytes}]})};
   const target={verify:async()=>store.verify(),inspect:async snapshot=>({identity:'disposable',rows:(await a.query('SELECT * FROM advent_quizzes WHERE quiz_day=ANY($1::int[])',[snapshot.rows.map(r=>r.quiz_day)])).rows,portraits:await store.inspect(snapshot.portraits)}),stagePortraits:store.stagePortraits,acquirePortraits:async()=>({verify:async()=>{},release:async()=>{}}),insert:(rows,reviewed)=>insertReviewedQuizzes(a,rows,reviewed)};
   const stateBeforeFlow=await snapshot(); const output=[]; assert.equal(await runOperator(source,target,[8],{write:line=>output.push(line),confirm:async()=> 'APPLIQUER'}),'applied'); assert.doesNotMatch(output.join(' '),/Synthetic|synthetic\.png|One|Two|Three/);
   assert.deepEqual(await snapshot(),stateBeforeFlow);assert.deepEqual(fs.readFileSync(path.join(dir,'synthetic.png')),bytes);
   assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day=8')).rows[0].n,1);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
  // Targeted removal also repairs the retained legacy scoring, regardless of content.
  const user='00000000-0000-0000-0000-000000000001';
  for (const day of [10,11,12,13]) {
   await a.query('INSERT INTO advent_test_answers (user_id,quiz_day,choice,correct_choice,response_points,participation_points,bonus_points,received_at,reveal_at) VALUES ($1,$2,0,0,10,1,$3,now(),now())',[user,day,day===12?2:0]);
  }
  await a.query('INSERT INTO advent_test_member_state (user_id,correct_streak) VALUES ($1,4)',[user]);
  await a.query('INSERT INTO advent_test_generations (user_id,quiz_day,generation) VALUES ($1,11,$2)',[user,'00000000-0000-0000-0000-000000000004']);
  await assert.rejects(deleteTestDays(a,'production',[11]));
  await deleteTestDays(a,'development',[11]);
  assert.deepEqual((await a.query('SELECT quiz_day,bonus_points FROM advent_test_answers ORDER BY quiz_day')).rows,[{quiz_day:10,bonus_points:0},{quiz_day:12,bonus_points:0},{quiz_day:13,bonus_points:2}]);
  assert.equal((await a.query('SELECT correct_streak FROM advent_test_member_state WHERE user_id=$1',[user])).rows[0].correct_streak,3);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_test_generations WHERE quiz_day=11')).rows[0].n,0);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_member_answers WHERE quiz_day=3')).rows[0].n,1);
  await a.query('BEGIN');
  await a.query('SELECT id FROM advent_member_lock WHERE id=1 FOR UPDATE');
  await a.query("INSERT INTO advent_member_attempts (id,user_id,quiz_day) VALUES ('00000000-0000-0000-0000-000000000005',$1,4)",[user]);
  const deleting=deleteTestDays(b,'staging',[4]);
  await a.query('COMMIT');
  await deleting;
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_member_attempts WHERE quiz_day=4')).rows[0].n,0);
  await a.query(`CREATE FUNCTION fail_deletion() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$`);
  await a.query('CREATE TRIGGER fail_deletion BEFORE DELETE ON advent_quizzes FOR EACH ROW EXECUTE FUNCTION fail_deletion()');
  await assert.rejects(deleteTestDays(a,'staging',[3]));
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_member_answers WHERE quiz_day=3')).rows[0].n,1);
  // A reservation can precede its quiz and an identity cannot move to another day.
  const character={...q(20),character_key:'synthetic-identity',statement_0:null,statement_1:null,statement_2:null,false_choice:null};
  await applySelectedContent(a,[character],'character');
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day=20')).rows[0].n,0);
  await assert.rejects(applySelectedContent(a,[{...character,quiz_day:21}],'character'));
  const storyQuiz={...q(20),character_key:character.character_key,story_0:'Un\n\nDeux',story_1:null,story_2:'Fin'};
  await applySelectedContent(a,[storyQuiz],'quiz');
  assert.deepEqual(await readStories(20),{story_0:'Un\n\nDeux',story_1:null,story_2:'Fin'});
  await applySelectedContent(a,[{...character,display_name:'Changed fictional name'}],'character');
  const retained=(await a.query('SELECT display_name,statement_0 FROM advent_quizzes WHERE quiz_day=20')).rows[0];
  assert.deepEqual(retained,{display_name:'Changed fictional name',statement_0:'One'});
  await applySelectedContent(a,[{...q(20),character_key:character.character_key,statement_0:'Changed fictional statement'}],'quiz');
  assert.equal((await a.query('SELECT display_name FROM advent_quizzes WHERE quiz_day=20')).rows[0].display_name,'Changed fictional name');
  assert.deepEqual(await readStories(20),{story_0:'Un\n\nDeux',story_1:null,story_2:'Fin'});
  await a.query('DROP TRIGGER fail_deletion ON advent_quizzes');
  // Deleted test fixtures can be replaced independently of their former target identity.
  const oldFixture={...q(23),display_name:'Fictional fixture',portrait_ref:'fixture.png'};
  await a.query('INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice,explanation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',Object.values(oldFixture));
  await a.query('INSERT INTO advent_character_reservations (quiz_day,character_key,display_name,portrait_ref) VALUES (23,NULL,$1,$2)',[oldFixture.display_name,oldFixture.portrait_ref]);
  await deleteTestDays(a,'development',[23]);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_character_reservations WHERE quiz_day=23')).rows[0].n,0);
  const validated={...q(23),character_key:'validated-fiction-id'};
  await applySelectedContent(a,[validated],'character');await applySelectedContent(a,[validated],'quiz');
  await deleteTestDays(a,'development',[23]);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_character_reservations WHERE quiz_day=23')).rows[0].n,0);
  await applySelectedContent(a,[{...validated,character_key:'other-fiction-id'}],'character');
  await assert.rejects(deleteTestDays(a,'production',[23]));
  const privateRow={...q(22),character_key:'synthetic-cloud'};
  const cloudSource={verify:async()=>{},snapshot:async(_days,op)=>({generation:'synthetic',rows:[op==='character'?{...privateRow,statement_0:null,statement_1:null,statement_2:null,false_choice:null}:privateRow],portraits:[]}),acquire:async()=>({verify:async()=>{},release:async()=>{}})};
  const cloudLines=[],cloudStore={verify:async()=>{}};
  const cloudArgs={source:cloudSource,store:cloudStore,db:a,days:[22],operation:'character',environment:'development',write:s=>cloudLines.push(s),ask:async prompt=>prompt.match(/APPLIQUER character 22/)[0]};
  await runCloudContent(cloudArgs);assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day=22')).rows[0].n,0);
  cloudArgs.operation='quiz';cloudArgs.ask=async prompt=>prompt.match(/APPLIQUER quiz 22/)[0];await runCloudContent(cloudArgs);
  assert.equal((await a.query('SELECT COUNT(*)::int AS n FROM advent_quizzes WHERE quiz_day=22')).rows[0].n,1);
  assert.doesNotMatch(cloudLines.join(' '),/Synthetic|synthetic-cloud|One|Two|Three/);
  await a.query('BEGIN READ ONLY');cloudArgs.environment='production';let prompts=0;
  cloudArgs.ask=async prompt=>{prompts++;return prompt.includes('AUTORISER PRODUCTION')?prompt.match(/AUTORISER PRODUCTION [a-f0-9]+/)[0]:'APPLIQUER quiz 22'};
  await runCloudContent(cloudArgs);assert.equal(prompts,2);
  const beforeDenied=(await a.query('SELECT * FROM advent_quizzes WHERE quiz_day=22')).rows;
  await a.query('BEGIN READ ONLY');let deniedPrompts=0;
  cloudArgs.ask=async prompt=>{deniedPrompts++;return prompt.includes('AUTORISER PRODUCTION')?'REFUS':'APPLIQUER quiz 22'};
  await assert.rejects(runCloudContent(cloudArgs));assert.equal(deniedPrompts,2);
  await a.query('ROLLBACK');assert.deepEqual((await a.query('SELECT * FROM advent_quizzes WHERE quiz_day=22')).rows,beforeDenied);

  // Generic replacement: real transaction, rollback and an uncommitted concurrent reminder.
  const prepareGeneric=async day=>{
   const name=`Lutin du ${day} décembre`;
   await a.query('INSERT INTO advent_quizzes (quiz_day,display_name,portrait_ref,statement_0,statement_1,statement_2,false_choice) VALUES ($1,$2,NULL,$3,$4,$5,0)',[day,name,'Old one','Old two','Old three']);
   await a.query('INSERT INTO advent_character_reservations (quiz_day,character_key,display_name,portrait_ref) VALUES ($1,NULL,$2,NULL)',[day,name]);
   const row={...q(day),character_key:`fiction-${day}`,story_0:null,story_1:null,story_2:null};
   return {row,reviewed:await inspectSelectedContent(a,[row])};
  };
  const success=await prepareGeneric(17);
  await replaceGeneric(a,'development',success.row,success.reviewed);
  const replaced=await inspectSelectedContent(a,[success.row]);
  assert.equal(replaced.reservations[0].character_key,success.row.character_key);
  assert.equal(replaced.quizzes[0].statement_0,success.row.statement_0);
  assert.equal(replaced.quizzes[0].content_revision,'1');
  const failed=await prepareGeneric(18);
  await a.query(`CREATE FUNCTION fail_generic_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.quiz_day=18 THEN RAISE EXCEPTION 'synthetic'; END IF; RETURN NEW; END $$`);
  await a.query('CREATE TRIGGER fail_generic_update BEFORE UPDATE ON advent_quizzes FOR EACH ROW EXECUTE FUNCTION fail_generic_update()');
  await assert.rejects(replaceGeneric(a,'development',failed.row,failed.reviewed));
  assert.deepEqual(await inspectSelectedContent(a,[failed.row]),failed.reviewed);
  const concurrent=await prepareGeneric(19);
  await b.query('BEGIN');
  await b.query('INSERT INTO advent_reminder_attempts (quiz_day,user_id,attempted_at) VALUES (19,$1,now())',[user]);
  const pending=replaceGeneric(a,'development',concurrent.row,concurrent.reviewed);
  let waiting=false;
  for(let i=0;i<100&&!waiting;i++) {
   waiting=(await b.query("SELECT wait_event_type='Lock' AS waiting FROM pg_stat_activity WHERE pid=$1",[a.processID])).rows[0]?.waiting===true;
   if(!waiting)await b.query('SELECT pg_sleep(0.02)');
  }
  assert.equal(waiting,true,'replacement must wait for the concurrent transaction');
  await b.query('COMMIT');
  await assert.rejects(pending);
  assert.deepEqual(await inspectSelectedContent(a,[concurrent.row]),concurrent.reviewed);
  assert.equal((await a.query('SELECT count(*)::int AS n FROM advent_reminder_attempts WHERE quiz_day=19')).rows[0].n,1);

  console.log('Disposable PostgreSQL migrations and catalogue synchronization and deletion checks passed');
 } finally { await a.end(); await b.end(); }
})().catch(e=>{console.error(e.message);process.exitCode=1});
