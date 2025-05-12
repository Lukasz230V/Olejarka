const SERVICE_UUID = 0xee99;
const CHAR_UUIDS = {
  value1: 0x00f1,  // UUID dla Wartości 1
  value2: 0x00f2,  // UUID dla Wartości 2
  value3: 0x00f3,   // UUID dla Wartości 3
  vent:   0x00f4    // Odpowietrzanie
};

let device = null;
let server = null;
let characteristics = {};
let isConnected = false;

async function connectOrDisconnect() {
  if (isConnected && device && device.gatt.connected) {
    device.gatt.disconnect();
    updateStatus('Rozłączono');
    toggleInputs(false);
    document.getElementById('connect').textContent = 'Połącz z OLEJARKA';
    isConnected = false;
    return;
  }

  try {
    updateStatus('Łączenie z urządzeniem...');

    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'OLEJARKA' }],
      optionalServices: [SERVICE_UUID]
    });

    server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);

    // Odczytujemy wszystkie charakterystyki
    for (const [key, uuid] of Object.entries(CHAR_UUIDS)) {
      try {
        // Sprawdzamy, czy urządzenie zwraca charakterystykę
        const char = await service.getCharacteristic(uuid);
        characteristics[key] = char;
        
if (key !== 'vent') {
  const value = await char.readValue();
  const num = value.getUint16(0, true);
  const inputElement = document.getElementById(key);
  if (inputElement) {
    inputElement.value = num;
  }
}

      } catch (charErr) {
        console.error(`Błąd odczytu charakterystyki ${uuid}:`, charErr);
        updateStatus('Błąd odczytu danych');
      }
    }

    // Uaktywniamy przyciski i pola po połączeniu
    updateStatus(`Połączono z ${device.name || 'OLEJARKA'}`);
    toggleInputs(true);
    document.getElementById('connect').textContent = 'Rozłącz';
    isConnected = true;
  } catch (err) {
    updateStatus('Błąd połączenia: ' + err);
    console.error('Błąd połączenia:', err);
  }
}

function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

function toggleInputs(enabled) {
  document.querySelectorAll('input').forEach(inp => inp.disabled = !enabled);
  document.getElementById('sendValues').disabled = !enabled;
   document.getElementById('ventButton').disabled = !enabled;
}

async function sendValues() {
  try {
    for (const [key, char] of Object.entries(characteristics)) {
      const inputValue = parseInt(document.getElementById(key).value);
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, inputValue, true);
      await char.writeValue(buffer);
    }
    updateStatus('Wysłano wartości do urządzenia');
  } catch (err) {
    updateStatus('Błąd podczas wysyłania: ' + err);
    console.error(err);
  }
}

const ventButton = document.getElementById('ventButton');
let ventInterval;

function sendVentValue(value) {
  const char = characteristics['vent'];
  if (!char) return;

  const buffer = new ArrayBuffer(1);
  const view = new DataView(buffer);
  view.setUint8(0, value);

  char.writeValue(buffer).catch(err => {
    console.error('Błąd wysyłania do vent:', err);
    updateStatus('Błąd odpowietrzania');
  });
}

if (ventButton) {
  // Wciśnięcie przycisku – start
  ventButton.addEventListener('mousedown', () => {
    sendVentValue(1);
    ventInterval = setInterval(() => sendVentValue(1), 500);
  });

  // Zwolnienie przycisku – stop
  document.addEventListener('mouseup', () => {
    clearInterval(ventInterval);
    sendVentValue(0);
  });

  // Obsługa dotyku dla urządzeń mobilnych
  ventButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // zapobiega przypadkowym kliknięciom
    sendVentValue(1);
    ventInterval = setInterval(() => sendVentValue(1), 500);
  });

  document.addEventListener('touchend', () => {
    clearInterval(ventInterval);
    sendVentValue(0);
  });
}

document.getElementById('connect').addEventListener('click', connectOrDisconnect);
document.getElementById('sendValues').addEventListener('click', sendValues);
