# Licenses, Attribution & Asset Credits
# التراخيص وحقوق البرمجيات والأعمال الفنية

**Project:** Kids Paint — عالم التلوين للأطفال  
**Repository:** https://github.com/abinadwan/kids-paint  
**Last reviewed:** 2026-11-09  
**Scope:** Drawing and coloring, pigment mixing, and additive RGB light mixing.

This document groups the project license, the bundled third-party library, visual-art provenance and attribution requirements. The child-facing page footers omit legal links, but the required notices and license files remain with the code.

هذا الملف يجمع الرخص وحقوق المكتبات وأصول البنرات المرسومة. أزلنا التفاصيل القانونية من واجهة الطفل فقط، ولم نحذف حقوق مؤلفي الأكواد أو إشعاراتهم من ملفات المشروع.

---

## 1. Original project code / كود المشروع

- **License:** [MIT — LICENSE](../LICENSE)
- **Copyright:** © 2026 abinadwan
- **Applies to:** Code original to Kids Paint, including the Drawing editor, both laboratory UIs, the original additive RGB light engine, Service Worker, and project-specific styles. Individually identified third-party code retains its own license.
- **Main files:** drawing.js, pwa.js, index.html, color-lab.html, color-lab.js, light-lab.js, light-lab-core.js, and original CSS.

Under the MIT terms, copies or substantial portions distributed by others must include the original copyright and permission notice. The [complete LICENSE file](../LICENSE) is the authoritative text.

**بالعربية:** رخصة MIT تسمح باستخدام الكود وتعديله وتوزيعه وفق شروطها، ومنها الاحتفاظ بإشعار حقوق النشر ونص الرخصة عند توزيع النسخ أو أجزاء جوهرية منها.

## 2. Third-party dependency / المكتبة الخارجية

### Spectral.js version 3.0.0

| Item / البند | Value / القيمة |
| --- | --- |
| Library | [Spectral.js](https://github.com/rvanwijnen/spectral.js) |
| Copyright owner | **Ronald van Wijnen** |
| Copyright | **Copyright (c) 2025 Ronald van Wijnen** |
| License | **MIT** |
| Version | **3.0.0**, pinned and bundled |
| Original release | https://github.com/rvanwijnen/spectral.js/releases/tag/3.0.0 |
| Bundled library | [vendor/spectral.min.js](../vendor/spectral.min.js) |
| Preserved original license | [licenses/spectral-MIT.txt](../licenses/spectral-MIT.txt) |
| Notices | [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) |
| Use | **Pigment Lab only** / مختبر الأصباغ فقط |

Spectral.js approximates paint-like mixing; it is not a precise prediction of every chemical paint formulation. The library is shipped locally, not loaded from a remote CDN. Its copyright notice remains intact, and its author is not represented as officially endorsing Kids Paint.

**بالعربية:** تُستخدم المكتبة لمحاكاة مزج الأصباغ بصورة تقريبية داخل مختبر الأصباغ، مع الاحتفاظ بالرخصة الأصلية وحقوق مطورها Ronald van Wijnen. لا يعني وجود المكتبة رعاية صاحبها للتطبيق.

### World of Light RGB / عالم الضوء

The additive RGB light engine was authored for this project, using standard mathematical formulas for linear light, sRGB and OKLab. **It does not embed or adapt any additional external code library.**

محرك الضوء مكتوب للمشروع ويستند إلى معادلات علمية معروفة؛ لا يعتمد على نسخ كود مكتبة إضافية.

## 3. Approved visual assets / البنرات المعتمدة

These banner images were generated for Kids Paint, reviewed and approved for use on 2026-11-09, then converted into optimized WebP files:

| Image / الملف | Intended use / الاستخدام | Dimensions |
| --- | --- | --- |
| [kids-paint-pigment-lab.webp](../assets/kids-paint-pigment-lab.webp) | Pigment Lab banner / مختبر الأصباغ | 1600 × 533 |
| [kids-paint-light-lab.webp](../assets/kids-paint-light-lab.webp) | World of Light banner / عالم الضوء | 1600 × 533 |
| [kids-paint-platform-banner.webp](../assets/kids-paint-platform-banner.webp) | Complete-platform GitHub README banner / بانر المنصة الشامل | 1600 × 533 |

- The banners were created for this project using an image-generation tool, not taken from an identified external stock-art catalog.
- The text and graphic lettering in the raster artwork do not require distributing font files.
- The earlier Drawing homepage banner (assets/kids-paint-banner.webp) remains available and is not replaced by the README-specific banner.
- **No unsupported claim of exclusive copyright** is made for AI-generated elements where such a claim is not recognized by applicable law; relevant provider terms and local law may apply.
- WebP copies use the original 3:1 composition at web-optimized resolution.

**بالعربية:** صُممت هذه الصور للمشروع وأُقرت للاستخدام فيه. لا نزعم ملكية حصرية مؤكدة لعناصر مولّدة بالذكاء الاصطناعي إذا لم تكن الأنظمة أو الشروط المنطبقة تمنح تلك الحماية.

## 4. Distribution, legal notices and offline copies / التوزيع والحقوق دون إنترنت

The original project MIT license and the Spectral.js MIT text, copyright notice and this credit document remain in the repository. The PWA precaches relevant license and notice files along with the project artwork and application code. Removing visible footer links **does not delete or waive copyright or license obligations**.

**بالعربية:** ملف LICENSE والرخصة الأصلية للمكتبة وإشعارات حقوقها باقية في المستودع وحزمة ملفات التطبيق. إزالة الروابط من صفحة اللعب لا تعني إسقاط الحقوق.

## 5. Review checklist for future contributions / متطلبات أي إضافة جديدة

1. Identify the original author, source URL, exact version and license.
2. Check whether the asset contains bundled or transitive dependencies with separate conditions.
3. Preserve required copyright lines and full license texts in redistributed source or assets.
4. Document the source, use, license and any modification in this file and THIRD_PARTY_NOTICES.md.
5. Verify that the license permits the intended redistribution and bundling.
6. Never remove a copyright notice solely to keep the children's interface uncluttered.

**الخلاصة:** لا يُضم أي كود أو عنصر خارجي دون فحص الرخصة وتوثيق الحقوق، وتبقى التفاصيل في وثائق المستودع بدلًا من أسفل واجهة الطفل.

---

**Primary sources / المصادر الرسمية:** [Kids Paint MIT](../LICENSE) · [Spectral.js MIT](../licenses/spectral-MIT.txt) · [Third-party notices](../THIRD_PARTY_NOTICES.md).

*Project documentation, not individualized legal advice. / توثيق للمشروع وليس استشارة قانونية خاصة.*
