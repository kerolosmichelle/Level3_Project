// memory.js - Memory Match game

// the pictures on the cards (12 different ones)
var symbols = ['\uD83D\uDE80', '\uD83C\uDF55', '\uD83D\uDC31', '\u26BD', '\uD83C\uDFB8', '\uD83C\uDF08',
               '\uD83E\uDD84', '\uD83C\uDF69', '\uD83D\uDC19', '\uD83C\uDFAE', '\uD83C\uDF35', '\uD83D\uDC8E'];

var memoryGrid = document.getElementById('memory-grid');
var memoryLevel = document.getElementById('memory-level');
var movesText = document.getElementById('memory-moves');
var memoryBest = document.getElementById('memory-best');
var memoryMsg = document.getElementById('memory-msg');

var firstCard = null;     // the first card flipped in the current move
var locked = false;       // true while two wrong cards are shown
var moves = 0;
var pairsFound = 0;
var totalPairs = 0;

// how many pairs and columns for each level
var levels = {
  easy: { pairs: 6, columns: 4 },
  normal: { pairs: 8, columns: 4 },
  hard: { pairs: 12, columns: 6 }
};

// mix the array in a random order
function shuffle(list) {
  for (var i = list.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function newMemoryGame() {
  var level = memoryLevel.value;
  totalPairs = levels[level].pairs;
  firstCard = null;
  locked = false;
  moves = 0;
  pairsFound = 0;
  movesText.textContent = 0;
  memoryMsg.textContent = '';
  memoryMsg.className = 'message';

  var best = getScore('memory-' + level);
  memoryBest.textContent = best === undefined ? '-' : best;

  memoryGrid.style.gridTemplateColumns = 'repeat(' + levels[level].columns + ', 1fr)';

  // each picture appears twice
  var cards = [];
  for (var i = 0; i < totalPairs; i++) {
    cards.push(symbols[i]);
    cards.push(symbols[i]);
  }
  shuffle(cards);

  memoryGrid.innerHTML = '';
  for (var c = 0; c < cards.length; c++) {
    var card = document.createElement('button');
    card.className = 'memory-card';
    card.textContent = '?';
    card.dataset.symbol = cards[c];
    card.addEventListener('click', function () {
      flipCard(this);
    });
    memoryGrid.appendChild(card);
  }
}

function flipCard(card) {
  // ignore clicks on cards that are already open or while waiting
  if (locked || card === firstCard || card.classList.contains('matched')) return;

  card.classList.add('open');
  card.textContent = card.dataset.symbol;
  beep(520, 0.05, 'triangle');

  if (firstCard === null) {
    firstCard = card;
    return;
  }

  // this is the second card of the move
  moves++;
  movesText.textContent = moves;
  var secondCard = card;

  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    // match
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard = null;
    pairsFound++;
    beep(880, 0.12, 'triangle');
    if (pairsFound === totalPairs) memoryWin();
  } else {
    // no match: show them red for a moment, then flip back
    locked = true;
    var a = firstCard;
    var b = secondCard;
    firstCard = null;
    a.classList.add('wrong');
    b.classList.add('wrong');
    setTimeout(function () {
      a.classList.remove('open', 'wrong');
      b.classList.remove('open', 'wrong');
      a.textContent = '?';
      b.textContent = '?';
      locked = false;
    }, 800);
  }
}

function memoryWin() {
  var level = memoryLevel.value;
  var isBest = saveScore('memory-' + level, moves, true);
  if (isBest) memoryBest.textContent = moves;
  memoryMsg.className = 'message good';
  memoryMsg.textContent = 'You won in ' + moves + ' moves!' + (isBest ? ' (new best!)' : '');
  beep(1040, 0.3, 'triangle');
}

memoryLevel.addEventListener('change', newMemoryGame);
document.getElementById('memory-new').addEventListener('click', newMemoryGame);
newMemoryGame();
