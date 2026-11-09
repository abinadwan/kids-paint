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

## v4.2.1 — Bottom install UX

- Moved the installation control from the hero to the page footer to avoid covering the primary artwork.
- Replaced the centered modal with a compact, bottom-anchored dialog showing only iOS, Android or desktop instructions for the detected platform.
- Chromium/Android uses `beforeinstallprompt.prompt()` on direct user click when the browser provides it; browser confirmation is still required.
- iOS Safari cannot invoke automatic installation: use Safari Share → Add to Home Screen. The UI explicitly states this limitation.
- Tests: Chromium in-memory views at 320/390/768/1280px, native prompt mock and Android fallback; Service Worker unit cache test. Physical Safari installation and deployed Pages propagation require device verification.

## v4.3.0 — In-app update check

- Footer shows current page version; update button fetches cache-busted `version.json` with `no-store`.
- Service Worker routes release metadata to the network, not its cache. App shell gets a new cache key.
- Same version: up-to-date feedback. Offline/error: retry guidance. Different version: explicit confirmation warns about unsaved drawings before a reload.
- Update requests Service Worker revalidation but does not clear IndexedDB/localStorage. Reinstall is unnecessary.
- Added Service Worker unit coverage for version network routing and retaining non-shell caches. A physical device and deployed-site test are still required to verify installed iOS updates.

## v4.4.0 — Portrait canvas and text tool

Tested locally in Chromium at 320×740, 390×844, 428×926, and 1280×900. On portrait phones, the drawing stage measured 85% of viewport height with intrinsically portrait canvas dimensions; desktop retained 960×640. New pages start blank with the pen selected. Arabic/English text placement, size/color selection, Undo/Redo, local Save/Open, and switching to template art passed in browser emulation without JavaScript exceptions.

Cross-device persistence checks confirmed a 960×640 legacy landscape drawing opens on the phone without stretching and a new mobile portrait drawing retains its original dimensions on desktop. Physical iOS Safari, keyboard overlays and browser toolbar changes remain unverified. Text is rasterized into artwork rather than remaining a separate editable text object.


## v4.4.1 — Responsive screen scale / unintended zoom

- Applied `touch-action: pan-y` to the application surface so vertical page scrolling remains available while touch-page pinch/double-tap zoom is suppressed; drawing canvas remains `touch-action: none`.
- Prevented Safari's proprietary `gesturestart` / `gesturechange` page zoom without disabling drawing interactions. Inputs use at least 16px font size on mobile to avoid focus auto-zoom.
- Kept viewport initial scale at 1 without `maximum-scale` or `user-scalable=no`; system/browser assistive zoom remains available.
- Local Chromium simulation using the responsive layout and the same CSS/gesture rules passed at widths 320, 360, 390, 428, 768, and 1280px: no horizontal overflow; pinch simulation at 390px retained `visualViewport.scale === 1`. Physical iOS Safari verification remains pending.
