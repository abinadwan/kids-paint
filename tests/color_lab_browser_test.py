"""Color Lab 2B visual/browser regression: requires Playwright and Chromium.
Run: python tests/color_lab_browser_test.py
Runs in-memory HTML/CSS/JS with a fake localStorage; no GitHub Pages dependency.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
def load(page,seed=None):
    html=(ROOT/'color-lab.html').read_text('utf-8')
    html=re.sub(r'<link\b[^>]*>','',html)
    html=re.sub(r'<script\b[^>]*></script>','',html)
    html=html.replace('<head>','<head><base href="https://example.invalid/kids-paint/">',1)
    page.set_content(html)
    page.add_style_tag(content=(ROOT/'color-lab.css').read_text('utf-8'))
    page.evaluate("""seed => {
      const data=new Map(Object.entries(seed||{}));
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return data.has(k)?data.get(k):null},
        setItem(k,v){data.set(String(k),String(v))},
        removeItem(k){data.delete(String(k))}
      }});
      window.__testStore=data;
    }""",seed or {})
    for filename in ('vendor/spectral.min.js','color-lab-core.js','color-lab.js'):
        page.add_script_tag(content=(ROOT/filename).read_text('utf-8'))

def tap(page,name,times):
    for _ in range(times):
        page.locator('[data-pigment='+name+']').click()

def run():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width,height in ((320,740),(390,844),(768,880),(1280,900)):
            page=browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('dialog',lambda d:d.accept())
            load(page)
            assert page.locator('#challengeSection').is_hidden()
            assert page.locator('.challenge-choice').count()==12
            assert page.locator('.challenge-stage').count()==3
            assert page.locator('[data-pigment]').count()==5
            assert page.locator('#paintColorBtn').is_disabled()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),width
            tap(page,'yellow',2);tap(page,'blue',2)
            assert page.locator('#resultHex').inner_text()=='#6FBA63'
            assert page.locator('[data-pigment=red]').is_enabled()
            tap(page,'red',1);tap(page,'white',2);tap(page,'black',1)
            assert page.locator('#dropSummary').inner_text().count('×')==5
            advanced=page.locator('#resultHex').inner_text()
            assert advanced.startswith('#') and len(advanced)==7
            page.locator('#undoDropBtn').click()
            assert page.locator('#resultHex').inner_text()!=advanced
            page.locator('#saveColorBtn').click()
            assert page.locator('.saved-item').count()==1
            assert page.locator('#savedCount').inner_text()=='1 / 48'
            assert page.evaluate("JSON.parse(window.__testStore.get('kids-paint-lab-colors-v1')).length")==1
            page.locator('#challengeModeBtn').click()
            assert page.locator('#challengeSection').is_visible()
            assert page.locator('#challengeProgress').inner_text()=='0 / 36 ★'
            tap(page,'yellow',2);tap(page,'blue',2)
            page.locator('#checkChallengeBtn').click()
            assert 'ثلاث نجوم' in page.locator('#challengeFeedback').inner_text()
            assert page.evaluate("JSON.parse(window.__testStore.get('kids-paint-lab-progress-v1')).green")==3
            assert page.locator('#challengeProgress').inner_text()=='3 / 36 ★'
            page.locator('.challenge-choice').nth(4).click()
            tap(page,'red',2);tap(page,'white',5)
            page.locator('#checkChallengeBtn').click()
            assert 'ثلاث نجوم' in page.locator('#challengeFeedback').inner_text()
            assert page.evaluate("JSON.parse(window.__testStore.get('kids-paint-lab-progress-v1')).pink")==3
            page.locator('#langEn').click()
            assert 'Color challenges' in page.locator('#challengeModeBtn').inner_text()
            assert '12 untimed challenges' in page.locator('.challenge-panel').inner_text()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),width
            page.locator('.saved-actions .delete-color').click()
            assert page.locator('.saved-item').count()==0
            assert page.evaluate("JSON.parse(window.__testStore.get('kids-paint-lab-colors-v1')).length")==0
            assert not errors, errors
            print('PASS Color Lab 2B: 5 pigments, 12 challenges, 3-star, notebook, i18n, layout',width)
            page.close()
        # Ensure legacy user progress and notebook recipes survive without migration.
        legacy=browser.new_page()
        seed={
          'kids-paint-lab-progress-v1':'{"green":3,"orange":2}',
          'kids-paint-lab-colors-v1':'[{"hex":"#6FBA63","drops":{"yellow":2,"blue":2},"createdAt":"2026-11-09T00:00:00Z"}]'
        }
        load(legacy,seed)
        assert legacy.locator('.saved-item').count()==1
        legacy.locator('#challengeModeBtn').click()
        assert legacy.locator('#challengeProgress').inner_text()=='5 / 36 ★'
        legacy.locator('.saved-actions button').first.click()
        assert legacy.locator('#resultHex').inner_text()=='#6FBA63'
        print('PASS: legacy 2A stars and saved recipes persist')
        browser.close()

if __name__=='__main__':
    run()
