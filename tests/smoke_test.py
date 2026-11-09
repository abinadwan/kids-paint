"""Kids Paint automated Chromium smoke tests.

Run: python tests/smoke_test.py (requires Python Playwright and Chromium).

The test environment prevents Chromium from navigating to file:// and http://
URLs. To test actual app code, it injects unchanged CSS and JS after placing
index.html into an about:blank document, and simulates localStorage. This
verifies drawing and UI behavior but is NOT a direct-open/file:// validation,
not a genuine IndexedDB validation, and not a physical touch-device test.
"""
from pathlib import Path
import re
from tempfile import TemporaryDirectory
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def load_app(page, stored=None):
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    html = re.sub(r'<link[^>]+href="style.css"[^>]*>', '', html)
    html = html.replace('<script src="drawing.js" defer></script>', '')
    page.set_content(html)
    page.add_style_tag(content=(ROOT / 'style.css').read_text(encoding='utf-8'))
    # about:blank has no usable native storage; mock the fallback store.
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
    page.add_script_tag(content=(ROOT / 'drawing.js').read_text(encoding='utf-8'))
    page.wait_for_selector('.template-item')
    page.wait_for_function("document.querySelector('#status').textContent.length > 0")


def alpha_count(page, canvas_id='paintCanvas'):
    return page.evaluate('''id => {
      const c = document.getElementById(id);
      const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let n=0; for(let i=3;i<data.length;i+=4) if(data[i] > 0) n++; return n;
    }''', canvas_id)


def draw_with_mouse(page):
    rect = page.locator('#paintCanvas').bounding_box()
    x, y = rect['x'] + .55 * rect['width'], rect['y'] + .54 * rect['height']
    page.mouse.move(x,y)
    page.mouse.down()
    page.mouse.move(x+rect['width']*.09,y+rect['height']*.07,steps=9)
    page.mouse.up()


def run():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        context = browser.new_context(accept_downloads=True, viewport={'width':1280,'height':900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        load_app(page)
        assert page.title().startswith('عالم التلوين')
        assert page.locator('.template-item').count() == 6
        assert alpha_count(page) == 0
        assert alpha_count(page, 'templateCanvas') > 500
        print('PASS: initialization and 6 original built-in templates')

        page.locator('#langEn').click()
        assert page.locator('html').get_attribute('dir') == 'ltr'
        assert 'Export PNG' in page.locator('#exportBtn').inner_text()
        page.locator('#langAr').click()
        assert page.locator('html').get_attribute('dir') == 'rtl'
        page.locator('#langEn').click()
        print('PASS: Arabic/English and RTL/LTR switching')

        draw_with_mouse(page)
        painted = alpha_count(page)
        assert painted > 0
        page.locator('#undoBtn').click()
        assert alpha_count(page) == 0
        page.locator('#redoBtn').click()
        assert alpha_count(page) == painted
        print('PASS: mouse strokes, undo, redo')

        # Erase is expected to remove some paint without changing the template layer.
        outline_before = alpha_count(page, 'templateCanvas')
        page.locator('#eraserTool').click()
        rect = page.locator('#paintCanvas').bounding_box()
        x, y = rect['x'] + .57 * rect['width'], rect['y'] + .555 * rect['height']
        page.mouse.move(x,y); page.mouse.down(); page.mouse.move(x+10,y+10,steps=4); page.mouse.up()
        assert alpha_count(page) < painted
        assert alpha_count(page, 'templateCanvas') == outline_before
        print('PASS: eraser preserves outline')
        page.locator('#brushTool').click()

        with TemporaryDirectory() as dest:
            with page.expect_download(timeout=8000) as pending:
                page.locator('#exportBtn').click()
            download = pending.value
            output = Path(dest) / download.suggested_filename
            download.save_as(output)
            assert output.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n'
            assert output.stat().st_size > 2000
        print('PASS: PNG download and signature')

        page.locator('#saveBtn').click()
        assert page.locator('#saveDialog').evaluate('(dialog) => dialog.open')
        page.locator('#artworkName').fill('Test Artwork')
        page.locator('#saveForm button[type=submit]').click()
        page.wait_for_selector('.saved-card')
        assert page.locator('.saved-card').count() == 1
        page.once('dialog', lambda dialog: dialog.accept())
        page.locator('#clearBtn').click()
        assert alpha_count(page) == 0
        assert alpha_count(page, 'templateCanvas') == outline_before
        page.locator('.saved-card-actions button').first.click()
        page.wait_for_function("document.querySelector('#status').textContent.includes('opened')", timeout=5000)
        assert alpha_count(page) > 0
        print('PASS: save, clear, open, outline retention')

        # Reload-equivalent browser document with persisted fallback storage seed.
        stored = page.evaluate('window.__dumpStorage()')
        new_page = context.new_page()
        new_page.on('pageerror', lambda err: errors.append(str(err)))
        load_app(new_page, stored)
        assert new_page.locator('html').get_attribute('dir') == 'ltr'
        assert new_page.locator('.saved-card').count() == 1
        new_page.once('dialog', lambda dialog: dialog.accept())
        new_page.locator('.saved-card-actions button.delete').click()
        new_page.wait_for_selector('.empty-gallery')
        assert new_page.locator('.saved-card').count() == 0
        print('PASS: language preference and saved artwork persists across recreated page (mock localStorage), delete')

        # Browser-level layout at mobile viewport and simulated touch pointer input.
        mobile_context = browser.new_context(viewport={'width':375,'height':812}, has_touch=True, is_mobile=True)
        mobile = mobile_context.new_page()
        mobile.on('pageerror', lambda err: errors.append(str(err)))
        load_app(mobile)
        mobile.locator('#templatePicker').scroll_into_view_if_needed()
        assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
        mobile.locator('#paintCanvas').scroll_into_view_if_needed()
        bounds = mobile.locator('#paintCanvas').bounding_box()
        mobile.touchscreen.tap(bounds['x'] + bounds['width']/2, bounds['y']+bounds['height']/2)
        assert alpha_count(mobile) > 0
        print('PASS: 375px layout, no horizontal overflow, synthetic touchscreen tap')

        assert not errors, f'Browser JavaScript errors: {errors}'
        print('PASS: zero uncaught browser JavaScript exceptions')
        browser.close()


if __name__ == '__main__':
    run()