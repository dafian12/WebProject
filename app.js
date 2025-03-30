const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logs = document.getElementById('logs');
let socket;

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

    logMessage(`Connecting to WebSocket...`);

    socket = new WebSocket(`ws://localhost:8000/ws`);

    socket.onopen = () => {
        logMessage('Connected to WebSocket server.');
        socket.send(JSON.stringify({
            action: 'start',
            address: address,
            port: port
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.log) {
            logMessage(data.log);
        }
    };

    socket.onerror = (error) => {
        logMessage(`WebSocket error: ${error.message}`);
    };

    socket.onclose = () => {
        logMessage('WebSocket connection closed.');
    };
});

stopBtn.addEventListener('click', () => {
    if (socket) {
        socket.send(JSON.stringify({ action: 'stop' }));
        socket.close();
    }
});
