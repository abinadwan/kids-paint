/* Kids Paint: self-contained bilingual/offline drawing app (no external libraries). */
(() => {
  'use strict';

  const W = 960;
  const H = 640;
  const MAX_HISTORY = 22;
  const STORAGE_PREFIX = 'kids-paint-art-';
  const LANGUAGE_KEY = 'kids-paint-language';
  const TEMPLATES = ['cat', 'fish', 'apple', 'lion', 'pencil', 'blank'];
  const PALETTE = [
    ['#ff6b6b', 'red'], ['#ff9f43', 'orange'], ['#ffdf55', 'yellow'],
    ['#62be78', 'green'], ['#24b9aa', 'teal'], ['#4f98ec', 'blue'],
    ['#9164dc', 'purple'], ['#ed7fbe', 'pink'], ['#9d6f4d', 'brown'], ['#30394c', 'black']
  ];
  const WORDS = {
    ar: {
      title: 'عالم التلوين', subtitle: 'ارسم، لوّن، واحفظ إبداعاتك', workspace: 'لوحة الرسم',
      workspaceHint: 'اختر رسمة ثم ابدأ التلوين', offline: 'يعمل دون إنترنت',
      tools: 'الأدوات', brush: 'فرشاة', eraser: 'ممحاة', colors: 'الألوان', size: 'حجم الأداة',
      undo: 'تراجع', redo: 'إعادة', clear: 'مسح الألوان', save: 'حفظ', export: 'تصدير PNG',
      templates: 'رسومات جاهزة', templatesHint: 'اختر رسمة لتلوينها، أو صفحة بيضاء للرسم الحر',
      savedArtworks: 'رسوماتي المحفوظة', savedHint: 'تُحفظ على هذا الجهاز فقط، وليست في حساب سحابي',
      footer: 'Kids Paint — مساحة آمنة للإبداع دون حساب أو إعلانات',
      nameDrawing: 'اسم الرسمة', nameLabel: 'اكتب اسم رسمة مميزًا', cancel: 'إلغاء',
      drawingArea: 'مساحة الرسم والتلوين', cat: 'قطة', fish: 'سمكة', apple: 'تفاح', lion: 'أسد',
      pencil: 'قلم', blank: 'رسم حر', open: 'فتح', delete: 'حذف', red: 'أحمر', orange: 'برتقالي',
      yellow: 'أصفر', green: 'أخضر', teal: 'فيروزي', blue: 'أزرق', purple: 'بنفسجي',
      pink: 'وردي', brown: 'بني', black: 'أسود', colorName: 'اللون: {color}',
      ready: 'اختر لونًا وارسم داخل اللوحة', toolSelected: 'الأداة الحالية: {tool}',
      selectedColor: 'اخترت {color}', sizeSelected: 'حجم الأداة: {size}',
      drawn: 'رسم ممتاز! يمكنك المتابعة أو الحفظ', undone: 'تم التراجع', redone: 'تمت الإعادة',
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
      title: 'Kids Paint', subtitle: 'Draw, color, and save your creations', workspace: 'Drawing canvas',
      workspaceHint: 'Choose a picture, then start coloring', offline: 'Works offline',
      tools: 'Tools', brush: 'Brush', eraser: 'Eraser', colors: 'Colors', size: 'Tool size',
      undo: 'Undo', redo: 'Redo', clear: 'Clear colors', save: 'Save', export: 'Export PNG',
      templates: 'Coloring pages', templatesHint: 'Choose a picture to color, or a blank page to draw freely',
      savedArtworks: 'My saved drawings', savedHint: 'Saved on this device only — not synced to a cloud account',
      footer: 'Kids Paint — a private, ad-free space to create',
      nameDrawing: 'Drawing name', nameLabel: 'Give your drawing a name', cancel: 'Cancel',
      drawingArea: 'Drawing and coloring canvas', cat: 'Cat', fish: 'Fish', apple: 'Apples', lion: 'Lion',
      pencil: 'Pencil', blank: 'Free draw', open: 'Open', delete: 'Delete', red: 'Red', orange: 'Orange',
      yellow: 'Yellow', green: 'Green', teal: 'Teal', blue: 'Blue', purple: 'Purple',
      pink: 'Pink', brown: 'Brown', black: 'Black', colorName: '{color} color',
      ready: 'Choose a color and draw on the canvas', toolSelected: 'Current tool: {tool}',
      selectedColor: 'Selected {color}', sizeSelected: 'Tool size: {size}',
      drawn: 'Nice drawing! Keep going or save it', undone: 'Undone', redone: 'Redone',
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
  const templateCanvas = el('templateCanvas');
  const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
  const templateCtx = templateCanvas.getContext('2d');
  const state = {
    lang: 'ar', template: 'cat', tool: 'brush', color: PALETTE[0][0], size: 12,
    pointer: null, lastPoint: null, history: [], historyIndex: 0,
    savedId: null, savedName: null, statusKey: 'ready', statusVars: {},
    storageMode: 'none', db: null, previewUrls: []
  };

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
    document.querySelectorAll('[data-i18n-aria]').forEach(node => {
      node.setAttribute('aria-label', t(node.dataset.i18nAria));
    });
    el('langAr').setAttribute('aria-pressed', String(lang === 'ar'));
    el('langEn').setAttribute('aria-pressed', String(lang === 'en'));
    el('toolsPanel').setAttribute('aria-label', t('tools'));
    el('colorPalette').setAttribute('aria-label', t('colors'));
    el('templatePicker').setAttribute('aria-label', t('templates'));
    renderPalette();
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
  const DRAWERS = { cat: drawCat, fish: drawFish, apple: drawApple, lion: drawLion, pencil: drawPencil, blank: () => {} };

  function renderOutline(ctx, templateId, width = W, height = H) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(width / 600, height / 400);
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#30394c';
    DRAWERS[templateId]?.(ctx);
    ctx.restore();
  }
  function chooseTemplate(id) {
    if (!DRAWERS[id] || id === state.template) return;
    if (hasPaint() && !window.confirm(t('switchQuestion'))) return;
    state.template = id;
    state.savedId = null; state.savedName = null;
    paintCtx.clearRect(0, 0, W, H);
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
  function renderPalette() {
    const parent = el('colorPalette'); parent.replaceChildren();
    for (const [color, name] of PALETTE) {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch'; swatch.type = 'button'; swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.setAttribute('aria-label', t('colorName', { color: t(name) }));
      swatch.setAttribute('aria-pressed', String(color === state.color));
      swatch.addEventListener('click', () => {
        state.color = color; state.tool = 'brush';
        renderPalette(); updateToolButtons(); message('selectedColor', { color: t(name) });
      });
      parent.append(swatch);
    }
  }
  function updateToolButtons() {
    for (const tool of ['brush', 'eraser']) {
      const button = el(tool === 'brush' ? 'brushTool' : 'eraserTool');
      button.classList.toggle('is-active', tool === state.tool);
      button.setAttribute('aria-pressed', String(tool === state.tool));
    }
  }
  function chooseTool(tool) {
    if (!['brush', 'eraser'].includes(tool)) return;
    state.tool = tool; updateToolButtons(); message('toolSelected', { tool: t(tool) });
  }

  /* A bounded snapshot history: initial state and one entry after each completed action. */
  function snapshot() { return paintCtx.getImageData(0, 0, W, H); }
  function resetHistory() { state.history = [snapshot()]; state.historyIndex = 0; updateHistoryButtons(); }
  function commitHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot());
    if (state.history.length > MAX_HISTORY) state.history.shift();
    state.historyIndex = state.history.length - 1;
    updateHistoryButtons();
  }
  function restoreHistory() {
    paintCtx.clearRect(0, 0, W, H);
    paintCtx.putImageData(state.history[state.historyIndex], 0, 0);
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
  function hasPaint() {
    const pixels = paintCtx.getImageData(0, 0, W, H).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) return true;
    return false;
  }
  function clearPaint() {
    if (state.pointer !== null || !hasPaint()) return;
    if (!window.confirm(t('clearedQuestion'))) return;
    paintCtx.clearRect(0, 0, W, H);
    commitHistory(); message('cleared');
  }
  function coords(event) {
    const r = paintCanvas.getBoundingClientRect();
    return { x: (event.clientX - r.left) * W / r.width, y: (event.clientY - r.top) * H / r.height };
  }
  function prepareTool() {
    paintCtx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
    paintCtx.lineCap = 'round'; paintCtx.lineJoin = 'round';
    paintCtx.lineWidth = state.size;
    paintCtx.strokeStyle = state.tool === 'eraser' ? '#000000' : state.color;
    paintCtx.fillStyle = paintCtx.strokeStyle;
  }
  function pointDot(point) {
    paintCtx.beginPath();
    paintCtx.arc(point.x, point.y, state.size / 2, 0, Math.PI * 2);
    paintCtx.fill();
  }
  function onPointerDown(e) {
    if (state.pointer !== null || e.isPrimary === false || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    state.pointer = e.pointerId;
    state.lastPoint = coords(e);
    try { paintCanvas.setPointerCapture(e.pointerId); } catch (_) { /* unusual input device */ }
    prepareTool(); pointDot(state.lastPoint);
    paintCtx.globalCompositeOperation = 'source-over';
  }
  function onPointerMove(e) {
    if (e.pointerId !== state.pointer) return;
    e.preventDefault();
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const points = events.length ? events : [e];
    prepareTool();
    for (const sample of points) {
      const p = coords(sample);
      paintCtx.beginPath(); paintCtx.moveTo(state.lastPoint.x, state.lastPoint.y);
      paintCtx.lineTo(p.x, p.y); paintCtx.stroke(); state.lastPoint = p;
    }
    paintCtx.globalCompositeOperation = 'source-over';
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
          const { paintBlob, ...metadata } = record;
          const dataUrl = record.paintDataUrl || await blobToDataURL(paintBlob);
          localStorage.setItem(STORAGE_PREFIX + record.id, JSON.stringify({ ...metadata, paintDataUrl: dataUrl }));
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
      const previewCanvas = document.createElement('canvas'); previewCanvas.width = 300; previewCanvas.height = 200;
      previewCanvas.getContext('2d').drawImage(composeImage(), 0, 0, 300, 200);
      const preview = previewCanvas.toDataURL('image/jpeg', .8);
      const id = state.savedId || (typeof window.crypto?.randomUUID === 'function' ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      await database.request('put', null, {
        id, name: name.slice(0, 60), template: state.template, preview, paintBlob,
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
  async function openArtwork(id) {
    try {
      const record = await database.request('get', id);
      if (!record || !DRAWERS[record.template]) throw new Error('Invalid saved artwork');
      if (hasPaint() && !window.confirm(t('switchQuestion'))) return;
      const url = record.paintBlob ? URL.createObjectURL(record.paintBlob) : record.paintDataUrl;
      let img;
      try { img = await imageFrom(url); } finally { if (record.paintBlob) URL.revokeObjectURL(url); }
      state.template = record.template; state.savedId = record.id; state.savedName = record.name;
      paintCtx.clearRect(0, 0, W, H); paintCtx.drawImage(img, 0, 0, W, H);
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
    el('brushTool').addEventListener('click', () => chooseTool('brush'));
    el('eraserTool').addEventListener('click', () => chooseTool('eraser'));
    el('brushSize').addEventListener('input', e => {
      state.size = Number(e.target.value); el('brushSizeOutput').textContent = String(state.size);
      message('sizeSelected', { size: state.size });
    });
    el('undoBtn').addEventListener('click', undo);
    el('redoBtn').addEventListener('click', redo);
    el('clearBtn').addEventListener('click', clearPaint);
    el('exportBtn').addEventListener('click', exportPNG);
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