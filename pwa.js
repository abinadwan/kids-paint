/* Progressive enhancement: install guidance; Android native prompt; iOS home-screen steps. */
(() => {
  'use strict';
  const button = document.getElementById('installAppBtn');
  const dialog = document.getElementById('installDialog');
  const close = document.getElementById('closeInstallDialog');
  const readyLabel = document.getElementById('offlineReady');
  let deferredPrompt = null;

  function translate() {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
    document.querySelectorAll('[data-pwa-ar]').forEach(node => {
      node.textContent = lang === 'ar' ? node.dataset.pwaAr : node.dataset.pwaEn;
    });
  }
  translate();
  new MutationObserver(translate).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isInstalled()) button.hidden = true;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    button.hidden = true;
    if (dialog.open) dialog.close();
  });

  button.addEventListener('click', async () => {
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      deferredPrompt = null;
      try { await prompt.prompt(); await prompt.userChoice; }
      catch (_) { dialog.showModal(); }
    } else {
      dialog.showModal();
    }
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => { readyLabel.hidden = false; })
      .catch(error => console.warn('Offline installation unavailable:', error));
  }
})();