const icons = ["bars", "bug", "bowling-ball", "coffee", "couch", "football-ball", "gem", "laptop"];
const btnStart = document.querySelector('.btnStart');
const gameOverEle = document.getElementById('gameOverElement');
const container = document.getElementById('container');
const box = document.querySelector('.box');
const base = document.querySelector('.base');
const scoreDash = document.querySelector('.scoreDash');
const progressbar = document.querySelector('.progress-bar');
const boxCenter = [box.offsetLeft + (box.offsetWidth / 2), box.offsetTop + (box.offsetHeight / 2)];
let gamePlay = false;
let player;
let animateGame;
let minEnemySpeed = 0.5; 
let maxEnemySpeed = 3.0;
let enemySpeedIncrement = 0.1;
let lastScore = 0; 

let minEnemies = 5; // Minimum number of enemies
let maxEnemies = 15; // Maximum number of enemies
let enemyIncrement = 1; // Number of enemies to increment// To keep track of the last score
let numEnemies = minEnemies;

let enemySpeed = minEnemySpeed; 
btnStart.addEventListener('click', startGame);
container.addEventListener('mousedown', mouseDown);
container.addEventListener('mousemove', movePosition);

function startGame() {
    gamePlay = true;
    gameOverEle.style.display = 'none';
    player = {
        score: 0,
        barwidth: 500,
        lives: 500
    }
    setupBadguys(numEnemies);
    animateGame = requestAnimationFrame(playGame);
}

function playGame() {
    if (gamePlay) {
        moveShots();
        updateDash();
        moveEnemy();
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
            enemy.style.top = enemy.offsetTop + enemy.movery * enemySpeed + 'px'; // Adjust speed based on enemySpeed
            enemy.style.left = enemy.offsetLeft + enemy.moverx * enemySpeed + 'px'; // Adjust speed based on enemySpeed

            for (let shot of tempShots) {
                if (isCollide(shot, enemy) && gamePlay) {
                    player.score += enemy.points;
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
            player.lives--;
            if (player.lives < 0) {
                gameOver();
            }
        }
    }

    if (hitter) {
        base.style.backgroundColor = 'red';
        hitter = false;
    } else {
        base.style.backgroundColor = '';
    }

    if (player.score > lastScore) {
        lastScore = player.score;
        if (enemySpeed < maxEnemySpeed) {
            enemySpeed += enemySpeedIncrement; // Increase speed by the increment value
        }
    }
}

function gameOver() {
    cancelAnimationFrame(animateGame);
    gameOverEle.style.display = 'block';
    gameOverEle.querySelector('span').innerHTML = 'GAME OVER<br>Your Score ' + player.score;
    gamePlay = false;
    let tempEnemy = document.querySelectorAll('.baddy');
    for (let enemy of tempEnemy) {
        enemy.parentNode.removeChild(enemy);
    }
    let tempShots = document.querySelectorAll('.fireme');
    for (let shot of tempShots) {
        shot.parentNode.removeChild(shot);
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
        (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right))
}

function getDeg(e) {
    let angle = Math.atan2(e.clientX - boxCenter[0], -(e.clientY - boxCenter[1]));
    return angle * (180 / Math.PI);
}

function degRad(deg) {
    return deg * (Math.PI / 180);
}

function mouseDown(e) {
    if (gamePlay) {
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
    }
}

function setupBadguys(num) {
    for (let x = 0; x < num; x++) {
        badmaker();
    }
}

function randomMe(num) {
    return Math.floor(Math.random() * num);
}

function badmaker() {
    let div = document.createElement('div');
    let myIcon = 'fa-' + icons[randomMe(icons.length)];
    let x, y, xmove, ymove;

    // Adjustments to spawn enemies from any side of the container
    let edge = Math.floor(Math.random() * 4);
    let pos = Math.random() * (edge % 2 === 0 ? container.offsetWidth : container.offsetHeight);
    if (edge === 0) { // Top edge
        x = pos;
        y = 0;
        xmove = (Math.random() * 2 - 1) * 2; // random -2 to 2
        ymove = 2;
    } else if (edge === 1) { // Right edge
        x = container.offsetWidth;
        y = pos;
        xmove = -2;
        ymove = (Math.random() * 2 - 1) * 2; // random -2 to 2
    } else if (edge === 2) { // Bottom edge
        x = pos;
        y = container.offsetHeight;
        xmove = (Math.random() * 2 - 1) * 2; // random -2 to 2
        ymove = -2;
    } else { // Left edge
        x = 0;
        y = pos;
        xmove = 2;
        ymove = (Math.random() * 2 - 1) * 2; // random -2 to 2
    }

    div.style.color = randomColor();
    div.innerHTML = '<i class="fas ' + myIcon + '"></i>';
    div.setAttribute('class', 'baddy');
    div.style.fontSize = randomMe(20) + 30 + 'px';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.points = randomMe(5) + 1;
    div.moverx = xmove;
    div.movery = ymove;
    container.appendChild(div);
}

function randomColor() {
    function c() {
        let hex = randomMe(256).toString(16);
        return ('0' + String(hex)).substr(-2);
    }
    return '#' + c() + c() + c();
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
