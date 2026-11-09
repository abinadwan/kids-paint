"""Chromium checks for Kids Paint Color Lab without deploying to GitHub Pages.

Run: python tests/color_lab_browser_test.py
Requires Playwright and /usr/bin/chromium (same setup as existing tests).
This uses in-memory HTML + bundled CSS/JS with mocked localStorage.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def load(page):
    html = (ROOT / 'color-lab.html').read_text('utf-8')
    html = re.sub(r'<link\b[^>]*>', '', html)
    html = re.sub(r'<script\b[^>]*></script>', '', html)
    html = html.replace('<head>', '<head><base href="https://example.invalid/kids-paint/">', 1)
    page.set_content(html)
    page.add_style_tag(content=(ROOT / 'color-lab.css').read_text('utf-8'))
    page.evaluate("""() => {
      const data = new Map();
      Object.defineProperty(window, 'localStorage', {configurable:true, value:{
        getItem(k){return data.has(k)?data.get(k):null},
        setItem(k,v){data.set(String(k),String(v))},
        removeItem(k){data.delete(String(k))}
      }});
      window.__testStore = data;
    }""")
    page.add_script_tag(content=(ROOT / 'vendor/spectral.min.js').read_text('utf-8'))
    page.add_script_tag(content=(ROOT / 'color-lab-core.js').read_text('utf-8'))
    page.add_script_tag(content=(ROOT / 'color-lab.js').read_text('utf-8'))

def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium',
                                     headless=True, args=['--no-sandbox'])
        for width, height in ((320,740),(390,844),(768,880),(1280,900)):
            page = browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            load(page)
            assert page.locator('#challengeSection').is_hidden()
            assert page.locator('#resultHex').inner_text()=='—'
            assert page.locator('#challengePicker .challenge-choice').count()==4
            assert page.locator('#paintColorBtn').is_disabled()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'), width
            page.locator('[data-pigment=yellow]').click()
            assert page.locator('#resultHex').inner_text()=='#FCF046'
            page.locator('[data-pigment=blue]').click()
            assert page.locator('[data-pigment=red]').is_disabled()
            assert page.locator('#resultHex').inner_text()=='#6FBA63'
            page.locator('#undoDropBtn').click()
            assert page.locator('#resultHex').inner_text()=='#FCF046'
            page.locator('[data-pigment=blue]').click()
            page.locator('#saveColorBtn').click()
            assert page.locator('.saved-item').count()==1
            assert page.evaluate("JSON.parse(window.__testStore.get('kids-paint-lab-colors-v1')).length")==1
            page.locator('#challengeModeBtn').click()
            assert page.locator('#challengeSection').is_visible()
            assert page.locator('#challengeActions').is_visible()
            for color in ('yellow','yellow','blue','blue'):
                page.locator('[data-pigment='+color+']').click()
            page.locator('#checkChallengeBtn').click()
            assert 'ثلاث نجوم' in page.locator('#challengeFeedback').inner_text()
            assert page.evaluate("JSON.parse(window.__testStore.get('kids-paint-lab-progress-v1')).green")==3
            page.locator('#langEn').click()
            assert 'Color challenges' in page.locator('#challengeModeBtn').inner_text()
            assert 'Check color' in page.locator('#checkChallengeBtn').inner_text()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'), width
            assert not errors, errors
            print('PASS Color Lab: mixing, undo, notebook, 3-star challenge, i18n, layout', width)
            page.close()
        browser.close()

if __name__ == '__main__':
    run()
