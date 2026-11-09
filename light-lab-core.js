/* Kids Paint — World of Light (2C)
 * Original RGB additive light engine. No third-party dependencies.
 * Intensity sliders represent linear light energy (0..100%).
 * Output is encoded into sRGB for display; OKLab distance is used for challenge scoring.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.KidsLightLabCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const CHANNELS=Object.freeze(['red','green','blue']);
  const LIGHT_COLORS=Object.freeze({
    red:{ar:'أحمر',en:'Red'},green:{ar:'أخضر',en:'Green'},blue:{ar:'أزرق',en:'Blue'}
  });
  const challenges=Object.freeze([
    {id:'yellowLight',stage:1,ar:'اصنع الضوء الأصفر',en:'Make yellow light',target:{red:100,green:100,blue:0}},
    {id:'cyanLight',stage:1,ar:'اصنع الضوء السماوي',en:'Make cyan light',target:{red:0,green:100,blue:100}},
    {id:'magentaLight',stage:1,ar:'اصنع الضوء الأرجواني',en:'Make magenta light',target:{red:100,green:0,blue:100}},
    {id:'whiteLight',stage:2,ar:'اجمع الأضواء لتصنع الأبيض',en:'Combine lights to make white',target:{red:100,green:100,blue:100}},
    {id:'amberLight',stage:2,ar:'اصنع ضوء الغروب',en:'Make sunset light',target:{red:100,green:60,blue:0}},
    {id:'violetLight',stage:2,ar:'اصنع الضوء البنفسجي',en:'Make violet light',target:{red:60,green:0,blue:100}}
  ]);
  function validate(input){
    if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Invalid light intensities');
    for(const key of Object.keys(input))if(!CHANNELS.includes(key))throw new RangeError('Unknown light channel');
    const result={};
    for(const key of CHANNELS){
      const n=Number(input[key]??0);
      if(!Number.isFinite(n)||n<0||n>100||Math.round(n)!==n||n%5!==0)throw new RangeError('Light intensity out of range: '+key);
      result[key]=n;
    }
    return result;
  }
  function toSRGB(linear){
    if(linear<=.0031308)return 12.92*linear;
    return 1.055*Math.pow(linear,1/2.4)-.055;
  }
  function encodeHex(n){return Math.round(Math.max(0,Math.min(255,n*255))).toString(16).padStart(2,'0').toUpperCase()}
  function mix(channels){
    const p=validate(channels);
    const rgb=CHANNELS.map(key=>Math.round(toSRGB(p[key]/100)*255));
    const hex='#'+rgb.map(n=>n.toString(16).padStart(2,'0').toUpperCase()).join('');
    const active=CHANNELS.filter(key=>p[key]>0);
    return {hex,rgb,channels:p,active};
  }
  function toOKLab(result){
    const rgb=result.rgb.map(n=>{
      const v=n/255;
      return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
    });
    const L=.4122214708*rgb[0]+.5363325363*rgb[1]+.0514459929*rgb[2];
    const M=.2119034982*rgb[0]+.6806995451*rgb[1]+.1073969566*rgb[2];
    const S=.0883024619*rgb[0]+.2817188376*rgb[1]+.6299787005*rgb[2];
    const l=Math.cbrt(L),m=Math.cbrt(M),s=Math.cbrt(S);
    return [.2104542553*l+.793617785*m-.0040720468*s,
      1.9779984951*l-2.428592205*m+.4505937099*s,
      .0259040371*l+.7827717662*m-.808675766*s];
  }
  function compare(actual,target){
    if(!actual||!target)return {distance:Infinity,stars:0};
    const a=toOKLab(actual),b=toOKLab(target);
    const distance=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    return {distance,stars:distance<=.025?3:distance<=.065?2:distance<=.13?1:0};
  }
  function hint(current,goal,lang){
    const a=validate(current),b=validate(goal);
    const en=lang==='en';
    const delta=CHANNELS.map(key=>({key,change:b[key]-a[key]})).sort((x,y)=>Math.abs(y.change)-Math.abs(x.change));
    const top=delta[0];
    if(!top.change)return en?'Perfect match!':'وصلت إلى تطابق كامل!';
    const name=LIGHT_COLORS[top.key][en?'en':'ar'];
    return top.change>0?(en?'Try increasing '+name+' light.':'جرّب زيادة شدة الضوء '+name+'.'):
      (en?'Try decreasing '+name+' light.':'جرّب تقليل شدة الضوء '+name+'.');
  }
  function byId(id){return challenges.find(c=>c.id===id)||null}
  return Object.freeze({CHANNELS,LIGHT_COLORS,challenges,validate,toSRGB,encodeHex,mix,toOKLab,compare,hint,byId});
});
