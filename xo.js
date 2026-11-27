// xo.js - Tic-Tac-Toe (you are X, the computer is O)

var xoBoard = document.getElementById('xo-board');
var xoMsg = document.getElementById('xo-msg');
var xoMode = document.getElementById('xo-mode');

var cells = [];          // 9 items: '', 'X' or 'O'
var turn = 'X';
var gameOver = false;
var wins = { X: 0, O: 0, draw: 0 };

// all the lines that make a win
var winLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// returns the winning line (like [0,1,2]) or null
function findWinner(board) {
  for (var i = 0; i < winLines.length; i++) {
    var a = winLines[i][0];
    var b = winLines[i][1];
    var c = winLines[i][2];
    if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
      return winLines[i];
    }
  }
  return null;
}

function boardIsFull(board) {
  for (var i = 0; i < 9; i++) {
    if (board[i] === '') return false;
  }
  return true;
}

// Minimax: the computer tries every possible move to find the best one.
// It returns a high number if O wins and a low number if X wins.
function minimax(board, player, depth) {
  var line = findWinner(board);
  if (line !== null) {
    return board[line[0]] === 'O' ? 10 - depth : depth - 10;
  }
  if (boardIsFull(board)) return 0;

  var best = player === 'O' ? -100 : 100;
  for (var i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = player;
      var score = minimax(board, player === 'O' ? 'X' : 'O', depth + 1);
      board[i] = '';
      if (player === 'O') best = Math.max(best, score);
      else best = Math.min(best, score);
    }
  }
  return best;
}

function computerMove() {
  var empty = [];
  for (var i = 0; i < 9; i++) {
    if (cells[i] === '') empty.push(i);
  }

  // easy mode: most of the time just pick a random square
  if (xoMode.value === 'easy' && Math.random() < 0.6) {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  var bestScore = -100;
  var bestMove = empty[0];
  for (var j = 0; j < empty.length; j++) {
    cells[empty[j]] = 'O';
    var score = minimax(cells, 'X', 1);
    cells[empty[j]] = '';
    if (score > bestScore) {
      bestScore = score;
      bestMove = empty[j];
    }
  }
  return bestMove;
}

function drawXo(winLine) {
  xoBoard.innerHTML = '';
  for (var i = 0; i < 9; i++) {
    var btn = document.createElement('button');
    btn.className = 'xo-cell';
    btn.textContent = cells[i];
    if (cells[i] === 'X') btn.classList.add('x');
    if (cells[i] === 'O') btn.classList.add('o');
    if (winLine && winLine.indexOf(i) !== -1) btn.classList.add('win');
    btn.disabled = gameOver || cells[i] !== '';
    btn.dataset.index = i;
    btn.addEventListener('click', function () {
      playMove(Number(this.dataset.index));
    });
    xoBoard.appendChild(btn);
  }
}

function showTally() {
  document.getElementById('xo-x').textContent = wins.X;
  document.getElementById('xo-o').textContent = wins.O;
  document.getElementById('xo-draw').textContent = wins.draw;
}

function endRound(winLine) {
  gameOver = true;
  if (winLine === null) {
    wins.draw++;
    xoMsg.className = 'message';
    xoMsg.textContent = "It's a draw.";
  } else {
    var winner = cells[winLine[0]];
    wins[winner]++;
    var twoPlayers = xoMode.value === 'two';
    if (twoPlayers) {
      xoMsg.className = 'message good';
      xoMsg.textContent = 'Player ' + winner + ' wins!';
    } else if (winner === 'X') {
      xoMsg.className = 'message good';
      xoMsg.textContent = 'You win!';
      saveScore('xo-wins', (getScore('xo-wins') || 0) + 1, false);
    } else {
      xoMsg.className = 'message bad';
      xoMsg.textContent = 'The computer wins.';
    }
    beep(winner === 'X' ? 900 : 200, 0.3, 'triangle');
  }
  showTally();
  drawXo(winLine);
}

function playMove(index) {
  if (gameOver || cells[index] !== '') return;

  cells[index] = turn;
  beep(turn === 'X' ? 600 : 420, 0.06);

  var line = findWinner(cells);
  if (line !== null) { endRound(line); return; }
  if (boardIsFull(cells)) { endRound(null); return; }

  turn = turn === 'X' ? 'O' : 'X';
  xoMsg.className = 'message';

  if (xoMode.value !== 'two' && turn === 'O') {
    // the computer plays after a short pause
    xoMsg.textContent = 'Computer is thinking...';
    gameOver = true;   // block clicks while it thinks
    drawXo();
    setTimeout(function () {
      gameOver = false;
      cells[computerMove()] = 'O';
      beep(420, 0.06);
      var line2 = findWinner(cells);
      if (line2 !== null) { endRound(line2); return; }
      if (boardIsFull(cells)) { endRound(null); return; }
      turn = 'X';
      xoMsg.textContent = 'Your turn';
      drawXo();
    }, 450);
  } else {
    xoMsg.textContent = 'Turn: ' + turn;
    drawXo();
  }
}

function newXoRound() {
  cells = ['', '', '', '', '', '', '', '', ''];
  turn = 'X';
  gameOver = false;
  xoMsg.className = 'message';
  xoMsg.textContent = 'Turn: X';
  drawXo();
}

xoMode.addEventListener('change', function () {
  wins = { X: 0, O: 0, draw: 0 };   // new mode, new tally
  showTally();
  newXoRound();
});
document.getElementById('xo-new').addEventListener('click', newXoRound);
newXoRound();
