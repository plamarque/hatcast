const refuse=()=>{throw Error('Preparation check refused')};
export async function checkReadiness({source,store,db,environment,write}) {
  await source.verify(true);await source.verifyCatalogue();await store.verify(true);
  const rights=await db.query("SELECT has_table_privilege('advent_character_reservations','SELECT') AND has_table_privilege('advent_character_reservations','INSERT') AND has_table_privilege('advent_character_reservations','UPDATE') AND has_table_privilege('advent_quizzes','SELECT') AND has_table_privilege('advent_quizzes','INSERT') AND has_table_privilege('advent_quizzes','UPDATE') AND has_table_privilege('advent_member_lock','SELECT') AND has_table_privilege('advent_member_lock','UPDATE') AND has_table_privilege('advent_test_clock','SELECT') AND has_table_privilege('advent_test_clock','UPDATE') AS ok");
  if(rights.rows[0]?.ok!==true)refuse();
  const migrations=await db.query("SELECT count(*) AS n FROM flyway_schema_history WHERE version ~ '^(7[0-9]|8[0-2])$' AND success");
  if(migrations.rows[0]?.n!=='13')refuse();
  const locks=await db.query('SELECT (SELECT count(*) FROM advent_member_lock WHERE id=1) AS member, (SELECT count(*) FROM advent_test_clock WHERE id=1) AS test');
  if(locks.rows[0]?.member!=='1'||locks.rows[0]?.test!=='1')refuse();
  write(`Préparation ${environment} vérifiée ; aucune contribution lue ni synchronisée.`);
}
