// install.js

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  
  console.log('beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
  installBtn.style.display = 'none';
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const choiceResult = await deferredPrompt.userChoice;
  if (choiceResult.outcome === 'accepted') {
    console.log('✅ Użytkownik zaakceptował instalację');
  } else {
    console.log('❌ Użytkownik anulował instalację');
  }
  deferredPrompt = null;
});

