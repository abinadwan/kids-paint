/* Kids Paint — World of Light 2C: additive RGB play in the shared Color Lab page.
 * Independent storage prevents interference with previous pigment artwork and stars.
 */
(() => {
  'use strict';
  const core=window.KidsLightLabCore;
  const $=id=>document.getElementById(id);
  const COLORS_KEY='kids-paint-light-colors-v1';
  const STARS_KEY='kids-paint-light-progress-v1';
  const CAP=24;
  const i18n={
    ar:{
      pigmentTab:'مختبر الأصباغ',lightTab:'عالم الضوء RGB',
      introSmall:'رحلة إلى عالم الضوء',introTitle:'عالم الضوء الملوّن',
      introDesc:'أشعل المصابيح الثلاثة وشاهد كيف تصنع الأضواء ألوانًا جديدة!',
      difference:'معلومة: مزج الضوء يختلف عن مزج الأصباغ؛ اجتماع الأحمر والأخضر هنا يصنع الأصفر.',
      free:'تجربة حرة',challenges:'تحديات الضوء',sixChallenges:'٦ تحديات دون مؤقت',
      challengeTitle:'طابق الضوء المطلوب',target:'اللون المطلوب',experiment:'التجربة',
      workspaceTitle:'امزج أشعة الضوء',noTime:'بدون وقت',mixingZone:'منطقة التقاء الأضواء',
      redLight:'الضوء الأحمر',greenLight:'الضوء الأخضر',blueLight:'الضوء الأزرق',
      allOff:'أطفئ الأنوار',allOn:'شغّل الثلاثة',learningStart:'جرّب تشغيل الضوء الأحمر والأخضر معًا. ماذا تتوقع؟',
      result:'اللون الناتج',save:'احفظ اللون',use:'استخدمه في الرسم',check:'تحقق من اللون',
      hint:'تلميح',savedSmall:'اكتشافاتك',notebookTitle:'دفتر أضوائي',
      savedLocally:'شدة الأضواء والنجوم تُحفظ على جهازك فقط، بشكل مستقل عن دفتر الأصباغ.',
      off:'الأسود',white:'الضوء الأبيض',yellow:'الضوء الأصفر',cyan:'الضوء السماوي',
      magenta:'الضوء الأرجواني',red:'الضوء الأحمر',green:'الضوء الأخضر',blue:'الضوء الأزرق',
      custom:'لون ضوئي مبتكر',balanced:'اجتماع الأضواء الثلاثة ينتج ضوءًا أبيض عندما تكون شدتها كاملة.',
      allDark:'بدون أضواء تبقى الغرفة مظلمة، ونرى اللون الأسود.',
      redGreen:'الضوء الأحمر + الأخضر = أصفر، بخلاف خلط الدهانات.',
      greenBlue:'الضوء الأخضر + الأزرق = سماوي.',
      redBlue:'الضوء الأحمر + الأزرق = أرجواني.',
      lightBlend:'كلما زادت شدة المصباح ازدادت مساهمته في اللون الناتج.',
      scoreZero:'ما زلت بعيدًا عن الهدف. جرّب تعديل شدة المصابيح.',
      scoreOne:'نجمة واحدة! اقتربت من اللون.',scoreTwo:'نجمتان! قريب جدًا.',
      scoreThree:'ثلاث نجوم! طابقت الضوء المطلوب!',stars:'النجوم',
      notSaved:'ما حفظت ألوان ضوء بعد. جرّب تحريك الأشرطة!',
      try:'جرّب',delete:'احذف',deleteConfirm:'هل تريد حذف هذا اللون من دفتر الأضواء؟',
      saved:'تم حفظ تركيبة الضوء.',deleted:'حُذفت التركيبة.',
      duplicate:'هذه التركيبة محفوظة مسبقًا.',full:'دفتر الأضواء ممتلئ. احذف تركيبًا لإضافة آخر.',
      storageFail:'الحفظ المحلي غير متاح.',restored:'تمت استعادة شدة المصابيح.',
      needLight:'أشعل مصباحًا واحدًا على الأقل.',offState:'أطفأت جميع المصابيح.'
    },
    en:{
      pigmentTab:'Pigment Lab',lightTab:'World of Light RGB',
      introSmall:'Explore the world of light',introTitle:'The Colorful World of Light',
      introDesc:'Turn on three light beams and watch them make new colors!',
      difference:'Light mixing is different from paint mixing: red plus green light makes yellow.',
      free:'Free play',challenges:'Light challenges',sixChallenges:'6 untimed challenges',
      challengeTitle:'Match the target light',target:'Target color',experiment:'Your experiment',
      workspaceTitle:'Mix colorful lights',noTime:'No timer',mixingZone:'Where the lights overlap',
      redLight:'Red light',greenLight:'Green light',blueLight:'Blue light',
      allOff:'Lights off',allOn:'All lights on',learningStart:'Try turning on red and green light together. What happens?',
      result:'Light color',save:'Save color',use:'Use in drawing',check:'Check color',
      hint:'Hint',savedSmall:'Your discoveries',notebookTitle:'My Light Notebook',
      savedLocally:'Light levels and stars stay on this device, separately from your paint notebook.',
      off:'Black',white:'White light',yellow:'Yellow light',cyan:'Cyan light',
      magenta:'Magenta light',red:'Red light',green:'Green light',blue:'Blue light',
      custom:'Your light color',balanced:'All three lights at full strength produce white.',
      allDark:'Without any light, the room is dark and looks black.',
      redGreen:'Red plus green LIGHT makes yellow, unlike mixing paints.',
      greenBlue:'Green plus blue light makes cyan.',
      redBlue:'Red plus blue light makes magenta.',
      lightBlend:'Increasing a lamp makes its color stronger in the result.',
      scoreZero:'Not quite there. Adjust the lamp brightness and try again.',
      scoreOne:'One star! Getting closer.',scoreTwo:'Two stars! Very close.',
      scoreThree:'Three stars! You matched the light!',stars:'Stars',
      notSaved:'No saved light colors. Try moving the sliders!',
      try:'Try',delete:'Delete',deleteConfirm:'Delete this color from your light notebook?',
      saved:'Light recipe saved.',deleted:'Recipe deleted.',
      duplicate:'You already saved this light recipe.',full:'Light notebook is full. Delete a recipe to save another.',
      storageFail:'Local storage is not available.',restored:'Light levels restored.',
      needLight:'Turn on at least one lamp.',offState:'All lights are off.'
    }
  };
  let lang='ar',mode='free',id='yellowLight';
  let values={red:0,green:0,blue:0};
  let saved=[],stars={};
  const word=key=>i18n[lang][key]||key;
  function read(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(_){return fallback}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}}
  function message(key){$('lightStatus').textContent=word(key);$('lightStatus').dataset.key=key}
  function isDark(){return core.CHANNELS.every(key=>values[key]===0)}
  function mix(){return core.mix(values)}
  function colorName(){
    if(isDark())return word('off');
    const flags=core.CHANNELS.filter(k=>values[k]>0);
    if(flags.length===3&&flags.every(k=>values[k]===100))return word('white');
    if(flags.length===1)return word(flags[0]);
    if(flags.length===2){
      if(!flags.includes('blue'))return word('yellow');
      if(!flags.includes('red'))return word('cyan');
      if(!flags.includes('green'))return word('magenta');
    }
    return word('custom');
  }
  function teaching(){
    const active=core.CHANNELS.filter(k=>values[k]>0);
    if(!active.length)return word('allDark');
    if(active.length===3&&active.every(k=>values[k]===100))return word('balanced');
    if(active.length===2){
      if(!active.includes('blue'))return word('redGreen');
      if(!active.includes('red'))return word('greenBlue');
      if(!active.includes('green'))return word('redBlue');
    }
    return word('lightBlend');
  }
  function render(showStatus=false){
    const color=mix();
    for(const key of core.CHANNELS){
      const suffix=key[0].toUpperCase()+key.slice(1);
      $('light'+suffix+'Range').value=String(values[key]);
      $('light'+suffix+'Value').textContent=values[key]+'%';
    }
    $('lightStage').style.setProperty('--light-r',String(values.red/100));
    $('lightStage').style.setProperty('--light-g',String(values.green/100));
    $('lightStage').style.setProperty('--light-b',String(values.blue/100));
    $('lightBlend').style.backgroundColor=color.hex;
    $('lightBlend').style.boxShadow='0 0 '+(10+Math.max(...Object.values(values))*.30)+'px '+color.hex+'88,0 0 0 9px rgba(255,255,255,.055)';
    $('lightResultSwatch').style.backgroundColor=color.hex;
    $('lightResultHex').textContent=color.hex;
    $('lightColorName').textContent=colorName();
    $('lightLearning').textContent=teaching();
    $('lightSaveBtn').disabled=isDark();
    $('lightUseBtn').disabled=isDark();
    $('lightCheckBtn').disabled=isDark();
    $('lightStage').setAttribute('aria-label',(lang==='en'?'Mixed light: ':'الضوء الناتج: ')+color.hex);
    if(showStatus){$('lightFeedback').textContent='';$('lightFeedback').dataset.key='';$('lightStatus').textContent='';$('lightStatus').dataset.key=''}
  }
  function setValues(next,changed){
    try{values=core.validate(next)}catch(e){console.warn('Invalid light input',e);return}
    render(changed);
  }
  function stageLabel(stage){
    if(stage===1)return lang==='en'?'Discover light':'اكتشاف الضوء';
    return lang==='en'?'Master light':'خبير الضوء';
  }
  function renderChallenges(){
    const parent=$('lightChallengePicker');parent.replaceChildren();
    for(const challenge of core.challenges){
      const button=document.createElement('button');
      button.type='button';button.className='light-challenge-choice';
      button.setAttribute('aria-pressed',String(challenge.id===id));
      const swatch=document.createElement('span');swatch.className='light-choice-swatch';
      swatch.style.backgroundColor=core.mix(challenge.target).hex;
      const name=document.createElement('strong');name.textContent=lang==='en'?challenge.en:challenge.ar;
      const starsText=document.createElement('small');
      starsText.textContent='★'.repeat(stars[challenge.id]||0)+'☆'.repeat(3-(stars[challenge.id]||0));
      starsText.setAttribute('aria-label',(stars[challenge.id]||0)+'/3');
      button.append(swatch,name,starsText);
      button.addEventListener('click',()=>chooseChallenge(challenge.id));
      parent.append(button);
    }
    const challenge=core.byId(id);
    $('lightTargetName').textContent=lang==='en'?challenge.en:challenge.ar;
    $('lightTargetSwatch').style.backgroundColor=core.mix(challenge.target).hex;
    $('lightStars').textContent=core.challenges.reduce((total,c)=>total+(stars[c.id]||0),0)+' / 18 ★';
  }
  function chooseChallenge(challengeId){
    if(!core.byId(challengeId))return;
    id=challengeId;
    setValues({red:0,green:0,blue:0},true);
    renderChallenges();
    $('lightFeedback').textContent='';
  }
  function showMode(selected){
    mode=selected==='challenge'?'challenge':'free';
    $('lightFreeBtn').classList.toggle('active',mode==='free');
    $('lightChallengesBtn').classList.toggle('active',mode==='challenge');
    $('lightFreeBtn').setAttribute('aria-pressed',String(mode==='free'));
    $('lightChallengesBtn').setAttribute('aria-pressed',String(mode==='challenge'));
    $('lightChallengesPanel').hidden=mode!=='challenge';
    $('lightChallengeActions').hidden=mode!=='challenge';
    if(mode==='challenge')renderChallenges();
    $('lightFeedback').textContent='';
  }
  function checkChallenge(){
    if(isDark()){message('needLight');return}
    const result=core.compare(mix(),core.mix(core.byId(id).target));
    const key=result.stars===3?'scoreThree':result.stars===2?'scoreTwo':
      result.stars===1?'scoreOne':'scoreZero';
    $('lightFeedback').textContent=('★'.repeat(result.stars)||'☆')+' '+word(key);
    $('lightFeedback').dataset.key=key;
    if(result.stars>(stars[id]||0)){
      stars[id]=result.stars;
      write(STARS_KEY,stars);
      renderChallenges();
    }
  }
  function showHint(){
    $('lightFeedback').textContent=core.hint(values,core.byId(id).target,lang);
    $('lightFeedback').dataset.key='';
  }
  function save(){
    if(isDark()){message('needLight');return}
    const duplicate=saved.some(item=>core.CHANNELS.every(key=>item.channels[key]===values[key]));
    if(duplicate){message('duplicate');return}
    if(saved.length>=CAP){message('full');return}
    const next=[{channels:{...values},hex:mix().hex},...saved];
    if(!write(COLORS_KEY,next)){message('storageFail');return}
    saved=next;renderSaved();message('saved');
  }
  function renderSaved(){
    const parent=$('lightSavedList');parent.replaceChildren();
    $('lightSavedCount').textContent=saved.length+' / '+CAP;
    if(!saved.length){
      const empty=document.createElement('p');empty.className='light-empty';empty.textContent=word('notSaved');
      parent.append(empty);return;
    }
    for(const item of saved){
      const row=document.createElement('div');row.className='light-saved-item';
      const swatch=document.createElement('span');swatch.className='light-saved-swatch';swatch.style.backgroundColor=item.hex;
      const meta=document.createElement('span');meta.className='light-saved-meta';
      const title=document.createElement('strong');title.textContent=item.hex;
      const detail=document.createElement('small');detail.textContent=core.CHANNELS.map(k=>core.LIGHT_COLORS[k][lang==='en'?'en':'ar']+' '+item.channels[k]+'%').join(' · ');
      meta.append(title,detail);
      const actions=document.createElement('span');actions.className='light-saved-actions';
      const tryBtn=document.createElement('button');tryBtn.type='button';tryBtn.textContent=word('try');
      tryBtn.addEventListener('click',()=>{
        setValues(item.channels,true);
        message('restored');
        $('lightWorkspaceTitle').scrollIntoView({behavior:'smooth',block:'start'});
      });
      const removeBtn=document.createElement('button');removeBtn.type='button';removeBtn.textContent=word('delete');
      removeBtn.addEventListener('click',()=>{
        if(!window.confirm(word('deleteConfirm')))return;
        const next=saved.filter(savedItem=>savedItem!==item);
        if(!write(COLORS_KEY,next)){message('storageFail');return}
        saved=next;renderSaved();message('deleted');
      });
      actions.append(tryBtn,removeBtn);
      row.append(swatch,meta,actions);
      parent.append(row);
    }
  }
  function useInPainting(){
    if(isDark())return;
    const url=new URL('./index.html',document.baseURI);
    url.searchParams.set('labColor',mix().hex.slice(1));
    window.location.assign(url.href);
  }
  function switchLab(next){
    const light=next==='light';
    $('pigmentLab').hidden=light;
    $('lightLab').hidden=!light;
    $('pigmentTab').classList.toggle('active',!light);
    $('lightTab').classList.toggle('active',light);
    $('pigmentTab').setAttribute('aria-selected',String(!light));
    $('lightTab').setAttribute('aria-selected',String(light));
    // Tab appearance changes without creating new pages or reloading user work.
  }
  function translate(){
    lang=document.documentElement.lang==='en'?'en':'ar';
    document.querySelectorAll('[data-light-t]').forEach(el=>{el.textContent=word(el.dataset.lightT)});
    render();
    renderChallenges();
    renderSaved();
    if($('lightFeedback').dataset.key)$('lightFeedback').textContent=word($('lightFeedback').dataset.key);
    if($('lightStatus').dataset.key)$('lightStatus').textContent=word($('lightStatus').dataset.key);
  }
  function init(){
    if(!core){console.warn('Light engine unavailable');return}
    const data=read(COLORS_KEY,[]);
    if(Array.isArray(data)){
      saved=data.filter(item=>{
        if(!item||!item.channels)return false;
        try{
          const checked=core.validate(item.channels);
          return core.CHANNELS.some(key=>checked[key]>0)&&item.hex===core.mix(checked).hex;
        }catch(_){return false}
      }).slice(0,CAP);
    }
    const rawStars=read(STARS_KEY,{});
    if(rawStars&&typeof rawStars==='object'&&!Array.isArray(rawStars)){
      for(const challenge of core.challenges){
        const n=Number(rawStars[challenge.id]);
        if(Number.isInteger(n)&&n>=1&&n<=3)stars[challenge.id]=n;
      }
    }
    for(const key of core.CHANNELS){
      const suffix=key[0].toUpperCase()+key.slice(1);
      $('light'+suffix+'Range').addEventListener('input',value=>{
        setValues({...values,[key]:Number(value.target.value)},true);
      });
    }
    $('pigmentTab').addEventListener('click',()=>switchLab('pigment'));
    $('lightTab').addEventListener('click',()=>switchLab('light'));
    $('lightFreeBtn').addEventListener('click',()=>showMode('free'));
    $('lightChallengesBtn').addEventListener('click',()=>showMode('challenge'));
    $('lightAllOffBtn').addEventListener('click',()=>setValues({red:0,green:0,blue:0},true));
    $('lightAllOnBtn').addEventListener('click',()=>setValues({red:100,green:100,blue:100},true));
    $('lightCheckBtn').addEventListener('click',checkChallenge);
    $('lightHintBtn').addEventListener('click',showHint);
    $('lightSaveBtn').addEventListener('click',save);
    $('lightUseBtn').addEventListener('click',useInPainting);
    translate();
    new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    showMode('free');
    const params=new URLSearchParams(window.location.search);
    switchLab(params.get('lab')==='light'?'light':'pigment');
  }
  init();
})();
