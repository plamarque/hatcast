const fail=()=>{throw Error('Neon target verification failed')};
// Independently verified identities. Any changed branch or endpoint requires revalidation.
const PROJECT='twilight-tree-11908937';
const TARGETS={
 development:{branchId:'br-wandering-fire-al69qlxl',endpointId:'ep-weathered-fog-al1law06'},
 staging:{branchId:'br-solitary-tree-alshbj8i',endpointId:'ep-plain-mode-al95cugr'},
 production:{branchId:'br-misty-shadow-algk3uc4',endpointId:'ep-cold-poetry-al3m3lxk'},
};
export async function verifyNeonDevelopment({databaseUrl,projectId,branchId,apiKey,client,fetchImpl=fetch,environment='development',forWrite=false}) {
 if(!['development','staging','production'].includes(environment))fail();
 if(!/^[a-z0-9-]{1,60}$/.test(projectId||'')||!/^br-[a-z0-9-]+$/.test(branchId||''))fail();
 const uri=new URL(databaseUrl);const host=uri.hostname;
 if(!['postgres:','postgresql:'].includes(uri.protocol)||!/^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/.test(host)||host.includes('-pooler.')||uri.searchParams.getAll('sslmode').length!==1||uri.searchParams.get('sslmode')!=='verify-full'||[...uri.searchParams.keys()].some(k=>k!=='sslmode'))fail();
 const endpointId=host.split('.')[0];
 const expected=TARGETS[environment];
 if(projectId!==PROJECT || branchId!==expected.branchId || endpointId!==expected.endpointId)fail();
 async function get(resource){const response=await fetchImpl(`https://console.neon.tech/api/v2/projects/${projectId}/${resource}`,{headers:{Authorization:`Bearer ${apiKey}`,Accept:'application/json'}});if(!response.ok)fail();return response.json();}
 if(apiKey) {
  const branch=(await get(`branches/${branchId}`)).branch, endpoint=(await get(`endpoints/${endpointId}`)).endpoint;
  if(branch?.id!==branchId||branch.name!==environment||branch.primary!==(environment==='production')||endpoint?.id!==endpointId||endpoint.branch_id!==branchId||endpoint.host!==host||endpoint.type!=='read_write')fail();
 }
 const privilege=environment==='production'&&!forWrite?"has_table_privilege('advent_quizzes','SELECT')":"(has_table_privilege('advent_quizzes','SELECT') AND has_table_privilege('advent_quizzes','INSERT') AND has_table_privilege('advent_quizzes','UPDATE'))";
 const check=await client.query(`SELECT current_database() AS db, current_user AS role, pg_is_in_recovery() AS recovery, ${privilege} AS quiz_ok`);
 const row=check.rows[0];
 if(row?.db!==decodeURIComponent(uri.pathname.slice(1))||row.role!==decodeURIComponent(uri.username)||row.recovery!==false||row.quiz_ok!==true||client.host!==host||client.connection?.stream?.authorized!==true||client.connection?.stream?.servername!==host)fail();
 {
  const intrinsic=await client.query("SELECT current_setting('neon.project_id', true) AS project_id, current_setting('neon.branch_id', true) AS branch_id, current_setting('neon.endpoint_id', true) AS endpoint_id");
  const actual=intrinsic.rows[0];
  if(intrinsic.rowCount!==1||actual?.project_id!==PROJECT||actual?.branch_id!==expected.branchId||actual?.endpoint_id!==expected.endpointId)fail();
 }
 if(environment==='production'&&!forWrite)return {host,database:row.db,role:row.role,projectId,branchId,endpointId};
 const tables=['advent_member_answers','advent_member_attempts','advent_member_generations','advent_member_replays','advent_test_answers','advent_test_attempts','advent_test_generations','advent_test_replays'];
 const rights=await client.query("SELECT bool_and(has_table_privilege(name,'SELECT')) AS ok FROM unnest($1::text[]) AS name",[tables]);
 if(rights.rows[0]?.ok!==true)fail();
 return {host,database:row.db,role:row.role,projectId,branchId,endpointId};
}
