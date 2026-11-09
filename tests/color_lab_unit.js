/* Run with: node tests/color_lab_unit.js — Color Lab 2B pigment/challenge regression. */
'use strict';
const assert=require('node:assert/strict');
const spectral=require('../vendor/spectral.min.js');
const core=require('../color-lab-core.js');

assert.equal(core.MAX_DROPS,18);
assert.equal(core.MAX_PIGMENTS,3);
assert.deepEqual(Object.keys(core.pigments),['red','yellow','blue','white','black']);
assert.deepEqual(core.tidyDrops({red:2,yellow:1,white:3}),{red:2,yellow:1,white:3});
assert.throws(()=>core.tidyDrops({red:19}),RangeError);
assert.throws(()=>core.tidyDrops({red:-1}),RangeError);
assert.throws(()=>core.tidyDrops({red:1,unknown:2}),RangeError);
assert.throws(()=>core.tidyDrops({constructor:1}),RangeError);
assert.equal(core.mayAdd({},'__proto__'),false);
assert.equal(core.mayAdd({red:1,yellow:1},'blue'),true,'Third primary pigment allowed');
assert.equal(core.mayAdd({red:1,yellow:1,blue:1},'white'),true,'White also allowed');
assert.equal(core.mayAdd({red:1,yellow:1,blue:1,white:1},'black'),true,'Black also allowed');
assert.equal(core.mayAdd({red:18},'red'),false,'Cup capacity enforced');
assert.equal(core.addDrop({red:18},'blue'),null);
assert.deepEqual(core.addDrop({red:1},'white'),{red:1,white:1});
assert.equal(core.mix({},spectral),null);
assert.equal(core.mix({red:1},spectral).hex,'#E53166');
const red=core.mix({red:3},spectral),light=core.mix({red:3,white:3},spectral);
const dark=core.mix({red:3,black:3},spectral);
assert.ok(light.color.OKLab[0]>red.color.OKLab[0],'White increases perceptual lightness');
assert.ok(dark.color.OKLab[0]<red.color.OKLab[0],'Black lowers perceptual lightness');
assert.ok(/^#[0-9A-F]{6}$/.test(core.mix({red:1,blue:2,yellow:2},spectral).hex));
assert.equal(core.challenges.length,12);
assert.deepEqual(core.challenges.map(x=>x.stage),[1,1,1,1,2,2,2,2,3,3,3,3]);
assert.equal(new Set(core.challenges.map(x=>x.id)).size,12);
const legacy={green:'#6FBA63',orange:'#FD9056',purple:'#575294',lime:'#CCE64E'};
for(const c of core.challenges){
  assert.ok(core.totalDrops(c.recipe)<=core.MAX_DROPS);
  assert.ok(core.BASE_PIGMENTS.filter(name=>c.recipe[name]).length<=3);
  const mixed=core.mix(c.recipe,spectral);
  assert.match(mixed.hex,/^#[0-9A-F]{6}$/);
  assert.equal(core.compare(mixed,mixed).stars,3,'Target is achievable: '+c.id);
  assert.ok(core.getHint({},c,'ar').length>0);
  assert.ok(core.getHint({},c,'en').length>0);
  if(c.id in legacy)assert.equal(mixed.hex,legacy[c.id],'Old 2A target unchanged '+c.id);
}
const contrast=core.compare(core.mix({red:4},spectral),core.mix({yellow:3,blue:3},spectral));
assert.ok(contrast.stars<3);
console.log('PASS: 12 targets, 3 primaries, white/black lightness, 18-drop limit, 2A compatibility');
