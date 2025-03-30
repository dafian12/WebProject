// Inisialisasi Scene, Kamera, dan Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tambahkan Pencahayaan
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Buat Lantai
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x008000 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Buat Karakter (Kubus)
const characterGeometry = new THREE.BoxGeometry(1, 1, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 0.5;
scene.add(character);

// Posisi Kamera
camera.position.set(0, 5, 10);
camera.lookAt(character.position);

// Kontrol Pergerakan Karakter
const keys = {};
document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);

let touchX = null;
let touchY = null;

document.addEventListener('touchstart', (event) => {
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
});

document.addEventListener('touchmove', (event) => {
    if (!touchX || !touchY) return;

    let deltaX = event.touches[0].clientX - touchX;
    let deltaY = event.touches[0].clientY - touchY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) keys['d'] = true; // Gerak Kanan
        else keys['a'] = true; // Gerak Kiri
    } else {
        if (deltaY > 0) keys['s'] = true; // Mundur
        else keys['w'] = true; // Maju
    }

    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
});

document.addEventListener('touchend', () => {
    keys['w'] = false;
    keys['s'] = false;
    keys['a'] = false;
    keys['d'] = false;
    touchX = null;
    touchY = null;
});

function moveCharacter() {
    const speed = 0.1;

    if (keys['w'] || keys['ArrowUp']) character.position.z -= speed;
    if (keys['s'] || keys['ArrowDown']) character.position.z += speed;
    if (keys['a'] || keys['ArrowLeft']) character.position.x -= speed;
    if (keys['d'] || keys['ArrowRight']) character.position.x += speed;

    camera.position.set(character.position.x, character.position.y + 5, character.position.z + 10);
    camera.lookAt(character.position);
}

function animate() {
    requestAnimationFrame(animate);
    moveCharacter();
    renderer.render(scene, camera);
}

animate();
