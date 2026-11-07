// Independent oracle for a chronological Advent journey.
// Entries must be in play order; a missed day is absent, a late answer has late=true.
function expectedScore(entries) {
  let streak = 0
  let score = 0
  const results = []
  for (const entry of entries) {
    const { day, choice, falseChoice, late = false } = entry
    if (!Number.isInteger(day) || day < 1 || day > 24 || !Number.isInteger(choice) || choice < 0 || choice > 2 || !Number.isInteger(falseChoice) || falseChoice < 0 || falseChoice > 2) throw new Error('Invalid answer')
    const correct = choice === falseChoice
    let responsePoints = 0, participationPoints = 0, bonusPoints = 0
    if (!late) {
      responsePoints = correct ? 10 : 0
      participationPoints = 1
      streak = correct ? streak + 1 : 0
      if (correct && streak % 3 === 0) bonusPoints = 2
    }
    const totalPoints = responsePoints + participationPoints + bonusPoints
    score += totalPoints
    results.push({ day, selectedChoice: choice, falseChoice, correct, responsePoints, participationPoints, bonusPoints, totalPoints, late })
  }
  return { score, results }
}
module.exports = { expectedScore }
