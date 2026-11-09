"""Offline Chromium regression: photo import, colored vector stamps, persistence, export, layouts."""
from pathlib import Path
from tempfile import TemporaryDirectory
from PIL import Image
from playwright.sync_api import sync_playwright
from smoke_test import load_app, tap_at, pixel, alpha_count

ROOT = Path(__file__).resolve().parents[1]


def canvas_pixel(page, canvas_id, x, y):
    return page.evaluate('''({id,x,y}) => [...document.getElementById(id).getContext('2d').getImageData(x,y,1,1).data]''',
                         {'id':canvas_id,'x':x,'y':y})

def run():
    with sync_playwright() as pw, TemporaryDirectory() as directory:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        context=browser.new_context(accept_downloads=True,viewport={'width':1280,'height':900})
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('dialog',lambda d:d.accept())
        load_app(page)
        assert page.locator('.color-swatch').count()==12
        assert page.locator('.shade-swatch').count()==5
        page.locator('#stampTool').click()
        assert page.locator('#stampPanel').is_visible()
        assert page.locator('.stamp-choice').count()==6
        for i in range(6):
            page.locator('.stamp-choice').nth(i).click()
            page.locator('#brushSize').fill('20')
            x=110+(i%3)*190
            y=125+(i//3)*130
            before=alpha_count(page)
            tap_at(page,x,y)
            assert alpha_count(page)>before+50, (i,alpha_count(page),before)
        page.locator('#undoBtn').click();page.locator('#redoBtn').click()
        assert alpha_count(page)>600
        print('PASS: six vector stamps, active stamp picker, sizes, undo/redo')
        page.locator('#langEn').click()
        assert page.locator('#stampTool').inner_text().find('Stamps')>=0
        assert page.locator('#importPhotoBtn').inner_text().find('Import')>=0
        page.locator('#langAr').click()
        print('PASS: stamp and import labels translated Arabic/English')
        photo=Path(directory)/'photo.png'
        im=Image.new('RGB',(320,180),(24,152,90))
        for yy in range(0,180):
            for xx in range(200,320):im.putpixel((xx,yy),(51,72,196))
        im.save(photo)
        page.locator('#photoInput').set_input_files(str(photo))
        page.wait_for_function("document.querySelector('#status').textContent.includes('استيراد')")
        assert canvas_pixel(page,'photoCanvas',160,320)[:3]==[24,152,90]
        assert canvas_pixel(page,'photoCanvas',800,320)[:3]==[51,72,196]
        assert canvas_pixel(page,'paintCanvas',480,320)[3]==0
        page.locator('#bucketTool').click()
        tap_at(page,300,200)
        assert canvas_pixel(page,'paintCanvas',480,320)[3]==0, 'bucket must not cover an imported photograph'
        assert 'مغلق' in page.locator('#status').inner_text()
        print('PASS: gallery image imported locally, aspect ratio preserved; bucket cannot cover photo')
        from user_outline_test import line_loop
        line_loop(page, [(210,130),(390,130),(390,270),(210,270),(210,130)], size=10)
        page.locator('#bucketTool').click()
        page.locator('.color-swatch').first.click()
        tap_at(page,300,200)
        assert canvas_pixel(page,'paintCanvas',480,320)[:3]==[255,107,107]
        assert canvas_pixel(page,'paintCanvas',70,70)[3]==0
        assert canvas_pixel(page,'photoCanvas',480,320)[:3]==[24,152,90]
        page.locator('#clearBtn').click()
        print('PASS: closed freehand region fills over photo, outside photo stays uncovered')
        page.locator('#stampTool').click()
        page.locator('.stamp-choice').first.click()
        page.locator('#customColor').fill('#f400f4')
        tap_at(page,300,200)
        assert canvas_pixel(page,'paintCanvas',480,320)[0]>100
        assert canvas_pixel(page,'photoCanvas',480,320)[:3]==[24,152,90]
        print('PASS: selected custom stamp color painted over independent photo layer')
        page.locator('#eraserTool').click()
        page.locator('#paintCanvas').scroll_into_view_if_needed()
        rect=page.locator('#paintCanvas').bounding_box()
        page.mouse.move(rect['x']+.5*rect['width'],rect['y']+.5*rect['height'])
        page.mouse.down();page.mouse.move(rect['x']+.51*rect['width'],rect['y']+.51*rect['height'],steps=5);page.mouse.up()
        assert canvas_pixel(page,'photoCanvas',480,320)[:3]==[24,152,90]
        page.locator('#clearBtn').click()
        assert alpha_count(page)==0
        assert canvas_pixel(page,'photoCanvas',160,320)[:3]==[24,152,90]
        print('PASS: eraser and Clear remove annotations but retain imported photograph')
        page.locator('#stampTool').click()
        page.locator('.stamp-choice').nth(2).click()
        page.locator('#brushSize').fill('30')
        tap_at(page,300,200)
        assert alpha_count(page)>100
        with page.expect_download(timeout=10000) as pending:page.locator('#exportBtn').click()
        target=Path(directory)/pending.value.suggested_filename
        pending.value.save_as(target)
        result=Image.open(target)
        assert result.size==(960,640)
        assert result.getpixel((160,320))[:3]==(24,152,90)
        assert result.getpixel((800,320))[:3]==(51,72,196)
        print('PASS: exported PNG contains imported photograph with vector stamp overlay')
        page.locator('#saveBtn').click()
        page.locator('#artworkName').fill('Photo with butterfly')
        page.locator('#saveForm button[type=submit]').click()
        page.wait_for_selector('.saved-card')
        assert len(page.evaluate('window.__dumpStorage()'))>=1
        page.locator('.template-item').nth(1).click()
        assert canvas_pixel(page,'photoCanvas',160,320)[3]==0
        page.locator('.saved-card-actions button').first.click()
        page.wait_for_function("document.querySelector('#photoCanvas').getContext('2d').getImageData(160,320,1,1).data[3] > 0")
        restored=canvas_pixel(page,'photoCanvas',800,320)[:3]
        assert all(abs(a-b)<=12 for a,b in zip(restored,[51,72,196])), restored
        assert alpha_count(page)>100
        print('PASS: imported photograph and colored stamps survive local Save/Open')
        # The source is always processed inside the browser and is not uploaded to a network endpoint.
        assert not errors,errors
        print('PASS: no uncaught JavaScript errors')
        for width in [320,375,390,768,1280]:
            page.set_viewport_size({'width':width,'height':880})
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), width
        print('PASS: phone/tablet/desktop widths without horizontal overflow')
        browser.close()

if __name__ == '__main__':run()