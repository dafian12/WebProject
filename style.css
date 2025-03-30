// Inisialisasi Scene, Kamera, dan Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

// Variabel Permainan
let playerWeapon = 'sword';
let difficulty = 'easy';
let currentRound = 1;
let maxRounds = 3;
let playerHealth = 100;
let enemyHealth = 100;

function startGame() {
    document.getElementById('gameMenu').style.display = 'none';
    playerWeapon = document.getElementById('weaponSelect').value;
    difficulty = document.getElementById('difficultySelect').value;
    playerHealth = 100;
    enemyHealth = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
    currentRound = 1;
    alert(`Memulai permainan dengan ${playerWeapon} melawan musuh ${difficulty}`);
    animate();
}

function attack() {
    const damage = Math.floor(Math.random() * 20) + 5;
    enemyHealth -= damage;
    alert(`Kamu menyerang musuh dan memberikan ${damage} damage!`);

    if (enemyHealth <= 0) {
        currentRound++;
        if (currentRound > maxRounds) {
            alert('Kamu menang!');
            resetGame();
        } else {
            enemyHealth = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100;
            alert(`Ronde ${currentRound} dimulai!`);
        }
    } else {
        enemyAttack();
    }
}

function enemyAttack() {
    const damage = Math.floor(Math.random() * 15) + 5;
    playerHealth -= damage;
    alert(`Musuh menyerang kamu dan memberikan ${damage} damage!`);

    if (playerHealth <= 0) {
        alert('Kamu kalah!');
        resetGame();
    }
}

function resetGame() {
    document.getElementById('gameMenu').style.display = 'block';
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') attack();
});
