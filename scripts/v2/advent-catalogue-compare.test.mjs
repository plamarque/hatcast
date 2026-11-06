import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareQuizzes} from './advent-catalogue-compare.mjs';
const quiz = day => ({quiz_day:day,display_name:'Synthetic',portrait_ref:'synthetic.png',statement_0:'One',statement_1:'Two',statement_2:'Three',false_choice:2,explanation:null});
test('compares every field and returns only day and status', () => {
  const first=quiz(1), second=quiz(2), third=quiz(3);
  assert.deepEqual(compareQuizzes([first,second,third],[{...first},{...second,false_choice:1},quiz(4)]),[
    {day:1,status:'unchanged'},{day:2,status:'divergence'},{day:3,status:'addition'}]);
  for (const field of ['display_name','portrait_ref','statement_0','statement_1','statement_2','false_choice','explanation']) {
    assert.equal(compareQuizzes([first],[{...first,[field]:'changed'}])[0].status,'divergence');
  }
});

test('an omitted story field preserves existing content while explicit removal is a divergence', () => {
  const old = {...quiz(1), story_0: 'First\n\nSecond', story_1: null, story_2: 'Third'};
  assert.equal(compareQuizzes([quiz(1)], [old])[0].status, 'unchanged');
  assert.equal(compareQuizzes([{...quiz(1), story_0: null, story_1: null, story_2: 'Third'}], [old])[0].status, 'divergence');
});
