const {test}=require('node:test')
const assert=require('node:assert/strict')
const {chromium}=require('@playwright/test')
const {readRevealedResult}=require('./result-check.cjs')
const expected={day:3,selectedChoice:0,falseChoice:1,correct:false,responsePoints:0,participationPoints:0,bonusPoints:0,late:true}
test('waits for a delayed reveal before requesting the result',async()=>{
 const browser=await chromium.launch({headless:true})
 try {
  const page=await browser.newPage()
  await page.setContent('<div class="advent__reveal" hidden>Result</div><script>setTimeout(()=>document.querySelector(".advent__reveal").hidden=false,350)</script>')
  let calls=0
  const body=await readRevealedResult(page,async()=>{
   calls++
   assert.equal(await page.locator('.advent__reveal').isVisible(),true)
   return {status:200,body:{...expected}}
  },expected)
  assert.equal(calls,1); assert.equal(body.day,3)
 } finally {await browser.close()}
})
test('diagnostics contain status or field only',async()=>{
 // Use a real browser below to exercise the same locator and status/field branches.
 const browser=await chromium.launch({headless:true})
 try {
  const p=await browser.newPage(); await p.setContent('<div class="advent__reveal">Result</div>')
  await assert.rejects(()=>readRevealedResult(p,async()=>({status:404}),expected),e=>e.safeCode==='RESULT_HTTP_404'&&!e.message.includes('404'))
  await assert.rejects(()=>readRevealedResult(p,async()=>({status:200,body:{...expected,correct:true}}),expected),e=>e.safeCode==='RESULT_FIELD_correct'&&!e.message.includes('true'))
 } finally {await browser.close()}
})
