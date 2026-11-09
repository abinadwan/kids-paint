"""Create genuine README screenshots of the current application in headless Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
from io import BytesIO
import base64, re
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'/'screenshots'
OUT.mkdir(parents=True, exist_ok=True)

def app_page(browser,width,height):
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    html=(ROOT/'index.html').read_text('utf-8')
    html=re.sub(r'<link\b[^>]*>', '', html)
    html=re.sub(r'<script\b[^>]*></script>', '', html)
    for path in ['assets/kids-paint-banner.webp','assets/app-icon.png']:
        p=ROOT/path
        data=base64.b64encode(p.read_bytes()).decode('ascii')
        mime='image/webp' if p.suffix=='.webp' else 'image/png'
        html=html.replace(f'src="{path}"',f'src="data:{mime};base64,{data}"')
    page.set_content(html)
    page.add_style_tag(content=(ROOT/'style.css').read_text('utf-8'))
    page.evaluate('''() => {
       Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
       const store=new Map();
       Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)||null,
       setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k),get length(){return store.size},key:n=>[...store.keys()][n]||null}});
    }''')
    page.add_script_tag(content=(ROOT/'drawing.js').read_text('utf-8'))
    page.add_script_tag(content=(ROOT/'pwa.js').read_text('utf-8'))
    page.wait_for_selector('.template-item')
    return page

def save_crop(page,name,maxwidth=None,maxheight=None):
    data=page.screenshot(type='png',full_page=False,animations='disabled')
    image=Image.open(BytesIO(data)).convert('RGB')
    if maxwidth and image.width>maxwidth:
        image.thumbnail((maxwidth,image.height))
    if maxheight and image.height>maxheight:
        image=image.crop((0,0,image.width,maxheight))
    image.save(OUT/name,'WEBP',quality=73,method=6)
    print(name,Image.open(OUT/name).size,(OUT/name).stat().st_size)

def click_canvas(page,logical_x,logical_y):
    c=page.locator('#paintCanvas');c.scroll_into_view_if_needed()
    b=c.bounding_box()
    page.mouse.click(b['x']+b['width']*logical_x/600,b['y']+b['height']*logical_y/400)

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=app_page(browser,1365,900)
    page.locator('#langEn').click()
    page.evaluate('window.scrollTo(0,0)')
    save_crop(page,'desktop.webp')
    page.locator('#emojiTool').click()
    page.locator('.emoji-choice').nth(8).click()
    click_canvas(page,300,200)
    page.evaluate("document.querySelector('.workspace-card').scrollIntoView({block:'start'})")
    page.wait_for_timeout(150)
    save_crop(page,'emoji-editor.webp')
    page.close()
    mobile=app_page(browser,390,900)
    mobile.locator('#langAr').click()
    mobile.locator('#emojiTool').click()
    mobile.locator('.emoji-choice').nth(9).click()
    click_canvas(mobile,300,200)
    mobile.evaluate('window.scrollTo(0,0)')
    mobile.wait_for_timeout(100)
    save_crop(mobile,'mobile.webp')
    mobile.close()
    browser.close()
