const scanButton = document.getElementById('scanButton');
const clearButton = document.getElementById('clearButton');
const devicesList = document.getElementById('devicesList');
const autoRefresh = document.getElementById('autoRefresh');
const darkMode = document.getElementById('darkMode');
const loadingIndicator = document.getElementById('loading');
const searchBox = document.getElementById('searchBox');

let devices = new Map();
let autoRefreshInterval;

scanButton.addEventListener('click', scanDevices);

clearButton.addEventListener('click', () => {
  devices.clear();
  renderDeviceList();
});

darkMode.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkMode.checked);
  renderDeviceList();
});

autoRefresh.addEventListener('change', () => {
  if (autoRefresh.checked) {
    autoRefreshInterval = setInterval(scanDevices, 10000);
  } else {
    clearInterval(autoRefreshInterval);
  }
});

searchBox.addEventListener('input', renderDeviceList);

async function scanDevices() {
  loadingIndicator.style.display = 'block';
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true
    });
    const currentTime = new Date().toLocaleTimeString();
    devices.set(device.id, { name: device.name || 'Unknown', time: currentTime });
    renderDeviceList();
  } catch (error) {
    alert('Error: ' + error.message);
  }
  loadingIndicator.style.display = 'none';
}

function renderDeviceList() {
  devicesList.innerHTML = '';
  const searchTerm = searchBox.value.toLowerCase();

  devices.forEach((device, id) => {
    if (device.name.toLowerCase().includes(searchTerm)) {
      const listItem = document.createElement('li');
      listItem.className = darkMode.checked ? 'dark' : '';
      listItem.innerHTML = `
        <div>
          <strong>Name:</strong> ${device.name} <br>
          <strong>ID:</strong> ${id} <br>
          <strong>Detected at:</strong> ${device.time}
        </div>
        <button onclick="removeDevice('${id}')">Remove</button>
      `;
      devicesList.appendChild(listItem);
    }
  });
}

function removeDevice(id) {
  devices.delete(id);
  renderDeviceList();
}
