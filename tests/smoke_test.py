"""Chromium smoke test for the real Kids Paint HTML/CSS/JS source.

Uses about:blank + injected unchanged sources and a mocked localStorage fallback
because this environment blocks both file:// and localhost navigations.
This does NOT verify actual IndexedDB, GitHub Pages, or physical device behavior.
Run: python tests/smoke_test.py
"""
from pathlib import Path
import re
from tempfile import TemporaryDirectory
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


def load_app(page, stored=None):
    html = (ROOT / 'index.html').read_text('utf-8')
    html = re.sub(r'<link[^>]+href="style\.css(?:\?[^"]*)?"[^>]*>', '', html)
    html = re.sub(r'<script src="drawing\.js(?:\?[^"]*)?" defer></script>', '', html)
    page.set_content(html)
    page.add_style_tag(content=(ROOT / 'style.css').read_text('utf-8'))
    page.evaluate('''seed => {
        const store = new Map(Object.entries(seed));
        Object.defineProperty(window, 'indexedDB', { configurable:true, value:undefined });
        Object.defineProperty(window, 'localStorage', { configurable:true, value: {
            get length() { return store.size; },
            key(n) { return [...store.keys()][n] ?? null; },
            getItem(k) { return store.has(k) ? store.get(k) : null; },
            setItem(k,v) { store.set(String(k), String(v)); },
            removeItem(k) { store.delete(String(k)); }
        }});
        window.__dumpStorage = () => Object.fromEntries(store);
    }''', stored or {})
    page.add_script_tag(content=(ROOT / 'drawing.js').read_text('utf-8'))
    page.wait_for_selector('.template-item')
    page.wait_for_function("document.querySelector('#status').textContent.length > 0")


def alpha_count(page, canvas_id='paintCanvas'):
    return page.evaluate('''id => {
      const c = document.getElementById(id);
      const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let n=0; for(let i=3;i<data.length;i+=4) if(data[i] > 0) n++; return n;
    }''', canvas_id)


def tap_at(page, logical_x, logical_y, touch=False):
    canvas = page.locator('#paintCanvas')
    canvas.scroll_into_view_if_needed()
    rect = canvas.bounding_box()
    x = rect['x'] + rect['width'] * logical_x/600
    y = rect['y'] + rect['height'] * logical_y/400
    if touch: page.touchscreen.tap(x,y)
    else: page.mouse.click(x,y)


def draw_with_mouse(page):
    canvas = page.locator('#paintCanvas')
    canvas.scroll_into_view_if_needed()
    rect = canvas.bounding_box()
    x, y = rect['x'] + .55 * rect['width'], rect['y'] + .54 * rect['height']
    page.mouse.move(x,y); page.mouse.down()
    page.mouse.move(x+rect['width']*.09,y+rect['height']*.07,steps=9)
    page.mouse.up()


def pixel(page, x, y):
    return page.evaluate('''xy => {
       const ctx = document.getElementById('paintCanvas').getContext('2d');
       return [...ctx.getImageData(xy[0],xy[1],1,1).data];
    }''', [x,y])


def run():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        context = browser.new_context(accept_downloads=True, viewport={'width':1280,'height':900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('dialog', lambda dialog: dialog.accept())
        load_app(page)
        assert page.locator('.template-item').count() == 14
        assert page.locator('#brushTool').get_attribute('aria-pressed') == 'true'
        assert page.locator('.template-item').first.get_attribute('aria-pressed') == 'true'
        assert alpha_count(page) == 0
        print('PASS: blank landing page, 14 templates, pen selected')

        page.locator('#langEn').click()
        assert page.locator('html').get_attribute('dir') == 'ltr'
        assert 'Paint bucket' in page.locator('#bucketTool').inner_text()
        assert 'Spray paint' in page.locator('#sprayTool').inner_text()
        page.locator('#langAr').click()
        assert page.locator('html').get_attribute('dir') == 'rtl'
        page.locator('#langEn').click()
        print('PASS: Arabic/English RTL/LTR, translated bucket')

        shapes = [('cat',300,180),('fish',300,200),('apple',180,200),('lion',300,210),
                  ('pencil',290,175),('butterfly',204,126),('flower',300,166),
                  ('house',298,228),('rocket',300,230),('car',300,228),('turtle',293,204),
                  ('icecream',298,156),('sun',300,193)]
        for i,(shape,x,y) in enumerate(shapes):
            page.locator('.template-item').nth(i+1).click()
            assert page.locator('#bucketTool').get_attribute('aria-pressed') == 'true', shape
            assert alpha_count(page) == 0, f'{shape}: starts blank'
            tap_at(page,x,y)
            painted = alpha_count(page)
            assert painted > 200, f'{shape}: fill failed'
            assert 'filled' in page.locator('#status').inner_text().lower(), shape
            page.locator('#undoBtn').click()
            assert alpha_count(page) == 0, f'{shape}: undo failed'
            page.locator('#redoBtn').click()
            assert alpha_count(page) == painted, f'{shape}: redo failed'
        print('PASS: region fill + Undo/Redo for all 13 illustrated templates')

        page.locator('.template-item').nth(1).click()
        tap_at(page,10,10)
        background_pixels = alpha_count(page)
        assert background_pixels > 1000, 'background must fill rather than silently fail'
        assert 'background' in page.locator('#status').inner_text().lower()
        page.locator('#undoBtn').click()
        assert alpha_count(page) == 0
        print('PASS: background/external area paints, Undo restores white background')

        tap_at(page,300,180)
        painted = alpha_count(page)
        assert painted > 200
        red = pixel(page,480,288)
        page.locator('.color-swatch').nth(5).click()
        assert page.locator('#bucketTool').get_attribute('aria-pressed') == 'true'
        tap_at(page,300,180)
        blue = pixel(page,480,288)
        assert blue[:3] == [79,152,236] and blue != red, (blue,red)
        page.locator('#undoBtn').click()
        assert pixel(page,480,288) == red
        page.locator('#redoBtn').click()
        assert pixel(page,480,288) == blue
        print('PASS: recolor same area, Undo/Redo restores colors')

        outline_before = alpha_count(page,'templateCanvas')
        page.locator('#eraserTool').click()
        page.locator('#paintCanvas').scroll_into_view_if_needed()
        rect = page.locator('#paintCanvas').bounding_box()
        page.mouse.move(rect['x']+rect['width']*.5,rect['y']+rect['height']*.45)
        page.mouse.down(); page.mouse.move(rect['x']+rect['width']*.51,rect['y']+rect['height']*.455,steps=3); page.mouse.up()
        assert alpha_count(page) < painted
        assert alpha_count(page,'templateCanvas') == outline_before
        page.locator('#brushTool').click(); draw_with_mouse(page)
        assert alpha_count(page) > 0
        print('PASS: eraser preserves outline, optional brush strokes')

        with TemporaryDirectory() as folder:
            with page.expect_download(timeout=8000) as pending:
                page.locator('#exportBtn').click()
            result = pending.value
            target = Path(folder) / result.suggested_filename
            result.save_as(target)
            assert target.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n'
            img = Image.open(target)
            assert img.size == (960,640)
            assert img.getpixel((10,10))[:3] == (255,255,255)
            assert img.getpixel((520,288))[:3] != (255,255,255)
        print('PASS: downloaded PNG has correct signature/dimensions and composited colors')

        page.locator('#saveBtn').click()
        page.locator('#artworkName').fill('Painted cat')
        page.locator('#saveForm button[type=submit]').click()
        page.wait_for_selector('.saved-card')
        assert page.locator('.saved-card').count() == 1
        page.locator('#clearBtn').click()
        assert alpha_count(page) == 0
        assert alpha_count(page,'templateCanvas') == outline_before
        page.locator('.saved-card-actions button').first.click()
        page.wait_for_function("document.querySelector('#status').textContent.includes('opened')")
        assert alpha_count(page)>0
        print('PASS: local save, clear, reopen, outline retained')

        stored = page.evaluate('window.__dumpStorage()')
        fresh = context.new_page()
        fresh.on('pageerror',lambda err:errors.append(str(err)))
        fresh.on('dialog',lambda d:d.accept())
        load_app(fresh, stored)
        assert fresh.locator('html').get_attribute('dir') == 'ltr'
        assert fresh.locator('.saved-card').count() == 1
        fresh.locator('.saved-card-actions .delete').click()
        fresh.wait_for_selector('.empty-gallery')
        assert fresh.locator('.saved-card').count() == 0
        print('PASS: language and saved art persist across document loads (mocked localStorage)')

        # Run the spray/free-draw scenario on a clean page to avoid carrying
        # gallery thumbnails and multiple full-size image histories from earlier cases.
        page.close(); fresh.close()
        page = context.new_page()
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('dialog', lambda dialog: dialog.accept())
        load_app(page)
        page.locator('.template-item').first.click()
        assert page.locator('#brushTool').get_attribute('aria-pressed') == 'true'
        page.locator('#bucketTool').click()
        tap_at(page,10,10)
        assert alpha_count(page) > 100000
        page.locator('#undoBtn').click()
        assert alpha_count(page) == 0
        page.locator('#brushTool').click()
        draw_with_mouse(page)
        assert alpha_count(page) > 0
        page.locator('#clearBtn').click()
        assert alpha_count(page) == 0
        page.locator('#sprayTool').click()
        assert page.locator('#sprayTool').get_attribute('aria-pressed') == 'true'
        tap_at(page,300,200)
        dots = alpha_count(page)
        assert dots > 10, 'one spray tap should add visible particles'
        page.locator('#undoBtn').click()
        assert alpha_count(page) == 0
        page.locator('#redoBtn').click()
        assert alpha_count(page) == dots
        page.locator('#clearBtn').click()
        assert alpha_count(page) == 0
        draw_with_mouse(page)
        assert alpha_count(page) > dots, 'dragging the spray should distribute pigment along the path'
        print('PASS: blank canvas bucket/background, pen, spray tap + drag, Undo/Redo, Clear')

        for width in [320,375,768,1024,1440]:
            mobile_context=browser.new_context(viewport={'width':width,'height':800}, has_touch=True, is_mobile=width<=375)
            mobile=mobile_context.new_page()
            mobile.on('pageerror',lambda err:errors.append(str(err)))
            load_app(mobile)
            assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), f'overflow at {width}px'
            tap_at(mobile,300,180,touch=True)
            assert alpha_count(mobile)>0, f'touch fill at {width}px'
            mobile_context.close()
        print('PASS: 320/375/768/1024/1440 viewport layouts, synthetic touchscreen fills')
        assert not errors, f'Uncaught browser exceptions: {errors}'
        print('PASS: zero uncaught JS exceptions')
        browser.close()


if __name__ == '__main__':
    run()
