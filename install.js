// install.js

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // zapobiega automatycznemu pokazaniu monitu
  deferredPrompt = e;

  // Pokaż przycisk instalacji
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none';
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Użytkownik zaakceptował instalację');
      } else {
        console.log('❌ Użytkownik anulował instalację');
      }
      deferredPrompt = null;
    });
  });
});
