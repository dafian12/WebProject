const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

let player, enemy;
let difficulty = 'medium';
let round = 1;
let maxRounds = 3;
let playerWins = 0;
let enemyWins = 0;

class Character {
    constructor(x, y, color, sprite) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.color = color;
        this.health = 100;
        this.isAttacking = false;
        this.sprite = sprite;
        this.frameIndex = 0;
    }

    draw() {
        ctx.drawImage(this.sprite, this.frameIndex * 50, 0, 50, 100, this.x, this.y, this.width, this.height);
    }

    move(dx) {
        this.x += dx;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    attack(target) {
        if (Math.abs(this.x - target.x) < 70) {
            this.isAttacking = true;
            target.health -= 5;
            this.frameIndex = 1;
            setTimeout(() => this.frameIndex = 0, 300);
        }
    }
}

const playerSprite = new Image();
playerSprite.src = 'player_sprite.png';
const enemySprite = new Image();
enemySprite.src = 'enemy_sprite.png';

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    player = new Character(100, 300, 'blue', playerSprite);
    enemy = new Character(600, 300, 'red', enemySprite);
    player.health = 100;
    enemy.health = 100;
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawArena();

    player.draw();
    enemy.draw();

    if (player.health <= 0 || enemy.health <= 0) {
        if (player.health <= 0) enemyWins++;
        if (enemy.health <= 0) playerWins++;
        round++;

        if (round > maxRounds) {
            alert(playerWins > enemyWins ? 'Player Wins the Game!' : 'Enemy Wins the Game!');
            round = 1;
            playerWins = 0;
            enemyWins = 0;
        }

        startGame(difficulty);
        return;
    }

    moveEnemy();
    requestAnimationFrame(animate);
}

function drawArena() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Round: ${round} / ${maxRounds}`, 10, 30);
    ctx.fillText(`Player Wins: ${playerWins}`, 10, 60);
    ctx.fillText(`Enemy Wins: ${enemyWins}`, 10, 90);
}

function moveEnemy() {
    let speed;
    if (difficulty === 'easy') speed = 1;
    else if (difficulty === 'medium') speed = 2;
    else if (difficulty === 'hard') speed = 3;

    if (enemy.x > player.x) enemy.move(-speed);
    else enemy.move(speed);

    if (Math.random() < 0.01 * (speed + 1)) enemy.attack(player);
}

startGame('medium');
