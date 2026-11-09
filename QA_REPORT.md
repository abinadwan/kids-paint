# Kids Paint — QA Report

Date: **2026-11-09**  
Scope: recognize freehand pen-drawn closed shapes as bucket-fill boundaries without regressing built-in templates, brush/spray/eraser, bilingual UI, save/export, or MIT licensing.

## Summary

The bucket now recognizes **both template outlines and user-drawn pen strokes**, so a closed hand-drawn rectangle or circle can be filled without coloring the surrounding background. A separate offscreen pen-boundary mask is synchronized with brush strokes, erasing, history and local artwork saves. Background fills still work when tapping outside. The application retains 14 pages and its existing tools.

## Verified tests

Executed in Chromium using the unchanged HTML/CSS/JavaScript inserted into an `about:blank` document by Playwright (browser environment blocks real navigation):

| Check | Result |
| --- | --- |
| `node --check drawing.js` | PASS |
| Page initializes; 14 templates; bucket selected | PASS |
| Arabic ↔ English labels and RTL/LTR | PASS |
| Paint Bucket fills a closed sample region on all 13 illustrated templates | PASS |
| Undo/Redo restores the previous/new fill state on every tested template | PASS |
| Background/outside region is filled instead of being ignored; Undo clears it | PASS |
| Tapping the same area with a new color recolors it | PASS |
| Undo/Redo correctly restores the previous/new color | PASS |
| Drawing Pen and Eraser remain usable and leave the outline untouched | PASS |
| Spray Paint produces visible scattered particles on tap and a trail on drag | PASS |
| Spray Paint Undo/Redo and Clear | PASS |
| Export downloads a valid 960×640 PNG with white background and colored artwork | PASS |
| Save, clear, reopen using mocked localStorage fallback | PASS |
| LocalStorage-fallback artwork and language persist across reloaded-equivalent documents | PASS |
| Switching to Free Draw chooses Drawing Pen automatically | PASS |
| Paint Bucket can fill the blank canvas background, and Undo reverses it | PASS |
| 320, 375, 768, 1024, 1440 px viewports; no horizontal overflow | PASS |
| Synthetic touchscreen tap paints a closed region at these viewport sizes | PASS |
| A user-drawn closed rectangle fills only inside its pen outline | PASS |
| Closed shape pen border remains visible after bucket fill | PASS |
| Hand-drawn boundary persists through Undo/Redo and recoloring | PASS |
| New saved drawing retains the pen boundary after clear/reopen (mocked localStorage) | PASS |
| Older saved drawing without mask loads safely | PASS |
| Open shape allows color to escape to background (expected) | PASS |
| Downloaded PNG includes user-created pen outline and enclosed fill | PASS |
| Uncaught browser JS exceptions during tests | NONE |

Test command:

```bash
python tests/smoke_test.py
python tests/user_outline_test.py
```

## Not tested / qualifications

- **NOT TESTED:** actual navigation to a deployed GitHub Pages URL from this test environment (administrator network restriction).
- **NOT TESTED:** opening the app directly as a `file://` resource in Chromium here (navigation restriction).
- **NOT TESTED:** real IndexedDB persistence. The automated test uses a mocked localStorage fallback.
- **NOT TESTED:** physical iPhone/Android touch input. Touchscreen input was simulated by Chromium.
- **NOT TESTED:** accessibility assessment with a screen reader.
- **LIMITATION:** only pen lines that actually close a region isolate bucket paint. Spray particles do not form boundaries. Existing saved drawings without a stored pen mask still open, but pre-upgrade pen strokes cannot be reconstructed reliably as boundaries.
- **LIMITATION:** each bucket fill is computed pixel-by-pixel in a 960×640 canvas; responsiveness of very low-powered phones should be checked manually.

## Suggested production verification

1. Open the live GitHub Pages URL and force-refresh after deployment.
2. Choose Cat, select a color, and tap inside its face; verify the face fills and outline remains. Then tap the white background and verify the background can also be colored.
3. Try Butterfly, House and Sun; then select Spray Paint, tap and drag on the picture to verify the stippled effect.
4. Draw a closed freehand circle, bucket-fill inside, then test Save → refresh → Open on iOS Safari and Android Chrome, confirming persistent IndexedDB where available.
5. Test Export PNG and open the downloaded file on iOS and desktop.
6. Switch languages mid-drawing, check RTL/LTR and that color stays intact.

This report distinguishes tests executed from tests not executed. It is not a claim of complete production certification. Spray tests ran in Chromium via simulated mouse input, not a physical stylus or spray-device integration.

## Cache busting

The production HTML uses versioned CSS/JS query parameters (`?v=3.1.0`) so browsers request the current script and stylesheet after deployment. This does not substitute for live GitHub Pages verification.
