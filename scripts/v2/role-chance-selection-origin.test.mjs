import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inferSelectionOrigins} from './role-chance-selection-origin.mjs';
const slot={event_id:'e',role_key:'player',slot_index:0,season_participant_id:'p'};
const draw=(before,after,at='1')=>({event_id:'e',action_type:'COMPOSITION_DRAW_COMPLETED',occurred_at:at,before_json:{assignmentsByRole:{player:before}},after_json:{assignmentsByRole:{player:after}}});
const assignment={event_id:'e',action_type:'SLOT_ASSIGNED',occurred_at:'2',metadata_json:{roleKey:'player',slotIndex:0},after_json:{participantId:'p'}};
const person={slotIndex:0,participantId:'p'};
test('recognizes a changed draw and a later manual selection',()=>{assert.equal(inferSelectionOrigins([draw([], [person])],[slot])[0].origin,'draw');assert.equal(inferSelectionOrigins([draw([], [person]),assignment],[slot])[0].origin,'manual')});
test('an identical later draw preserves a previously established draw origin',()=>assert.equal(inferSelectionOrigins([draw([],[person]),draw([person],[person],'3')],[slot])[0].origin,'draw'));
test('an identical later draw after a manual selection remains ambiguous',()=>assert.equal(inferSelectionOrigins([assignment,draw([person],[person],'3')],[slot])[0].origin,'unknown'));
test('observed origin overrides reconstructed ambiguity',()=>{const r=inferSelectionOrigins([draw([person],[person])],[{...slot,selection_chance_source:'manual'}])[0];assert.equal(r.origin,'manual');assert.equal(r.provenance,'observed')});
test('does not attribute an old person’s selection to a replacement',()=>assert.equal(inferSelectionOrigins([assignment],[{...slot,season_participant_id:'q'}])[0].origin,'unknown'));
test('simultaneous events do not invent an order',()=>assert.equal(inferSelectionOrigins([assignment,{...assignment,action_type:'SLOT_CLEARED'}],[slot])[0].origin,'unknown'));

test('a no-op assignment does not change the origin of an earlier draw',()=>{const noop={...assignment,before_json:{participantId:'p'}};assert.equal(inferSelectionOrigins([draw([],[person]),noop],[slot])[0].origin,'draw')});

test('structural deletion shifts later slots without changing selection origin',()=>{const other={slotIndex:1,participantId:'p'};const remove={event_id:'e',action_type:'SLOT_DELETED',occurred_at:'2',metadata_json:{roleKey:'player',slotIndex:0},before_json:{participantId:'other'}};assert.equal(inferSelectionOrigins([draw([],[{slotIndex:0,participantId:'other'},other]),remove],[slot])[0].origin,'draw')});
test('outside-model deletion does not compact positions',()=>{const other={slotIndex:1,participantId:'p'};const remove={event_id:'e',action_type:'SLOT_DELETED',occurred_at:'2',metadata_json:{roleKey:'player',slotIndex:0,outsideModel:true}};assert.equal(inferSelectionOrigins([draw([],[other]),remove],[{...slot,slot_index:1}])[0].origin,'draw')});
