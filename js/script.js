let btnStart = document.querySelector('.btnStart');
let gameOverElement = document.getElementById('gameOverElement');
let container = document.getElementById('container');
let player;
let animateGame;

let gamePlay = false;

btnStart.addEventListener('click', startGame);
container.addEventListener('click', mouseClicked);

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