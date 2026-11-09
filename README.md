# Kids Paint | عالم الصبغ للأطفال

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Arabic + English](https://img.shields.io/badge/Languages-Arabic%20%7C%20English-blue)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e?logo=javascript&logoColor=black)
![Offline ready](https://img.shields.io/badge/App-Offline%20Ready-purple)
![No dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen)
[![Live website](https://img.shields.io/badge/Live-GitHub%20Pages-7058d6)](https://abinadwan.github.io/kids-paint/)

A free, open-source **paint-by-tap** app for kids. Choose a color, tap **inside an enclosed shape**, and the **Paint Bucket** instantly fills that region. Freehand Brush and Eraser are also available.

**بالعربية:** اختر لونًا ثم اضغط داخل مساحة مغلقة في الرسمة لتصبغها بالكامل بضغطة واحدة. الفرشاة متوفرة للرسم الحر.

**[Try Kids Paint online](https://abinadwan.github.io/kids-paint/)**

## Features

- **Paint Bucket (default)** — fill a closed area with a single mouse click or touch. The outline blocks the paint. The bucket deliberately refuses open areas connected to the outside background.
- **14 pages** — 13 built-in line-art illustrations plus one blank Free Draw page: Cat, Fish, Apples, Lion, Pencil, Butterfly, Flower, House, Rocket, Car, Turtle, Ice Cream, Sun, and Free Draw.
- **Arabic + English** — language toggle switches RTL/LTR and saves the preference when browser storage is available.
- **Brush and Eraser** — optional smooth strokes for mouse, touch and stylus; adjustable brush size and 10 colors.
- **Undo/Redo** — undo bucket fills and brush strokes; Clear Colors preserves the original illustration.
- **Local artworks** — save, reopen and delete drawings in the browser (IndexedDB preferred, localStorage fallback).
- **Export PNG** — downloads a 960 × 640 image combining a white background, paint and the original line-art.
- **Offline and privacy-first** — no accounts, advertisements, analytics, external fonts, image CDNs, tracking, network API calls, build tools, or runtime dependencies.

## Try it

Go to **https://abinadwan.github.io/kids-paint/**. If Pages is not enabled yet, use **Settings → Pages → Deploy from branch → main → /(root)**.

To run locally, keep `index.html`, `style.css` and `drawing.js` in one directory and open `index.html` in a modern browser; no installation is required.

### How to paint with one tap

1. Select a picture under **Coloring pages / رسومات جاهزة**.
2. Choose a color and leave **Paint Bucket / دلو الصبغ** selected.
3. Tap **inside** a closed area (not on the outline). Tap again with a different color to recolor it.
4. Use Undo / Redo, Save, or Export PNG.
5. For freehand drawing, choose **Free Draw**, where Brush is automatically selected.

**Limit:** The bucket fills *bounded* regions only; it intentionally refuses the outside background and decorative regions with gaps. Choose Brush for drawing in open areas. Brush size affects Brush and Eraser, not Bucket.

## Save versus Export PNG

- **Save** keeps editable artwork in this browser profile. It does not sync or back up to the cloud; saved projects can disappear when browser data is cleared.
- **Export PNG** downloads a standard standalone picture that can be shared or kept outside the application. PNG images are flattened, not editable multi-layer projects.

## Repository files

| Path | Purpose |
| --- | --- |
| `index.html` | Accessible bilingual UI, canvas, galleries and save dialog |
| `style.css` | Responsive mobile and desktop layout |
| `drawing.js` | Built-in vector templates, Paint Bucket, brush/eraser, history, local storage, image export |
| `tests/smoke_test.py` | Chromium smoke/regression checks |
| `PARENTING_KIDS_PAINT.md` | Arabic/English parent and child instructions |
| `QA_REPORT.md` | Tests executed and known limitations |
| `LICENSE` | MIT open-source license |

## Testing

With Playwright (Python) and Chromium installed:

```bash
python tests/smoke_test.py
```

The automated environment used actual Chromium but injected the unchanged application sources into an `about:blank` document because navigation to local file/HTTP URLs was blocked. It simulated the localStorage fallback. It **does not** validate real IndexedDB persistence, physical-device touch, `file://` navigation, or live GitHub Pages deployment. See [QA_REPORT.md](QA_REPORT.md).

## Privacy, limitations, contributions

Your artwork stays in your browser unless you deliberately export/share it. No personal information is collected. Local browser storage has quotas and is not a reliable backup. This is a single-pointer application. Pixel-based flood fill at 960×640 may need further optimization on low-powered devices.

Bug reports and pull requests are welcome.

## License

Released under the [MIT License](LICENSE), © 2026 `abinadwan`. You may use, modify and distribute the code, including commercially, as long as the copyright notice and license remain included.
