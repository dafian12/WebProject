const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');

let lastX = null, lastY = null;
let isDrawing = false;

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        await new Promise(resolve => videoElement.onloadedmetadata = resolve);
        videoElement.play();
        statusDiv.textContent = "Kamera berhasil terhubung, mendeteksi tangan...";
    } catch (error) {
        statusDiv.textContent = "Gagal mengakses kamera: " + error.message;
    }
}

setupCamera();

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(results => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexFinger = landmarks[8]; // Titik ujung jari telunjuk

        const x = indexFinger.x * canvasElement.width;
        const y = indexFinger.y * canvasElement.height;

        statusDiv.textContent = "Tangan terdeteksi! Menggambar...";

        if (lastX === null || lastY === null) {
            lastX = x;
            lastY = y;
            return; // Skip menggambar garis pertama kali
        }

        canvasCtx.beginPath();
        canvasCtx.moveTo(lastX, lastY);
        canvasCtx.lineTo(x, y);
        canvasCtx.strokeStyle = '#32cd32';
        canvasCtx.lineWidth = 3;
        canvasCtx.stroke();

        lastX = x;
        lastY = y;
        isDrawing = true;
    } else {
        statusDiv.textContent = "Tidak ada tangan terdeteksi. Arahkan tanganmu ke kamera.";
        isDrawing = false;
        lastX = null;
        lastY = null;
    }
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        try {
            await hands.send({image: videoElement});
        } catch (error) {
            console.error("Gagal mengirim frame ke MediaPipe:", error);
            statusDiv.textContent = "Error: " + error.message;
        }
    },
    width: 640,
    height: 480
});

camera.start();
