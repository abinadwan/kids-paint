"""Regression test: portrait mobile canvas, blank start, tap-to-place text, old artwork compatibility.
Run with Python + Playwright + Chromium: python tests/portrait_text_test.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from smoke_test import load_app, alpha_count

def pixel_at(page, x, y):
    return page.evaluate("""([x,y]) => [...document.querySelector('#paintCanvas').getContext('2d').getImageData(x,y,1,1).data]""", [x,y])

def tap_center(page):
    canvas=page.locator('#paintCanvas')
    canvas.scroll_into_view_if_needed()
    box=canvas.bounding_box()
    page.mouse.click(box['x']+box['width']*.55,box['y']+box['height']*.48)

def run():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width,height in [(320,740),(390,844),(428,926),(1280,900)]:
            page=browser.new_page(viewport={'width':width,'height':height},accept_downloads=True)
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('dialog',lambda d:d.accept())
            load_app(page)
            assert page.locator('#brushTool').get_attribute('aria-pressed')=='true'
            assert page.locator('.template-item').first.get_attribute('aria-pressed')=='true'
            assert alpha_count(page,'templateCanvas')==0
            dims=page.locator('#paintCanvas').evaluate('(c)=>[c.width,c.height]')
            rect=page.locator('#canvasStage').bounding_box()
            if width<=760:
                assert dims[1]>dims[0],dims
                assert abs(rect['height']-height*.85)<2,rect
                assert page.locator('#canvasStage').get_attribute('data-shape')=='portrait'
            else:
                assert dims==[960,640]
            page.locator('#textTool').click()
            assert page.locator('#textPanel').is_visible()
            page.locator('#textInput').fill('Hello عالم')
            page.locator('#brushSize').fill('25')
            before=alpha_count(page)
            tap_center(page)
            after=alpha_count(page)
            assert after>before+100,(before,after)
            page.locator('#undoBtn').click()
            assert alpha_count(page)==before
            page.locator('#redoBtn').click()
            assert alpha_count(page)==after
            page.locator('#saveBtn').click()
            page.locator('#artworkName').fill('Caption test')
            page.locator('#saveForm button[type=submit]').click()
            page.wait_for_selector('.saved-card')
            page.locator('#clearBtn').click()
            assert alpha_count(page)==0
            page.locator('.saved-card-actions button').first.click()
            page.wait_for_function("document.querySelector('#status').textContent.includes('فتح')")
            assert alpha_count(page)==after
            assert page.locator('#paintCanvas').evaluate('(c)=>[c.width,c.height]')==dims
            page.locator('.template-item').nth(1).click()
            assert page.locator('#bucketTool').get_attribute('aria-pressed')=='true'
            assert not errors,errors
            print('PASS: blank start, 85% portrait on phone, text/undo/save/restore',width)
            page.close()
        browser.close()

if __name__=='__main__':
    run()
