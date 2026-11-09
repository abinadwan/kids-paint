/* Kids Paint PWA v4.3.0: install + safe, on-demand application update checks. */
(() => {
  'use strict';
  const button = document.getElementById('installAppBtn');
  const dialog = document.getElementById('installDialog');
  const closeButton = document.getElementById('closeInstallDialog');
  const readyLabel = document.getElementById('offlineReady');
  const updateButton = document.getElementById('checkUpdateBtn');
  const updateStatus = document.getElementById('updateStatus');
  const localVersion = document.querySelector('meta[name="app-version"]')?.content || '4.3.0';
  let deferredPrompt = null;
  let checkingUpdate = false;

  const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const devicePlatform = () => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'desktop';
  };
  function translate() {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
    document.querySelectorAll('[data-pwa-ar]').forEach(node => {
      node.textContent = lang === 'ar' ? node.dataset.pwaAr : node.dataset.pwaEn;
    });
  }
  function updateMessage(ar, en) {
    updateStatus.dataset.pwaAr = ar;
    updateStatus.dataset.pwaEn = en;
    translate();
  }
  translate();
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if (isInstalled()) {
    button.hidden = true;
    button.closest('.footer-install').hidden = true;
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    button.hidden = true;
    button.closest('.footer-install').hidden = true;
    if (dialog.open) dialog.close();
  });

  function openInstructions() {
    if (isInstalled()) return;
    const platform = devicePlatform();
    document.querySelectorAll('[data-install-platform]').forEach(node => {
      node.hidden = node.dataset.installPlatform !== platform;
    });
    translate();
    if (!dialog.open) dialog.showModal();
  }

  button.addEventListener('click', async () => {
    if (isInstalled()) return;
    if (deferredPrompt) {
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      try {
        // Native browser confirmation is required; installation is never silent.
        await promptEvent.prompt();
        const decision = await promptEvent.userChoice;
        if (decision?.outcome === 'accepted') button.disabled = true;
      } catch (error) {
        console.warn('Native install prompt unavailable:', error);
        openInstructions();
      }
    } else {
      openInstructions();
    }
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  // Latest-version metadata comes from the site itself; a cache-busting query
  // and no-store policy allow checking even when the PWA runs under an old SW.
  updateButton.addEventListener('click', async () => {
    if (checkingUpdate) return;
    checkingUpdate = true;
    updateButton.disabled = true;
    updateMessage('جارٍ التحقق من التحديثات…', 'Checking for updates…');
    try {
      const checkURL = new URL('./version.json', document.baseURI);
      checkURL.searchParams.set('check', String(Date.now()));
      const response = await fetch(checkURL.href, { cache: 'no-store' });
      if (!response.ok) throw new Error('Version service unavailable: ' + response.status);
      const payload = await response.json();
      const available = typeof payload.version === 'string' ? payload.version.trim() : '';
      if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i.test(available)) {
        throw new Error('Invalid version metadata');
      }
      if (available === localVersion) {
        updateMessage('التطبيق مُحدّث بالفعل (الإصدار ' + localVersion + ').', 'You have the latest version (' + localVersion + ').');
        return;
      }
      updateMessage('تحديث ' + available + ' متاح.', 'Update ' + available + ' is available.');
      // Never discard an unsaved canvas without explicit user confirmation.
      const confirmed = window.confirm(document.documentElement.lang === 'en'
        ? 'Version ' + available + ' is available. Save your current drawing first: updating reloads the app and loses unsaved changes. Update now?'
        : 'الإصدار ' + available + ' متاح. احفظ رسمتك أولًا: التحديث يعيد تشغيل التطبيق وقد تفقد التعديلات غير المحفوظة. هل تريد التحديث الآن؟');
      if (!confirmed) {
        updateMessage('لم يُطبّق التحديث. احفظ رسمتك، ثم اضغط «تحديث التطبيق» لاحقًا.', 'Update postponed. Save your drawing, then tap Update app when ready.');
        return;
      }
      updateMessage('جارٍ تجهيز الإصدار ' + available + ' وإعادة فتح التطبيق…', 'Preparing version ' + available + ' and reopening the app…');
      if ('serviceWorker' in navigator && window.isSecureContext) {
        const registration = await navigator.serviceWorker.getRegistration('./');
        if (registration) {
          await registration.update();
          const worker = registration.installing || registration.waiting;
          if (worker && worker.state !== 'activated' && worker.state !== 'redundant') {
            await new Promise(resolve => {
              let settled = false;
              const finish = () => { if (!settled) { settled = true; resolve(); } };
              worker.addEventListener('statechange', () => {
                if (worker.state === 'activated' || worker.state === 'redundant') finish();
              });
              setTimeout(finish, 6000);
            });
          }
        }
      }
      window.location.reload();
    } catch (error) {
      console.warn('Kids Paint update check:', error);
      updateMessage('تعذّر التحقق من التحديث الآن. تأكد من الاتصال وحاول مجددًا.', 'Could not check for updates. Check your connection and retry.');
    } finally {
      checkingUpdate = false;
      updateButton.disabled = false;
    }
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => { readyLabel.hidden = false; })
      .catch(error => console.warn('Offline installation unavailable:', error));
  }
})();