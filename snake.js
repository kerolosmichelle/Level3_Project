// snake.js - the Snake game

var canvas = document.getElementById('snake-canvas');
var ctx = canvas.getContext('2d');
var scoreText = document.getElementById('snake-score');
var bestText = document.getElementById('snake-best');
var snakeMsg = document.getElementById('snake-msg');
var snakeStartBtn = document.getElementById('snake-start');

var gridSize = 20;                    // 20 x 20 squares
var cell = canvas.width / gridSize;   // size of one square in pixels

var snake = [];
var direction = { x: 1, y: 0 };
var nextDirection = { x: 1, y: 0 };
var food = { x: 5, y: 5 };
var goldFood = null;                  // the bonus food, null when there is none
var snakeScore = 0;
var snakeTimer = null;
var snakeRunning = false;
var snakePaused = false;
var snakeEnded = false;               // true after game over, then the button must be used

bestText.textContent = getScore('snake') || 0;

function randomPlace() {
  // pick a random square that the snake is not on
  var place;
  do {
    place = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (isOnSnake(place.x, place.y));
  return place;
}

function isOnSnake(x, y) {
  for (var i = 0; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) return true;
  }
  return false;
}

function resetSnake() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = randomPlace();
  goldFood = null;
  snakeScore = 0;
  scoreText.textContent = 0;
  drawSnake();
}

function startSnake() {
  resetSnake();
  snakeRunning = true;
  snakePaused = false;
  snakeEnded = false;
  snakeMsg.className = 'message';
  snakeMsg.textContent = '';
  snakeStartBtn.textContent = 'Restart';
  clearInterval(snakeTimer);
  snakeTimer = setInterval(moveSnake, 140);
}

function stopSnake() {
  clearInterval(snakeTimer);
  snakeRunning = false;
}

function moveSnake() {
  if (snakePaused) return;
  direction = nextDirection;

  var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // hit a wall or itself?
  var hitWall = head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
  if (hitWall || isOnSnake(head.x, head.y)) {
    gameOverSnake();
    return;
  }

  snake.unshift(head);   // add the new head
  var ate = false;

  if (head.x === food.x && head.y === food.y) {
    snakeScore += 1;
    ate = true;
    food = randomPlace();
    beep(660, 0.07);
    // sometimes show the gold food for 5 seconds
    if (goldFood === null && Math.random() < 0.25) {
      goldFood = randomPlace();
      goldFood.endTime = Date.now() + 5000;
    }
  } else if (goldFood !== null && head.x === goldFood.x && head.y === goldFood.y) {
    snakeScore += 5;
    ate = true;
    goldFood = null;
    beep(990, 0.12, 'triangle');
  }

  if (!ate) snake.pop();   // if nothing was eaten, remove the tail so the length stays the same

  if (goldFood !== null && Date.now() > goldFood.endTime) goldFood = null;

  if (ate) {
    scoreText.textContent = snakeScore;
    // the more you eat the faster it gets (minimum 60 ms)
    var speed = Math.max(60, 140 - snakeScore * 3);
    clearInterval(snakeTimer);
    snakeTimer = setInterval(moveSnake, speed);
  }
  drawSnake();
}

function gameOverSnake() {
  stopSnake();
  snakeEnded = true;
  beep(160, 0.3, 'sawtooth');
  var isBest = false;
  if (snakeScore > 0) {
    isBest = saveScore('snake', snakeScore, false);
    if (isBest) bestText.textContent = snakeScore;
  }
  snakeMsg.className = 'message bad';
  snakeMsg.textContent = 'Game over! Score: ' + snakeScore + (isBest ? ' (new best!)' : '');
  snakeStartBtn.textContent = 'Play again';
}

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
}

function drawSnake() {
  // background
  ctx.fillStyle = '#0e1124';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // food
  drawSquare(food.x, food.y, '#ff4d8d');
  if (goldFood !== null) drawSquare(goldFood.x, goldFood.y, '#ffc857');

  // snake: the head is a lighter colour
  for (var i = 0; i < snake.length; i++) {
    drawSquare(snake[i].x, snake[i].y, i === 0 ? '#7cffee' : '#00c9b0');
  }

  if (snakePaused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
  }
}

// change direction (the snake can not turn back on itself)
function turnSnake(x, y) {
  if (currentGame !== 'snake') return;
  if (!snakeRunning) {
    if (snakeEnded) return;   // after game over use the button
    startSnake();
  }
  if (x === -direction.x && y === -direction.y) return;
  nextDirection = { x: x, y: y };
}

document.addEventListener('keydown', function (event) {
  if (currentGame !== 'snake') return;
  var key = event.key.toLowerCase();

  if (key === 'arrowup' || key === 'w') turnSnake(0, -1);
  else if (key === 'arrowdown' || key === 's') turnSnake(0, 1);
  else if (key === 'arrowleft' || key === 'a') turnSnake(-1, 0);
  else if (key === 'arrowright' || key === 'd') turnSnake(1, 0);
  else if (key === ' ' && snakeRunning) {
    snakePaused = !snakePaused;
    drawSnake();
  } else return;

  event.preventDefault();   // stop the page from scrolling
});

snakeStartBtn.addEventListener('click', startSnake);

// on-screen buttons for phones
var padButtons = document.querySelectorAll('.touch-pad button');
for (var p = 0; p < padButtons.length; p++) {
  padButtons[p].addEventListener('click', function () {
    var d = this.dataset.dir;
    if (d === 'up') turnSnake(0, -1);
    if (d === 'down') turnSnake(0, 1);
    if (d === 'left') turnSnake(-1, 0);
    if (d === 'right') turnSnake(1, 0);
  });
}

// swipe on the board
var touchX = 0;
var touchY = 0;
canvas.addEventListener('touchstart', function (event) {
  touchX = event.touches[0].clientX;
  touchY = event.touches[0].clientY;
});
canvas.addEventListener('touchend', function (event) {
  var dx = event.changedTouches[0].clientX - touchX;
  var dy = event.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;   // too small, ignore
  if (Math.abs(dx) > Math.abs(dy)) turnSnake(dx > 0 ? 1 : -1, 0);
  else turnSnake(0, dy > 0 ? 1 : -1);
});

resetSnake();
