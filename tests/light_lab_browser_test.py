"""World of Light RGB browser regression with Chromium and Playwright.
Run: python tests/light_lab_browser_test.py
In-memory resources; verifies page switching, sliders, challenges, notebook and language.
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
    page.evaluate("""seed=>{
      const values=new Map(Object.entries(seed||{}));
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return values.has(k)?values.get(k):null},
        setItem(k,v){values.set(String(k),String(v))},
        removeItem(k){values.delete(String(k))}
      }});
      window.__lightStore=values;
    }""",seed or {})
    for file in ('vendor/spectral.min.js','color-lab-core.js','color-lab.js',
                 'light-lab-core.js','light-lab.js'):
        page.add_script_tag(content=(ROOT/file).read_text('utf-8'))

def intensity(page,channel,percent):
    page.locator('#light'+channel+'Range').evaluate(
      """(el,val)=>{el.value=String(val);el.dispatchEvent(new Event('input',{bubbles:true}));}""",
      percent)

def run():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',
                                   headless=True,args=['--no-sandbox'])
        for width,height in ((320,740),(390,844),(768,900),(1280,900)):
            page=browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('dialog',lambda d:d.accept())
            seed={'kids-paint-lab-progress-v1':'{"green":3}',
                  'kids-paint-lab-colors-v1':'[{"hex":"#6FBA63","drops":{"yellow":2,"blue":2}}]'}
            load(page,seed)
            assert page.locator('#pigmentLab').is_visible()
            assert page.locator('#lightLab').is_hidden()
            assert page.locator('#labVersionLabel').inner_text()=='4.7.0'
            assert page.locator('#labUpdateBtn').inner_text()=='تحديث التطبيق'
            page.locator('#lightTab').click()
            assert page.locator('#lightLab').is_visible()
            assert page.locator('#pigmentLab').is_hidden()
            assert page.locator('#lightSaveBtn').is_disabled()
            assert page.locator('#lightResultHex').inner_text()=='#000000'
            intensity(page,'Red',100);intensity(page,'Green',100)
            assert page.locator('#lightResultHex').inner_text()=='#FFFF00'
            intensity(page,'Red',0);intensity(page,'Blue',100)
            assert page.locator('#lightResultHex').inner_text()=='#00FFFF'
            page.locator('#lightAllOnBtn').click()
            assert page.locator('#lightResultHex').inner_text()=='#FFFFFF'
            page.locator('#lightAllOffBtn').click()
            assert page.locator('#lightResultHex').inner_text()=='#000000'
            intensity(page,'Red',100);intensity(page,'Green',100)
            page.locator('#lightSaveBtn').click()
            assert page.locator('.light-saved-item').count()==1
            assert page.evaluate("JSON.parse(window.__lightStore.get('kids-paint-light-colors-v1')).length")==1
            page.locator('#lightChallengesBtn').click()
            assert page.locator('#lightChallengesPanel').is_visible()
            assert page.locator('.light-challenge-choice').count()==6
            page.locator('#lightCheckBtn').click()
            assert 'ثلاث نجوم' in page.locator('#lightFeedback').inner_text()
            assert page.locator('#lightStars').inner_text()=='3 / 18 ★'
            assert page.evaluate("JSON.parse(window.__lightStore.get('kids-paint-light-progress-v1')).yellowLight")==3
            assert page.evaluate("JSON.parse(window.__lightStore.get('kids-paint-lab-progress-v1')).green")==3
            page.locator('#langEn').click()
            assert 'World of Light' in page.locator('#lightTab').inner_text()
            assert 'Light challenges' in page.locator('#lightChallengesBtn').inner_text()
            assert 'Update app' in page.locator('#labUpdateBtn').inner_text()
            page.locator('#pigmentTab').click()
            assert page.locator('#pigmentLab').is_visible()
            assert page.locator('.challenge-choice').count()==12
            page.locator('#lightTab').click()
            assert page.locator('#lightResultHex').inner_text()=='#FFFF00'
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+2'),width
            page.locator('.light-saved-actions button').last.click()
            assert page.locator('.light-saved-item').count()==0
            assert not errors,errors
            print('PASS: RGB Light Lab tabs, six challenges, notebook, legacy data, mobile layout',width)
            page.close()
        browser.close()

if __name__=='__main__':
    run()
