let btnStart = document.querySelector('.btnStart');
let gameOverElement = document.getElementById('gameOverElement');
let container = document.getElementById('container');
let box = document.querySelector('.box');
let boxCenter = [box.offsetLeft + (box.offsetRight / 2), box.offsetTop + (box.offsetHeight / 2)];
console.log(boxCenter);
let player;
let animateGame;

let gamePlay = false;

btnStart.addEventListener('click', startGame);
container.addEventListener('click', mouseClicked);
container.addEventListener('mousemove', movePosition);

function movePosition(e){
    console.log(e);
    let mouseAngle = getDeg(e);
    console.log(mouseAngle);

}

function getDeg(e){
    let angle = Math.atan2(e.clientX-boxCenter[0], -(e.clientY - boxCenter[1]));
    return angle * (180 / Math.PI);
}

function mouseClicked(e){
    if(gamePlay = true){
        animateGame = requestAnimationFrame(playGame);
    }
}

function startGame(){
    gamePlay = true;
    gameOverElement.style.display = 'none';
    player = {
        score: 0,
        barwidth: 100,
        lives: 100
    }
    animateGame = requestAnimationFrame(playGame);
}

function playGame(){
    console.log('in play');
    animateGame = requestAnimationFrame(playGame);
}