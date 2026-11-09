"""Regression checks for a user-drawn closed shape and paint bucket boundaries.

Requires Playwright + Chromium. Reuses the existing HTML/CSS/JS browser harness;
localStorage is mocked to be available under about:blank. IndexedDB, file://,
and physical devices are not covered.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image
from playwright.sync_api import sync_playwright
from smoke_test import load_app, tap_at, pixel, alpha_count


def line_loop(page, vertices, size=12):
    canvas = page.locator('#paintCanvas')
    canvas.scroll_into_view_if_needed()
    b = canvas.bounding_box()

    def xy(p):
        return b['x'] + p[0] * b['width'] / 600, b['y'] + p[1] * b['height'] / 400

    page.locator('#brushTool').click()
    page.locator('#brushSize').fill(str(size))
    page.locator('.color-swatch').last.click()  # black pen border
    page.mouse.move(*xy(vertices[0])); page.mouse.down()
    for v in vertices[1:]:
        page.mouse.move(*xy(v), steps=10)
    page.mouse.up()


def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        context = browser.new_context(accept_downloads=True, viewport={'width': 1220, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('dialog', lambda d: d.accept())
        load_app(page)
        # Free draw, no illustration boundaries.
        page.locator('.template-item').first.click()
        line_loop(page, [(150, 110), (450, 110), (450, 300), (150, 300), (150, 110)])
        black = pixel(page, 240, 176)
        assert black[:3] == [48, 57, 76] or (black[3] > 200 and max(black[:3]) < 80), black
        assert pixel(page, 480, 320)[3] == 0, 'inside must be empty before fill'
        assert pixel(page, 120, 120)[3] == 0, 'outside must be empty before fill'
        print('PASS: closed rectangle pen border drawn, interior/exterior empty')

        page.locator('#bucketTool').click()
        page.locator('.color-swatch').first.click()  # red
        tap_at(page, 300, 200)
        assert pixel(page, 480, 320)[:3] == [255, 107, 107], pixel(page,480,320)
        assert pixel(page, 120, 120)[3] == 0, 'bucket escaped outside hand-drawn border'
        assert pixel(page, 240, 176) == black, 'bucket overwrote pen outline'
        assert alpha_count(page) < 300000, 'closed shape filled whole screen'
        print('PASS: bucket fills ONLY user-drawn closed shape and preserves pen border')

        page.locator('#undoBtn').click()
        assert pixel(page, 480, 320)[3] == 0
        assert pixel(page, 240, 176) == black
        page.locator('#redoBtn').click()
        assert pixel(page, 480, 320)[:3] == [255, 107, 107]
        page.locator('.color-swatch').nth(5).click()  # blue
        tap_at(page, 300, 200)
        assert pixel(page, 480, 320)[:3] == [79, 152, 236]
        page.locator('#undoBtn').click()
        assert pixel(page, 480, 320)[:3] == [255, 107, 107]
        page.locator('#redoBtn').click()
        assert pixel(page, 480, 320)[:3] == [79, 152, 236]
        print('PASS: undo/redo + recolor preserve manually drawn boundaries')

        with TemporaryDirectory() as folder:
            with page.expect_download(timeout=10000) as pending:
                page.locator('#exportBtn').click()
            out = Path(folder) / pending.value.suggested_filename
            pending.value.save_as(out)
            im = Image.open(out)
            assert im.size == (960, 640)
            assert im.getpixel((480, 320))[:3] == (79, 152, 236)
            assert im.getpixel((120, 120))[:3] == (255, 255, 255)
            assert max(im.getpixel((240, 176))[:3]) < 80
        print('PASS: PNG exports interior color, pen outline, and white exterior')

        page.locator('#saveBtn').click()
        page.locator('#artworkName').fill('My colored rectangle')
        page.locator('#saveForm button[type=submit]').click()
        page.wait_for_selector('.saved-card')
        page.locator('#clearBtn').click()
        assert alpha_count(page) == 0
        page.locator('.saved-card-actions button').first.click()
        page.wait_for_function("document.querySelector('#paintCanvas').getContext('2d').getImageData(480,320,1,1).data[3] > 0")
        assert pixel(page, 480, 320)[:3] == [79, 152, 236]
        page.locator('.color-swatch').nth(2).click()  # yellow
        tap_at(page, 300, 200)
        assert pixel(page, 480, 320)[:3] == [255, 223, 85]
        assert pixel(page, 120, 120)[3] == 0
        print('PASS: saved/reopened drawing retains pen boundaries for later bucket use')

        # Old saves (without a stroke mask) must still load without throwing.
        stored = page.evaluate('window.__dumpStorage()')
        import json
        for key, value in list(stored.items()):
            if key.startswith('kids-paint-art-'):
                record = json.loads(value)
                record.pop('strokeDataUrl', None)
                stored[key] = json.dumps(record)
        legacy = context.new_page()
        legacy.on('pageerror', lambda e: errors.append(str(e)))
        legacy.on('dialog', lambda d: d.accept())
        load_app(legacy, stored)
        legacy.locator('.saved-card-actions button').first.click()
        legacy.wait_for_function("document.querySelector('#paintCanvas').getContext('2d').getImageData(480,320,1,1).data[3] > 0")
        assert alpha_count(legacy) > 0
        print('PASS: older saves without a stored boundary mask load safely')
        legacy.close()
        page.close()

        # A pen line with a gap is intentionally not a closed region.
        gapped = context.new_page()
        gapped.on('pageerror', lambda e: errors.append(str(e)))
        gapped.on('dialog', lambda d: d.accept())
        load_app(gapped)
        gapped.locator('.template-item').first.click()
        line_loop(gapped, [(150, 110), (450, 110), (450, 300), (150, 300), (150, 160)])
        gapped.locator('#bucketTool').click()
        gapped.locator('.color-swatch').first.click()
        tap_at(gapped, 300, 200)
        assert pixel(gapped, 120, 120)[:3] == [255, 107, 107], 'an open loop should not act as sealed'
        print('PASS: open pen shape has expected background spill; no fake auto-closure')
        # A hand-drawn enclosure on top of a built-in illustration must also work.
        illustration = context.new_page()
        illustration.on('pageerror', lambda e: errors.append(str(e)))
        illustration.on('dialog', lambda d: d.accept())
        load_app(illustration)
        line_loop(illustration, [(25, 20), (100, 20), (100, 95), (25, 95), (25, 20)], size=8)
        illustration.locator('#bucketTool').click()
        illustration.locator('.color-swatch').nth(2).click()
        tap_at(illustration, 60, 60)
        assert pixel(illustration, 96, 96)[:3] == [255, 223, 85]
        assert pixel(illustration, 16, 16)[3] == 0
        print('PASS: hand-drawn closed shape over a built-in template does not flood outside')
        illustration.close()

        assert not errors, errors
        print('PASS: no uncaught browser errors')
        gapped.close()
        context.close()
        browser.close()


if __name__ == '__main__':
    run()
