const video = document.getElementById('video'); const canvas = document.getElementById('canvas'); const context = canvas.getContext('2d');

async function setupCamera() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); video.srcObject = stream; return new Promise(resolve => { video.onloadedmetadata = () => { resolve(video); }; }); } catch (error) { alert('Error accessing camera: ' + error.message); console.error('Error accessing camera:', error); } }

async function detectObjects(model) { if (!video.srcObject) return;

context.drawImage(video, 0, 0, canvas.width, canvas.height);

const predictions = await model.detect(video);

predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 4; // Lebih kecil dari sebelumnya

    // Draw smaller circle
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.stroke();

    // Draw label
    context.font = '18px Arial';
    context.fillStyle = 'red';
    context.fillText(
        `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
        x,
        y > 10 ? y - 5 : 10
    );
});

}

async function main() { await setupCamera(); if (!video.srcObject) return;

video.play();

const model = await cocoSsd.load();
console.log('Model loaded.');

setInterval(() => detectObjects(model), 100);

}

main();

