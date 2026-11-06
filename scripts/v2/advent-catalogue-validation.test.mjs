import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalogue, CatalogueValidationError } from './advent-catalogue-validation.mjs';
const fixture = () => ({schema_version:1, year:2026, index_base:0, quizzes:Array.from({length:24}, (_,i) => ({
  day:i+1, kind:'contribution', name:'Synthetic', portrait:{type:'bucket-object',object:`portraits/synthetic-${i}.png`},
  statements:['One','Two','Three'], false_statement_index:2, reveal:null
}))});
test('selects only explicitly chosen validated quizzes in order', () => {
  const rows = validateCatalogue(fixture(), [3,1]);
  assert.deepEqual(rows.map(r => r.quiz_day), [3,1]);
  assert.equal(rows[0].portrait_ref, 'synthetic-2.png');
});
test('rejects malformed catalogue and non-contributions without disclosing content', () => {
  const cases = [q => q.quizzes[1].day=1, q => q.quizzes[0].false_statement_index=3,
    q => q.quizzes[0].kind='fictional-placeholder', q => q.quizzes[0].portrait.object='portraits/../secret.png',
    q => q.quizzes[0].statements[0]='', q => q.quizzes[0].reveal=undefined,
    q => q.quizzes[0].portrait.object=`portraits/${'a'.repeat(252)}.png`, q => q.schema_version=2];
  for (const mutate of cases) {
    const q = fixture(); mutate(q);
    assert.throws(() => validateCatalogue(q, [1]), e => e instanceof CatalogueValidationError && !e.message.includes('Synthetic'));
  }
  assert.throws(() => validateCatalogue(fixture(), [1,1]), CatalogueValidationError);
});

test('rejects a selected generic portrait and preserves optional explanations', () => {
  const q = fixture(); q.quizzes[0].portrait={type:'application-resource',path:'advent/lutin-generique-net.png'};
  assert.throws(() => validateCatalogue(q, [1]), CatalogueValidationError);
  q.quizzes[1].reveal='Synthetic explanation';
  assert.equal(validateCatalogue(q, [2])[0].explanation, 'Synthetic explanation');
});
test('accepts a reserved character without quiz and rejects incomplete and duplicate identities', () => {
  const q=fixture();q.quizzes[0].character_id='fiction-1';q.quizzes[0].statements=null;q.quizzes[0].false_statement_index=null;q.quizzes[0].reveal=null;
  const row=validateCatalogue(q,[1])[0];assert.equal(row.character_key,'fiction-1');assert.equal(row.statement_0,null);
  q.quizzes[0].false_statement_index=1;assert.throws(()=>validateCatalogue(q,[1]),CatalogueValidationError);
  q.quizzes[0].false_statement_index=null;q.quizzes[1].character_id='fiction-1';assert.throws(()=>validateCatalogue(q,[1]),CatalogueValidationError);
});

test('validates ordered multiline stories without normalizing them', () => {
  const q = fixture();
  q.quizzes[1].stories = ['Premier\n\nÉté', null, 'Troisième'];
  const row = validateCatalogue(q, [2])[0];
  assert.equal(row.story_0, 'Premier\n\nÉté');
  assert.equal(row.story_1, null);
  assert.equal(row.story_2, 'Troisième');
  q.quizzes[1].stories = ['one', 'two'];
  assert.throws(() => validateCatalogue(q, [2]));
  q.quizzes[1].stories = ['one', '', null];
  assert.throws(() => validateCatalogue(q, [2]));
});

test('accepts three explicit null stories and rejects stories on a reservation', () => {
  const q=fixture(); q.quizzes[0].stories=[null,null,null];
  const row=validateCatalogue(q,[1])[0];
  assert.deepEqual([row.story_0,row.story_1,row.story_2],[null,null,null]);
  q.quizzes[0].statements=null; q.quizzes[0].false_statement_index=null; q.quizzes[0].reveal=null;
  assert.throws(()=>validateCatalogue(q,[1]),CatalogueValidationError);
});
