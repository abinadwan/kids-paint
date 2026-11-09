/* World of Light 2C — test with: node tests/light_lab_unit.js */
'use strict';
const assert=require('node:assert/strict');
const core=require('../light-lab-core.js');
assert.deepEqual(core.CHANNELS,['red','green','blue']);
assert.equal(core.challenges.length,6);
assert.equal(new Set(core.challenges.map(c=>c.id)).size,6);
function light(r,g,b){return core.mix({red:r,green:g,blue:b}).hex}
assert.equal(light(0,0,0),'#000000','No light = black');
assert.equal(light(100,0,0),'#FF0000','Red only');
assert.equal(light(0,100,0),'#00FF00','Green only');
assert.equal(light(0,0,100),'#0000FF','Blue only');
assert.equal(light(100,100,0),'#FFFF00','Red+green light = yellow');
assert.equal(light(0,100,100),'#00FFFF','Green+blue light = cyan');
assert.equal(light(100,0,100),'#FF00FF','Red+blue light = magenta');
assert.equal(light(100,100,100),'#FFFFFF','All lamps = white');
assert.equal(core.mix({red:50,green:0,blue:0}).hex.slice(3),'0000','Half red stays on red channel');
assert.throws(()=>core.validate({red:105,green:0,blue:0}),RangeError);
assert.throws(()=>core.validate({red:-5}),RangeError);
assert.throws(()=>core.validate({red:50,green:0,blue:0,alpha:100}),RangeError);
assert.throws(()=>core.validate({red:2}),RangeError,'Slider steps must be 5 percent');
assert.throws(()=>core.validate({constructor:5}),RangeError);
assert.deepEqual(core.validate({}),{red:0,green:0,blue:0});
assert.equal(core.compare(core.mix({red:0,green:0,blue:0}),core.mix({red:100,green:100,blue:100})).stars,0);
assert.equal(core.compare(core.mix({red:100,green:100,blue:100}),core.mix({red:100,green:100,blue:100})).stars,3);
for(const ch of core.challenges){
  assert.deepEqual(core.validate(ch.target),ch.target);
  assert.equal(core.compare(core.mix(ch.target),core.mix(ch.target)).stars,3,ch.id);
  assert.ok(core.hint({red:0,green:0,blue:0},ch.target,'ar').length>0,ch.id);
  assert.ok(core.hint({red:0,green:0,blue:0},ch.target,'en').length>0,ch.id);
}
assert.match(core.hint({red:0,green:0,blue:0},{red:100,green:0,blue:0},'en'),/increasing Red/);
console.log('PASS World of Light: additive primaries, exact reachable targets, validation, OKLab stars and bilingual hints');
