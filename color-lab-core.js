/* Kids Paint Color Lab 2B — deterministic pigment model and reachable challenges.
 * Spectral.js v3.0.0 (MIT, Ronald van Wijnen) is vendored separately.
 * All targets use the same function as free mixing. Prior IDs/recipes remain stable.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KidsColorLabCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const pigments = Object.freeze({
    red: Object.freeze({hex:'#E53166',ar:'أحمر',en:'Red',kind:'color'}),
    yellow: Object.freeze({hex:'#FCF046',ar:'أصفر',en:'Yellow',kind:'color'}),
    blue: Object.freeze({hex:'#3375DA',ar:'أزرق',en:'Blue',kind:'color'}),
    white: Object.freeze({hex:'#FFFFFF',ar:'أبيض',en:'White',kind:'neutral'}),
    black: Object.freeze({hex:'#181923',ar:'أسود',en:'Black',kind:'neutral'})
  });
  const BASE_PIGMENTS = Object.freeze(['red','yellow','blue']);
  const NEUTRALS = Object.freeze(['white','black']);
  const MAX_DROPS = 18;
  // The three chromatic colors may all be used; white and black adjust tones.
  const MAX_PIGMENTS = 3;
  const challenges = Object.freeze([
    {id:'green',stage:1,ar:'اصنع الأخضر',en:'Make green',recipe:{yellow:2,blue:2}},
    {id:'orange',stage:1,ar:'اصنع البرتقالي',en:'Make orange',recipe:{red:2,yellow:3}},
    {id:'purple',stage:1,ar:'اصنع البنفسجي',en:'Make purple',recipe:{red:2,blue:3}},
    {id:'lime',stage:1,ar:'اصنع الأخضر الفاتح',en:'Make light green',recipe:{yellow:4,blue:1}},
    {id:'pink',stage:2,ar:'اصنع الوردي الهادئ',en:'Make soft pink',recipe:{red:2,white:5}},
    {id:'sky',stage:2,ar:'اصنع الأزرق السماوي',en:'Make sky blue',recipe:{blue:2,white:5}},
    {id:'mint',stage:2,ar:'اصنع الأخضر النعناعي',en:'Make mint green',recipe:{yellow:3,blue:1,white:4}},
    {id:'lavender',stage:2,ar:'اصنع اللافندر',en:'Make lavender',recipe:{red:2,blue:2,white:4}},
    {id:'forest',stage:3,ar:'اصنع الأخضر الغامق',en:'Make forest green',recipe:{yellow:3,blue:3,black:2}},
    {id:'coral',stage:3,ar:'اصنع المرجاني الفاتح',en:'Make light coral',recipe:{red:3,yellow:2,white:4}},
    {id:'earth',stage:3,ar:'اصنع لونًا ترابيًا',en:'Make an earthy shade',recipe:{red:2,yellow:3,blue:2,black:1}},
    {id:'deepPurple',stage:3,ar:'اصنع البنفسجي الداكن',en:'Make deep purple',recipe:{red:3,blue:4,black:2}}
  ]);
  function totalDrops(drops) {
    return Object.values(drops).reduce((sum,n)=>sum+n,0);
  }
  function tidyDrops(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      if (input == null) return {};
      throw new TypeError('Invalid drop recipe');
    }
    for (const key of Object.keys(input)) if (!Object.prototype.hasOwnProperty.call(pigments,key)) {
      throw new RangeError('Unknown pigment: '+key);
    }
    const result={};
    for (const key of Object.keys(pigments)) {
      const value=Number(input[key]??0);
      if (!Number.isInteger(value)||value<0||value>MAX_DROPS) throw new RangeError('Invalid drops for '+key);
      if (value) result[key]=value;
    }
    const chromatics=BASE_PIGMENTS.filter(key=>result[key]>0);
    if (chromatics.length>MAX_PIGMENTS||totalDrops(result)>MAX_DROPS) {
      throw new RangeError('Too many colors or drops');
    }
    return result;
  }
  function mayAdd(drops,name) {
    if (!Object.prototype.hasOwnProperty.call(pigments,name)) return false;
    const clean=tidyDrops(drops);
    return totalDrops(clean)<MAX_DROPS &&
      (pigments[name].kind==='neutral'||!!clean[name]||
       BASE_PIGMENTS.filter(key=>clean[key]>0).length<MAX_PIGMENTS);
  }
  function addDrop(drops,name) {
    if(!mayAdd(drops,name)) return null;
    const clean=tidyDrops(drops);
    clean[name]=(clean[name]||0)+1;
    return clean;
  }
  function mix(drops,spectralEngine) {
    const amounts=tidyDrops(drops);
    const entries=Object.entries(amounts);
    if (!entries.length) return null;
    if (!spectralEngine||!spectralEngine.Color||!spectralEngine.mix) throw new Error('Spectral.js pigment mixer unavailable');
    const mixture=spectralEngine.mix(...entries.map(([name,count])=>
      [new spectralEngine.Color(pigments[name].hex),count]));
    const hex=mixture.toString().toUpperCase();
    if(!/^#[0-9A-F]{6}$/.test(hex)) throw new Error('Unexpected pigment-mixing result');
    return {hex,color:mixture,counts:amounts,drops:totalDrops(amounts)};
  }
  function compare(actual,target) {
    if (!actual||!target) return {distance:Infinity,stars:0};
    const a=actual.color.OKLab,b=target.color.OKLab;
    const distance=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    const stars=distance<=.025?3:distance<=.065?2:distance<=.13?1:0;
    return {distance,stars};
  }
  function challengeById(id) { return challenges.find(x=>x.id===id)||null; }
  function getHint(drops,challenge,lang) {
    if(!challenge) return '';
    const en=lang==='en';
    const recipe=challenge.recipe;
    const used=tidyDrops(drops);
    const label=name=>pigments[name][en?'en':'ar'];
    const wrong=Object.keys(used).find(name=>!recipe[name]);
    if(wrong) return en?'The target uses another color. Undo '+label(wrong)+' or empty the cup.':
      'اللون المطلوب يحتاج لونًا آخر. تراجع عن '+label(wrong)+' أو أفرغ الكأس.';
    const missing=Object.keys(recipe).find(name=>!used[name]);
    if(missing) return en?'Try adding '+label(missing)+'.':'جرّب إضافة '+label(missing)+'.';
    if(totalDrops(used)>=MAX_DROPS) return en?'The cup is full. Undo some drops to change the proportions.':
      'الكأس ممتلئ. تراجع عن قطرات لتغيير النسب.';
    // Suggest the largest underrepresented ingredient by normalized proportion.
    const sum=totalDrops(used),goalSum=totalDrops(recipe);
    const shortages=Object.keys(recipe).map(name=>({name,delta:recipe[name]/goalSum-(used[name]||0)/sum}))
      .sort((a,b)=>b.delta-a.delta);
    const pick=shortages[0].name;
    return en?'Try one more drop of '+label(pick)+'.':'جرّب قطرة إضافية من '+label(pick)+'.';
  }
  return Object.freeze({pigments,BASE_PIGMENTS,NEUTRALS,MAX_DROPS,MAX_PIGMENTS,
    challenges,tidyDrops,totalDrops,mayAdd,addDrop,mix,compare,challengeById,getHint});
});
