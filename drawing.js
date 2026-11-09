/* Kids Paint: self-contained bilingual/offline drawing app (no external libraries). */
(() => {
  'use strict';

  // Portrait on mobile is a real portrait canvas, not a stretched landscape bitmap.
  // Capture the stage's physical aspect after responsive CSS has been applied.
  const MOBILE_PORTRAIT = window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches;
  const stage = document.getElementById('canvasStage');
  if (MOBILE_PORTRAIT) stage.dataset.shape = 'portrait';
  const stageBounds = stage.getBoundingClientRect();
  let W = MOBILE_PORTRAIT ? 560 : 960;
  let H = MOBILE_PORTRAIT
    ? Math.max(720, Math.min(1560, Math.round(W * stageBounds.height / Math.max(1, stageBounds.width))))
    : 640;
  const DEFAULT_W = W;
  const DEFAULT_H = H;
  const MAX_HISTORY = MOBILE_PORTRAIT ? 16 : 22;
  const STORAGE_PREFIX = 'kids-paint-art-';
  const LANGUAGE_KEY = 'kids-paint-language';
  const TEMPLATES = ['cat', 'fish', 'apple', 'lion', 'pencil', 'butterfly', 'flower', 'house', 'rocket', 'car', 'turtle', 'icecream', 'sun'];
  TEMPLATES.unshift('blank');
  const PALETTE = [
    ['#ff6b6b', 'red'], ['#ff9f43', 'orange'], ['#ffdf55', 'yellow'],
    ['#62be78', 'green'], ['#24b9aa', 'teal'], ['#4f98ec', 'blue'],
    ['#9164dc', 'purple'], ['#ed7fbe', 'pink'], ['#9d6f4d', 'brown'], ['#91c944', 'lime'], ['#ffffff', 'white'], ['#30394c', 'black']
  ];
  const WORDS = {
    ar: {
      heroCaption: 'اختر رسمة، امسك اللون، وابدأ إبداعك!', startPainting: 'ابدأ التلوين',
      title: 'عالم التلوين', subtitle: 'صبغ بضغطة، أو ارسم بالقلم والبخاخ', workspace: 'لوحة الرسم',
      workspaceHint: 'ارسم شكلًا مغلقًا بالقلم، ثم اضغط داخله بالدلو لصبغه دون تلوين الخلفية', offline: 'يعمل دون إنترنت',
      textTool: 'كتابة', textLabel: 'النص المطلوب', textPlaceholder: 'اكتب هنا...', textHint: 'اختر اللون والحجم ثم اضغط على المكان المطلوب داخل الصورة', textRequired: 'اكتب نصًا أولًا، ثم اختر مكانه على اللوحة', textPlaced: 'تمت إضافة النص إلى الصورة',
      tools: 'الأدوات', bucket: 'دلو الصبغ', brush: 'قلم الرسم', spray: 'بخاخ الألوان', eraser: 'ممحاة', stamp: 'الأختام', stampShapes: 'اختر شكل الختم', stampHint: 'اختر لونًا وحجمًا، ثم اضغط على اللوحة', heart: 'قلب', star: 'نجمة', stampButterfly: 'فراشة', stampFlower: 'زهرة', moon: 'هلال', smile: 'وجه مبتسم', stampPlaced: 'تم وضع الختم', emojiTool: 'إيموجي', emojiShapes: 'اختر الإيموجي', emojiHint: 'اختر رمزًا وحجمًا، ثم اضغط على الصورة. يحتفظ الإيموجي بألوانه الأصلية.', emojiPlaced: 'تمت إضافة الإيموجي', saveToPhotos: 'حفظ في الصور', galleryShareTitle: 'رسمتي من عالم التلوين', galleryShared: 'اختر «حفظ الصورة» من نافذة المشاركة لإضافتها للاستديو', galleryDownloaded: 'تم تنزيل PNG. افتح الملف واحفظه في تطبيق الصور من قائمة المشاركة.', galleryCancelled: 'تم إلغاء المشاركة', colors: 'الألوان', shades: 'درجات اللون', customColor: 'لون مخصص', lime: 'ليموني', white: 'أبيض', size: 'حجم الأداة', importPhoto: 'استيراد صورة من الاستديو', photoPrivacy: 'الصورة تبقى على جهازك دون رفعها للإنترنت', photoImported: 'تم استيراد الصورة. ارسم أو ضع الأختام عليها!', photoInvalid: 'تعذر قراءة الصورة. اختر صورة مدعومة بحجم أقل من 30 ميغابايت', photoImportFailed: 'فشل استيراد الصورة. جرّب صورة بصيغة أخرى', photoFillNeedsBorder: 'ارسم شكلًا مغلقًا أولًا، ثم استخدم الدلو داخله حتى لا تختفي الصورة',
      undo: 'تراجع', redo: 'إعادة', clear: 'مسح الألوان', save: 'حفظ', export: 'تصدير PNG',
      templates: 'رسومات جاهزة', templatesHint: 'اختر رسمة جاهزة، أو ارسم شكلًا مغلقًا بالقلم ثم اصبغ داخله بالدلو',
      savedArtworks: 'رسوماتي المحفوظة', savedHint: 'تُحفظ على هذا الجهاز فقط، وليست في حساب سحابي',
      footer: 'Kids Paint — مساحة آمنة للإبداع دون حساب أو إعلانات', copyright: 'حقوق النشر', repositoryLink: 'المستودع على GitHub', licenseLink: 'رخصة MIT',
      nameDrawing: 'اسم الرسمة', nameLabel: 'اكتب اسم رسمة مميزًا', cancel: 'إلغاء',
      drawingArea: 'مساحة الرسم والصبغ', butterfly: 'فراشة', flower: 'زهرة', house: 'منزل', rocket: 'صاروخ', car: 'سيارة', turtle: 'سلحفاة', icecream: 'آيس كريم', sun: 'شمس', cat: 'قطة', fish: 'سمكة', apple: 'تفاح', lion: 'أسد',
      pencil: 'قلم', blank: 'رسم حر', open: 'فتح', delete: 'حذف', red: 'أحمر', orange: 'برتقالي',
      yellow: 'أصفر', green: 'أخضر', teal: 'فيروزي', blue: 'أزرق', purple: 'بنفسجي',
      pink: 'وردي', brown: 'بني', black: 'أسود', colorName: 'اللون: {color}',
      ready: 'اختر لونًا: دلو الصبغ للمساحات، القلم للرسم، والبخاخ للرذاذ', toolSelected: 'الأداة الحالية: {tool}',
      selectedColor: 'اخترت {color}', sizeSelected: 'حجم الأداة: {size}',
      drawn: 'ممتاز! يمكنك المتابعة أو الحفظ', filled: 'تم صبغ المنطقة', backgroundFilled: 'تم صبغ الخلفية أيضًا', alreadyColored: 'هذه المنطقة بنفس اللون بالفعل', blockedRegion: 'اضغط بجوار الخط الداكن داخل المنطقة المطلوبة', undone: 'تم التراجع', redone: 'تمت الإعادة',
      cleared: 'تم مسح تلوينك مع الاحتفاظ بالرسمة الأصلية', clearedQuestion: 'هل تريد مسح تلوينك؟ ستبقى الرسمة الأصلية.',
      switchQuestion: 'ستفقد التلوين غير المحفوظ عند تغيير الرسمة. هل تريد المتابعة؟',
      exported: 'تم تجهيز صورة PNG للتنزيل', exportFailed: 'تعذر تصدير الصورة. حاول مجددًا.',
      saved: 'تم حفظ الرسمة على هذا الجهاز', saveFailed: 'تعذر الحفظ محليًا. يمكنك استخدام تصدير PNG بدلًا من ذلك.',
      loaded: 'تم فتح الرسمة المحفوظة', loadFailed: 'تعذر فتح الرسمة المحفوظة',
      deleted: 'تم حذف الرسمة', deleteFailed: 'تعذر حذف الرسمة',
      deleteQuestion: 'هل تريد حذف «{name}» نهائيًا من هذا المتصفح؟',
      emptyGallery: 'ما عندك رسومات محفوظة بعد. ارسم شيئًا واضغط «حفظ»!',
      galleryError: 'تعذر قراءة الرسومات المحفوظة', unnamedArtwork: 'رسمتي',
      storageUnavailable: 'التخزين المحلي غير متاح في هذا المتصفح؛ لا يزال بإمكانك تصدير PNG.',
      storageMode: 'تخزين محلي',
    },
    en: {
      heroCaption: 'Pick a picture, choose a color, and make something wonderful!', startPainting: 'Start coloring',
      title: 'Kids Paint', subtitle: 'Tap to fill, draw with a pen, or spray paint', workspace: 'Drawing canvas',
      workspaceHint: 'Draw a closed shape with the pen, then tap inside with the bucket to fill just that shape', offline: 'Works offline',
      textTool: 'Text', textLabel: 'Your text', textPlaceholder: 'Type here...', textHint: 'Choose a color and size, then tap where the text should appear', textRequired: 'Type some text first, then tap its position on the canvas', textPlaced: 'Text added to the picture',
      tools: 'Tools', bucket: 'Paint bucket', brush: 'Drawing pen', spray: 'Spray paint', eraser: 'Eraser', stamp: 'Stamps', stampShapes: 'Pick a stamp', stampHint: 'Choose a color and size, then tap the canvas', heart: 'Heart', star: 'Star', stampButterfly: 'Butterfly', stampFlower: 'Flower', moon: 'Crescent moon', smile: 'Smiley face', stampPlaced: 'Stamp placed', emojiTool: 'Emoji', emojiShapes: 'Choose an emoji', emojiHint: 'Pick an emoji and size, then tap the canvas. Emoji use their original colors.', emojiPlaced: 'Emoji added', saveToPhotos: 'Save to Photos', galleryShareTitle: 'My Kids Paint artwork', galleryShared: 'Choose Save Image in the share sheet to add it to Photos', galleryDownloaded: 'PNG downloaded. Open it and use Share → Save Image to add it to Photos.', galleryCancelled: 'Sharing cancelled', colors: 'Colors', shades: 'Color shades', customColor: 'Custom color', lime: 'Lime', white: 'White', size: 'Tool size', importPhoto: 'Import a photo', photoPrivacy: 'Your photo stays on your device; nothing is uploaded', photoImported: 'Photo imported! Draw or add stamps on top', photoInvalid: 'Cannot read this image. Choose a supported image under 30 MB', photoImportFailed: 'Could not import the image. Try another image format', photoFillNeedsBorder: 'Draw a closed shape first; bucket fill cannot cover the entire photo',
      undo: 'Undo', redo: 'Redo', clear: 'Clear colors', save: 'Save', export: 'Export PNG',
      templates: 'Coloring pages', templatesHint: 'Choose a picture, or draw a closed shape with the pen and fill inside it with the bucket',
      savedArtworks: 'My saved drawings', savedHint: 'Saved on this device only — not synced to a cloud account',
      footer: 'Kids Paint — a private, ad-free space to create', copyright: 'Copyright', repositoryLink: 'GitHub repository', licenseLink: 'MIT License',
      nameDrawing: 'Drawing name', nameLabel: 'Give your drawing a name', cancel: 'Cancel',
      drawingArea: 'Drawing and painting canvas', butterfly: 'Butterfly', flower: 'Flower', house: 'House', rocket: 'Rocket', car: 'Car', turtle: 'Turtle', icecream: 'Ice cream', sun: 'Sun', cat: 'Cat', fish: 'Fish', apple: 'Apples', lion: 'Lion',
      pencil: 'Pencil', blank: 'Free draw', open: 'Open', delete: 'Delete', red: 'Red', orange: 'Orange',
      yellow: 'Yellow', green: 'Green', teal: 'Teal', blue: 'Blue', purple: 'Purple',
      pink: 'Pink', brown: 'Brown', black: 'Black', colorName: '{color} color',
      ready: 'Pick a color: bucket fills areas, pen draws, spray adds a mist', toolSelected: 'Current tool: {tool}',
      selectedColor: 'Selected {color}', sizeSelected: 'Tool size: {size}',
      drawn: 'Nice work! Keep going or save it', filled: 'Area filled with color', backgroundFilled: 'Background painted too', alreadyColored: 'This region already has that color', blockedRegion: 'Tap beside the dark outline inside the area you want', undone: 'Undone', redone: 'Redone',
      cleared: 'Your colors were cleared; the original outline remains', clearedQuestion: 'Clear your coloring? The original outline will remain.',
      switchQuestion: 'Changing pictures will discard any unsaved coloring. Continue?',
      exported: 'PNG image prepared for download', exportFailed: 'Could not export the image. Please retry.',
      saved: 'Drawing saved on this device', saveFailed: 'Could not save locally. Try Export PNG instead.',
      loaded: 'Saved drawing opened', loadFailed: 'Could not open the saved drawing',
      deleted: 'Drawing deleted', deleteFailed: 'Could not delete the drawing',
      deleteQuestion: 'Permanently delete “{name}” from this browser?',
      emptyGallery: 'No saved drawings yet. Make one and select Save!',
      galleryError: 'Could not read saved drawings', unnamedArtwork: 'My drawing',
      storageUnavailable: 'Local storage is unavailable in this browser; PNG export still works.',
      storageMode: 'Local storage',
    }
  };

  const el = (id) => document.getElementById(id);
  const paintCanvas = el('paintCanvas');
  const photoCanvas = el('photoCanvas');
  const photoCtx = photoCanvas.getContext('2d');
  const STAMPS = ['heart', 'star', 'stampButterfly', 'stampFlower', 'moon', 'smile'];
  // Native Unicode emoji are intentionally separate from recolorable vector stamps.
  // Their colors follow the operating system's emoji font (iOS / Android / desktop).
  const EMOJIS = [
    ['😀', 'ضحكة', 'Smile'], ['😍', 'إعجاب', 'Heart eyes'], ['🥳', 'حفلة', 'Party'],
    ['😎', 'نظارة', 'Cool'], ['🥰', 'حب', 'Lovely'], ['❤️', 'قلب', 'Heart'],
    ['💖', 'قلب لامع', 'Sparkling heart'], ['⭐', 'نجمة', 'Star'], ['🌈', 'قوس قزح', 'Rainbow'],
    ['🦋', 'فراشة', 'Butterfly'], ['🐱', 'قطة', 'Cat'], ['🐶', 'كلب', 'Dog'],
    ['🌸', 'زهرة', 'Blossom'], ['🌻', 'عباد الشمس', 'Sunflower'], ['🚀', 'صاروخ', 'Rocket'],
    ['⚽', 'كرة قدم', 'Football'], ['🍕', 'بيتزا', 'Pizza'], ['🎉', 'احتفال', 'Confetti']
  ];
  const templateCanvas = el('templateCanvas');
  for (const canvas of [paintCanvas, photoCanvas, templateCanvas]) {
    canvas.width = W;
    canvas.height = H;
  }
  const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
  const templateCtx = templateCanvas.getContext('2d');
  // Track only freehand pen outlines, independently from fills and spray pigment.
  // The visible paint canvas remains the combined artwork for backwards compatibility.
  const strokeCanvas = document.createElement('canvas');
  strokeCanvas.width = W; strokeCanvas.height = H;
  const strokeCtx = strokeCanvas.getContext('2d', { willReadFrequently: true });
  const state = {
    lang: 'ar', template: 'blank', tool: 'brush', color: PALETTE[0][0], size: 12,
    stamp: 'heart', emoji: '😀', colorFamily: 0, photoActive: false,
    pointer: null, lastPoint: null, history: [], historyIndex: 0,
    savedId: null, savedName: null, statusKey: 'ready', statusVars: {},
    storageMode: 'none', db: null, previewUrls: []
  };

  function resizeDocument(width, height) {
    // Open saved artwork in its original pixel dimensions, including legacy
    // 960x640 projects, so imported photos, paint and pen boundaries stay aligned.
    if (![width, height].every(n => Number.isInteger(n) && n >= 240 && n <= 2400)) {
      throw new Error('Invalid artwork dimensions');
    }
    W = width; H = height;
    for (const canvas of [photoCanvas, paintCanvas, templateCanvas, strokeCanvas]) {
      canvas.width = W;
      canvas.height = H;
    }
    stage.dataset.shape = H > W ? 'portrait' : 'landscape';
    stage.style.setProperty('--canvas-ratio', W + ' / ' + H);
  }
  resizeDocument(DEFAULT_W, DEFAULT_H);

  function t(key, vars = {}) {
    let result = WORDS[state.lang][key] ?? key;
    for (const [name, value] of Object.entries(vars)) result = result.replaceAll(`{${name}}`, String(value));
    return result;
  }
  function message(key, vars = {}) {
    state.statusKey = key;
    state.statusVars = vars;
    el('status').textContent = t(key, vars);
  }
  function persistLanguage() { try { localStorage.setItem(LANGUAGE_KEY, state.lang); } catch (_) { /* disabled storage */ } }
  function restoreLanguage() {
    try { return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ar'; } catch (_) { return 'ar'; }
  }
  function setLanguage(lang, persist = true) {
    if (!WORDS[lang]) return;
    state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${t('title')} | Kids Paint`;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node => { node.placeholder = t(node.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => {
      node.setAttribute('aria-label', t(node.dataset.i18nAria));
    });
    el('langAr').setAttribute('aria-pressed', String(lang === 'ar'));
    el('langEn').setAttribute('aria-pressed', String(lang === 'en'));
    el('toolsPanel').setAttribute('aria-label', t('tools'));
    el('colorPalette').setAttribute('aria-label', t('colors'));
    el('templatePicker').setAttribute('aria-label', t('templates'));
    renderPalette();
    renderShades();
    renderStampPicker();
    renderEmojiPicker();
    renderTemplatePicker();
    updateToolButtons();
    message(state.statusKey, state.statusVars);
    if (persist) persistLanguage();
    renderGallery();
  }

  /* Built-in vector line art; no external images, downloads, or fonts required. */
  function strokePath(ctx, build, fill = null) {
    ctx.beginPath();
    build(ctx);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.stroke();
  }
  function circle(ctx, x, y, r, fill = null) {
    strokePath(ctx, c => c.arc(x, y, r, 0, Math.PI * 2), fill);
  }
  function drawCat(ctx) {
    strokePath(ctx, c => {
      c.moveTo(236, 112); c.lineTo(202, 48); c.quadraticCurveTo(197, 36, 213, 42);
      c.lineTo(286, 88); c.quadraticCurveTo(300, 87, 314, 88);
      c.lineTo(387, 42); c.quadraticCurveTo(403, 36, 398, 48); c.lineTo(364, 112);
      c.bezierCurveTo(430, 182, 386, 276, 300, 283);
      c.bezierCurveTo(214, 276, 170, 182, 236, 112); c.closePath();
    });
    strokePath(ctx, c => { c.moveTo(237, 91); c.lineTo(223, 65); c.lineTo(255, 88); });
    strokePath(ctx, c => { c.moveTo(363, 91); c.lineTo(377, 65); c.lineTo(345, 88); });
    circle(ctx, 259, 166, 11, '#26334b'); circle(ctx, 341, 166, 11, '#26334b');
    strokePath(ctx, c => { c.moveTo(286, 202); c.quadraticCurveTo(300, 214, 314, 202); c.closePath(); }, '#f2b2bb');
    strokePath(ctx, c => { c.moveTo(300, 214); c.lineTo(300, 225); c.quadraticCurveTo(285, 241, 271, 226); });
    strokePath(ctx, c => { c.moveTo(300, 225); c.quadraticCurveTo(315, 241, 329, 226); });
    for (let i = -1; i <= 1; i++) {
      strokePath(ctx, c => { c.moveTo(225, 210 + i * 15); c.lineTo(160, 200 + i * 19); });
      strokePath(ctx, c => { c.moveTo(375, 210 + i * 15); c.lineTo(440, 200 + i * 19); });
    }
    strokePath(ctx, c => { c.moveTo(245, 284); c.bezierCurveTo(194, 303, 205, 350, 240, 355); c.lineTo(360, 355); c.bezierCurveTo(395, 350, 406, 303, 355, 284); });
    strokePath(ctx, c => { c.moveTo(260, 327); c.lineTo(260, 356); c.moveTo(340, 327); c.lineTo(340, 356); });
    strokePath(ctx, c => { c.moveTo(387, 329); c.bezierCurveTo(482, 307, 473, 224, 433, 253); });
  }
  function drawFish(ctx) {
    strokePath(ctx, c => { c.ellipse(292, 201, 143, 94, 0, 0, Math.PI * 2); });
    strokePath(ctx, c => { c.moveTo(426, 170); c.lineTo(505, 116); c.lineTo(491, 200); c.lineTo(505, 285); c.lineTo(426, 231); });
    strokePath(ctx, c => { c.moveTo(259, 111); c.quadraticCurveTo(295, 53, 361, 120); });
    strokePath(ctx, c => { c.moveTo(268, 291); c.quadraticCurveTo(309, 331, 362, 282); });
    strokePath(ctx, c => { c.moveTo(217, 138); c.quadraticCurveTo(254, 200, 217, 266); });
    circle(ctx, 202, 187, 10, '#26334b');
    strokePath(ctx, c => { c.moveTo(166, 216); c.quadraticCurveTo(178, 225, 191, 215); });
    for (let i=0; i<3; i++) strokePath(ctx, c => { c.moveTo(273 + i*38, 162); c.quadraticCurveTo(290 + i*38, 204, 273 + i*38, 244); });
    circle(ctx, 120, 106, 14); circle(ctx, 95, 65, 9); circle(ctx, 138, 48, 5);
    strokePath(ctx, c => { c.moveTo(105, 329); c.quadraticCurveTo(130, 290, 145, 334); c.quadraticCurveTo(156, 365, 167, 336); });
  }
  function appleAt(ctx, x, y, scale) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    strokePath(ctx, c => { c.moveTo(0, 43); c.bezierCurveTo(-89, -5, -139, 68, -98, 144); c.bezierCurveTo(-77, 202, -19, 187, 0, 181); c.bezierCurveTo(29, 189, 80, 204, 103, 139); c.bezierCurveTo(142, 57, 82, -5, 0, 43); c.closePath(); });
    strokePath(ctx, c => { c.moveTo(0, 49); c.quadraticCurveTo(-6, 8, 18, -23); });
    strokePath(ctx, c => { c.moveTo(4, 33); c.quadraticCurveTo(59, -34, 102, 9); c.quadraticCurveTo(65, 51, 4, 33); });
    ctx.restore();
  }
  function drawApple(ctx) { appleAt(ctx, 210, 121, .9); appleAt(ctx, 395, 145, .8); }
  function drawLion(ctx) {
    ctx.save(); ctx.translate(300, 191);
    strokePath(ctx, c => {
      for (let i = 0; i <= 20; i++) {
        const a = -Math.PI/2 + (i * Math.PI*2/20);
        const r = i % 2 === 0 ? 159 : 132;
        const x = Math.cos(a)*r, y = Math.sin(a)*r;
        if (i === 0) c.moveTo(x,y); else c.lineTo(x,y);
      }
      c.closePath();
    });
    circle(ctx, -85, -69, 36); circle(ctx, 85, -69, 36);
    strokePath(ctx, c => { c.moveTo(-89, -65); c.quadraticCurveTo(-53, -99, -55, -49); });
    strokePath(ctx, c => { c.moveTo(89, -65); c.quadraticCurveTo(53, -99, 55, -49); });
    strokePath(ctx, c => { c.ellipse(0, 8, 106, 116, 0, 0, Math.PI*2); });
    circle(ctx, -41, -20, 9, '#26334b'); circle(ctx, 41, -20, 9, '#26334b');
    strokePath(ctx, c => { c.moveTo(-18, 26); c.lineTo(18, 26); c.lineTo(0, 45); c.closePath(); }, '#f1adb1');
    strokePath(ctx, c => { c.moveTo(0, 45); c.lineTo(0, 58); c.quadraticCurveTo(-21, 78, -40, 58); });
    strokePath(ctx, c => { c.moveTo(0, 58); c.quadraticCurveTo(21, 78, 40, 58); });
    for(let j=-1;j<=1;j++) { strokePath(ctx,c=>{c.moveTo(-54,53+j*11);c.lineTo(-104,46+j*15);}); strokePath(ctx,c=>{c.moveTo(54,53+j*11);c.lineTo(104,46+j*15);}); }
    ctx.restore();
  }
  function drawPencil(ctx) {
    ctx.save(); ctx.translate(300, 190); ctx.rotate(-.55);
    strokePath(ctx, c => { c.rect(-54,-153,108,247); });
    strokePath(ctx, c => { c.moveTo(-54,94); c.lineTo(0,172); c.lineTo(54,94); c.closePath(); });
    strokePath(ctx, c => { c.moveTo(-17,149); c.lineTo(0,172); c.lineTo(17,149); });
    strokePath(ctx, c => { c.moveTo(-54,-153); c.quadraticCurveTo(-54,-183,-23,-183); c.lineTo(23,-183); c.quadraticCurveTo(54,-183,54,-153); });
    strokePath(ctx, c => { c.moveTo(-17,-150); c.lineTo(-17,94); c.moveTo(17,-150); c.lineTo(17,94); });
    ctx.restore();
    strokePath(ctx,c=>{c.moveTo(135,115);c.lineTo(150,104);c.moveTo(135,83);c.lineTo(151,93);c.moveTo(454,278);c.lineTo(475,278);c.moveTo(448,309);c.lineTo(462,323);});
  }
  function drawButterfly(ctx) {
    const wing = (side, upper) => {
      ctx.save(); ctx.translate(300, 208); ctx.scale(side, 1);
      strokePath(ctx, c => {
        if (upper) { c.moveTo(4,-38); c.bezierCurveTo(88,-215,205,-166,188,-67); c.bezierCurveTo(180,-8,115,30,8,7); }
        else { c.moveTo(4,10); c.bezierCurveTo(114,-9,173,56,146,124); c.bezierCurveTo(117,189,27,117,4,27); }
        c.closePath();
      });
      circle(ctx, upper ? 105 : 99, upper ? -75 : 69, upper ? 27 : 22);
      ctx.restore();
    };
    wing(-1,true); wing(1,true); wing(-1,false); wing(1,false);
    strokePath(ctx,c=>{ c.ellipse(300,211,19,103,0,0,Math.PI*2); });
    strokePath(ctx,c=>{c.moveTo(289,113);c.quadraticCurveTo(263,64,245,78);c.moveTo(311,113);c.quadraticCurveTo(337,64,355,78);});
    circle(ctx,245,78,5); circle(ctx,355,78,5);
  }
  function drawFlower(ctx) {
    const cx=300, cy=164;
    for(let i=0;i<8;i++){const a=i*Math.PI/4; circle(ctx,cx+72*Math.cos(a),cy+72*Math.sin(a),53);}
    circle(ctx,cx,cy,54);
    strokePath(ctx,c=>{c.moveTo(300,273);c.lineTo(300,366);});
    strokePath(ctx,c=>{c.moveTo(300,326);c.bezierCurveTo(237,255,201,313,300,346);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(300,346);c.bezierCurveTo(365,269,401,313,300,366);c.closePath();});
  }
  function drawHouse(ctx) {
    strokePath(ctx,c=>{c.rect(189,163,222,196);});
    strokePath(ctx,c=>{c.moveTo(163,174);c.lineTo(300,44);c.lineTo(437,174);c.closePath();});
    strokePath(ctx,c=>{c.rect(269,257,63,102);});
    strokePath(ctx,c=>{c.rect(216,200,50,51);c.rect(338,200,50,51);});
    strokePath(ctx,c=>{c.moveTo(241,200);c.lineTo(241,251);c.moveTo(216,225);c.lineTo(266,225);c.moveTo(363,200);c.lineTo(363,251);c.moveTo(338,225);c.lineTo(388,225);});
    circle(ctx,316,311,3.5,'#26334b');
    strokePath(ctx,c=>{c.rect(371,82,24,44);});
  }
  function drawRocket(ctx) {
    strokePath(ctx,c=>{c.moveTo(261,274);c.lineTo(261,150);c.quadraticCurveTo(261,89,300,37);c.quadraticCurveTo(339,89,339,150);c.lineTo(339,274);c.closePath();});
    circle(ctx,300,158,33);
    strokePath(ctx,c=>{c.moveTo(261,225);c.lineTo(216,300);c.lineTo(261,287);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(339,225);c.lineTo(384,300);c.lineTo(339,287);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(271,274);c.lineTo(329,274);c.lineTo(329,296);c.lineTo(271,296);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(283,296);c.quadraticCurveTo(263,348,300,379);c.quadraticCurveTo(337,348,317,296);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(261,220);c.lineTo(339,220);});
    circle(ctx,300,158,17);
  }
  function drawCar(ctx) {
    strokePath(ctx,c=>{c.moveTo(108,250);c.lineTo(108,211);c.quadraticCurveTo(108,190,139,190);c.lineTo(177,190);c.lineTo(223,131);c.quadraticCurveTo(235,119,253,119);c.lineTo(375,119);c.quadraticCurveTo(390,119,404,136);c.lineTo(448,190);c.lineTo(478,190);c.quadraticCurveTo(497,190,497,216);c.lineTo(497,263);c.lineTo(108,263);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(229,185);c.lineTo(267,135);c.lineTo(302,135);c.lineTo(302,185);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(318,135);c.lineTo(369,135);c.lineTo(416,185);c.lineTo(318,185);c.closePath();});
    circle(ctx,194,268,39); circle(ctx,415,268,39);
    circle(ctx,194,268,20); circle(ctx,415,268,20);
    strokePath(ctx,c=>{c.moveTo(313,198);c.lineTo(313,256);c.moveTo(336,205);c.lineTo(354,205);});
    strokePath(ctx,c=>{c.rect(468,213,29,17);c.rect(108,213,20,17);});
  }
  function drawTurtle(ctx) {
    strokePath(ctx,c=>{c.ellipse(296,211,160,110,0,0,Math.PI*2);});
    circle(ctx,468,202,51); circle(ctx,486,191,5,'#26334b');
    strokePath(ctx,c=>{c.moveTo(491,216);c.quadraticCurveTo(480,227,467,215);});
    for(const [x,y] of [[185,298],[370,299],[223,303],[340,302]]) {
      strokePath(ctx,c=>{c.ellipse(x,y,23,39,-.15,0,Math.PI*2);});
    }
    strokePath(ctx,c=>{c.moveTo(143,231);c.lineTo(88,249);c.lineTo(149,265);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(263,135);c.lineTo(340,135);c.lineTo(382,205);c.lineTo(334,273);c.lineTo(263,273);c.lineTo(210,206);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(210,206);c.lineTo(136,206);c.moveTo(382,205);c.lineTo(455,205);c.moveTo(263,135);c.lineTo(228,107);c.moveTo(334,273);c.lineTo(348,304);});
  }
  function drawIcecream(ctx) {
    strokePath(ctx,c=>{c.moveTo(223,218);c.lineTo(377,218);c.lineTo(300,364);c.closePath();});
    strokePath(ctx,c=>{c.moveTo(250,233);c.lineTo(334,298);c.moveTo(350,233);c.lineTo(266,298);});
    strokePath(ctx,c=>{c.arc(300,160,99,0,Math.PI*2);});
    strokePath(ctx,c=>{c.moveTo(205,197);c.quadraticCurveTo(300,219,395,197);});
    circle(ctx,300,59,17);
    strokePath(ctx,c=>{c.moveTo(300,44);c.quadraticCurveTo(309,12,331,28);});
  }
  function drawSun(ctx) {
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const x=Math.cos(a),y=Math.sin(a);
      strokePath(ctx,c=>{c.moveTo(300+x*146,194+y*146);c.lineTo(300+Math.cos(a-.15)*198,194+Math.sin(a-.15)*198);
        c.lineTo(300+Math.cos(a+.15)*198,194+Math.sin(a+.15)*198);c.closePath();});
    }
    circle(ctx,300,194,129);
    circle(ctx,256,170,9,'#26334b');circle(ctx,344,170,9,'#26334b');
    strokePath(ctx,c=>{c.arc(300,194,67,.25*Math.PI,.75*Math.PI);});
  }
  const DRAWERS = { cat: drawCat, fish: drawFish, apple: drawApple, lion: drawLion, pencil: drawPencil, butterfly: drawButterfly, flower: drawFlower, house: drawHouse, rocket: drawRocket, car: drawCar, turtle: drawTurtle, icecream: drawIcecream, sun: drawSun, blank: () => {} };

  function renderOutline(ctx, templateId, width = W, height = H) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    if (height > width) {
      // Keep illustrated shapes proportional and centered inside portrait pages.
      const zoom = Math.min(width / 470, height / 470);
      ctx.translate(width / 2 - 300 * zoom, height / 2 - 200 * zoom);
      ctx.scale(zoom, zoom);
    } else {
      ctx.scale(width / 600, height / 400);
    }
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#30394c';
    DRAWERS[templateId]?.(ctx);
    ctx.restore();
  }
  function chooseTemplate(id) {
    if (!DRAWERS[id] || (id === state.template && !state.photoActive)) return;
    if (hasArtwork() && !window.confirm(t('switchQuestion'))) return;
    resizeDocument(DEFAULT_W, DEFAULT_H);
    state.template = id;
    state.tool = id === 'blank' ? 'brush' : 'bucket';
    updateToolButtons();
    state.savedId = null; state.savedName = null;
    paintCtx.clearRect(0, 0, W, H);
    strokeCtx.clearRect(0, 0, W, H);
    photoCtx.clearRect(0, 0, W, H); state.photoActive = false;
    renderOutline(templateCtx, id);
    resetHistory();
    renderTemplatePicker();
    message('ready');
  }
  function renderTemplatePicker() {
    const parent = el('templatePicker');
    parent.replaceChildren();
    for (const id of TEMPLATES) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'template-item';
      button.setAttribute('aria-pressed', String(id === state.template));
      button.setAttribute('aria-label', t(id));
      const preview = document.createElement('canvas');
      preview.width = 300; preview.height = 200; preview.setAttribute('aria-hidden', 'true');
      const context = preview.getContext('2d');
      renderOutline(context, id, 300, 200);
      const label = document.createElement('span'); label.textContent = t(id);
      button.append(preview, label);
      button.addEventListener('click', () => chooseTemplate(id));
      parent.append(button);
    }
  }
  function blendColors(hex, target, factor) {
    const source = [1,3,5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const other = [1,3,5].map(i => parseInt(target.slice(i, i + 2), 16));
    return '#' + source.map((v, i) => Math.round(v * (1 - factor) + other[i] * factor).toString(16).padStart(2, '0')).join('');
  }
  function shadesFor(hex) {
    return [blendColors(hex, '#ffffff', .76), blendColors(hex, '#ffffff', .43), hex,
      blendColors(hex, '#000000', .23), blendColors(hex, '#000000', .48)];
  }
  function updateSelectedColor(color, family = state.colorFamily) {
    state.color = color.toLowerCase(); state.colorFamily = family;
    if (state.tool === 'eraser') state.tool = 'brush';
    renderPalette(); renderShades(); renderStampPicker(); updateToolButtons();
    el('customColor').value = state.color;
    message('selectedColor', { color: state.color });
  }
  function renderPalette() {
    const parent = el('colorPalette'); parent.replaceChildren();
    PALETTE.forEach(([color, name], index) => {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch'; swatch.type = 'button'; swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.setAttribute('aria-label', t('colorName', { color: t(name) }));
      swatch.setAttribute('aria-pressed', String(state.colorFamily === index));
      swatch.addEventListener('click', () => updateSelectedColor(color, index));
      parent.append(swatch);
    });
  }
  function renderShades() {
    const parent = el('shadePalette'); parent.replaceChildren();
    if (state.colorFamily < 0) return;
    shadesFor(PALETTE[state.colorFamily][0]).forEach((color, i) => {
      const swatch = document.createElement('button');
      swatch.type = 'button'; swatch.className = 'shade-swatch'; swatch.style.backgroundColor = color;
      swatch.setAttribute('aria-label', t('colorName', { color }));
      swatch.setAttribute('aria-pressed', String(state.color === color));
      swatch.addEventListener('click', () => updateSelectedColor(color));
      parent.append(swatch);
    });
  }

  // Vector stamps use the chosen pigment, not OS-specific multicolor emoji.
  function drawStamp(ctx, id, point, size, color) {
    ctx.save();
    ctx.translate(point.x, point.y); ctx.scale(size / 100, size / 100);
    ctx.fillStyle = color; ctx.strokeStyle = color === '#ffffff' ? '#576078' : 'rgba(41,34,76,.42)';
    ctx.lineWidth = 3.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const shape = (build) => { ctx.beginPath(); build(); ctx.fill(); ctx.stroke(); };
    if (id === 'heart') {
      shape(() => {
        ctx.moveTo(0, 40); ctx.bezierCurveTo(-58, 6, -56, -39, -23, -38);
        ctx.bezierCurveTo(-10, -38, -2, -31, 0, -22);
        ctx.bezierCurveTo(9, -46, 48, -49, 50, -17);
        ctx.bezierCurveTo(52, 6, 25, 27, 0, 40); ctx.closePath();
      });
    } else if (id === 'star') {
      shape(() => {
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5;
          const r = i % 2 ? 22 : 47;
          const x = Math.cos(a) * r, y = Math.sin(a) * r;
          if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        } ctx.closePath();
      });
    } else if (id === 'stampButterfly') {
      shape(() => { ctx.moveTo(-3, -5); ctx.bezierCurveTo(-58, -65, -63, 0, -26, 11); ctx.bezierCurveTo(-56, 57, -7, 59, -3, 7); ctx.closePath(); });
      shape(() => { ctx.moveTo(3, -5); ctx.bezierCurveTo(58, -65, 63, 0, 26, 11); ctx.bezierCurveTo(56, 57, 7, 59, 3, 7); ctx.closePath(); });
      ctx.beginPath(); ctx.ellipse(0, 4, 5, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2,-24); ctx.quadraticCurveTo(-11,-44,-20,-40);
      ctx.moveTo(2,-24); ctx.quadraticCurveTo(11,-44,20,-40); ctx.stroke();
    } else if (id === 'stampFlower') {
      for (let i = 0; i < 6; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 3);
        ctx.beginPath(); ctx.ellipse(0, -24, 17, 23, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === 'moon') {
      shape(() => { ctx.moveTo(20, -46); ctx.bezierCurveTo(-35, -45, -52, 24, -1, 47); ctx.bezierCurveTo(-33, 4, -1, -25, 20, -46); ctx.closePath(); });
    } else if (id === 'smile') {
      ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.fillStyle = '#ffffff';
      for (const x of [-16, 16]) { ctx.beginPath(); ctx.arc(x, -12, 5.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = '#37435e'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.arc(0, 2, 25, .12 * Math.PI, .88 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  }
  function renderStampPicker() {
    const parent = el('stampPicker'); parent.replaceChildren();
    STAMPS.forEach(id => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'stamp-choice';
      btn.setAttribute('aria-label', t(id)); btn.setAttribute('aria-pressed', String(state.stamp === id));
      const preview = document.createElement('canvas'); preview.width = 68; preview.height = 68;
      preview.setAttribute('aria-hidden', 'true');
      drawStamp(preview.getContext('2d'), id, {x:34,y:34}, 62, state.color);
      const text = document.createElement('span'); text.textContent = t(id);
      btn.append(preview, text);
      btn.addEventListener('click', () => { state.stamp = id; chooseTool('stamp'); renderStampPicker(); });
      parent.append(btn);
    });
  }
  function renderEmojiPicker() {
    const parent = el('emojiPicker');
    parent.replaceChildren();
    for (const [symbol, arName, enName] of EMOJIS) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'emoji-choice';
      button.textContent = symbol;
      button.title = state.lang === 'ar' ? arName : enName;
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', String(state.emoji === symbol));
      button.addEventListener('click', () => {
        state.emoji = symbol;
        chooseTool('emoji');
        renderEmojiPicker();
      });
      parent.append(button);
    }
  }
  function placeEmoji(point) {
    // Emoji glyphs draw onto the paint layer, not the pen-boundary layer.
    // Thus bucket fills cannot mistake colored emoji details for closed pen outlines.
    const size = Math.max(48, state.size * 4.1);
    paintCtx.save();
    paintCtx.globalCompositeOperation = 'source-over';
    paintCtx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    paintCtx.textAlign = 'center';
    paintCtx.textBaseline = 'middle';
    paintCtx.fillText(state.emoji, point.x, point.y, size * 1.55);
    paintCtx.restore();
    commitHistory();
    message('emojiPlaced');
  }
  function placeText(point) {
    // Tap-to-position: text is flattened into the paint layer, leaving photos
    // and reusable pen boundaries intact. Undo/Redo and Save work unchanged.
    const input = el('textInput');
    const content = input.value.trim();
    if (!content) { message('textRequired'); input.focus(); return; }
    const lines = content.split(/\r?\n/).slice(0, 3);
    const size = Math.min(150, Math.max(23, Math.round(state.size * 3.2)));
    const lineHeight = size * 1.22;
    const top = Math.max(size * 0.7 + 10, Math.min(H - 10 - (lines.length - 1) * lineHeight - size * 0.4,
      point.y - (lines.length - 1) * lineHeight / 2));
    paintCtx.save();
    paintCtx.globalCompositeOperation = 'source-over';
    paintCtx.font = '700 ' + size + 'px system-ui, "Noto Sans Arabic", sans-serif';
    paintCtx.textAlign = 'center';
    paintCtx.textBaseline = 'middle';
    paintCtx.lineJoin = 'round';
    paintCtx.lineWidth = Math.max(2, size * 0.065);
    paintCtx.strokeStyle = 'rgba(255,255,255,.88)';
    paintCtx.fillStyle = state.color;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const maxWidth = W - 24;
      const measured = Math.min(maxWidth, paintCtx.measureText(line).width);
      const x = Math.max(12 + measured / 2, Math.min(W - 12 - measured / 2, point.x));
      const y = top + i * lineHeight;
      paintCtx.direction = /[\u0600-\u06ff]/.test(line) ? 'rtl' : 'ltr';
      paintCtx.strokeText(line, x, y, maxWidth);
      paintCtx.fillText(line, x, y, maxWidth);
    }
    paintCtx.restore();
    commitHistory();
    message('textPlaced');
  }
  function updateToolButtons() {
    paintCanvas.dataset.mode = state.tool;
    el('textPanel').hidden = state.tool !== 'text';
    el('stampPanel').hidden = state.tool !== 'stamp';
    el('emojiPanel').hidden = state.tool !== 'emoji';
    el('brushSize').disabled = state.tool === 'bucket';
    el('brushSizeOutput').textContent = state.tool === 'bucket' ? '—' : String(state.size);
    for (const tool of ['bucket', 'brush', 'spray', 'eraser', 'stamp', 'emoji', 'text']) {
      const button = el(tool === 'bucket' ? 'bucketTool' : tool === 'brush' ? 'brushTool' : tool === 'spray' ? 'sprayTool' : tool === 'eraser' ? 'eraserTool' : tool === 'stamp' ? 'stampTool' : tool === 'emoji' ? 'emojiTool' : 'textTool');
      button.classList.toggle('is-active', tool === state.tool);
      button.setAttribute('aria-pressed', String(tool === state.tool));
    }
  }
  function chooseTool(tool) {
    if (!['bucket', 'brush', 'spray', 'eraser', 'stamp', 'emoji', 'text'].includes(tool)) return;
    state.tool = tool; updateToolButtons(); message('toolSelected', { tool: t(tool) });
  }
  function placeStamp(point) {
    const size = Math.max(28, state.size * 4);
    drawStamp(paintCtx, state.stamp, point, size, state.color);
    drawStamp(strokeCtx, state.stamp, point, size, '#000000');
    commitHistory(); message('stampPlaced');
  }

  /* The pen boundary mask is stored as alpha-only bytes to keep mobile undo history small.
     Both the visible paint and the stroke mask must time-travel together. */
  function snapshot() {
    const alpha = strokeCtx.getImageData(0, 0, W, H).data;
    const outline = new Uint8Array(W * H);
    for (let i = 0; i < outline.length; i++) outline[i] = alpha[4 * i + 3];
    return { paint: paintCtx.getImageData(0, 0, W, H), outline };
  }
  function restoreStrokeMask(outline) {
    const restored = strokeCtx.createImageData(W, H);
    for (let i = 0; i < outline.length; i++) {
      const j = i * 4;
      restored.data[j] = 0;
      restored.data[j + 1] = 0;
      restored.data[j + 2] = 0;
      restored.data[j + 3] = outline[i];
    }
    strokeCtx.putImageData(restored, 0, 0);
  }
  function resetHistory() { state.history = [snapshot()]; state.historyIndex = 0; updateHistoryButtons(); }
  function commitHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot());
    if (state.history.length > MAX_HISTORY) state.history.shift();
    state.historyIndex = state.history.length - 1;
    updateHistoryButtons();
  }
  function restoreHistory() {
    const saved = state.history[state.historyIndex];
    paintCtx.clearRect(0, 0, W, H);
    paintCtx.putImageData(saved.paint, 0, 0);
    restoreStrokeMask(saved.outline);
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    el('undoBtn').disabled = state.historyIndex === 0;
    el('redoBtn').disabled = state.historyIndex >= state.history.length - 1;
  }
  function undo() {
    if (state.pointer !== null || state.historyIndex === 0) return;
    state.historyIndex--; restoreHistory(); message('undone');
  }
  function redo() {
    if (state.pointer !== null || state.historyIndex >= state.history.length - 1) return;
    state.historyIndex++; restoreHistory(); message('redone');
  }
  function hasArtwork() { return hasPaint() || state.photoActive; }
  function hasPaint() {
    const pixels = paintCtx.getImageData(0, 0, W, H).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) return true;
    return false;
  }
  function clearPaint() {
    if (state.pointer !== null || !hasPaint()) return;
    if (!window.confirm(t('clearedQuestion'))) return;
    paintCtx.clearRect(0, 0, W, H);
    strokeCtx.clearRect(0, 0, W, H);
    commitHistory(); message('cleared');
  }
  function coords(event) {
    const r = paintCanvas.getBoundingClientRect();
    return { x: (event.clientX - r.left) * W / r.width, y: (event.clientY - r.top) * H / r.height };
  }
  // Flood fill respects both built-in template outlines AND hand-drawn pen strokes.
  // Spray particles and existing fill colors are deliberately not barriers.
  // The outside/background region remains paintable when tapped intentionally.
  function bucketFill(point) {
    if (state.pointer !== null) return;
    let sx = Math.floor(point.x), sy = Math.floor(point.y);
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
    const ink = templateCtx.getImageData(0, 0, W, H).data;
    const penInk = strokeCtx.getImageData(0, 0, W, H).data;
    const barriers = new Uint8Array(W * H);
    for (let i = 0; i < barriers.length; i++) {
      barriers[i] = ink[i * 4 + 3] >= 52 || penInk[i * 4 + 3] >= 24 ? 1 : 0;
    }
    const isLine = (x, y) => barriers[y * W + x] !== 0;
    if (isLine(sx, sy)) {
      // Resolve a near-outline tap to the nearest fillable pixel.
      let nearest = null;
      for (let radius = 1; radius <= 12 && !nearest; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
            const x = sx + dx, y = sy + dy;
            if (x >= 0 && x < W && y >= 0 && y < H && !isLine(x, y)) {
              const distance = dx * dx + dy * dy;
              if (!nearest || distance < nearest.distance) nearest = { x, y, distance };
            }
          }
        }
      }
      if (!nearest) { message('blockedRegion'); return; }
      sx = nearest.x; sy = nearest.y;
    }

    const visited = new Uint8Array(W * H);
    const queue = new Int32Array(W * H);
    let head = 0, tail = 0;
    let touchesEdge = false;
    const seed = sy * W + sx;
    visited[seed] = 1;
    queue[tail++] = seed;
    const push = idx => {
      if (visited[idx] || barriers[idx]) return;
      visited[idx] = 1;
      queue[tail++] = idx;
    };
    while (head < tail) {
      const idx = queue[head++];
      const x = idx % W, y = (idx / W) | 0;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touchesEdge = true;
      if (x > 0) push(idx - 1);
      if (x < W - 1) push(idx + 1);
      if (y > 0) push(idx - W);
      if (y < H - 1) push(idx + W);
    }

    // Imported photos remain visible: only fill closed pen regions on top.
    if (state.photoActive && touchesEdge) { message('photoFillNeedsBorder'); return; }
    const data = paintCtx.getImageData(0, 0, W, H);
    const value = state.color;
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    let changed = false;
    for (let i = 0; i < tail; i++) {
      const offset = queue[i] * 4;
      if (data.data[offset] !== r || data.data[offset + 1] !== g || data.data[offset + 2] !== b || data.data[offset + 3] !== 255) {
        changed = true;
        data.data[offset] = r; data.data[offset + 1] = g;
        data.data[offset + 2] = b; data.data[offset + 3] = 255;
      }
    }
    if (!changed) { message('alreadyColored'); return; }
    paintCtx.putImageData(data, 0, 0);
    commitHistory();
    message(touchesEdge ? 'backgroundFilled' : 'filled');
  }

  // Soft spray: randomized semitransparent pigment particles distributed over a
  // circular radius. Continuous drags interpolate between pointer samples.
  function sprayAt(point) {
    const radius = Math.max(5, state.size * 2.5);
    const quantity = Math.max(12, Math.min(28, Math.round(state.size * 1.15)));
    paintCtx.save();
    paintCtx.globalCompositeOperation = 'source-over';
    paintCtx.fillStyle = state.color;
    paintCtx.globalAlpha = 0.28;
    for (let i = 0; i < quantity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius * Math.sqrt(Math.random());
      const x = point.x + Math.cos(angle) * distance;
      const y = point.y + Math.sin(angle) * distance;
      const particleSize = 0.65 + Math.random() * 1.7;
      paintCtx.beginPath();
      paintCtx.arc(x, y, particleSize, 0, Math.PI * 2);
      paintCtx.fill();
    }
    paintCtx.restore();
  }

  function prepareTool() {
    paintCtx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
    paintCtx.lineCap = 'round'; paintCtx.lineJoin = 'round';
    paintCtx.lineWidth = state.size;
    paintCtx.strokeStyle = state.tool === 'eraser' ? '#000000' : state.color;
    paintCtx.fillStyle = paintCtx.strokeStyle;
    // Spray never updates the outline mask. The eraser removes outline pixels too.
    strokeCtx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
    strokeCtx.lineCap = 'round'; strokeCtx.lineJoin = 'round';
    strokeCtx.lineWidth = state.size;
    strokeCtx.strokeStyle = '#000000'; strokeCtx.fillStyle = '#000000';
  }
  function pointDot(point) {
    paintCtx.beginPath();
    paintCtx.arc(point.x, point.y, state.size / 2, 0, Math.PI * 2);
    paintCtx.fill();
    strokeCtx.beginPath();
    strokeCtx.arc(point.x, point.y, state.size / 2, 0, Math.PI * 2);
    strokeCtx.fill();
  }
  function onPointerDown(e) {
    if (state.pointer !== null || e.isPrimary === false || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    if (state.tool === 'bucket') { bucketFill(coords(e)); return; }
    if (state.tool === 'stamp') { placeStamp(coords(e)); return; }
    if (state.tool === 'emoji') { placeEmoji(coords(e)); return; }
    if (state.tool === 'text') { placeText(coords(e)); return; }
    state.pointer = e.pointerId;
    state.lastPoint = coords(e);
    try { paintCanvas.setPointerCapture(e.pointerId); } catch (_) { /* unusual input device */ }
    if (state.tool === 'spray') sprayAt(state.lastPoint);
    else { prepareTool(); pointDot(state.lastPoint); }
    paintCtx.globalCompositeOperation = 'source-over';
    strokeCtx.globalCompositeOperation = 'source-over';
  }
  function onPointerMove(e) {
    if (e.pointerId !== state.pointer) return;
    e.preventDefault();
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const points = events.length ? events : [e];
    if (state.tool !== 'spray') prepareTool();
    for (const sample of points) {
      const p = coords(sample);
      if (state.tool === 'spray') {
        const dx = p.x - state.lastPoint.x;
        const dy = p.y - state.lastPoint.y;
        const distance = Math.hypot(dx, dy);
        const steps = Math.min(8, Math.max(1, Math.ceil(distance / Math.max(4, state.size * 0.65))));
        for (let i = 1; i <= steps; i++) {
          sprayAt({x: state.lastPoint.x + dx * i / steps, y: state.lastPoint.y + dy * i / steps});
        }
      } else {
        paintCtx.beginPath(); paintCtx.moveTo(state.lastPoint.x, state.lastPoint.y);
        paintCtx.lineTo(p.x, p.y); paintCtx.stroke();
        strokeCtx.beginPath(); strokeCtx.moveTo(state.lastPoint.x, state.lastPoint.y);
        strokeCtx.lineTo(p.x, p.y); strokeCtx.stroke();
      }
      state.lastPoint = p;
    }
    paintCtx.globalCompositeOperation = 'source-over';
    strokeCtx.globalCompositeOperation = 'source-over';
  }
  function onPointerEnd(e, cancelled = false) {
    if (e.pointerId !== state.pointer) return;
    if (!cancelled) onPointerMove(e);
    state.pointer = null; state.lastPoint = null;
    if (paintCanvas.hasPointerCapture?.(e.pointerId)) {
      try { paintCanvas.releasePointerCapture(e.pointerId); } catch (_) { /* already released */ }
    }
    if (cancelled) restoreHistory();
    else { commitHistory(); message('drawn'); }
  }
  function onCaptureLost(e) {
    if (state.pointer !== e.pointerId) return;
    state.pointer = null; state.lastPoint = null;
    commitHistory(); message('drawn');
  }

  function composeImage() {
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const context = out.getContext('2d');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, W, H);
    if (state.photoActive) context.drawImage(photoCanvas, 0, 0);
    context.drawImage(paintCanvas, 0, 0);
    context.drawImage(templateCanvas, 0, 0);
    return out;
  }
  function toBlob(canvas, mime = 'image/png', quality) {
    return new Promise((resolve, reject) => {
      try { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas export failed')), mime, quality); }
      catch (error) { reject(error); }
    });
  }
  function filename(value) {
    const clean = value.normalize('NFKC').replace(/[\\/:*?"<>|\x00-\x1F]/g, '-').trim().slice(0, 60);
    return clean || 'kids-paint';
  }
  async function exportPNG() {
    try {
      const blob = await toBlob(composeImage());
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      anchor.download = `${filename(state.savedName || 'kids-paint')}-${date}.png`;
      anchor.href = url; document.body.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15_000);
      message('exported');
    } catch (error) { console.error('PNG export:', error); message('exportFailed'); }
  }

  async function saveToPhotos() {
    // Web apps cannot silently write to the iOS Photos library. The Web Share
    // sheet lets the child/parent explicitly choose "Save Image". Other browsers
    // receive a regular PNG download, which can be saved to Photos manually.
    try {
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        // Synchronous creation keeps the user gesture active for Safari's share sheet.
        const dataURL = composeImage().toDataURL('image/png');
        const bytes = atob(dataURL.split(',')[1]);
        const data = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) data[i] = bytes.charCodeAt(i);
        const filenamePNG = `${filename(state.savedName || 'kids-paint')}-${new Date().toISOString().slice(0,10)}.png`;
        const file = new File([data], filenamePNG, {type: 'image/png'});
        if (navigator.canShare({files: [file]})) {
          await navigator.share({files: [file], title: t('galleryShareTitle')});
          message('galleryShared');
          return;
        }
      }
      await exportPNG();
      message('galleryDownloaded');
    } catch (error) {
      if (error && error.name === 'AbortError') { message('galleryCancelled'); return; }
      console.warn('Photo share unavailable; downloading PNG instead:', error);
      try { await exportPNG(); message('galleryDownloaded'); }
      catch (_) { message('exportFailed'); }
    }
  }

  /* IndexedDB for binary artwork; localStorage data-URL fallback if IDB is blocked. */
  const database = {
    async init() {
      if (typeof indexedDB !== 'undefined') {
        try {
          state.db = await new Promise((resolve, reject) => {
            const req = indexedDB.open('KidsPaintDatabase', 1);
            req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('artworks')) req.result.createObjectStore('artworks', { keyPath: 'id' }); };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
            req.onblocked = () => reject(new Error('Database blocked'));
          });
          state.storageMode = 'idb'; return;
        } catch (error) { console.warn('IndexedDB unavailable, trying localStorage', error); }
      }
      try {
        const key = 'kids-paint-storage-check';
        localStorage.setItem(key, 'ok'); localStorage.removeItem(key);
        state.storageMode = 'local';
      } catch (_) { state.storageMode = 'none'; message('storageUnavailable'); }
    },
    async request(action, id = null, record = null) {
      if (state.storageMode === 'none') throw new Error('Storage unavailable');
      if (state.storageMode === 'local') {
        if (action === 'getAll') {
          const results = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) {
              try { results.push(JSON.parse(localStorage.getItem(key))); } catch (_) { /* invalid legacy record */ }
            }
          }
          return results;
        }
        if (action === 'get') { const raw = localStorage.getItem(STORAGE_PREFIX + id); return raw ? JSON.parse(raw) : null; }
        if (action === 'put') {
          const { paintBlob, strokeBlob, photoBlob, ...metadata } = record;
          const photoDataUrl = record.photoDataUrl || (photoBlob ? await blobToDataURL(photoBlob) : null);
          const paintDataUrl = record.paintDataUrl || await blobToDataURL(paintBlob);
          const strokeDataUrl = record.strokeDataUrl || (strokeBlob ? await blobToDataURL(strokeBlob) : null);
          localStorage.setItem(STORAGE_PREFIX + record.id, JSON.stringify({ ...metadata, paintDataUrl, strokeDataUrl, photoDataUrl }));
          return record.id;
        }
        if (action === 'delete') { localStorage.removeItem(STORAGE_PREFIX + id); return; }
      }
      return new Promise((resolve, reject) => {
        const tx = state.db.transaction('artworks', action === 'put' || action === 'delete' ? 'readwrite' : 'readonly');
        const store = tx.objectStore('artworks');
        let request;
        if (action === 'getAll') request = store.getAll();
        if (action === 'get') request = store.get(id);
        if (action === 'put') request = store.put(record);
        if (action === 'delete') request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.onerror = () => reject(tx.error);
      });
    }
  };
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob);
    });
  }
  function openSaveDialog() {
    if (state.storageMode === 'none') { message('storageUnavailable'); return; }
    el('artworkName').value = state.savedName || t('unnamedArtwork');
    el('saveDialog').showModal();
    el('artworkName').focus(); el('artworkName').select();
  }
  async function saveArtwork(name) {
    try {
      const paintBlob = await toBlob(paintCanvas);
      const strokeBlob = await toBlob(strokeCanvas);
      const photoBlob = state.photoActive ? await toBlob(photoCanvas, 'image/jpeg', .86) : null;
      const previewCanvas = document.createElement('canvas'); previewCanvas.width = 300; previewCanvas.height = Math.round(300 * H / W);
      previewCanvas.getContext('2d').drawImage(composeImage(), 0, 0, previewCanvas.width, previewCanvas.height);
      const preview = previewCanvas.toDataURL('image/jpeg', .8);
      const id = state.savedId || (typeof window.crypto?.randomUUID === 'function' ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      await database.request('put', null, {
        id, name: name.slice(0, 60), template: state.template, preview, paintBlob, strokeBlob, photoBlob, canvasWidth: W, canvasHeight: H,
        updatedAt: new Date().toISOString()
      });
      state.savedId = id; state.savedName = name;
      el('saveDialog').close();
      message('saved'); await renderGallery();
    } catch (error) { console.error('Artwork save:', error); message('saveFailed'); }
  }
  function imageFrom(src) {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Could not decode image')); img.src = src;
    });
  }
  async function importPhoto(file) {
    if (!file) return;
    // Browser-native decoding covers the formats the user's gallery actually supports.
    if ((!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|heic|heif|avif|bmp)$/i.test(file.name)) || file.size > 30 * 1024 * 1024) {
      message('photoInvalid'); return;
    }
    let sourceUrl = null;
    try {
      sourceUrl = URL.createObjectURL(file);
      const img = await imageFrom(sourceUrl);
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('Empty image');
      if (hasArtwork() && !window.confirm(t('switchQuestion'))) return;
      // Resize onto the fixed drawing stage without stretching or cropping the source.
      // The original file is not modified, stored remotely, or sent over the network.
      resizeDocument(DEFAULT_W, DEFAULT_H);
      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      photoCtx.clearRect(0, 0, W, H);
      photoCtx.fillStyle = '#ffffff'; photoCtx.fillRect(0, 0, W, H);
      photoCtx.drawImage(img, (W - width) / 2, (H - height) / 2, width, height);
      state.photoActive = true;
      state.template = 'blank'; state.tool = 'brush';
      state.savedId = null; state.savedName = null;
      paintCtx.clearRect(0, 0, W, H); strokeCtx.clearRect(0, 0, W, H);
      renderOutline(templateCtx, 'blank'); renderTemplatePicker(); updateToolButtons();
      resetHistory(); message('photoImported');
      el('canvasStage').scrollIntoView({behavior:'smooth',block:'nearest'});
    } catch (error) {
      console.error('Photo import:', error); message('photoImportFailed');
    } finally { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }
  }

  async function openArtwork(id) {
    try {
      const record = await database.request('get', id);
      if (!record || !DRAWERS[record.template]) throw new Error('Invalid saved artwork');
      if (hasArtwork() && !window.confirm(t('switchQuestion'))) return;
      const url = record.paintBlob ? URL.createObjectURL(record.paintBlob) : record.paintDataUrl;
      let img;
      try { img = await imageFrom(url); } finally { if (record.paintBlob) URL.revokeObjectURL(url); }
      let restoredPen = null;
      // Older saved artworks do not have a stroke mask. They still open normally,
      // but their previously drawn pen strokes cannot be retroactively identified.
      if (record.strokeBlob || record.strokeDataUrl) {
        const outlineURL = record.strokeBlob ? URL.createObjectURL(record.strokeBlob) : record.strokeDataUrl;
        try { restoredPen = await imageFrom(outlineURL); }
        finally { if (record.strokeBlob) URL.revokeObjectURL(outlineURL); }
      }
      let restoredPhoto = null;
      if (record.photoBlob || record.photoDataUrl) {
        const photoURL = record.photoBlob ? URL.createObjectURL(record.photoBlob) : record.photoDataUrl;
        try { restoredPhoto = await imageFrom(photoURL); }
        finally { if (record.photoBlob) URL.revokeObjectURL(photoURL); }
      }
      resizeDocument(record.canvasWidth || 960, record.canvasHeight || 640);
      state.template = record.template; state.tool = record.template === 'blank' ? 'brush' : 'bucket';
      updateToolButtons(); state.savedId = record.id; state.savedName = record.name;
      paintCtx.clearRect(0, 0, W, H); paintCtx.drawImage(img, 0, 0, W, H);
      strokeCtx.clearRect(0, 0, W, H);
      if (restoredPen) strokeCtx.drawImage(restoredPen, 0, 0, W, H);
      photoCtx.clearRect(0, 0, W, H);
      if (restoredPhoto) photoCtx.drawImage(restoredPhoto, 0, 0, W, H);
      state.photoActive = !!restoredPhoto;
      renderOutline(templateCtx, state.template); resetHistory(); renderTemplatePicker();
      message('loaded');
    } catch (error) { console.error('Artwork load:', error); message('loadFailed'); }
  }
  async function deleteArtwork(record) {
    if (!window.confirm(t('deleteQuestion', { name: record.name }))) return;
    try {
      await database.request('delete', record.id);
      if (state.savedId === record.id) { state.savedId = null; state.savedName = null; }
      await renderGallery(); message('deleted');
    } catch (error) { console.error('Artwork delete:', error); message('deleteFailed'); }
  }
  async function renderGallery() {
    const parent = el('savedGallery'); if (!parent) return;
    parent.replaceChildren();
    if (state.storageMode === 'none') {
      const empty = document.createElement('p'); empty.className = 'empty-gallery'; empty.textContent = t('storageUnavailable'); parent.append(empty); return;
    }
    try {
      const records = await database.request('getAll');
      records.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      if (!records.length) {
        const empty = document.createElement('p'); empty.className = 'empty-gallery'; empty.textContent = t('emptyGallery'); parent.append(empty); return;
      }
      for (const item of records) {
        const card = document.createElement('article'); card.className = 'saved-card';
        const picture = document.createElement('img'); picture.src = item.preview; picture.alt = item.name; picture.loading = 'lazy';
        const heading = document.createElement('h3'); heading.textContent = item.name;
        const date = document.createElement('small');
        try { date.textContent = new Intl.DateTimeFormat(state.lang === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'medium' }).format(new Date(item.updatedAt)); }
        catch (_) { date.textContent = item.updatedAt.slice(0, 10); }
        const actions = document.createElement('div'); actions.className = 'saved-card-actions';
        const open = document.createElement('button'); open.type = 'button'; open.textContent = t('open'); open.setAttribute('aria-label', `${t('open')}: ${item.name}`);
        open.addEventListener('click', () => openArtwork(item.id));
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete'; remove.textContent = t('delete'); remove.setAttribute('aria-label', `${t('delete')}: ${item.name}`);
        remove.addEventListener('click', () => deleteArtwork(item));
        actions.append(open, remove); card.append(picture, heading, date, actions); parent.append(card);
      }
    } catch (error) {
      console.error('Artwork gallery:', error);
      const warning = document.createElement('p'); warning.className = 'empty-gallery'; warning.textContent = t('galleryError'); parent.append(warning);
    }
  }

  function attachEvents() {
    el('langAr').addEventListener('click', () => setLanguage('ar'));
    el('langEn').addEventListener('click', () => setLanguage('en'));
    el('bucketTool').addEventListener('click', () => chooseTool('bucket'));
    el('brushTool').addEventListener('click', () => chooseTool('brush'));
    el('sprayTool').addEventListener('click', () => chooseTool('spray'));
    el('eraserTool').addEventListener('click', () => chooseTool('eraser'));
    el('stampTool').addEventListener('click', () => chooseTool('stamp'));
    el('emojiTool').addEventListener('click', () => chooseTool('emoji'));
    el('textTool').addEventListener('click', () => chooseTool('text'));
    el('customColor').addEventListener('input', e => updateSelectedColor(e.target.value, -1));
    el('importPhotoBtn').addEventListener('click', () => el('photoInput').click());
    el('photoInput').addEventListener('change', async e => {
      const file = e.target.files?.[0]; e.target.value = '';
      if (file) await importPhoto(file);
    });
    el('brushSize').addEventListener('input', e => {
      state.size = Number(e.target.value); el('brushSizeOutput').textContent = String(state.size);
      message('sizeSelected', { size: state.size });
    });
    el('undoBtn').addEventListener('click', undo);
    el('redoBtn').addEventListener('click', redo);
    el('clearBtn').addEventListener('click', clearPaint);
    el('exportBtn').addEventListener('click', exportPNG);
    el('saveToPhotosBtn').addEventListener('click', saveToPhotos);
    el('saveBtn').addEventListener('click', openSaveDialog);
    el('cancelSave').addEventListener('click', () => el('saveDialog').close());
    el('saveForm').addEventListener('submit', event => {
      event.preventDefault(); const name = el('artworkName').value.trim() || t('unnamedArtwork');
      saveArtwork(name);
    });
    paintCanvas.addEventListener('pointerdown', onPointerDown);
    paintCanvas.addEventListener('pointermove', onPointerMove);
    paintCanvas.addEventListener('pointerup', e => onPointerEnd(e));
    paintCanvas.addEventListener('pointercancel', e => onPointerEnd(e, true));
    paintCanvas.addEventListener('lostpointercapture', onCaptureLost);
    window.addEventListener('keydown', e => {
      if (el('saveDialog').open || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault(); redo();
      }
    });
  }
  async function init() {
    attachEvents();
    renderOutline(templateCtx, state.template);
    resetHistory();
    state.lang = restoreLanguage();
    await database.init();
    setLanguage(state.lang, false);
  }
  init().catch(error => { console.error('Kids Paint initialization failed', error); message('saveFailed'); });
})();
