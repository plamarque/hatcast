const fail=()=>{throw Error('Private portrait storage refused')};
// verifyBinding must independently verify the Cloud Run service, its active
// revision and runtime service account's access before this can be exposed.
export function createGcsPortraitStore({storage,bucketName,projectNumber,verifyBinding}) {
  if(typeof verifyBinding!=='function')fail();
  const bucket=storage.bucket(bucketName);
  async function verify(forWrite) {
    await verifyBinding(forWrite);
    const [meta]=await bucket.getMetadata();
    if(meta.name!==bucketName||String(meta.projectNumber)!==String(projectNumber)||
       meta.iamConfiguration?.publicAccessPrevention!=='enforced'||meta.iamConfiguration?.uniformBucketLevelAccess?.enabled!==true) fail();
    const needed=forWrite?['storage.objects.get','storage.objects.update']:['storage.objects.get'];
    const [permissions]=await bucket.iam.testPermissions(needed);
    if(needed.some(p=>permissions[p]!==true))fail();
  }
  return {verify};
}
