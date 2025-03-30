let socket;
let isConnected = false;

function connectWebSocket() {
    socket = new WebSocket("ws://localhost:8000");

    socket.onopen = () => {
        console.log("Terhubung ke server!");
        isConnected = true;
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.log !== "keep-alive") {
            console.log("Log dari server:", data.log);
        }
    };

    socket.onclose = () => {
        console.log("Koneksi terputus. Mencoba menghubungkan kembali...");
        isConnected = false;
        setTimeout(connectWebSocket, 3000);  // Coba hubungkan lagi setelah 3 detik
    };

    socket.onerror = (error) => {
        console.error("Terjadi kesalahan:", error);
        socket.close();
    };
}

function startAttack(address, port) {
    if (isConnected && socket.readyState === WebSocket.OPEN) {
        const data = {
            action: "start",
            address: address,
            port: port
        };
        socket.send(JSON.stringify(data));
    } else {
        console.log("Tidak terhubung ke server!");
    }
}

function stopAttack() {
    if (isConnected && socket.readyState === WebSocket.OPEN) {
        const data = {
            action: "stop"
        };
        socket.send(JSON.stringify(data));
    } else {
        console.log("Tidak terhubung ke server!");
    }
}

connectWebSocket();
