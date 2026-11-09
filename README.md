# Kids Paint | عالم التلوين للأطفال

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Arabic + English](https://img.shields.io/badge/Languages-Arabic%20%7C%20English-blue)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?logo=javascript&logoColor=black)
![Offline ready](https://img.shields.io/badge/App-Offline%20Ready-purple)
![No dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen)
[![Live website](https://img.shields.io/badge/Live-GitHub%20Pages-7058d6)](https://abinadwan.github.io/kids-paint/)

![Kids Paint — عالم التلوين للأطفال](assets/kids-paint-banner.webp)

*Paint, spray, and create — صبغ، ارسم، وابتكر.*

A free, open-source drawing and painting app for kids with **three creative painting tools**: **Drawing Pen** for smooth strokes, **Spray Paint** for a scattered mist effect, and **Paint Bucket** for one-tap fills inside the supplied outlines **or closed shapes you draw with the pen** (including the background). An Eraser removes paint without erasing the outlines.

**العربية:** اختر الأداة المناسبة: **القلم** للرسم، **البخاخ** لرذاذ اللون، أو **دلو الصبغ** لتعبئة مساحات الرسومات الجاهزة أو الأشكال المغلقة التي ترسمها بالقلم، وكذلك الخلفية. تعمل الممحاة على طبقة الألوان فقط.

**[Try Kids Paint online](https://abinadwan.github.io/kids-paint/)**

## New in v4.0 — photo drawing, stamps, and color shades

- **Import any gallery image supported by the browser** using **Import a photo / استيراد صورة من الاستديو**. Photos are resized to fit the 960×640 stage without cropping or stretching; drawing is on a **separate layer**, so the eraser and Clear do not change the photograph.
- **Six stamps / الأختام**: heart, star, butterfly, flower, crescent moon, and smiley face. Pick a shape, a color, and tool size; tap the drawing or imported photo to place it. Stamps support Undo/Redo, Clear, Save/Open, and PNG export.
- **Expanded colors:** 12 color families, 5 shades per family, plus a custom color picker. Pen, spray, paint bucket, and stamps use the same chosen color.
- **Photo-aware paint bucket:** fills only user-drawn closed areas on imported photos. It intentionally does **not** flood the whole photo or recolor photographic objects.
- **Local-first:** photo processing happens in your browser. Photos are not uploaded. Saved photos use resized JPEG encoding in browser storage (IndexedDB when available, localStorage fallback); larger projects may exceed localStorage quotas. Export a PNG to keep your result outside the app.
- **Limits:** files above 30 MB are rejected; HEIC/HEIF support depends on the browser's image decoder. Physical iPhone/Safari testing is still required.

## Features

- **Paint Bucket (default for templates):** tap inside an illustrated region or a **closed freehand pen outline** to fill only that area. Both built-in lines and user-drawn pen strokes act as boundaries; pen strokes remain visible. Tapping outside the outline deliberately paints the surrounding background.
- **14 coloring pages:** 13 built-in line-art pictures and one blank page for free drawing: Cat, Fish, Apples, Lion, Pencil, Butterfly, Flower, House, Rocket, Car, Turtle, Ice Cream, Sun, and Free Draw.
- **Arabic and English** with RTL/LTR layout switching and a saved language preference where storage is available.
- **Drawing Pen, Spray Paint and Eraser:** smooth pen strokes, scattered semi-transparent spray particles (tap or drag), and erasing user paint without removing the original template. Pointer Events support mouse, touch and stylus. Tool size adjusts pen, spray spread, and eraser size. There are 10 color swatches.
- **Undo/Redo** for bucket fills and strokes, and **Clear Colors** without deleting the original outline.
- **Save/Open/Delete** drawings locally in the browser (IndexedDB preferred, localStorage fallback).
- **Export PNG:** downloads a 960 × 640 image with the painted area, original template, and a white background.
- **Privacy-first:** no accounts, ads, analytics, API keys, servers, tracking, external images, fonts or runtime dependencies.
- **Fully static** and responsive on phones, tablets and desktop browsers.

## Getting started

### On the web

Open **https://abinadwan.github.io/kids-paint/**. If GitHub Pages is not yet enabled, open **Settings → Pages → Deploy from a branch → main → /(root)** in this repository.

### Locally, including offline

Keep `index.html`, `style.css`, and `drawing.js` together and open **`index.html`** in a modern browser. No installation, package manager, build command, or backend is necessary.

### How to use the Paint Bucket

1. Choose a picture from **Coloring pages** (Arabic: **رسومات جاهزة**).
2. Choose a color from the palette.
3. Select **Paint Bucket / دلو الصبغ** (selected automatically for templates).
4. Tap an area of the picture to fill it. **Or choose Free Draw, draw a fully closed shape with Drawing Pen, select the Paint Bucket, and tap inside the shape.** Only the enclosed region will fill. Tapping outside deliberately colors the background. To recolor, select another color and tap the same region again.
5. Use **Undo / Redo**, **Save**, or **Export PNG** when finished.

**Tool selection:** choose **Drawing Pen** to draw freely, **Spray Paint** to scatter pigment, **Paint Bucket** to fill a bounded region or the outer background, and **Eraser** to remove user paint. The **Free Draw** page starts with Drawing Pen. The bucket uses both built-in outlines and **freehand pen strokes** as boundaries. Ensure your pen outline is fully closed: even a small gap can let the fill reach the background. Spray particles do not form boundaries.

## Save vs. Export

- **Save** stores editable artwork in your current browser profile. It is not backed up online, does not sync to other devices, and may disappear if browser data is cleared.
- **Export PNG** downloads a standard picture to share or keep outside the app. Exported PNGs are flattened rather than editable layers.

## Branding and app icon

The approved bilingual Kids Paint banner is displayed in the website hero and this README.

| Asset | Usage |
| --- | --- |
| `assets/kids-paint-banner.webp` | Optimized approved banner for the web and README |
| `assets/app-icon.png` | Matching icon in the website header |
| `favicon.ico` | Multi-resolution browser favicon |
| `apple-touch-icon.png` | Home screen icon for iPhone / iPad |

The banner and icon ship locally with the app, so neither requires an external image service.

## Source files

| Path | Purpose |
| --- | --- |
| `index.html` | Accessible bilingual UI, approved hero banner, painting area, galleries and save dialog |
| `style.css` | Responsive styling, mobile and desktop layouts |
| `drawing.js` | Built-in outlines and freehand boundary mask, region fill, pen/spray/eraser, translations, history, local storage and export |
| `tests/smoke_test.py` | Browser smoke/regression checks using Chromium and Playwright |
| `tests/user_outline_test.py` | Regression for closed/open user pen shapes, bucket containment, Undo/Redo, export and stored pen mask |
| `PARENTING_KIDS_PAINT.md` | Parent/user instructions (Arabic and English) |
| `QA_REPORT.md` | Verified tests and remaining limitations |
| `LICENSE` | MIT open-source license |

## Tests

With Python Playwright and Chromium installed:

```bash
python tests/smoke_test.py
python tests/user_outline_test.py
```

In the constrained automated environment, the test runner injects the same HTML/CSS/JavaScript into Chromium and simulates the localStorage fallback. It is **not** a substitute for a real `file://` or deployed-site test, physical touch-device testing, or genuine IndexedDB persistence testing. See [QA_REPORT.md](QA_REPORT.md).

## Privacy and limitations

The app does not transmit artwork or data to a server. Browser storage depends on permissions and quotas. Use PNG export to preserve important pictures. The bucket recognizes both the built-in line art and **freehand pen strokes** as boundaries. Shapes must be actually closed; an open path or a small gap can cause a background fill. Older saved artwork still opens, but drawings saved before this update do not have a separate stroke-boundary mask, so pre-update pen lines cannot always be recognized as fill barriers. Save such a drawing again after redrawing the outline to enable this feature. It is designed for one active pointer at a time. Interface text is bilingual; the drawings are code-generated and have no external image licensing requirements.

## Open-source license

Released under the [MIT License](LICENSE) © 2026 `abinadwan`. MIT allows reuse, modification and redistribution, including commercial use, provided the copyright and license notice remain included. Pull requests and issues are welcome.
