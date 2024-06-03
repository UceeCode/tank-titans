let btnStart = document.querySelector('.btnStart');
let gameOverElement = document.getElementById('gameOverElement');
let player;
let animateGame;

let gamePlay = false;

btnStart.addEventListener('click', startGame);

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