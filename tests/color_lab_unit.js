/* Color Lab unit tests. No DOM or network: run with node tests/color_lab_unit.js */
'use strict';
const assert = require('node:assert/strict');
const spectral = require('../vendor/spectral.min.js');
const core = require('../color-lab-core.js');
const ids = new Set(core.challenges.map(c => c.id));
assert.equal(ids.size, 4, 'Four distinct challenges');
assert.equal(core.MAX_DROPS, 12);
assert.equal(core.MAX_PIGMENTS, 2);
assert.deepEqual(core.tidyDrops({red:2,yellow:1,blue:0}), {red:2,yellow:1});
assert.throws(() => core.tidyDrops({red:1,yellow:1,blue:1}), RangeError);
assert.throws(() => core.tidyDrops({red:-2}), RangeError);
assert.throws(() => core.tidyDrops({blue:13}), RangeError);
assert.equal(core.mayAdd({red:2,yellow:3},'blue'), false);
assert.equal(core.mayAdd({red:1},'blue'), true);
assert.equal(core.mayAdd({red:12},'red'), false);
assert.deepEqual(core.addDrop({red:1},'blue'), {red:1,blue:1});
assert.equal(core.addDrop({red:1,yellow:1},'blue'), null);
assert.equal(core.mix({}, spectral), null);
assert.equal(core.mix({red:1},spectral).hex, '#E53166');
assert.equal(core.mix({yellow:2,blue:2},spectral).hex, '#6FBA63');
for (const ch of core.challenges) {
  assert.ok(Object.keys(ch.recipe).length <= core.MAX_PIGMENTS, ch.id);
  assert.ok(core.totalDrops(ch.recipe) <= core.MAX_DROPS, ch.id);
  const goal = core.mix(ch.recipe, spectral);
  assert.match(goal.hex, /^#[0-9A-F]{6}$/);
  assert.equal(core.compare(goal,goal).stars,3,'Exact recipe must earn 3 stars: '+ch.id);
  assert.ok(core.getHint({},ch,'ar').length > 0);
  assert.ok(core.getHint({},ch,'en').length > 0);
}
const wrong = core.compare(core.mix({red:4},spectral),core.mix({yellow:4,blue:4},spectral));
assert.ok(wrong.stars < 3, 'Mismatched pigments must not get perfect score');
console.log('PASS Color Lab: 4 reachable challenges, spectral mixing, pigment limits, exact stars, hints');
