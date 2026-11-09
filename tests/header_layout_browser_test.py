"""Kids Paint v4.8.0 — precise shared header/layout checks in Chromium.

Run from repo root: python tests/header_layout_browser_test.py
Needs Python Playwright and a Chromium installation at /usr/bin/chromium.
Checks the two pages at identical viewport sizes in both RTL and LTR.
No network access or real user data required.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
VIEWPORTS=((320,740),(375,812),(390,844),(530,850),(768,900),(1024,900),(1440,950))

def load(page,filename,styles):
    html=(ROOT/filename).read_text('utf-8')
    # Disable the app logic: this test targets geometry and avoids localStorage state.
    html=re.sub(r'<script\b[^>]*></script>','',html)
    html=re.sub(r'<link\b[^>]*>', '', html)
    # Avoid touching network for app icons and locally bundled banners.
    html=re.sub(r'\bsrc="[^"]+"','src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="',html)
    page.set_content(html,wait_until='domcontentloaded')
    for path in styles:
        page.add_style_tag(content=(ROOT/path).read_text('utf-8'))

def rect(page,selector):
    return page.locator(selector).bounding_box()

def compare(a,b,name,width,tol=1.1):
    for field in ('x','y','width','height'):
        diff=abs(a[field]-b[field])
        assert diff<=tol,(width,name,field,a[field],b[field],diff)

def run():
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(
            executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for width,height in VIEWPORTS:
            painter=browser.new_page(viewport={'width':width,'height':height})
            lab=browser.new_page(viewport={'width':width,'height':height})
            load(painter,'index.html',['style.css','assets/site-header.css'])
            load(lab,'color-lab.html',['color-lab.css','assets/site-header.css'])
            for page in (painter,lab):
                assert page.locator('.site-header').count()==1
                assert page.locator('.site-brand img').get_attribute('width')=='56'
                assert page.locator('#langAr').inner_text()=='العربية'
                assert page.locator('#langEn').inner_text()=='English'
                assert page.locator('.site-pages a').count()==2
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),width
                assert page.locator('#langAr').evaluate('(el)=>getComputedStyle(el).minHeight') in ('44px','46px')
                assert page.locator('.site-languages button').count()==2
            for selector in ('.site-header','.site-brand','.site-brand img',
                             '.site-pages','.site-languages','#langAr','#langEn'):
                compare(rect(painter,selector),rect(lab,selector),selector,width)
            # The two approved lab banners have equal intrinsic dimensions and display ratio.
            assert lab.locator('.experience-banner').count()==2
            img1,img2=lab.locator('.experience-banner').all()
            assert img1.get_attribute('width')=='1600'
            assert img2.get_attribute('width')=='1600'
            assert img1.get_attribute('height')=='533'
            assert img2.get_attribute('height')=='533'
            lab.locator('#lightLab').evaluate('(el)=>el.hidden=false')
            size1=img1.bounding_box();size2=img2.bounding_box()
            assert abs(size1['width']-size2['width'])<=1,width
            assert abs(size1['height']-size2['height'])<=1,width
            for page in (painter,lab):
                page.evaluate("""() => {
                    document.documentElement.lang='en';
                    document.documentElement.dir='ltr';
                }""")
            for selector in ('.site-header','.site-brand','.site-pages',
                             '.site-languages','#langAr','#langEn'):
                compare(rect(painter,selector),rect(lab,selector),selector+' LTR',width)
            print('PASS header/buttons/banner geometry —',width,'px')
            painter.close();lab.close()
        browser.close()

if __name__=='__main__':
    run()
