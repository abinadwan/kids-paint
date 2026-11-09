"""Mobile layout and accidental page zoom regression for the real Kids Paint UI.

Run: python tests/mobile_zoom_test.py
In-memory Chromium and synthetic gestures, not a physical iPhone Safari test.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium',
                                     headless=True, args=['--no-sandbox'])
        for width, height in ((320,740),(360,780),(390,844),(428,926),(768,900),(1280,900)):
            mobile = width <= 428
            page = browser.new_page(
                viewport={'width': width, 'height': height},
                is_mobile=mobile, has_touch=mobile,
                device_scale_factor=2 if mobile else 1)
            errors = []
            page.on('pageerror', lambda err: errors.append(str(err)))
            html = (ROOT / 'index.html').read_text('utf-8')
            html = re.sub(r'<link\b[^>]*>', '', html)
            html = re.sub(r'<script\b[^>]*></script>', '', html)
            page.set_content(html)
            page.add_style_tag(content=(ROOT / 'style.css').read_text('utf-8'))
            page.evaluate("""() => {
              Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
              const data=new Map();
              Object.defineProperty(window,'localStorage',{configurable:true,value:{
                get length(){return data.size},key(n){return [...data.keys()][n]||null},
                getItem(k){return data.get(k)||null},
                setItem(k,v){data.set(String(k),String(v))},
                removeItem(k){data.delete(k)}
              }});
            }""")
            page.add_script_tag(content=(ROOT / 'drawing.js').read_text('utf-8'))
            page.add_script_tag(content=(ROOT / 'pwa.js').read_text('utf-8'))
            page.wait_for_selector('.template-item')
            computed=page.evaluate("""() => ({
              width:innerWidth, scrollWidth:document.documentElement.scrollWidth,
              zoom:visualViewport.scale,
              touch:getComputedStyle(document.querySelector('.app-shell')).touchAction,
              canvasTouch:getComputedStyle(document.querySelector('#paintCanvas')).touchAction,
              inputFont:parseFloat(getComputedStyle(document.querySelector('#textInput')).fontSize)
            })""")
            assert computed['scrollWidth'] <= computed['width']+2, computed
            assert computed['touch']=='pan-y' and computed['canvasTouch']=='none'
            if mobile:
                assert computed['inputFont'] >= 16, computed
                stage=page.locator('#canvasStage').bounding_box()
                assert abs(stage['height'] - height*.85) < 3, stage
            blocked=page.evaluate("""() => ['gesturestart','gesturechange'].map(type=>{
              const event=new Event(type,{cancelable:true,bubbles:true});
              document.dispatchEvent(event);
              return event.defaultPrevented;
            })""")
            assert blocked==[True,True],blocked
            page.locator('#textTool').click()
            page.locator('#textInput').fill('Hello عالم')
            assert page.locator('#textInput').input_value() == 'Hello عالم'
            assert not errors, errors
            print('PASS responsive layout, canvas, input, gesture cancellation:', width)
            page.close()
        browser.close()

if __name__ == '__main__':
    run()
