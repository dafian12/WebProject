<!DOCTYPE html><html>
<head>
    <title>Object Detection App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        canvas {
            border: 2px solid #000;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection"></script>
</head>
<body>
    <h1>Object Detection App</h1>
    <video id="video" width="640" height="480" autoplay playsinline style="display:none;"></video>
    <canvas id="canvas" width="640" height="480"></canvas><script>
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    async function setupCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
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
        await setupCamera();
        video.play();

        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

        setInterval(() => detectPose(detector), 100);
    }

    main();
</script>

</body>
</html>
