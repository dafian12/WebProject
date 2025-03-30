const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logs = document.getElementById('logs');
let interval;

function logMessage(message) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logs.appendChild(logEntry);
    logs.scrollTop = logs.scrollHeight;
}

startBtn.addEventListener('click', () => {
    const address = document.getElementById('serverAddress').value;
    const port = document.getElementById('serverPort').value;

    if (!address || !port) {
        logMessage('Please enter a valid server address and port.');
        return;
    }

    logMessage(`Starting stress test on ${address}:${port}...`);

    interval = setInterval(() => {
        logMessage(`Sending request to ${address}:${port}`);
    }, 1000);
});

stopBtn.addEventListener('click', () => {
    clearInterval(interval);
    logMessage('Stress test stopped.');
});
