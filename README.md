# Kids Paint | عالم التلوين

A lightweight, bilingual (Arabic / English) drawing and coloring application for children. It uses only HTML, CSS, and JavaScript. No account, backend, tracking, external images, or internet connection is required.

## Open the app

1. Keep `index.html`, `style.css`, and `drawing.js` together in the same directory.
2. Double-click `index.html` to open it in a modern browser. It also works when hosted on a static web server.
3. Choose **العربية** or **English** from the header. Arabic is the default for first-time visitors.

The runtime uses no CDN, web fonts, network calls, or build step. All coloring templates are drawn as vectors by `drawing.js`.

## Features

- Arabic and English interface with live RTL/LTR direction switching; language preference stored locally when storage is available.
- Six pages: cat, fish, apples, lion, pencil, and a blank canvas.
- Freehand brush and eraser using Pointer Events (mouse, pen/stylus, touch); stroke positions account for CSS scaling.
- Adjustable brush size, ten selectable colors, bounded Undo/Redo history (21 completed actions plus the initial state), and keyboard shortcuts: Ctrl/Cmd+Z for Undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y for Redo.
- Separate paint and outline layers: **Clear colors** and **Eraser** affect only the child's coloring, not the original illustration.
- **Export PNG** produces a downloadable 960 × 640 image containing a white background, user coloring, and the original outline.
- **Save** opens a name dialog and stores editable artwork in this browser. Saved drawings can be reopened or deleted in the gallery.
- Data is stored in IndexedDB where available. If IndexedDB is unavailable, the app tries localStorage, which has tighter capacity limits. If both are blocked, PNG export still works.
- Mobile and desktop layouts, accessible button labels and keyboard focus indicators.

## Saving vs. exporting

**Save** keeps an editable drawing inside the current browser profile. It is *not* a file download or cloud backup and can be lost if site data is cleared or private browsing ends.

**Export PNG** downloads a standard image. It is the recommended way to preserve or share the finished picture outside the app. PNG exports are flattened images, not editable multi-layer projects.

The selected template is saved alongside the user's coloring. Selecting a different template when coloring exists asks for confirmation; unsaved coloring will be discarded if confirmed. A saved drawing can be opened from the gallery.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Semantic page structure, buttons, galleries, save dialog |
| `style.css` | Responsive, touch-friendly interface |
| `drawing.js` | Templates, Canvas drawing, bilingual strings, history, IndexedDB fallback, PNG export |
| `PARENTING_KIDS_PAINT.md` | Practical instructions for parents and children |

## Privacy and limitations

- No user accounts, ads, telemetry, analytics, or automatic uploads.
- Local browser storage is not a reliable backup and may be unavailable or quota-limited; use **Export PNG** regularly.
- Drawing is single-pointer at a time; intentional multi-touch drawing is not supported.
- The eraser removes colored strokes, not the outline template.
- Saving large collections in browsers that only provide localStorage can exhaust the available space. The app will display an error if saving fails.
- Browser/OS file download behavior varies. On some mobile devices PNG may be offered in the browser's downloads or share UI.

## Manual QA checklist

1. Open `index.html` with the network disconnected; confirm the template and color palette appear.
2. Draw a line and single dot using a mouse or touch. Repeat after resizing the window.
3. Change colors and brush size; test Eraser, Undo, and Redo.
4. Clear your colors and confirm the template remains.
5. Switch Arabic/English without losing the drawing; reload and verify the selected language persists when storage is available.
6. Export PNG and open it outside the browser; confirm white background, coloring, and template.
7. Save a named drawing, reload, open it from the gallery, and delete it.

Use a browser-based test runner for automated checks; simply reading the source cannot verify real touch and download behavior.