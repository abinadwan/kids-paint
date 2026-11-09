/* Kids Paint Color Lab v4.7.0 — educational pigment play, no accounts or network APIs. */
(() => {
  'use strict';
  const core = window.KidsColorLabCore;
  const engine = window.spectral;
  const $ = id => document.getElementById(id);
  const pigmentNames = ['red', 'yellow', 'blue', 'white', 'black'];
  const RELEASE = '4.7.0';
  const LANGUAGE_KEY = 'kids-paint-language';
  const COLOR_KEY = 'kids-paint-lab-colors-v1';
  const PROGRESS_KEY = 'kids-paint-lab-progress-v1';
  const MAX_SAVES = 48;
  const words = {
    ar: {

       stage1:'المرحلة الأولى: اكتشاف الألوان',stage2:'المرحلة الثانية: صانع الدرجات',stage3:'المرحلة الثالثة: الخبير',
       stageTopic1:'جرّب مزج اللونين لتكتشف اللون المطلوب.',
       stageTopic2:'استعمل الأبيض للتفتيح وراقب الفرق في الدرجة.',
       stageTopic3:'جرّب الأسود للتغميق أو امزج ثلاثة ألوان أساسية.',
       starsCollected:'النجوم المكتسبة',notebookGuide:'جرّب وصفة محفوظة، أو احذف لونًا لم تعد تحتاجه.',
       deleteColor:'احذف',confirmDelete:'هل تريد حذف هذا اللون من دفتر ألوانك؟',
       deletedColor:'حُذف اللون من الدفتر.',notebookFull:'دفتر الألوان ممتلئ (48 لونًا). احذف وصفة لإضافة لون جديد.',
       lighterTone:'درجة فاتحة',darkerTone:'درجة داكنة',complexTone:'درجة مركبة',
       neutralTone:'درجة رمادية',lightHint:'الأبيض يخفف اللون ويصنع درجات فاتحة.',
       darkHint:'الأسود يجعل اللون أغمق. جرّب قطرات قليلة.',
       threeHint:'ثلاثة ألوان أساسية يمكن أن تنتج درجات مركبة غير متوقعة.',
       whiteBlackHint:'الأبيض والأسود معًا يصنعان درجات رمادية مختلفة.',
      brand:'عالم التلوين',painting:'لوحة الرسم',lab:'مختبر الألوان',
      eyebrow:'تجربة جديدة من عالم التلوين',title:'مختبر الألوان السحري',
      subtitle:'أضف القطرات، شاهد الألوان تمتزج، واكتشف لونًا جديدًا!',
      freeMode:'المختبر الحر',challengeMode:'تحديات الألوان',
      twelveChallenges:'١٢ تحديًا بدون مؤقت',challengeTitle:'اصنع اللون المطلوب!',
      noClock:'بدون وقت أو عقوبات',targetColor:'اللون المطلوب',
      tryMix:'اكتشف بنفسك أي قطرات تحتاجها.',yourExperiment:'تجربتك',
      mixTitle:'هيا نخلط الألوان!',chooseThree:'٣ ألوان أساسية + الأبيض والأسود',
      red:'أحمر',yellow:'أصفر',blue:'أزرق',white:'أبيض',black:'أسود',tapTube:'امزج الألوان، وأضف الأبيض للتفتيح أو الأسود للتغميق.',
      emptyCup:'الكأس ينتظر أول قطرة!',theRecipe:'وصفة اللون',noDrops:'لم تضف قطرات بعد',
      maxEighteen:'يمكنك إضافة 18 قطرة كحد أقصى.',
      learningStart:'هل تعلم؟ تغيير عدد القطرات يغير درجة اللون الناتج!',
      undoDrop:'↶ تراجع عن قطرة',emptyCupButton:'إفراغ الكأس',
      discovery:'اكتشافك الجديد',waiting:'بانتظار المزج...',saveColor:'احفظ اللون',
      useInPainting:'استخدمه في الرسم',checkColor:'تحقق من اللون',hint:'أعطني تلميحًا',
      discoveriesEyebrow:'ذكريات من المختبر',collection:'دفتر ألواني',
      saveLocal:'الألوان والنجوم تُحفظ على هذا الجهاز فقط.',
      poweredBy:'مزج الأصباغ التقريبي بواسطة',licenseLink:'حقوق المكتبات والتراخيص',
      aboutProject:'عن المشروع',versionLabel:'الإصدار',checkUpdates:'تحديث التطبيق',
      drops:'قطرات',oneDrop:'قطرة',twoDrops:'قطرتان',mixed:'لون ممزوج',
      stored:'تم حفظ اللون في دفتر ألواني.',alreadySaved:'هذا اللون محفوظ في دفتر ألواني.',
      savingUnavailable:'التخزين المحلي غير متاح. يمكنك استخدام اللون في الرسم دون حفظه.',
      maxThree:'تستطيع إضافة ثلاثة ألوان أساسية، مع الأبيض والأسود. جرّب إزالة قطرة أو إفراغ الكأس.',
      fullCup:'الكأس ممتلئ! الحد الأقصى 18 قطرة.',reset:'أفرغت الكأس، جرّب وصفة جديدة!',
      needMix:'أضف قطرة واحدة على الأقل قبل التحقق.',tap:'قطرة',
      swatchHint:'كل قطرة تغيّر النسبة، فهل ستتغير الدرجة؟',
      singleHint:'اختر لونًا ثانيًا وشاهد لونًا جديدًا يظهر!',
      greenHint:'الأزرق مع الأصفر ينتج درجات خضراء.',
      orangeHint:'الأحمر مع الأصفر ينتج درجات برتقالية.',
      purpleHint:'الأحمر مع الأزرق ينتج درجات بنفسجية.',
      hintTry:'جرّب إضافة لون آخر أو تغيير عدد القطرات.',
      close:'قريب! جرّب مرة أخرى أو استعن بتلميح.',
      oneStar:'نجمة! اقتربت من الهدف.',twoStars:'نجمتان! نتيجة ممتازة.',
      threeStars:'ثلاث نجوم! وصلت إلى اللون المطلوب!',
      starProgress:'نجومك',noSaved:'ما حفظت ألوانًا بعد. ابدأ بإضافة قطرات!',
      loadRecipe:'جرّب',recipeLoaded:'تم تحميل الوصفة المحفوظة.',
      error:'تعذّر تحميل محرك المزج. تأكد من اكتمال تحديث التطبيق.',
      networkError:'تعذّر التحقق من الإصدار، اتصل بالإنترنت وحاول مجددًا.',
      updated:'أنت تستخدم أحدث إصدار.',updateAvailable:'إصدار جديد متاح. احفظ تجاربك أولًا، ثم أكّد التحديث.',
      confirmUpdate:'يوجد إصدار جديد. احفظ أي عمل غير محفوظ أولًا؛ سيُعاد تحميل التطبيق. التحديث الآن؟',
      updatePostponed:'تقدر تحدّث التطبيق لاحقًا.',
      updateHelp:'اضغط للتحقق من توفر إصدار أحدث.',
      offlineChecking:'جارٍ التحقق من جاهزية العمل دون إنترنت…',
      offlineReady:'الصفحتان جاهزتان للعمل دون إنترنت، بما فيها عالم الضوء.',
      offlinePending:'ملفات العمل دون إنترنت لم تكتمل بعد. اتصل بالإنترنت وحدّث التطبيق.'
    },
    en: {

       stage1:'Level 1: Discover colors',stage2:'Level 2: Make new shades',stage3:'Level 3: Color expert',
       stageTopic1:'Try combining two colors to find the target.',
       stageTopic2:'Use white to lighten the mix and compare shades.',
       stageTopic3:'Use black to darken or mix all three base pigments.',
       starsCollected:'Stars collected',notebookGuide:'Try saved recipes or delete any mix you no longer need.',
       deleteColor:'Delete',confirmDelete:'Delete this color from your notebook?',
       deletedColor:'Color removed from the notebook.',notebookFull:'Your notebook is full (48 colors). Delete a recipe to add another.',
       lighterTone:'Light shade',darkerTone:'Dark shade',complexTone:'Complex blend',
       neutralTone:'Gray shade',lightHint:'White makes many pigment colors lighter and softer.',
       darkHint:'Black darkens a mix. Try adding just a little.',
       threeHint:'Mixing three primary pigments can create surprising complex shades.',
       whiteBlackHint:'White and black together create different gray shades.',
      brand:'Kids Paint',painting:'Drawing page',lab:'Color Lab',eyebrow:'A new Kids Paint adventure',
      title:'The Magic Color Lab',subtitle:'Add drops, watch colors swirl, and discover something new!',
      freeMode:'Free mixing',challengeMode:'Color challenges',
      twelveChallenges:'12 untimed challenges',challengeTitle:'Make the target color!',
      noClock:'No timer or penalties',targetColor:'Target color',tryMix:'Discover which color drops are needed.',
      yourExperiment:'Your experiment',mixTitle:"Let's mix colors!",chooseThree:'3 pigments + white and black',
      red:'Red',yellow:'Yellow',blue:'Blue',white:'White',black:'Black',tapTube:'Mix pigments; add white to lighten or black to darken.',
      emptyCup:'Your cup is ready for its first drop!',theRecipe:'Your color recipe',
      noDrops:'No drops added yet',maxEighteen:'You can add up to 18 drops.',
      learningStart:'Did you know? Changing the number of drops changes the color shade!',
      undoDrop:'↶ Undo one drop',emptyCupButton:'Empty cup',
      discovery:'Your discovery',waiting:'Waiting for the mix...',saveColor:'Save color',
      useInPainting:'Use in drawing',checkColor:'Check color',hint:'Give me a hint',
      discoveriesEyebrow:'Memories from the lab',collection:'My color notebook',
      saveLocal:'Colors and stars are saved only on this device.',
      poweredBy:'Approximate pigment mixing by',licenseLink:'Third-party licenses',
      aboutProject:'About this project',versionLabel:'Version',checkUpdates:'Update app',
      drops:'drops',oneDrop:'drop',twoDrops:'two drops',mixed:'Mixed color',
      stored:'Saved in your color notebook.',alreadySaved:'This color is already saved.',
      savingUnavailable:'Local storage is unavailable. You can still use this color for drawing.',
      maxThree:'Mix up to three base colors, plus white and black. Undo or empty the cup to try again.',
      fullCup:'The cup is full! Maximum 18 drops.',reset:'Cup emptied. Try a new recipe!',
      needMix:'Add at least one drop before checking.',tap:'drop',
      swatchHint:'Every drop changes the proportions. Can you predict the shade?',
      singleHint:'Choose a second color and watch a new shade appear!',
      greenHint:'Blue and yellow make shades of green.',
      orangeHint:'Red and yellow make shades of orange.',
      purpleHint:'Red and blue make shades of purple.',
      hintTry:'Try adding another color or changing the drop amounts.',
      close:'Close! Try again or ask for a hint.',oneStar:'One star! You are getting closer.',
      twoStars:'Two stars! Great result.',threeStars:'Three stars! You made the target color!',
      starProgress:'Your stars',noSaved:'No saved colors yet. Try adding some drops!',
      loadRecipe:'Try',recipeLoaded:'Saved recipe loaded.',
      error:'The mixing engine could not load. Reopen after updating the app.',
      networkError:'Could not check for updates. Connect to the internet and try again.',
      updated:'You have the latest version.',updateAvailable:'A new version is available. Save your work before updating.',
      confirmUpdate:'An update is available. Save any unsaved artwork first; the app will reload. Update now?',
      updatePostponed:'You can update later.',
      updateHelp:'Tap to check for a newer version.',
      offlineChecking:'Checking both pages for offline readiness…',
      offlineReady:'Drawing, Pigment Lab and World of Light are ready offline.',
      offlinePending:'Offline files are not complete yet. Connect and update the app.'
    }
  };
  let lang = 'ar';
  let mode = 'free';
  let challengeId = 'green';
  let drops = {};
  let actions = [];
  let result = null;
  let colors = [];
  let progress = {};
  let checkingUpdates = false;

  function readStore(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (_) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }
  function text(key) { return words[lang][key] || key; }
  function status(key) { $('labStatus').textContent = text(key); }
  function setLanguage(next) {
    lang = next === 'en' ? 'en' : 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.title = text('lab') + ' | Kids Paint';
    document.querySelectorAll('[data-t]').forEach(node => {
      node.textContent = text(node.dataset.t);
    });
    $('langAr').setAttribute('aria-pressed', String(lang === 'ar'));
    $('langEn').setAttribute('aria-pressed', String(lang === 'en'));
    try { localStorage.setItem(LANGUAGE_KEY, lang); } catch (_) {}
    renderChallenges();
    renderSaved();
    renderMix();
    if ($('challengeFeedback').dataset.messageKey) {
      $('challengeFeedback').textContent = text($('challengeFeedback').dataset.messageKey);
    }
    if ($('labStatus').dataset.messageKey) status($('labStatus').dataset.messageKey);
    const offline=$('labOfflineStatus');
    if(offline.dataset.state)offline.textContent=text(offline.dataset.state);
  }
  function notify(key) {
    $('labStatus').dataset.messageKey = key;
    status(key);
  }
  function target() {
    const challenge = core.challengeById(challengeId);
    return challenge ? core.mix(challenge.recipe, engine) : null;
  }
  function currentChallenge() { return core.challengeById(challengeId); }
  function showMode(next) {
    if (next !== 'free' && next !== 'challenge') return;
    if (mode !== next) {
      mode = next;
      resetMix(false);
    }
    $('freeModeBtn').classList.toggle('active', mode === 'free');
    $('challengeModeBtn').classList.toggle('active', mode === 'challenge');
    $('freeModeBtn').setAttribute('aria-pressed', String(mode === 'free'));
    $('challengeModeBtn').setAttribute('aria-pressed', String(mode === 'challenge'));
    $('challengeSection').hidden = mode !== 'challenge';
    $('challengeActions').hidden = mode !== 'challenge';
    renderChallenges();
    renderMix();
  }
  function renderChallenges() {
    if (!core || !engine) return;
    const picker = $('challengePicker');
    picker.replaceChildren();
    for (const level of [1, 2, 3]) {
      const section = document.createElement('section');
      section.className = 'challenge-stage';
      const heading = document.createElement('h3');
      heading.className = 'challenge-stage-heading';
      const marker = document.createElement('span');
      marker.className = 'challenge-stage-index';
      marker.textContent = String(level);
      const title = document.createElement('span');
      title.textContent = text('stage' + level);
      heading.append(marker, title);
      const grid = document.createElement('div');
      grid.className = 'challenge-stage-grid';
      for (const item of core.challenges.filter(challenge => challenge.stage === level)) {
        const mixed = core.mix(item.recipe, engine);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'challenge-choice';
        button.setAttribute('aria-pressed', String(item.id === challengeId));
        const swatch = document.createElement('span');
        swatch.className = 'mini-swatch';
        swatch.style.backgroundColor = mixed.hex;
        const name = document.createElement('strong');
        name.textContent = lang === 'en' ? item.en : item.ar;
        const stars = document.createElement('small');
        stars.textContent = '★'.repeat(progress[item.id] || 0) + '☆'.repeat(3 - (progress[item.id] || 0));
        stars.setAttribute('aria-label', (progress[item.id] || 0) + '/3');
        button.append(swatch, name, stars);
        button.addEventListener('click', () => selectChallenge(item.id));
        grid.append(button);
      }
      section.append(heading, grid);
      picker.append(section);
    }
    $('challengeProgress').textContent = core.challenges.reduce((sum,item) =>
      sum + (progress[item.id] || 0), 0) + ' / ' + (core.challenges.length * 3) + ' ★';
    const challenge = currentChallenge();
    $('challengeName').textContent = lang === 'en' ? challenge.en : challenge.ar;
    $('challengeDescription').textContent = text('stageTopic' + challenge.stage);
    $('targetSwatch').style.backgroundColor = target().hex;
  }
  function selectChallenge(id) {
    if (!core.challengeById(id)) return;
    challengeId = id;
    resetMix(false);
    renderChallenges();
    $('challengeFeedback').textContent = '';
    $('challengeFeedback').dataset.messageKey = '';
  }
  function resetMix(announce = true) {
    drops = {};
    actions = [];
    result = null;
    $('challengeFeedback').textContent = '';
    $('challengeFeedback').dataset.messageKey = '';
    renderMix();
    if (announce) notify('reset'); else { $('labStatus').textContent = ''; $('labStatus').dataset.messageKey = ''; }
  }
  function addPigment(name) {
    if (!core.pigments[name]) return;
    if (!core.mayAdd(drops, name)) {
      notify(core.totalDrops(drops) >= core.MAX_DROPS ? 'fullCup' : 'maxThree');
      return;
    }
    const next = core.addDrop(drops, name);
    if (!next) return;
    drops = next;
    actions.push(name);
    $('challengeFeedback').textContent = '';
    $('challengeFeedback').dataset.messageKey = '';
    renderMix(true);
    $('labStatus').textContent = '';
    $('labStatus').dataset.messageKey = '';
  }
  function undoDrop() {
    if (!actions.length) return;
    actions.pop();
    drops = {};
    for (const name of actions) drops = core.addDrop(drops, name);
    renderMix();
    $('challengeFeedback').textContent = '';
    $('challengeFeedback').dataset.messageKey = '';
  }
  function getLearning() {
    const names = Object.keys(drops);
    if (!names.length) return text('learningStart');
    if (drops.white && drops.black) return text('whiteBlackHint');
    if (drops.white) return text('lightHint');
    if (drops.black) return text('darkHint');
    if (core.BASE_PIGMENTS.filter(name => drops[name]).length >= 3) return text('threeHint');
    if (names.length === 1) return text('singleHint');
    if (drops.blue && drops.yellow) return text('greenHint');
    if (drops.red && drops.yellow) return text('orangeHint');
    if (drops.red && drops.blue) return text('purpleHint');
    return text('swatchHint');
  }
  function toneName(amounts) {
    if (amounts.white && amounts.black && !core.BASE_PIGMENTS.some(name => amounts[name])) return text('neutralTone');
    if (amounts.black) return text('darkerTone');
    if (amounts.white) return text('lighterTone');
    if (core.BASE_PIGMENTS.filter(name => amounts[name]).length === 3) return text('complexTone');
    return text('mixed');
  }
  function renderMix(animate = false) {
    if (!core || !engine) return;
    try { result = core.mix(drops, engine); }
    catch (error) { console.error('Pigment mixing:', error); notify('error'); return; }
    const total = core.totalDrops(drops);
    for (const name of pigmentNames) {
      const count = drops[name] || 0;
      $(name + 'Count').textContent = count + ' / ' + core.MAX_DROPS;
      const control = document.querySelector('[data-pigment="' + name + '"]');
      control.disabled = !core.mayAdd(drops, name);
      control.setAttribute('aria-label', (lang === 'en' ? core.pigments[name].en : core.pigments[name].ar) + ' — ' + count + ' ' + text('drops'));
    }
    const cup = $('mixCup');
    const liquid = $('liquid');
    cup.classList.toggle('empty', !result);
    cup.setAttribute('aria-label', result ? text('mixed') + ': ' + result.hex : text('emptyCup'));
    liquid.style.height = result ? Math.max(18, Math.round(18 + 67 * total / core.MAX_DROPS)) + '%' : '0%';
    liquid.style.backgroundColor = result ? result.hex : '#eef1fc';
    $('cupLabel').textContent = result ? total + ' ' + text('drops') + ' / ' + core.MAX_DROPS : text('emptyCup');
    $('dropSummary').textContent = result ? Object.entries(drops).map(([name,count]) =>
      (lang === 'en' ? core.pigments[name].en : core.pigments[name].ar) + ' × ' + count
    ).join(' + ') : text('noDrops');
    $('mixLearning').textContent = getLearning();
    $('undoDropBtn').disabled = !actions.length;
    $('resetMixBtn').disabled = !actions.length;
    $('resultSwatch').style.backgroundColor = result ? result.hex : '';
    $('resultSwatch').classList.toggle('empty-result', !result);
    $('resultName').textContent = result ? toneName(drops) : text('waiting');
    $('resultHex').textContent = result ? result.hex : '—';
    $('saveColorBtn').disabled = !result;
    $('paintColorBtn').disabled = !result;
    $('checkChallengeBtn').disabled = !result;
    if (animate && result) {
      cup.classList.remove('pour');
      void cup.offsetWidth;
      cup.classList.add('pour');
      $('sparkleEffect').classList.remove('sparkle');
      void $('sparkleEffect').offsetWidth;
      $('sparkleEffect').classList.add('sparkle');
    }
  }
  function checkChallenge() {
    if (!result) { notify('needMix'); return; }
    const score = core.compare(result, target());
    const key = score.stars === 3 ? 'threeStars' : score.stars === 2 ? 'twoStars'
      : score.stars === 1 ? 'oneStar' : 'close';
    $('challengeFeedback').dataset.messageKey = key;
    $('challengeFeedback').textContent = ('★'.repeat(score.stars) || '☆') + ' ' + text(key);
    if (score.stars > (progress[challengeId] || 0)) {
      progress[challengeId] = score.stars;
      writeStore(PROGRESS_KEY, progress);
      renderChallenges();
    }
    if (score.stars === 3) {
      $('sparkleEffect').classList.remove('sparkle');
      void $('sparkleEffect').offsetWidth;
      $('sparkleEffect').classList.add('sparkle');
    }
  }
  function showHint() {
    const phrase = core.getHint(drops, currentChallenge(), lang);
    $('challengeFeedback').dataset.messageKey = '';
    $('challengeFeedback').textContent = phrase || text('hintTry');
  }
  function recipeId(amounts) {
    return Object.entries(core.tidyDrops(amounts)).map(([name,count]) => name + ':' + count).join('|');
  }
  function saveColor() {
    if (!result) return;
    const id = recipeId(drops);
    if (colors.some(item => recipeId(item.drops) === id)) { notify('alreadySaved'); return; }
    if (colors.length >= MAX_SAVES) { notify('notebookFull'); return; }
    const item = {hex:result.hex, drops:{...drops}, createdAt:new Date().toISOString()};
    const next = [item, ...colors];
    if (!writeStore(COLOR_KEY,next)) { notify('savingUnavailable'); return; }
    colors = next;
    renderSaved();
    notify('stored');
  }
  function renderSaved() {
    const parent = $('savedColors');
    parent.replaceChildren();
    $('savedCount').textContent = colors.length + ' / ' + MAX_SAVES;
    if (!colors.length) {
      const empty = document.createElement('p');
      empty.className = 'no-saved';
      empty.textContent = text('noSaved');
      parent.append(empty);
      return;
    }
    for (const item of colors) {
      const row = document.createElement('div');
      row.className = 'saved-item';
      const sample = document.createElement('span');
      sample.className = 'saved-dot';
      sample.style.backgroundColor = item.hex;
      const meta = document.createElement('span');
      meta.className = 'saved-meta';
      const name = document.createElement('strong');
      name.className = 'saved-name';
      name.textContent = toneName(item.drops);
      const hex = document.createElement('bdi');
      hex.textContent = item.hex;
      const recipe = document.createElement('small');
      recipe.textContent = Object.entries(item.drops).map(([pigment,count]) =>
        (lang === 'en' ? core.pigments[pigment].en : core.pigments[pigment].ar) + ' × ' + count
      ).join(' + ');
      meta.append(name, hex, recipe);
      const buttons = document.createElement('span');
      buttons.className = 'saved-actions';
      const use = document.createElement('button');
      use.type = 'button';
      use.textContent = text('loadRecipe');
      use.addEventListener('click', () => {
        try {
          const clean = core.tidyDrops(item.drops);
          drops = clean;
          actions = Object.entries(clean).flatMap(([pigment,count]) => Array(count).fill(pigment));
          renderMix();
          notify('recipeLoaded');
          $('mixTitle').scrollIntoView({behavior:'smooth',block:'center'});
        } catch(error) { console.warn('Invalid saved mix:',error); }
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'delete-color';
      remove.textContent = text('deleteColor');
      remove.addEventListener('click', () => {
        if (!window.confirm(text('confirmDelete'))) return;
        const next = colors.filter(saved => saved !== item);
        if (!writeStore(COLOR_KEY,next)) { notify('savingUnavailable'); return; }
        colors = next;
        renderSaved();
        notify('deletedColor');
      });
      buttons.append(use,remove);
      row.append(sample,meta,buttons);
      parent.append(row);
    }
  }
  function useInPainting() {
    if (!result) return;
    const next = new URL('./index.html', document.baseURI);
    next.searchParams.set('labColor', result.hex.slice(1));
    window.location.assign(next.href);
  }
  async function checkForUpdate() {
    if (checkingUpdates) return;
    checkingUpdates = true;
    const button = $('labUpdateBtn');
    button.disabled = true;
    const label = $('labUpdateStatus');
    try {
      const url = new URL('./version.json', document.baseURI);
      url.searchParams.set('check', String(Date.now()));
      const response = await fetch(url.href, {cache:'no-store'});
      if (!response.ok) throw new Error('Version check failed');
      const metadata = await response.json();
      if (!metadata || !/^\d+\.\d+\.\d+$/.test(metadata.version)) throw new Error('Invalid version');
      if (metadata.version === RELEASE) { label.textContent = text('updated'); return; }
      label.textContent = text('updateAvailable');
      if (!window.confirm(text('confirmUpdate'))) { label.textContent = text('updatePostponed'); return; }
      if ('serviceWorker' in navigator && window.isSecureContext) {
        const registration = await navigator.serviceWorker.getRegistration('./');
        if (registration) {
          await registration.update();
          const worker=registration.installing||registration.waiting;
          if(worker&&!['activated','redundant'].includes(worker.state)){
            await Promise.race([
              new Promise(resolve=>{
                const done=()=>{
                  if(['activated','redundant'].includes(worker.state)){
                    worker.removeEventListener('statechange',done);
                    resolve();
                  }
                };
                worker.addEventListener('statechange',done);
              }),
              new Promise(resolve=>setTimeout(resolve,6000))
            ]);
          }
        }
      }
      window.location.reload();
    } catch (error) {
      console.warn('Color Lab update:', error);
      label.textContent = text('networkError');
    } finally {
      checkingUpdates = false;
      button.disabled = false;
    }
  }
  async function verifyOffline(){
    const element=$('labOfflineStatus');
    if(!('caches' in window)||!('serviceWorker' in navigator)||!window.isSecureContext){
      element.dataset.state='offlinePending';element.textContent=text('offlinePending');return;
    }
    try{
      const name='kids-paint-shell-v4.7.0';
      if(!(await caches.keys()).includes(name))throw new Error('Offline cache not installed');
      const cache=await caches.open(name);
      const root=new URL('./',document.baseURI);
      const required=[
        './','./index.html','./manifest.webmanifest',
        './style.css?v=4.5.0','./drawing.js?v=4.5.0','./pwa.js?v=4.7.0',
        './color-lab.html','./color-lab.css?v=4.7.0',
        './color-lab-core.js?v=4.6.0','./color-lab.js?v=4.7.0',
        './light-lab-core.js?v=4.7.0','./light-lab.js?v=4.7.0',
        './vendor/spectral.min.js?v=3.0.0',
        './THIRD_PARTY_NOTICES.md','./licenses/spectral-MIT.txt',
        './assets/kids-paint-banner.webp','./assets/app-icon.png',
        './assets/icon-192.png','./assets/icon-512.png',
        './apple-touch-icon.png','./favicon.ico'
      ];
      for(const path of required){
        if(!(await cache.match(new URL(path,root).href)))throw new Error('Missing cached asset '+path);
      }
      element.dataset.state='offlineReady';element.textContent=text('offlineReady');
    }catch(error){
      console.warn('Offline readiness:',error);
      element.dataset.state='offlinePending';element.textContent=text('offlinePending');
    }
  }
  function init() {
    if (!core || !engine) {
      $('labStatus').textContent = words.ar.error;
      document.querySelectorAll('[data-pigment]').forEach(button => button.disabled = true);
      return;
    }
    const previous = (() => { try { return localStorage.getItem(LANGUAGE_KEY); } catch (_) { return 'ar'; } })();
    const storedColors = readStore(COLOR_KEY, []);
    if (Array.isArray(storedColors)) {
      colors = storedColors.filter(item => {
        if (!item || !/^#[0-9a-f]{6}$/i.test(item.hex)) return false;
        try {
          return core.totalDrops(core.tidyDrops(item.drops)) > 0;
        } catch (_) { return false; }
      }).slice(0, MAX_SAVES);
    }
    const storedProgress = readStore(PROGRESS_KEY, {});
    if (storedProgress && typeof storedProgress === 'object' && !Array.isArray(storedProgress)) {
      for (const item of core.challenges) {
        const n = Number(storedProgress[item.id]);
        if (Number.isInteger(n) && n >= 1 && n <= 3) progress[item.id] = n;
      }
    }
    document.querySelectorAll('[data-pigment]').forEach(button => {
      button.addEventListener('click', () => addPigment(button.dataset.pigment));
    });
    $('langAr').addEventListener('click', () => setLanguage('ar'));
    $('langEn').addEventListener('click', () => setLanguage('en'));
    $('freeModeBtn').addEventListener('click', () => showMode('free'));
    $('challengeModeBtn').addEventListener('click', () => showMode('challenge'));
    $('undoDropBtn').addEventListener('click', undoDrop);
    $('resetMixBtn').addEventListener('click', () => resetMix());
    $('saveColorBtn').addEventListener('click', saveColor);
    $('paintColorBtn').addEventListener('click', useInPainting);
    $('checkChallengeBtn').addEventListener('click', checkChallenge);
    $('hintBtn').addEventListener('click', showHint);
    $('labUpdateBtn').addEventListener('click', checkForUpdate);
    setLanguage(previous === 'en' ? 'en' : 'ar');
    showMode('free');
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('./sw.js', {scope:'./',updateViaCache:'none'})
        .then(()=>navigator.serviceWorker.ready)
        .then(verifyOffline)
        .catch(error=>{console.warn('Offline Color Lab setup:',error);verifyOffline();});
      navigator.serviceWorker.addEventListener('controllerchange',verifyOffline);
    }
  }
  init();
})();
