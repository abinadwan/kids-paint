"""In-memory Chromium tests of PWA install guide and existing canvas, no localhost."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]

def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width in (320,390,768,1280):
            page=browser.new_page(viewport={'width':width,'height':850},user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1')
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
            assert not page.locator('#androidInstallSteps').is_visible()
            assert not page.locator('#desktopInstallSteps').is_visible()
            position=page.locator('#installDialog').bounding_box()
            assert position and position['y']>400 and position['y']+position['height']>=840, position
            assert page.locator('.hero-section #installAppBtn').count()==0
            assert page.locator('.site-footer #installAppBtn').count()==1
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
        # Chromium install event should trigger native prompt immediately from user click.
        page=browser.new_page(viewport={'width':390,'height':844},user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/122 Mobile Safari/537.36')
        html=(ROOT/'index.html').read_text('utf-8')
        html=re.sub(r'<link\b[^>]*>', '', html)
        html=re.sub(r'<script\b[^>]*></script>', '', html)
        page.set_content(html)
        page.add_style_tag(content=(ROOT/'style.css').read_text('utf-8'))
        page.add_script_tag(content=(ROOT/'pwa.js').read_text('utf-8'))
        page.evaluate("""() => {
            window.__nativeCalls=0;
            const event=new Event('beforeinstallprompt',{cancelable:true});
            event.prompt=()=>{window.__nativeCalls++; return Promise.resolve({outcome:'accepted'})};
            event.userChoice=Promise.resolve({outcome:'accepted'});
            window.dispatchEvent(event);
        }""")
        page.locator('#installAppBtn').click()
        page.wait_for_function('window.__nativeCalls === 1')
        assert not page.locator('#installDialog').evaluate('(d)=>d.open')
        page.evaluate("window.dispatchEvent(new Event('appinstalled'))")
        assert not page.locator('.footer-install').is_visible()
        print('PASS: native installation prompt and installed state')
        page.close()
        page=browser.new_page(viewport={'width':390,'height':844},user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/122 Mobile Safari/537.36')
        page.set_content(html)
        page.add_style_tag(content=(ROOT/'style.css').read_text('utf-8'))
        page.add_script_tag(content=(ROOT/'pwa.js').read_text('utf-8'))
        page.locator('#installAppBtn').click()
        assert page.locator('#androidInstallSteps').is_visible()
        assert not page.locator('#iosInstallSteps').is_visible()
        print('PASS: Android fallback instructions')
        page.close()
        browser.close()
if __name__=='__main__':main()