// Only a status code or a fixed field name may enter the evidence report.
const {expect}=require('@playwright/test')
const FIELDS=['day','selectedChoice','falseChoice','correct','responsePoints','participationPoints','bonusPoints','late']
function fail(code) { const error=new Error('Result verification failed'); error.safeCode=code; throw error }
async function readRevealedResult(page,api,expected) {
  await expect(page.locator('.advent__reveal')).toBeVisible()
  const result=await api(`/doors/${expected.day}/result`)
  if (result.status!==200) fail(`RESULT_HTTP_${Number.isInteger(result.status)?result.status:'UNKNOWN'}`)
  if (!result.body || typeof result.body!=='object') fail('RESULT_BODY_INVALID')
  for (const field of FIELDS) if (result.body[field]!==expected[field]) fail(`RESULT_FIELD_${field}`)
  return result.body
}
module.exports={readRevealedResult}
