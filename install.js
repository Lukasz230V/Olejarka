// install.js

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Blokuje automatyczne wyświetlenie prompta
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('✅ Użytkownik zaakceptował instalację');
        } else {
          console.log('❌ Użytkownik anulował instalację');
        }
        deferredPrompt = null;
      });
    });
  }
});
