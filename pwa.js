/* Progressive PWA installation: native Chromium prompt; compact bottom-sheet fallback for iOS. */
(() => {
  'use strict';
  const button = document.getElementById('installAppBtn');
  const dialog = document.getElementById('installDialog');
  const closeButton = document.getElementById('closeInstallDialog');
  const readyLabel = document.getElementById('offlineReady');
  let deferredPrompt = null;

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
        // Trigger the native prompt inside the user gesture; consent is still required.
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

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => { readyLabel.hidden = false; })
      .catch(error => console.warn('Offline installation unavailable:', error));
  }
})();