// Run only through run-journey.sh. Real API and Chromium; no response or clock mocks.
const { chromium, expect } = require('@playwright/test')
const { advance } = require('./clock-proxy.cjs')
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { expectedScore } = require('./expected-score.cjs')
const { recordPage } = require('./video-recorder.cjs')
const { readRevealedResult } = require('./result-check.cjs')
const base = 'http://127.0.0.1:14331'
const out = process.env.ADVENT_JOURNEY_OUTPUT
if (!out || !process.env.ADVENT_GUARDIAN_FD) throw Error('Use the isolated journey launcher')
const evidence = []
function note(day, message) { evidence.push({ day, message }); fs.writeFileSync(path.join(out, 'evidence.json'), JSON.stringify(evidence, null, 2)) }
;(async () => {
  const browser = await chromium.launch({headless: true})
  const context = await browser.newContext({viewport: {width:390,height:844}, reducedMotion:'reduce', serviceWorkers:'block'})
  const page = await context.newPage()
  const recorder = recordPage(page, path.join(out, 'journey.webm'))
  let day = 0
  let step = 'préparation'
  const answers = []
  const content = JSON.parse(fs.readFileSync(process.env.ADVENT_JOURNEY_EXPECTATIONS, 'utf8'))
  const available = day => Number.isInteger(content[day]?.falseChoice)
  const absent = Array.from({length:24},(_,i)=>i+1).filter(day=>!available(day))
  note(0, `Jours sans quiz officiel complet : ${absent.join(', ') || 'aucun'}. Préférence initiale à vérifier ; livraison push non observée.`)
  async function api(endpoint) {
    const session = await page.request.get(`${base}/v1/advent/session`)
    assert.equal(session.status(),200,'session')
    const data = await session.json()
    assert.equal(data.testControls,false,'normal member must have no test controls')
    const response = await page.request.get(`${base}/v1/advent${endpoint}`, {headers:{'X-Advent-Test-Session':data.sessionId,'X-Advent-User':'d0000001-0000-4000-8000-000000000001'}})
    return {status:response.status(), body: await response.json().catch(() => null)}
  }
  async function calendar() {
    if (await page.locator('.advent__calendar').isVisible()) return
    await page.getByRole('button',{name:'Voir le calendrier'}).first().click()
    await expect(page.locator('.advent__calendar')).toBeVisible()
    await recorder.capture()
  }
  async function ranking(score) {
    const response = await api('/ranking')
    assert.equal(response.status,200,'ranking API')
    assert.equal(response.body.ranking.score,score,'revealed ranking score')
    const button = page.getByRole('button',{name:/^(Voir le classement|Classement)$/}).first()
    await button.click()
    await expect(page.locator('.advent__ranking-summary')).toContainText(`${score} point`)
    await recorder.capture()
    await calendar()
  }
  async function result(expected) {
    await readRevealedResult(page,api,expected)
    await expect(page.locator('.advent__result-points')).toContainText(`+${expected.totalPoints}`)
    const truth = await page.locator('.advent__result-answer--truth').innerText()
    assert.ok(truth.includes(content[expected.day].statements[expected.falseChoice]), 'Result content differs from private catalogue')
    if (content[expected.day].explanation) {
      const resultText = await page.locator('.advent__reveal').innerText()
      assert.ok(resultText.includes(content[expected.day].explanation), 'Result explanation differs from private catalogue')
    }
    await recorder.capture()
  }
  try {
    const guard = await page.request.get(`${base}/v1/e2e/fixtures/advent-preview-guard`,{headers:{'X-Hatcast-E2E-Key':'e2e-fixtures-secret'}})
    assert.equal(guard.status(),200); assert.equal((await guard.json()).environment,'advent-e2e-memory')
    for (day=1; day<=26; day++) {
      step = 'changement de date'
      advance(day)
      step = 'connexion et contrôle de date'
      await page.goto('about:blank')
      // Refresh the ordinary member session, which can expire as the real clock advances.
      const login = await page.request.post(`${base}/v1/auth/google`,{data:{idToken:'e2e-member',rememberMe:true}})
      assert.equal(login.status(),200,'fictional member login')
      const me = await page.request.get(`${base}/v1/auth/me`)
      assert.equal((await me.json()).user.id,'d0000001-0000-4000-8000-000000000001')
      const clock = await api('/clock')
      assert.equal(clock.status,200); assert.equal(clock.body.simulated,false)
      assert.equal(clock.body.date,`2026-12-${String(day).padStart(2,'0')}`)
      await page.goto(`${base}/avent`)
      const localDay = await page.evaluate(() => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))
      assert.equal(localDay,clock.body.date,'browser and API must read the same date')
      step = 'ouverture et résultat prioritaire'
      if (day===1) {
        const preference = await api('/reminder-preference')
        assert.equal(preference.status,200)
        note(day,`Préférence de rappel initiale : ${JSON.stringify(preference.body)}. Livraison non observée.`)
        await page.getByRole('button',{name:'Commencer à jouer'}).click()
        await expect(page.locator('.advent__calendar')).toBeVisible()
        await recorder.capture()
      } else if (answers.some(a => a.day===day-1 && !a.late)) {
        const expected = expectedScore(answers).results.find(x => x.day===day-1)
        await result(expected)
        await page.getByRole('button',{name:'Continuer'}).click()
      }
      if (day<=24) {
        step = 'calendrier et cadeau futur'
        await calendar()
        if (day<24) {
          const future = page.locator(`.advent__calendar-door[data-day="${day+1}"]`)
          await expect(future).toBeDisabled()
          assert.equal((await api(`/doors/${day+1}`)).status,404,'future content must be unavailable')
        }
        if (day===5 && available(3)) {
          step = 'réponse tardive et révélation du jour 3'
          await page.locator('.advent__calendar-door[data-day="3"]').click()
          await page.getByRole('button',{name:'Ouvrir le cadeau du jour 3'}).click()
          await expect(page.getByText(/sans gagner de points/)).toBeVisible()
          const lateChoice = content[3].falseChoice
          await page.getByRole('radio').nth(lateChoice).check()
          await page.getByRole('button',{name:'Confirmer ma réponse'}).click()
          answers.push({day:3,choice:lateChoice,falseChoice:content[3].falseChoice,late:true})
          await result(expectedScore(answers).results.at(-1))
          const continueButton = page.getByRole('button',{name:'Continuer'})
          if (await continueButton.isVisible()) await continueButton.click()
          await calendar()
          note(day,'Réponse tardive et résultat sans points contrôlés.')
        }
        if (day===6 && available(1)) {
          await page.locator('.advent__calendar-door[data-day="1"]').click()
          await result(expectedScore(answers).results.find(x => x.day === 1))
          await calendar()
          note(day,'Consultation d’une case déjà jouée contrôlée.')
        }
        if (!available(day)) {
          const missing = page.locator(`.advent__calendar-door[data-day="${day}"]`)
          await expect(missing).toHaveAttribute('data-state','missing')
          assert.equal((await api(`/doors/${day}`)).status,404,'unavailable quiz')
          await missing.click()
          await expect(page.getByText('Il n’y a rien ici. Reviens plus tard !')).toBeVisible()
          await recorder.capture()
          note(day,'Aucun quiz officiel disponible ; état sans contenu vérifié.')
          continue
        }
        if (day===3) { note(day,'Jour volontairement manqué ; reprise tardive prévue le 5.'); continue }
        step = 'quiz et réponse'
        await page.locator(`.advent__calendar-door[data-day="${day}"]`).click()
        await page.getByRole('button',{name:`Ouvrir le cadeau du jour ${day}`}).click()
        await recorder.capture()
        const falseChoice = content[day].falseChoice
        const choice = day%4===0 ? (falseChoice+1)%3 : falseChoice
        await page.getByRole('radio').nth(choice).check()
        await page.getByRole('button',{name:'Confirmer ma réponse'}).click()
        answers.push({day,choice,falseChoice})
        await expect(page.locator('.advent__recorded')).toBeVisible()
        await recorder.capture()
        await expect(page.locator('.advent__recorded')).not.toContainText(/bonne réponse|mauvaise réponse|points|anecdote fausse/i)
        assert.equal((await api(`/doors/${day}/result`)).status,404,'result is hidden before midnight')
        const revealed = expectedScore(answers.filter(a => a.late || a.day < day)).score
        await ranking(revealed)
        await page.locator(`.advent__calendar-door[data-day="${day}"]`).click()
        await expect(page.locator('.advent__waiting')).toBeVisible()
        await recorder.capture()
        await expect(page.locator('.advent__waiting')).not.toContainText(/bonne réponse|mauvaise réponse|points|anecdote fausse/i)
        note(day,'Réponse enregistrée, attente et classement contrôlés.')
      } else {
        step = 'bilan et classement final'
        if (day === 25) {
          await expect(page.locator('.advent__christmas')).toBeVisible()
          await expect(page.locator('.advent__christmas')).toContainText(`${expectedScore(answers).score} point`)
          await ranking(expectedScore(answers).score)
        } else {
          await expect(page.locator('.advent__ranking')).toBeVisible()
          await expect(page.locator('.advent__ranking-summary')).toContainText(`${expectedScore(answers).score} point`)
          await calendar()
        }
        await page.locator('.advent__calendar-door[data-day="25"]').click()
        await expect(page.locator('.advent__christmas')).toBeVisible()
        await recorder.capture()
        note(day,'Bilan, score, classement et calendrier contrôlés.')
      }
    }
    note(26,'Préférence et livraison push non vérifiées : profil local sans clés push.')
  } catch (error) {
    note(day,`ÉCHEC : étape ${step} (${error?.safeCode || error?.name || 'Error'}). Voir la capture et la vidéo privées.`)
    await page.screenshot({path:path.join(out,`failure-day-${day}.png`),fullPage:true}).catch(()=>{})
    throw error
  } finally {
    try { await recorder.stop() } catch { note(day,'ÉCHEC : finalisation de la vidéo.'); process.exitCode=1 }
    await context.close(); await browser.close()
  }
})().catch(() => { console.error('Journey failed; private content and answers omitted.'); process.exitCode=1 })
