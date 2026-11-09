# Kids Paint — عالم التلوين للأطفال

**[English (default)](README.md) · [العربية — اقرأ التوثيق بالعربي](README.ar.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Installable%20%26%20offline-7058d6)
![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Arabic-22a5ad)
![External runtime](https://img.shields.io/badge/External%20runtime%20requests-0-34a853)
[![Website](https://img.shields.io/badge/Live-GitHub%20Pages-238d75)](https://abinadwan.github.io/kids-paint/)

![Official Kids Paint banner — عالم التلوين للأطفال](assets/kids-paint-banner.webp)

**Paint, spray, stamp, add emoji, and create.** Kids Paint is a free, open-source, bilingual drawing and coloring web app for kids. It works in modern mobile and desktop browsers, supports adding photos from your gallery, and can be installed on a phone's home screen for offline use after the first successful app-shell download.

**Live app:** https://abinadwan.github.io/kids-paint/

## Screenshots

Actual screenshots of the web interface captured in Chromium (not physical iPhone screenshots):

| Desktop | Emoji editor |
| --- | --- |
| ![Kids Paint desktop interface](docs/screenshots/desktop.webp) | ![Emoji tool and drawing canvas](docs/screenshots/emoji-editor.webp) |

**Mobile interface**

<img src="docs/screenshots/mobile.webp" alt="Kids Paint Arabic mobile interface with the emoji picker" width="390">



## New in v4.6.0 — Color Lab Phase 2B

The [Color Lab](color-lab.html) has **five paint tubes**: red, yellow, blue, white and black. Mix all **three colored pigments**, add white to make lighter shades or black for darker shades, with up to **18 drops** per cup.

- **12 untimed challenges in three levels:** Four existing Phase 2A targets are unchanged; eight new achievable recipes cover pastel tones, dark shades and more complex three-color blends. Scoring still uses perceptual OKLab distance, with up to three stars and unlimited retries.
- **Learning as you play:** Bilingual hints explain how white, black and the proportions of three pigments affect the result.
- **Expanded color notebook:** Save up to **48 distinct recipes**, see HEX and drop counts, restore saved mixes with **Try**, and remove only selected recipes using **Delete** and confirmation.
- **No lost progress:** Historical notebook data (kids-paint-lab-colors-v1) and challenge stars (kids-paint-lab-progress-v1) use the existing storage keys. Up to 36 stars across all challenges; old stars are not reduced by later attempts.
- **Offline:** Updated PWA cache includes the Phase 2B interface and locally vendored pigment engine. Both Arabic and English interfaces remain supported.

**Important:** Spectral.js 3.0.0 approximates pigment mixing rather than predicting every real physical paint. White/black mixing and challenge star thresholds are educational approximations.

**Copyright:** Third-party Spectral.js is MIT © 2025 Ronald van Wijnen. Its unmodified license is in [licenses/spectral-MIT.txt](licenses/spectral-MIT.txt), with source/attribution in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No new external library was added in 2B.
## New in v4.5.0 — Color Lab / Phase 2A

The new **[Color Lab](color-lab.html)** is a separate, bilingual, mobile-friendly page connected to the drawing editor. Its first release combines **free pigment-mixing** with **four educational challenges**, with no timer, attempt limit or penalty.

- **Mix pigments:** tap the red, yellow or blue paint tubes to add drops to an animated cup. Start with up to **two pigment types** and **12 drops total**, and undo the last drop or empty the cup. Changing the proportions changes the resulting shade.
- **Realistic-looking approximation:** the mixer uses an offline, pinned copy of **Spectral.js 3.0.0**, a Kubelka–Munk-inspired approximation of paint mixing, rather than averaging RGB numbers. Colors shown on a screen are not guaranteed to match real paint formulas.
- **Challenges:** create **green, orange, purple and yellow-dominant light green** using the same mixer as free play. Targets are generated from achievable recipes. Judge closeness using perceptual **OKLab** distance and award up to three stars; players can retry indefinitely. Pilot thresholds may need tuning with children.
- **Hints and learning:** short explanations after mixing; challenge hints guide the child toward ingredients and proportions.
- **Color notebook:** save up to **24 mixtures** with their drop recipes to this device using localStorage, and restore any recipe later. Best star results are also stored locally. No account, backend or image upload.
- **Use in drawing:** after mixing, tap **Use in drawing** to return to the existing coloring page with the new color selected for the brush and other color tools.
- **Offline:** the PWA Service Worker precaches the lab HTML/CSS/JS and local pigment-mixing library. Each page has an independent offline navigation entry.

**Open-source rights:** Spectral.js is © 2025 **Ronald van Wijnen**, MIT license. The exact 3.0.0 source and original license are retained at [vendor/spectral.min.js](vendor/spectral.min.js) and [licenses/spectral-MIT.txt](licenses/spectral-MIT.txt). Full attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The game code remains under Kids Paint's existing MIT license.

**Scope:** Phase 2A intentionally excludes white/black tinting, three-color recipes and the future RGB light lab; those are planned for later stages.

## New in v4.4.0 — immersive portrait editor and text

- **85% mobile portrait canvas:** on a new page in phone portrait mode (screen width up to 760px), the drawing stage fills 85% of the viewport height. It uses a genuine portrait-resolution bitmap, not a stretched 960×640 landscape image. New desktop pages remain 960×640.
- **Blank start:** the application now opens on Free Draw with the Drawing Pen already active. All 13 outlined coloring templates remain available.
- **Text tool (T):** select Text, enter up to 120 characters across up to three lines, select a color and tool size, then tap the exact location on the canvas or imported image where the text should appear. Use Undo to remove or reposition it. Text is included in Save, Open, Undo/Redo, Export PNG and Save to Photos.
- **Preserved document dimensions:** the stored artwork includes its original width and height. A legacy 960×640 landscape save will still open in landscape on a phone, and a portrait mobile save will preserve its portrait proportions on a desktop.
- **Mobile memory:** portrait drawing history stores up to 16 states; desktop stores up to 22. Screen orientation changes during a drawing can change the displayed size without changing the saved document dimensions.

## What's new in v4.2

- **Emoji stickers:** 18 native emoji (faces, hearts, rainbow, butterfly, animals, flowers, rocket, ball, food, celebration). Choose **Emoji**, select a symbol and set its size, then tap the canvas or imported picture. Emoji retain their native multicolor appearance, unlike the color-customizable vector stamps. Undo/redo, clear, local save, and PNG export all include emoji.
- **Save to Photos / gallery handoff:** a new **Save to Photos** button prepares a PNG and opens the native **Share** sheet when file sharing is available. **On iPhone, select “Save Image” from the share sheet** to place the image in Photos; a website cannot silently add photos to the library. On Android, choose a supported Photos/gallery app or save destination. If sharing files is unavailable, the app **downloads the PNG**; open the downloaded file and save/share it into Photos manually. This is separate from the editable **Save** button.
- **Documentation:** expanded English README, separate linked Arabic translation, and screenshots.
- **Offline cache bump:** updates the PWA app shell to version `v4.2.0` so installed users receive the new tools and styles once they reconnect.

## Features

| Feature | Details |
| --- | --- |
| Drawing pen | Smooth pointer drawing with adjustable size; closed shapes can become paint-bucket boundaries |
| Spray paint | Semi-transparent scattered dots, touch or drag |
| Paint bucket | Fills areas in 13 provided line-art pictures, closed hand-drawn shapes, and optionally the outside background of ordinary templates; won't flood imported photos |
| Eraser | Removes user-applied paint, marks, stamps, and emoji without erasing an imported photo or original template |
| Vector stamps | Six recolorable shapes: heart, star, butterfly, flower, crescent moon, smiley face |
| Emoji tool | 18 OS-rendered emoji stickers placed at adjustable size; their intrinsic colors are not changed by the palette |
| Text tool | Enter Arabic or English text, select size/color and tap the exact placement on the canvas or imported photo |
| Colors | 12 color families, five shades per family, plus a custom color input (for pen/spray/bucket/vector stamps) |
| Gallery photo import | Import a browser-supported image (e.g. JPG, PNG, WebP) from your device, draw or place emoji/stamps over it; file size limit 30 MB |
| Picture templates | 13 built-in vector illustrations plus one blank canvas (14 choices total) |
| Undo / Redo | Up to 16 drawing states for portrait mobile work and 22 on desktop, including text and stamps |
| Save / Open / Delete | Editable drawings saved locally in IndexedDB, with localStorage fallback; not synced or cloud-backed |
| Export PNG | Download a flat image at the artwork's native dimensions; new mobile portrait drawings are tall, desktop and legacy drawings can be 960×640 |
| Save to Photos | Native file Share sheet where supported; otherwise download and manually save the PNG to your gallery |
| Language | Arabic and English, including RTL/LTR switch and retained preference when storage is available |
| PWA | Installable app shell, icons, manifest, offline cache of essential static assets, standalone display |
| Color Lab | Five pigments, 12 untimed challenges, up to 36 stars, saved recipes and color handoff to Drawing |

## Get started

Open [the live website](https://abinadwan.github.io/kids-paint/). Choose an illustration or **Free Draw**, select a tool and size, and start creating. You can choose a color family, then a shade, or use **Custom color**. The **Emoji** tool uses the symbol's built-in colors.

To import a photo, select **Import a photo**, pick an image from the phone's gallery/files, and use the pen, spray, stamps, or emoji on top. Your original photo stays on a separate non-destructive background layer. It is resized to fit a fixed 960 × 640 canvas without cropping; letterboxing may appear for different aspect ratios. Large files over 30 MB are refused; HEIC/HEIF support depends on the browser.

**Bucket caution:** on an imported photo, fill is restricted to **closed pen-drawn regions** to prevent painting over the entire photograph. On templates or the blank page, tapping outside a closed boundary may color the outer background. Emoji and spray dots are not intended to form fill boundaries.

## Install as a mobile app and use offline

**iPhone (Safari):** tap the **Install app** button at the **bottom of the Kids Paint page**. A compact guide slides up from the **bottom of the screen** and shows only iPhone steps. Safari cannot allow the website to install itself automatically: use **Page Menu → Share → Add to Home Screen → Open as Web App → Add**. Launch it once while online. Installed app storage may be separate from Safari; export important artwork before switching profiles or clearing browser data.

**Android (Chrome):** scroll to the **Install app** button at the bottom of the page. When Chrome supplies the native install event, tapping it opens Android's **official install confirmation** immediately; accept to install. If Chrome does not offer the event, a small bottom sheet displays the browser-menu fallback (**⋮ → Install app / Add to Home Screen**). Open the installed app once while connected. The button disappears in installed standalone mode.

The Service Worker caches the HTML, CSS, JavaScript, banner, manifest, and icons inside the `/kids-paint/` GitHub Pages scope; after the initial cache succeeds, the drawing editor can launch offline. **Your saved drawings are stored in browser storage, not in the Service Worker cache or GitHub.** Browser storage can be deleted or evicted, so export important artwork to PNG. Updates load when online; an installed device may need a restart/reload after an update.

## Save, export, and Photos — what's the difference?

- **Save:** keeps an *editable project* on this device and inside this particular browser/app storage profile. Photos included in projects may be re-encoded/resized for storage. The app does not create an online account or upload artwork.
- **Export PNG:** downloads a finished *flat image*. Where the file goes depends on your browser/OS (often **Downloads** or **Files**).
- **Save to Photos:** when the browser supports sharing files, opens the system share sheet; **you must choose Save Image / Photos yourself**. Otherwise PNG download is used and you can move the file to Photos manually. No browser API guarantees direct, automatic insertion into iOS Photos.

## Privacy, accessibility, and limitations

- **Local-first:** no backend, accounts, advertising, analytics, user-upload endpoint, runtime CDN scripts, or cloud synchronization. Imported images are handled on-device; artwork is not transmitted to a server by the app. Choosing an external share destination is an explicit user action.
- **Accessibility:** descriptive labels, pressed-state feedback, large touch targets, keyboard-focus styling, and Arabic RTL/English LTR UI. Painting is primarily a pointer/touch interaction.
- **Storage:** IndexedDB is preferred; localStorage fallback may run out of space. Separate Safari/PWA browser profiles might not share artwork. Deleted browser data can delete saved projects.
- **Emoji appearance:** depends on the OS and installed fonts; not all platforms render emoji identically. Color selection applies to vector stamps, not native emoji glyphs.
- **Drawing limits:** canvas is 960 × 640; bucket fill needs properly closed pen lines; photos are fitted into this fixed frame. Hardware-device support and actual iOS share-sheet/gallery behavior should be verified on a real phone.

## Files

| File / folder | Role |
| --- | --- |
| `index.html` | Bilingual layout, tool buttons, file input, art canvas, gallery and installation guidance |
| `style.css` | Responsive layout, drawing tools, emoji panel, buttons, footer |
| `drawing.js` | All drawing, stamps/emoji, share/export, image import, translations and local data |
| `pwa.js` | Native installation prompt, device-specific instructions and safe update checks |
| `sw.js` | Offline Service Worker, versioned shell and network-only version checks
| `version.json` | Latest published version used by the update button |
| `color-lab.html`, `color-lab.css`, `color-lab.js`, `color-lab-core.js` | The new Color Lab page, interactive experience, and testable common mixing logic |
| `vendor/spectral.min.js`, `licenses/spectral-MIT.txt`, `THIRD_PARTY_NOTICES.md` | Pinned open-source pigment engine and preserved copyright notices |
| `manifest.webmanifest` | App name, scope, display mode, icon references |
| `assets/` | Approved banner, website/app icons, PWA icons |
| `docs/screenshots/` | Browser screenshots for this README |
| `README.ar.md` | Full Arabic documentation |
| `PARENTING_KIDS_PAINT.md` | Parent-facing guide |
| `QA_REPORT.md` | Test coverage and limitations |
| `tests/` | Chromium/Playwright and Service Worker regression tests |
| `LICENSE` | MIT open-source license |

## Local development and tests

No build system, Node package installation, framework, external API, or backend is needed to run the app. Serve this folder via a local HTTPS-enabled/static server to test PWA installation (Service Workers require a secure context; `localhost` is normally treated as secure). For a basic non-PWA preview, open `index.html` directly in a browser. A `file://` page will generally not register its Service Worker.

Regression tests (when Python, Playwright, Pillow, Chromium, and Node.js are available):

```bash
python tests/smoke_test.py
python tests/user_outline_test.py
python tests/photo_stamps_test.py
python tests/emoji_gallery_test.py
python tests/install_ui_test.py
python tests/portrait_text_test.py
python tests/mobile_zoom_test.py
node tests/color_lab_unit.js
python tests/color_lab_browser_test.py
node tests/service_worker_unit.js
```

Some tests use an in-memory browser page and mocked localStorage; they do **not** prove device-specific iOS photo-library behavior. See [QA_REPORT.md](QA_REPORT.md).

## License and contribution

Copyright © 2026 **abinadwan**. Licensed under the [MIT License](LICENSE), which permits use, modification, and distribution (including commercially) provided the license and copyright notice are retained. See the [GitHub repository](https://github.com/abinadwan/kids-paint) for source, issues, and contributions.

**[Read the complete Arabic README →](README.ar.md)**

### Install UX update (v4.2.1)

The install action was moved out of the top hero into the footer, and device-specific help now opens as a compact **bottom sheet** rather than a centered dialog. iOS requires manual Share → Add to Home Screen; the browser does not expose a one-tap installation API. Android/Chromium can use the native install confirmation when offered. Service Worker shell cache updated to `v4.2.1` to refresh these changes.

## In-app updates (v4.3.0)

At the bottom of Kids Paint you will see the **current version** (e.g. `4.3.0`) and an **Update app** button. While online, tap the button to fetch the published `version.json` directly from the network (bypassing offline caches). If the server reports a different version, the app **asks before reloading**: save any unfinished artwork or export PNG first, as a reload loses unsaved edits. Once confirmed, it requests a new Service Worker and reloads. You do **not** need to reinstall the home-screen app. Saved artwork is not deliberately deleted.

When offline, checking cannot work; reconnect and retry. Publication to GitHub Pages may lag behind commits. Browser storage (IndexedDB/localStorage) is separate from the offline app-shell cache and can still be lost if site data is cleared or evicted.

**Future release checklist:** bump the HTML `meta[name="app-version"]` and visible footer version, update versioned CSS/JS URLs in `index.html` and the Service Worker precache, bump `CACHE_NAME` in `sw.js`, and **publish `version.json` last** after all other assets. Never clear artwork storage as part of an app update.


## Mobile layout / accidental zoom protection (v4.4.1)

The interface uses a responsive width rather than fixed pixel widths on phones. The portrait drawing canvas remains 85% of the viewport height when creating a new portrait mobile picture. Touch gestures within the app scroll vertically without unintended page pinch/double-tap zoom; the painting surface itself captures brush gestures. Mobile inputs use a minimum 16px font size to avoid Safari's automatic focus zoom. The viewport still allows browser/OS accessibility zoom: the site does **not** set `user-scalable=no`. These changes affect layout and gestures only, not saved artwork or the canvas dimensions.
