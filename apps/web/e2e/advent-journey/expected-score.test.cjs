const { test } = require('node:test')
const assert = require('node:assert/strict')
const { expectedScore } = require('./expected-score.cjs')
test('missed day does not interrupt a run; late answer scores zero and does not affect it', () => {
  const entries = [{day:1,choice:0}, {day:2,choice:1}, {day:4,choice:0}, {day:3,choice:2,late:true}, {day:5,choice:1}]
  const {score,results} = expectedScore(entries.map(e => ({...e, falseChoice:(e.day-1)%3})))
  assert.equal(score, 46)
  assert.deepEqual(results.map(r => r.totalPoints), [11,11,13,0,11])
})
test('wrong answer breaks streak and groups do not overlap', () => {
  const entries = Array.from({length: 8}, (_, i) => ({day:i+1,choice:i===3 ? 2 : i%3}))
  const {score,results} = expectedScore(entries.map(e => ({...e, falseChoice:(e.day-1)%3})))
  assert.equal(score, 82)
  assert.deepEqual(results.map(r => r.bonusPoints), [0,0,2,0,0,0,2,0])
})
test('rejects out-of-range input', () => assert.throws(() => expectedScore([{day:25,choice:0}])))
