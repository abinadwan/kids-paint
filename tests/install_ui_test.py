"""In-memory Chromium tests of PWA install guide and existing canvas, no localhost."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width in (320,390,768,1280):
            page=browser.new_page(viewport={'width':width,'height':850})
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            html=(ROOT/'index.html').read_text('utf-8')
            html=re.sub(r'<link\b[^>]*>', '', html)
            html=re.sub(r'<script\b[^>]*></script>', '', html)
            page.set_content(html)
            page.add_style_tag(content=(ROOT/'style.css').read_text('utf-8'))
            page.evaluate("""() => {Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(){return null},setItem(){},removeItem(){},get length(){return 0},key(){return null}}})}""")
            page.add_script_tag(content=(ROOT/'drawing.js').read_text('utf-8'))
            page.add_script_tag(content=(ROOT/'pwa.js').read_text('utf-8'))
            page.wait_for_selector('.template-item')
            assert page.locator('.template-item').count()==14
            assert page.locator('#installAppBtn').is_visible()
            page.locator('#installAppBtn').click()
            assert page.locator('#installDialog').evaluate('(d)=>d.open')
            assert 'الآيفون' in page.locator('#installDialog').inner_text()
            page.locator('#closeInstallDialog').click()
            page.locator('#langEn').click()
            assert 'Install app' in page.locator('#installAppBtn').inner_text()
            page.locator('#installAppBtn').click()
            assert 'On iPhone' in page.locator('#installDialog').inner_text()
            page.locator('#closeInstallDialog').click()
            doc=page.evaluate('({width:document.documentElement.scrollWidth,window:window.innerWidth})')
            assert doc['width']<=doc['window']+2,(width,doc)
            page.locator('#brushTool').click()
            assert page.locator('#paintCanvas').get_attribute('data-mode')=='brush'
            assert not errors,errors
            print('PASS: UI, i18n, existing draw tools, no overflow', width)
            page.close()
        browser.close()
if __name__=='__main__':main()