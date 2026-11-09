# Kids Paint | عالم الصبغ للأطفال

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Arabic + English](https://img.shields.io/badge/Languages-Arabic%20%7C%20English-blue)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?logo=javascript&logoColor=black)
![Offline ready](https://img.shields.io/badge/App-Offline%20Ready-purple)
![No dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen)
[![Live website](https://img.shields.io/badge/Live-GitHub%20Pages-7058d6)](https://abinadwan.github.io/kids-paint/)

A free, open-source drawing and painting app for kids with **three creative painting tools**: **Drawing Pen** for smooth strokes, **Spray Paint** for a scattered mist effect, and **Paint Bucket** for one-tap region fills (including the background). An Eraser removes paint without erasing the outlines.

**العربية:** اختر الأداة المناسبة: **القلم** للرسم، **البخاخ** لرذاذ اللون، أو **دلو الصبغ** لملء المساحات بما فيها الخلفية بضغطة واحدة. تعمل الممحاة على طبقة الألوان فقط.

**[Try Kids Paint online](https://abinadwan.github.io/kids-paint/)**

## Features

- **Paint Bucket (default for templates):** tap a region to fill it instantly; dark illustration outlines stay visible. The outside white background can also be colored, fixing an earlier confusing no-op behavior.
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
4. Tap a white area of the picture to fill it. You can also tap the outside background to paint that region; outline strokes stay visible. To recolor an area, select a different color and tap it again.
5. Use **Undo / Redo**, **Save**, or **Export PNG** when finished.

**Tool selection:** choose **Drawing Pen** to draw freely, **Spray Paint** to scatter pigment, **Paint Bucket** to fill a bounded region or the outer background, and **Eraser** to remove user paint. The **Free Draw** page starts with Drawing Pen. The bucket is based on the provided outlines; incomplete decorative line segments may not form separate fill areas.

## Save vs. Export

- **Save** stores editable artwork in your current browser profile. It is not backed up online, does not sync to other devices, and may disappear if browser data is cleared.
- **Export PNG** downloads a standard picture to share or keep outside the app. Exported PNGs are flattened rather than editable layers.

## Source files

| Path | Purpose |
| --- | --- |
| `index.html` | Accessible bilingual UI, painting area, galleries and save dialog |
| `style.css` | Responsive styling, mobile and desktop layouts |
| `drawing.js` | Built-in outlines, region fill (including background), pen/spray/eraser, translations, history, local storage and export |
| `tests/smoke_test.py` | Browser smoke/regression checks using Chromium and Playwright |
| `PARENTING_KIDS_PAINT.md` | Parent/user instructions (Arabic and English) |
| `QA_REPORT.md` | Verified tests and remaining limitations |
| `LICENSE` | MIT open-source license |

## Tests

With Python Playwright and Chromium installed:

```bash
python tests/smoke_test.py
```

In the constrained automated environment, the test runner injects the same HTML/CSS/JavaScript into Chromium and simulates the localStorage fallback. It is **not** a substitute for a real `file://` or deployed-site test, physical touch-device testing, or genuine IndexedDB persistence testing. See [QA_REPORT.md](QA_REPORT.md).

## Privacy and limitations

The app does not transmit artwork or data to a server. Browser storage depends on permissions and quotas. Use PNG export to preserve important pictures. The bucket follows existing line-art boundaries and can also fill the background; it does not automatically treat freehand pen strokes as closed fill boundaries. It is designed for one active pointer at a time. Interface text is bilingual; the drawings are code-generated and have no external image licensing requirements.

## Open-source license

Released under the [MIT License](LICENSE) © 2026 `abinadwan`. MIT allows reuse, modification and redistribution, including commercial use, provided the copyright and license notice remain included. Pull requests and issues are welcome.
