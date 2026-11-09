"""Regression checks for emoji canvas stickers and mobile photo share/download fallback.
Uses the existing in-memory Chromium harness; native iOS Photos UI requires device testing.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image
from playwright.sync_api import sync_playwright
from smoke_test import load_app, tap_at, alpha_count

ROOT = Path(__file__).resolve().parents[1]

def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        context = browser.new_context(accept_downloads=True, viewport={'width':390,'height':844})
        page = context.new_page()
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.on('dialog',lambda dialog:dialog.accept())
        load_app(page)
        assert page.locator('#emojiTool').is_visible()
        page.locator('#emojiTool').click()
        assert page.locator('#emojiPanel').is_visible()
        assert page.locator('.emoji-choice').count()==18
        assert page.locator('#brushSize').is_enabled()
        page.locator('.template-item').last.click() # Blank page.
        page.locator('#emojiTool').click()
        page.locator('#brushSize').fill('28')
        page.locator('.emoji-choice').nth(8).click() # rainbow
        assert page.locator('.emoji-choice').nth(8).get_attribute('aria-pressed')=='true'
        before=alpha_count(page)
        tap_at(page,300,200)
        after=alpha_count(page)
        assert after>before+100,(before,after)
        page.locator('#undoBtn').click()
        assert alpha_count(page)==0
        page.locator('#redoBtn').click()
        assert alpha_count(page)==after
        print('PASS: emoji tool, 18 emoji, insert, size, undo/redo')

        page.locator('#langEn').click()
        assert 'Emoji' in page.locator('#emojiTool').inner_text()
        assert 'Choose an emoji' in page.locator('#emojiPanel').inner_text()
        assert 'Save to Photos' in page.locator('#saveToPhotosBtn').inner_text()
        page.locator('#langAr').click()
        assert 'إيموجي' in page.locator('#emojiTool').inner_text()
        print('PASS: bilingual labels and accessible selection')

        page.evaluate('''() => {
          window.__shared = [];
          Object.defineProperty(navigator, 'canShare', {configurable:true, value: data=>Boolean(data.files && data.files.length)});
          Object.defineProperty(navigator, 'share', {configurable:true, value: async data=> {
            window.__shared.push({title:data.title, name:data.files[0].name, type:data.files[0].type,
              size:data.files[0].size, fileCount:data.files.length});
          }});
        }''')
        page.locator('#saveToPhotosBtn').click()
        page.wait_for_function('window.__shared.length === 1')
        shared=page.evaluate('window.__shared[0]')
        assert shared['fileCount']==1 and shared['type']=='image/png'
        assert shared['size']>1000 and shared['name'].endswith('.png'),shared
        print('PASS: Web Share receives complete PNG File (share-sheet handoff only)')

        page.evaluate('''() => {
          Object.defineProperty(navigator, 'share', {configurable:true, value:undefined});
          Object.defineProperty(navigator, 'canShare', {configurable:true, value:undefined});
        }''')
        with TemporaryDirectory() as path:
            with page.expect_download(timeout=12000) as pending:
                page.locator('#saveToPhotosBtn').click()
            download=pending.value
            target=Path(path)/download.suggested_filename
            download.save_as(target)
            assert target.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
            assert Image.open(target).size==(960,640)
        assert 'الصور' in page.locator('#status').inner_text()
        print('PASS: fallback downloads real PNG when Web Share is not available')
        assert not errors,errors
        context.close();browser.close()

if __name__=='__main__':run()
