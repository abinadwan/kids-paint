"""In-memory Chromium regression for version label and update button.

Uses no real network: response metadata is mocked, and cancellation avoids a reload.
It verifies that read-only update checks do not alter artwork storage.
Run: python tests/update_ui_test.py
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def prepare(page):
    html = (ROOT / 'index.html').read_text('utf-8')
    html = re.sub(r'<link\b[^>]*>', '', html)
    html = re.sub(r'<script\b[^>]*></script>', '', html)
    html = html.replace('<head>', '<head><base href="https://abinadwan.github.io/kids-paint/">', 1)
    page.set_content(html)
    page.add_style_tag(content=(ROOT / 'style.css').read_text('utf-8'))
    page.evaluate("""() => {
      window.__servedVersion = '4.7.0';
      window.__failUpdateCheck = false;
      window.__requests = [];
      window.fetch = async (url, init) => {
        window.__requests.push({url: String(url), cache: init && init.cache});
        if (window.__failUpdateCheck) throw new Error('Connection unavailable');
        return {ok: true, json: async () => ({version: window.__servedVersion})};
      };
    }""")
    page.add_script_tag(content=(ROOT / 'pwa.js').read_text('utf-8'))

def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium',
                                      headless=True, args=['--no-sandbox'])
        for width in (320, 390, 768, 1280):
            page = browser.new_page(viewport={'width':width, 'height':850})
            problems = []
            page.on('pageerror', lambda error: problems.append(str(error)))
            prepare(page)
            assert page.locator('#appVersionLabel').inner_text() == '4.7.0'
            assert page.locator('#checkUpdateBtn').is_visible()
            page.locator('#checkUpdateBtn').click()
            page.wait_for_function("document.querySelector('#updateStatus').textContent.includes('4.7.0')")
            assert 'مُحدّث' in page.locator('#updateStatus').inner_text()
            assert page.evaluate('window.__requests[0].cache') == 'no-store'
            assert '/version.json?check=' in page.evaluate('window.__requests[0].url')
            page.evaluate("window.__servedVersion = '4.8.0'")
            page.once('dialog', lambda dialog: dialog.dismiss())
            page.locator('#checkUpdateBtn').click()
            page.wait_for_function("document.querySelector('#updateStatus').textContent.includes('لم يُطبّق')")
            assert page.locator('#appVersionLabel').inner_text() == '4.7.0'
            page.evaluate("window.__failUpdateCheck = true")
            page.locator('#checkUpdateBtn').click()
            page.wait_for_function("document.querySelector('#updateStatus').textContent.includes('تعذّر')")
            page.evaluate("document.documentElement.lang = 'en'")
            page.wait_for_function("document.querySelector('#updateStatus').textContent.includes('Could not')")
            assert 'Update app' in page.locator('#checkUpdateBtn').inner_text()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), width
            assert not problems, problems
            print('PASS: current version, newer version cancelled, offline retry, translations, layout', width)
            page.close()
        browser.close()

if __name__ == '__main__':
    run()
