// The catalogue and its validation errors are private; callers must not print input.
const portraitPattern = /^portraits\/[A-Za-z0-9_-]+\.png$/;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const integerIn = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

export class CatalogueValidationError extends Error {
  constructor() { super('Invalid private catalogue or selection'); this.name = 'CatalogueValidationError'; }
}

function validateCatalogueInternal(root, selectedDays, documentOnly = false) {
  const fail = () => { throw new CatalogueValidationError(); };
  if (!root || root.schema_version !== 1 || root.year !== 2026 || root.index_base !== 0 ||
      !Array.isArray(root.quizzes) || root.quizzes.length !== 24 ||
      !Array.isArray(selectedDays) || (!documentOnly && selectedDays.length === 0) ||
      selectedDays.some(day => !integerIn(day, 1, 24)) || new Set(selectedDays).size !== selectedDays.length) fail();
  const days = new Set();
  const identities = new Set();
  for (const q of root.quizzes) {
    if (!q || !integerIn(q.day, 1, 24) || days.has(q.day) ||
        !['contribution', 'fictional-placeholder'].includes(q.kind) || !nonempty(q.name) ||
        !((Array.isArray(q.statements) && q.statements.length === 3 && q.statements.every(nonempty) &&
           integerIn(q.false_statement_index, 0, 2) && (q.reveal === null || typeof q.reveal === 'string')) ||
          (q.kind === 'contribution' && q.statements == null && q.false_statement_index == null && q.reveal == null)) || !q.portrait ||
        !((q.portrait.type === 'bucket-object' && typeof q.portrait.object === 'string' && portraitPattern.test(q.portrait.object) && q.portrait.object.slice('portraits/'.length).length <= 255) ||
          (q.portrait.type === 'application-resource' && q.portrait.path === 'advent/lutin-generique-net.png'))) fail();
    if (q.stories !== undefined && (!Array.isArray(q.stories) || q.stories.length !== 3 || !q.stories.every(v => v === null || nonempty(v)) || q.statements == null)) fail();
    days.add(q.day);
    if (q.character_id !== undefined || (q.kind === 'contribution' && q.portrait.type === 'bucket-object')) {
      const identity = q.character_id ?? `legacy:${q.portrait.object}`;
      if (typeof identity !== 'string' || !/^[A-Za-z0-9_:/.-]{1,255}$/.test(identity) || identities.has(identity)) fail();
      identities.add(identity);
    }
  }
  if (root.extra_contributions !== undefined && !Array.isArray(root.extra_contributions)) fail();
  for (const q of root.extra_contributions ?? []) {
    if (!q || typeof q !== 'object' || Array.isArray(q) || 'day' in q || q.kind !== 'contribution' ||
        !nonempty(q.name) || typeof q.character_id !== 'string' ||
        !/^[A-Za-z0-9_:/.-]{1,255}$/.test(q.character_id) || identities.has(q.character_id) ||
        !q.portrait || q.portrait.type !== 'bucket-object' || typeof q.portrait.object !== 'string' ||
        !portraitPattern.test(q.portrait.object) || q.portrait.object.slice('portraits/'.length).length > 255 ||
        !Array.isArray(q.statements) || q.statements.length !== 3 || !q.statements.every(nonempty) ||
        !integerIn(q.false_statement_index, 0, 2) || !(q.reveal === null || typeof q.reveal === 'string') ||
        (q.stories !== undefined && (!Array.isArray(q.stories) || q.stories.length !== 3 || !q.stories.every(v => v === null || nonempty(v))))) fail();
    if (q.desired_date !== undefined && q.desired_date !== null) {
      if (typeof q.desired_date !== 'string' || !/^2026-\d{2}-\d{2}$/.test(q.desired_date)) fail();
      const date = new Date(`${q.desired_date}T00:00:00.000Z`);
      if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== q.desired_date) fail();
    }
    identities.add(q.character_id);
  }
  return selectedDays.map(day => {
    const q = root.quizzes.find(item => item.day === day);
    if (!q || q.kind !== 'contribution' || q.portrait.type !== 'bucket-object') fail();
    return { quiz_day: day, display_name: q.name, portrait_ref: q.portrait.object.slice('portraits/'.length),
      statement_0: q.statements?.[0] ?? null, statement_1: q.statements?.[1] ?? null, statement_2: q.statements?.[2] ?? null,
      false_choice: q.false_statement_index ?? null, explanation: q.reveal ?? null,
      ...(q.stories === undefined ? {} : Object.fromEntries(q.stories.map((v, i) => [`story_${i}`, v]))),
      character_key: q.character_id ?? `legacy:${q.portrait.object}` };
  });
}

export function validateCatalogue(root, selectedDays) { return validateCatalogueInternal(root, selectedDays); }
export function validateCatalogueDocument(root) { validateCatalogueInternal(root, [], true); }
