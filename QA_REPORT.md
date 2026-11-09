# Kids Paint — QA report (v4.2.0)

**Date:** 2026-11-09  
**Scope:** Emoji stickers, mobile PNG-to-Photos sharing handoff, English/Arabic documentation, PWA shell, and regression coverage for existing drawing/photo tools.

## Verified in Chromium test environment

| Test | Result | Coverage |
| --- | --- | --- |
| `tests/smoke_test.py` | PASS | Built-in coloring templates, bucket, palette, undo/redo, export, save/load mock, layout |
| `tests/user_outline_test.py` | PASS | Hand-drawn closed boundaries, fill isolation, history and artwork persistence |
| `tests/photo_stamps_test.py` | PASS | Six recolorable vector stamps, photo import, photo-safe bucket, eraser, save/load, export, mobile layout |
| `tests/emoji_gallery_test.py` | PASS | 18 emoji choices, selectable emoji/size, visible painting, undo/redo, Arabic/English, Web Share mock receiving a real PNG File, download fallback with PNG signature/960 × 640 dimensions |
| `tests/install_ui_test.py` | PASS | PWA install UI and language switching; widths 320, 390, 768, 1280; no horizontal overflow or JS exceptions |
| `tests/service_worker_unit.js` | PASS | Simulated offline shell precache, cached offline navigation, versioned assets, cache activation cleanup, scope isolation |
| README screenshot capture | PASS | Real Chromium-rendered desktop/mobile/editor images created at `docs/screenshots/` |

Code syntax checked with Node.js (`drawing.js`, `sw.js`). The tests passed locally in the available runtime. Screenshots were produced with actual UI rendering, not mockup art.

## Known limitations and unverified areas

1. **Native iPhone / Android sharing:** the test mocks `navigator.share` and `navigator.canShare`, checking file type, size, and file name. It **does not** open the physical iOS/Android share sheet or prove that a photo was inserted into a gallery. The user needs to choose **Save Image** on iOS; unsupported browsers download PNG instead. Browsers cannot write into iOS Photos automatically.
2. **Offline on an actual installed phone:** Service Worker behavior was tested in a simulated worker unit test. Real GitHub Pages deployment, device installation, offline launch, quota/eviction, and PWA upgrade behavior still need on-device confirmation.
3. **IndexedDB:** existing storage code prefers real IndexedDB; the majority of browser regression harness tests mock localStorage. Persistent storage under real Safari/PWA contexts, and switching between them, were not verified in this execution.
4. **Emoji:** Unicode emoji appearance depends on the OS font, language, emoji sequences, and device. Desktop Chromium checks only the currently available font; other platforms may render them differently.
5. **Imported images:** JPEG/PNG/WebP decoding follows browser support; HEIC/HEIF decoding is not guaranteed. The 30 MB input cap, 960 × 640 canvas size, and browser storage quotas still apply.
6. **Bucket boundaries:** only fully enclosed manually drawn pen strokes form reliable fill boundaries; freehand gaps can leak color in blank/template pages. The special photo rule prevents bucket flooding the photo background.

## Manual acceptance checklist for iPhone Safari

1. Visit `https://abinadwan.github.io/kids-paint/` and refresh after deployment.
2. Choose **Emoji**, select a symbol, tap on the illustration, change tool size and try undo/redo.
3. Use **Import a photo** from the gallery; place an emoji and a recolored vector stamp above it.
4. Choose **Save to Photos**, then choose **Save Image** in the iOS sharing sheet; verify that the result appears in Photos. If the share sheet is unavailable, locate the downloaded PNG in Files and save it to Photos manually.
5. Use **Save**, reopen the artwork, and confirm all decorative overlays are retained.
6. Use **Share → Add to Home Screen** to install; open while online and confirm offline-readiness. Enable Airplane Mode, reopen, and test drawing and PNG export.
7. Check English and Arabic `README` language links, screenshots, footer, and MIT license.

**Status:** Ready for live-device acceptance testing; no claim of physical-device or production GitHub Pages verification is made here.
