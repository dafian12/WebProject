const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const cameraSelect = document.getElementById('cameraSelect');

async function setupCamera(deviceId = null) {
    const constraints = {
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user", // Ganti dengan "environment" untuk kamera belakang
            deviceId: deviceId ? { exact: deviceId } : undefined
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    cameraSelect.innerHTML = '';
    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
    });
}

async function detectPose(detector) {
    if (!video.srcObject) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const poses = await detector.estimatePoses(video);

    context.clearRect(0, 0, canvas.width, canvas.height);

    poses.forEach(pose => {
        const keypoints = pose.keypoints;
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 6], [6, 8], [9, 10], [10, 12],
            [13, 14], [14, 16], [17, 18], [18, 20],
            [5, 11], [6, 12], [11, 12], [11, 13],
            [13, 15], [12, 14], [14, 16]
        ];

        context.strokeStyle = 'lime';
        context.lineWidth = 2;

        connections.forEach(([i, j]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            if (kp1.score > 0.5 && kp2.score > 0.5) {
                context.beginPath();
                context.moveTo(kp1.x, kp1.y);
                context.lineTo(kp2.x, kp2.y);
                context.stroke();
            }
        });
    });
}

async function main() {
    await getCameras();
    await setupCamera();
    video.play();

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

    setInterval(() => detectPose(detector), 100);
}

cameraSelect.addEventListener('change', async () => {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    await setupCamera(cameraSelect.value);
    video.play();
});

main();
