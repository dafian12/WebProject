const video = document.getElementById('video'); const canvas = document.getElementById('canvas'); const context = canvas.getContext('2d');

async function setupCamera() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); video.srcObject = stream; return new Promise(resolve => { video.onloadedmetadata = () => { resolve(video); }; }); } catch (error) { alert('Error accessing camera: ' + error.message); console.error('Error accessing camera:', error); } }

async function detectPose(model) { if (!video.srcObject) return;

context.drawImage(video, 0, 0, canvas.width, canvas.height);

const poses = await model.estimatePoses(video, {
    flipHorizontal: false
});

poses.forEach(pose => {
    pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            context.beginPath();
            context.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
            context.fillStyle = 'lime';
            context.fill();
        }
    });

    const skeleton = [
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
        [5, 11], [6, 12], [11, 12], [11, 13], [13, 15],
        [12, 14], [14, 16]
    ];

    context.strokeStyle = 'lime';
    context.lineWidth = 2;

    skeleton.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i];
        const kp2 = pose.keypoints[j];

        if (kp1.score > 0.5 && kp2.score > 0.5) {
            context.beginPath();
            context.moveTo(kp1.x, kp1.y);
            context.lineTo(kp2.x, kp2.y);
            context.stroke();
        }
    });
});

}

async function main() { await setupCamera(); if (!video.srcObject) return;

video.play();

const model = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4', { fromTFHub: true });
console.log('PoseNet Model loaded.');

setInterval(() => detectPose(model), 100);

}

main();

