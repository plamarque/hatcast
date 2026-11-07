// Only return day numbers and states; database content must stay in private memory.
const fields = ['quiz_day', 'display_name', 'portrait_ref', 'statement_0', 'statement_1', 'statement_2', 'false_choice', 'explanation', 'story_0', 'story_1', 'story_2'];
export function compareQuizzes(selected, target) {
  const byDay = new Map(target.map(row => [row.quiz_day, row]));
  return selected.map(row => {
    const existing = byDay.get(row.quiz_day);
    return {day: row.quiz_day, status: !existing ? 'addition' :
      fields.every(field => (field.startsWith('story_') && row[field] === undefined) || row[field] === existing[field]) ? 'unchanged' : 'divergence'};
  });
}

// Report only ordered positions and operation kinds; never disclose story text.
export function storyChanges(row, previous) {
  return [0, 1, 2].flatMap(i => {
    const next = row[`story_${i}`], old = previous?.[`story_${i}`] ?? null;
    if (next === undefined || next === old) return [];
    const action = next === null ? 'suppression' : old === null ? 'ajout' : 'modification';
    return [`Jour ${row.quiz_day} : récit choix ${i + 1} : ${action}`];
  });
}
