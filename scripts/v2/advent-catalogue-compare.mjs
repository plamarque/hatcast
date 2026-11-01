// Only return day numbers and states; database content must stay in private memory.
const fields = ['quiz_day', 'display_name', 'portrait_ref', 'statement_0', 'statement_1', 'statement_2', 'false_choice', 'explanation'];
export function compareQuizzes(selected, target) {
  const byDay = new Map(target.map(row => [row.quiz_day, row]));
  return selected.map(row => {
    const existing = byDay.get(row.quiz_day);
    return {day: row.quiz_day, status: !existing ? 'addition' :
      fields.every(field => row[field] === existing[field]) ? 'unchanged' : 'divergence'};
  });
}
