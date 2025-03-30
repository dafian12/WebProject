const serverAddressInput = document.getElementById("serverAddress");
const serverPortInput = document.getElementById("serverPort");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const logArea = document.getElementById("logArea");

let socket;

function addLog(message) {
    logArea.value += message + "\n";
    logArea.scrollTop = logArea.scrollHeight;
}

startButton.addEventListener("click", () => {
    const serverAddress = serverAddressInput.value.trim();
    const serverPort = serverPortInput.value.trim();

    if (!serverAddress || !serverPort) {
        alert("Mohon isi alamat server dan port.");
        return;
    }

    if (socket) {
        socket.close();
    }

    socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => {
        addLog("Terhubung ke server backend.");
        socket.send(JSON.stringify({
            action: "start",
            address: serverAddress,
            port: serverPort
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.log) {
            addLog(data.log);
        }
    };

    socket.onclose = () => {
        addLog("Koneksi terputus dari server backend.");
    };

    socket.onerror = (error) => {
        addLog("Terjadi kesalahan: " + error.message);
    };
});

stopButton.addEventListener("click", () => {
    if (socket) {
        socket.send(JSON.stringify({ action: "stop" }));
        socket.close();
        addLog("Serangan dihentikan.");
    }
});
