/* Kids Paint Color Lab — pure pigment-mixing helpers.
 * Spectral.js v3.0.0 is vendored separately with its original MIT notice.
 * Functions are isolated from DOM so the same mixing logic drives free play and challenges.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KidsColorLabCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const pigments = Object.freeze({
    red: Object.freeze({ hex: '#E53166', ar: 'أحمر', en: 'Red' }),
    yellow: Object.freeze({ hex: '#FCF046', ar: 'أصفر', en: 'Yellow' }),
    blue: Object.freeze({ hex: '#3375DA', ar: 'أزرق', en: 'Blue' })
  });
  const MAX_DROPS = 12;
  const MAX_PIGMENTS = 2;
  const challenges = Object.freeze([
    { id: 'green', ar: 'اصنع الأخضر', en: 'Make green', recipe: { yellow: 2, blue: 2 }, tipAr: 'الأصفر والأزرق يصنعان أخضر.', tipEn: 'Yellow and blue make green.' },
    { id: 'orange', ar: 'اصنع البرتقالي', en: 'Make orange', recipe: { red: 2, yellow: 3 }, tipAr: 'جرّب تغيير كمية الأصفر.', tipEn: 'Try adjusting the yellow.' },
    { id: 'purple', ar: 'اصنع البنفسجي', en: 'Make purple', recipe: { red: 2, blue: 3 }, tipAr: 'الأحمر مع الأزرق يعطي درجات بنفسجية.', tipEn: 'Red with blue creates purple tones.' },
    { id: 'lime', ar: 'اصنع الأخضر الفاتح', en: 'Make light green', recipe: { yellow: 4, blue: 1 }, tipAr: 'زيادة الأصفر تُغيّر درجة الأخضر.', tipEn: 'More yellow changes the green shade.' }
  ]);

  function tidyDrops(input) {
    const cleaned = {};
    for (const name of Object.keys(pigments)) {
      const count = Number(input && input[name] || 0);
      if (!Number.isInteger(count) || count < 0 || count > MAX_DROPS) {
        throw new RangeError('Invalid drop count: ' + name);
      }
      if (count) cleaned[name] = count;
    }
    if (Object.keys(cleaned).length > MAX_PIGMENTS || totalDrops(cleaned) > MAX_DROPS) {
      throw new RangeError('Too many pigments or drops for this lab stage');
    }
    return cleaned;
  }
  function totalDrops(drops) { return Object.values(drops).reduce((sum, n) => sum + n, 0); }
  function mayAdd(drops, name) {
    if (!(name in pigments)) return false;
    const current = tidyDrops(drops);
    return totalDrops(current) < MAX_DROPS &&
      (current[name] || Object.keys(current).length < MAX_PIGMENTS);
  }
  function addDrop(drops, name) {
    if (!mayAdd(drops, name)) return null;
    const result = tidyDrops(drops);
    result[name] = (result[name] || 0) + 1;
    return result;
  }
  function mix(drops, spectralEngine) {
    const amounts = tidyDrops(drops);
    const entries = Object.entries(amounts);
    if (!entries.length) return null;
    if (!spectralEngine || !spectralEngine.Color || !spectralEngine.mix) {
      throw new Error('Spectral.js pigment mixer is unavailable');
    }
    const parts = entries.map(([name, count]) => [new spectralEngine.Color(pigments[name].hex), count]);
    const color = spectralEngine.mix(...parts);
    const hex = color.toString().toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(hex)) throw new Error('Unexpected pigment-mixing result');
    return { hex, color, counts: amounts, drops: totalDrops(amounts) };
  }
  function compare(result, target) {
    if (!result || !target) return { distance: Infinity, stars: 0 };
    const a = result.color.OKLab;
    const b = target.color.OKLab;
    const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    // Pilot thresholds in OKLab; 3 stars is possible with the exact recipe.
    const stars = distance <= 0.025 ? 3 : distance <= 0.065 ? 2 : distance <= 0.13 ? 1 : 0;
    return { distance, stars };
  }
  function challengeById(id) { return challenges.find(item => item.id === id) || null; }
  function getHint(drops, challenge, lang) {
    if (!challenge) return '';
    const recipe = challenge.recipe;
    const used = tidyDrops(drops);
    const label = key => pigments[key][lang === 'en' ? 'en' : 'ar'];
    const wrong = Object.keys(used).find(name => !recipe[name]);
    if (wrong) return lang === 'en' ? 'Try a different color instead of ' + label(wrong) + '.'
      : 'جرّب لونًا مختلفًا بدل ' + label(wrong) + '.';
    const missing = Object.keys(recipe).find(name => !used[name]);
    if (missing) return lang === 'en' ? 'Try adding ' + label(missing) + '.' : 'جرّب إضافة ' + label(missing) + '.';
    const names = Object.keys(recipe);
    const relativeA = used[names[0]] / totalDrops(used);
    const relativeGoal = recipe[names[0]] / totalDrops(recipe);
    const add = relativeA < relativeGoal ? names[0] : names[1];
    return lang === 'en' ? 'Try one more drop of ' + label(add) + '.'
      : 'جرّب إضافة قطرة من ' + label(add) + '.';
  }
  return Object.freeze({ pigments, MAX_DROPS, MAX_PIGMENTS, challenges, tidyDrops, totalDrops, mayAdd, addDrop, mix, compare, challengeById, getHint });
});
