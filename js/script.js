const icons = ["assets/BallOne.png", "assets/BallTwo.png", "assets/pngwing.com.png", "assets/Satelite.png", "assets/enemy.png", "assets/EnemyTwo.png", "assets/Scary.png"];
const btnStart = document.querySelector('.btnStart');
const btnPause = document.querySelector('.btnPause');
const pauseText = document.getElementById('pauseText');
const gameOverEle = document.getElementById('gameOverElement');
const container = document.getElementById('container');
const box = document.querySelector('.box');
const scoreDash = document.querySelector('.scoreDash');
const progressbar = document.querySelector('.progress-bar');
const backgroundEffect = document.getElementById('backgroundEffect');
const backgroundMusic = document.getElementById('backgroundMusic');
const shootSound = document.getElementById('shootSound');
const explosionSound = document.getElementById('explosionSound');
const collisionSound = document.getElementById('collisionSound');

let info = document.getElementById('info');
let gamePlayArea = document.getElementById('gamePlayArea');
let dashboard = document.getElementById('dashBoard');
const boxCenter = [box.offsetLeft + (box.offsetWidth / 2), box.offsetTop + (box.offsetHeight / 2)];

let gamePlay = false;
let gamePaused = false; // Track if the game is paused
let player;
let animateGame;
let minEnemySpeed = 0.3;
let maxEnemySpeed = 2.9;
let enemySpeedIncrement = 0.1;
let lastScore = 0;

let minEnemies = 5; // Minimum number of enemies
let maxEnemies = 15; // Maximum number of enemies
let enemyIncrement = 1; // Number of enemies to increment
let numEnemies = minEnemies;

let enemySpeed = minEnemySpeed;
let enemySpawnInterval = 2000; // Initial interval for enemy spawn in milliseconds
let spawnTimer;

btnStart.addEventListener('click', startGame);
btnPause.addEventListener('click', togglePause); // Add event listener to pause button
container.addEventListener('mousedown', mouseDown);
container.addEventListener('mousemove', movePosition);

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        togglePause(); // Call the togglePause function when spacebar is pressed
    }
});

backgroundEffect.play();

function startGame() {
    gamePlay = true;
    gameOverEle.style.display = 'none';
    info.style.display = 'block';
    document.querySelector('.turet').style.display = 'block'; // Show the turret when the game starts
    box.style.display = 'block'; // Show the box when the game starts
    player = {
        score: 0,
        barwidth: 100,
        lives: 100
    }
    lastScore = 0;
    minEnemySpeed = 0.6;
    enemySpeed = minEnemySpeed;
    enemySpawnInterval = 2000;
    clearInterval(spawnTimer);
    setupBadguys(numEnemies);
    moveEnemy(); // Start moving enemies immediately
    spawnEnemies();
    spawnTimer = setInterval(spawnEnemies, enemySpawnInterval); // Start the enemy spawn interval
    animateGame = requestAnimationFrame(playGame);

    // Stop the background effect and start the game music
    backgroundEffect.pause();
    backgroundEffect.currentTime = 0; // Reset the effect to the beginning
    backgroundMusic.play();
}

function togglePause() {
    if (gamePlay) {
        if (!gamePaused) {
            // Pause the game
            cancelAnimationFrame(animateGame);
            clearInterval(spawnTimer);
            backgroundMusic.pause();
            gamePaused = true;
            pauseText.style.display = 'block';
            btnPause.innerHTML = '<i class="fas fa-play"></i>'; // Change icon to play
        } else {
            // Resume the game
            animateGame = requestAnimationFrame(playGame);
            spawnTimer = setInterval(spawnEnemies, enemySpawnInterval);
            backgroundMusic.play();
            gamePaused = false;
            pauseText.style.display = 'none';
            btnPause.innerHTML = '<i class="fas fa-pause"></i>'; // Change icon to pause
        }
    }
}

function playGame() {
    if (gamePlay && !gamePaused) {
        moveShots();
        updateDash();
        moveEnemy(); // Move the enemies continuously
        animateGame = requestAnimationFrame(playGame);
    }
}

function movePosition(e) {
    let deg = getDeg(e);
    box.style.webkitTransform = 'rotate(' + deg + 'deg)';
    box.style.mozTransform = 'rotate(' + deg + 'deg)';
    box.style.msTransform = 'rotate(' + deg + 'deg)';
    box.style.oTransform = 'rotate(' + deg + 'deg)';
    box.style.transform = 'rotate(' + deg + 'deg)';
}

function moveEnemy() {
    let tempEnemy = document.querySelectorAll('.baddy');
    let hitter = false;
    let tempShots = document.querySelectorAll('.fireme');

    for (let enemy of tempEnemy) {
        if (enemy.offsetTop > 550 || enemy.offsetTop < 0 || enemy.offsetLeft > 750 || enemy.offsetLeft < 0) {
            enemy.parentNode.removeChild(enemy);
            badmaker();
        } else {
            // Move enemies towards the turret
            let angleToTurret = Math.atan2(boxCenter[1] - enemy.offsetTop, boxCenter[0] - enemy.offsetLeft);
            enemy.moverx = Math.cos(angleToTurret) * enemySpeed;
            enemy.movery = Math.sin(angleToTurret) * enemySpeed;

            enemy.style.top = enemy.offsetTop + enemy.movery + 'px';
            enemy.style.left = enemy.offsetLeft + enemy.moverx + 'px';

            for (let shot of tempShots) {
                if (isCollide(shot, enemy) && gamePlay) {
                    player.score += enemy.points;
                    createExplosion(enemy.offsetLeft, enemy.offsetTop);
                    explosionSound.currentTime = 0; // Reset the sound to the beginning
                    explosionSound.play(); // Play explosion sound effect
                    enemy.parentNode.removeChild(enemy);
                    shot.parentNode.removeChild(shot);
                    updateDash();
                    badmaker();
                    break;
                }
            }
        }

        if (isCollide(box, enemy)) {
            hitter = true;
            enemy.parentNode.removeChild(enemy); // Remove the enemy when it touches the turret
            player.lives -= 5; // Decrease lives more aggressively
            collisionSound.currentTime = 0; // Reset the sound to the beginning
            collisionSound.play(); // Play collision sound effect
            gamePlayArea.classList.add('blink-red');
            dashboard.classList.add('blink-red');
            setTimeout(() => {
                gamePlayArea.classList.remove('blink-red');
                dashboard.classList.remove('blink-red');
            }, 500); // Remove the class after the blinking effect
            if (player.lives < 0) {
                gameOver();
            }
            updateDash(); // Update the dashboard to reflect the change in lives
        }
    }

    if (hitter) {
        box.style.backgroundColor = 'red';
        hitter = false;
    } else {
        box.style.backgroundColor = '';
    }

    if (player.score > lastScore) {
        lastScore = player.score;
        if (enemySpeed < maxEnemySpeed) {
            enemySpeed += enemySpeedIncrement; // Increase speed by the increment value
        }
        // Gradually decrease the enemy spawn interval
        if (enemySpawnInterval > 100) { // Minimum spawn interval to avoid excessive spawning
            enemySpawnInterval = Math.max(50, 2000 - player.score * 20); // Adjust the formula as needed
            clearInterval(spawnTimer);
            spawnTimer = setInterval(spawnEnemies, enemySpawnInterval);
        }
    }
}

function createExplosion(x, y) {
    let explosion = document.createElement('div');
    explosion.setAttribute('class', 'explosion');
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    container.appendChild(explosion);

    setTimeout(() => {
        explosion.parentNode.removeChild(explosion);
    }, 500); // Remove the explosion after the animation is complete
}

function gameOver() {
    cancelAnimationFrame(animateGame);
    clearInterval(spawnTimer); // Clear the spawn interval
    gameOverEle.style.display = 'block';
    document.querySelector('.turet').style.display = 'none';
    document.querySelector('.box').style.display = 'none';
    gameOverEle.querySelector('span').innerHTML = 'GAME OVER<br>Your Score: ' + player.score + '<br>';
    updateHighScore(player.score); // Update high score
    gamePlay = false;
    gamePaused = false; // Reset pause state
    backgroundMusic.pause(); // Pause the background music
    backgroundMusic.currentTime = 0; // Reset the music to the beginning
    backgroundEffect.play(); // Resume the background effect
    clearGameArea(); // Clear all enemies and shots
}

function updateHighScore(score) {
    let highScore = localStorage.getItem('highScore');
    if (!highScore || score > highScore) {
        localStorage.setItem('highScore', score);
        gameOverEle.querySelector('span').innerHTML += 'New High Score: ' + score;
    } else {
        gameOverEle.querySelector('span').innerHTML += 'High Score: ' + highScore;
    }
}

function updateDash() {
    scoreDash.innerHTML = player.score;
    let tempPer = (player.lives / player.barwidth) * 100 + '%';
    progressbar.style.width = tempPer;
}

function isCollide(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !(
        (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right)
    );
}

function getDeg(e) {
    let angle = Math.atan2(e.clientX - boxCenter[0], -(e.clientY - boxCenter[1]));
    return angle * (180 / Math.PI);
}

function degRad(deg) {
    return deg * (Math.PI / 180);
}

function mouseDown(e) {
    if (gamePlay && !gamePaused) { // Check if the game is not paused
        let div = document.createElement('div');
        let deg = getDeg(e);
        div.setAttribute('class', 'fireme');
        div.moverx = 10 * Math.sin(degRad(deg)); // Increase the speed here
        div.movery = -10 * Math.cos(degRad(deg)); // Increase the speed here
        div.style.left = (boxCenter[0] - 5) + 'px';
        div.style.top = (boxCenter[1] - 5) + 'px';
        div.style.width = 10 + 'px';
        div.style.height = 10 + 'px';
        container.appendChild(div);

        // Play shooting sound effect
        shootSound.currentTime = 0; // Reset the sound to the beginning
        shootSound.play();

        info.style.display = 'none';
    }
}

function setupBadguys(num) {
    let currentEnemies = document.querySelectorAll('.baddy').length;
    for (let x = 0; x < num - currentEnemies; x++) {
        badmaker();
    }
}

function randomMe(num) {
    return Math.floor(Math.random() * num);
}

function badmaker() {
    let div = document.createElement('div');
    let myIcon = icons[randomMe(icons.length)];
    let x, y;

    // Generate a random position on the border of the container
    let edge = Math.floor(Math.random() * 4);
    let posX = Math.random() * container.offsetWidth;
    let posY = Math.random() * container.offsetHeight;

    switch (edge) {
        case 0: // Top edge
            x = posX;
            y = 0;
            break;
        case 1: // Right edge
            x = container.offsetWidth;
            y = posY;
            break;
        case 2: // Bottom edge
            x = posX;
            y = container.offsetHeight;
            break;
        case 3: // Left edge
            x = 0;
            y = posY;
            break;
    }

    div.style.backgroundImage = `url(${myIcon})`;
    div.style.backgroundSize = 'cover';
    div.setAttribute('class', 'baddy');
    div.style.width = '105px'; // Set the width of the enemy
    div.style.height = '105px'; // Set the height of the enemy
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.points = randomMe(5) + 1;
    div.moverx = 0; // Initialize movement to zero
    div.movery = 0; // Initialize movement to zero
    container.appendChild(div);
}

function moveShots() {
    let tempShots = document.querySelectorAll('.fireme');
    for (let shot of tempShots) {
        if (shot.offsetTop > 600 || shot.offsetTop < 0 || shot.offsetLeft > 800 || shot.offsetLeft < 0) {
            shot.parentNode.removeChild(shot);
        } else {
            shot.style.top = shot.offsetTop + shot.movery + 'px';
            shot.style.left = shot.offsetLeft + shot.moverx + 'px';
        }
    }
}

function spawnEnemies() {
    let currentEnemies = document.querySelectorAll('.baddy').length;
    if (currentEnemies < numEnemies) {
        setupBadguys(numEnemies - currentEnemies);
    }
}

function clearGameArea() {
    let tempEnemy = document.querySelectorAll('.baddy');
    for (let enemy of tempEnemy) {
        enemy.parentNode.removeChild(enemy);
    }
    let tempShots = document.querySelectorAll('.fireme');
    for (let shot of tempShots) {
        shot.parentNode.removeChild(shot);
    }
}
